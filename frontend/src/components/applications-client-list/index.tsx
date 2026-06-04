'use client';

import { ApplicationsApi, AuthApi, RentalsApi, WarehousesApi } from "@/lib";
import { Badge, Button, FileInput, Modal, Select, Text, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const STATUS_OPTIONS = [
    { value: "PENDING_REVIEW", label: "На проверке", color: "#FEF3C7", text: "#92400E" },
    { value: "IN_PROGRESS", label: "В работе", color: "#E0F2FE", text: "#0369A1" },
    { value: "COMPLETED", label: "Завершено", color: "#DCFCE7", text: "#166534" },
];

function formatCurrency(value: number) {
    return new Intl.NumberFormat("ru-RU").format(value);
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("ru-RU");
}

function formatCells(rental: {
    rowStart: number;
    rowEnd: number;
    colStart: number;
    colEnd: number;
}) {
    return `Ряды ${rental.rowStart}-${rental.rowEnd}, Ячейки ${rental.colStart}-${rental.colEnd}`;
}

function isWithinRental(createdAt: string, rental: { startDate: string; endDate: string }) {
    const created = new Date(createdAt).getTime();
    const start = new Date(rental.startDate).getTime();
    const end = new Date(rental.endDate).getTime();
    if (!Number.isFinite(created) || !Number.isFinite(start) || !Number.isFinite(end)) {
        return false;
    }
    return created >= start && created <= end;
}

export function ApplicationsClientList() {
    const queryClient = useQueryClient();
    const [openedId, setOpenedId] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    const { data: currentUser } = useQuery({
        queryKey: ["me"],
        queryFn: () => AuthApi.me(),
    });

    const { data: rentals } = useQuery({
        queryKey: ["rentals", currentUser?.id],
        queryFn: () => RentalsApi.listRentals(undefined, currentUser?.id),
        enabled: Boolean(currentUser?.id),
    });

    const { data: applications } = useQuery({
        queryKey: ["applications", currentUser?.id],
        queryFn: () => ApplicationsApi.listApplications({ userId: currentUser?.id }),
        enabled: Boolean(currentUser?.id),
    });

    const { data: warehouses } = useQuery({
        queryKey: ["warehouses"],
        queryFn: () => WarehousesApi.listWarehouses(),
    });

    const warehousesById = useMemo(() => {
        const map = new Map<number, string>();
        (warehouses ?? []).forEach((warehouse) => map.set(warehouse.id, warehouse.title));
        return map;
    }, [warehouses]);

    const applicationsByRentalId = useMemo(() => {
        const map = new Map<string, typeof applications>();
        (rentals ?? []).forEach((rental) => {
            const matches = (applications ?? []).filter((application) =>
                application.warehouseId === rental.warehouseId &&
                application.userId === rental.userId &&
                isWithinRental(application.createdAt, rental),
            );
            map.set(rental.id, matches);
        });
        return map;
    }, [applications, rentals]);

    const rentalOptions = useMemo(
        () =>
            (rentals ?? []).map((rental) => {
                const title = warehousesById.get(rental.warehouseId) ?? `Склад #${rental.warehouseId}`;
                const cells = formatCells(rental);
                const dates = `${formatDate(rental.startDate)} - ${formatDate(rental.endDate)}`;
                return {
                    value: rental.id,
                    label: `${title} | ${cells} | ${dates}`,
                };
            }),
        [rentals, warehousesById],
    );

    const selectedRental = useMemo(
        () => (rentals ?? []).find((rental) => rental.id === selectedRentalId) ?? null,
        [rentals, selectedRentalId],
    );

    const visibleRentals = useMemo(
        () => (rentals ?? []).slice().sort((a, b) => b.startDate.localeCompare(a.startDate)),
        [rentals],
    );

    const createApplicationMutation = useMutation({
        mutationFn: async (input: { warehouseId: number; description: string; file?: File | null }) => {
            const created = await ApplicationsApi.createApplication({
                warehouseId: input.warehouseId,
                description: input.description,
            });
            if (input.file) {
                await ApplicationsApi.uploadPhoto({
                    applicationId: created.id,
                    file: input.file,
                    kind: "BREAKDOWN",
                });
            }
            return created;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications", currentUser?.id] });
            notifications.show({
                title: "Заявка создана",
                message: "Заявка отправлена менеджеру и инженеру.",
                color: "green",
            });
            setIsCreateOpen(false);
            setSelectedRentalId(null);
            setDescription("");
            setPhotoFile(null);
        },
        onError: () => {
            notifications.show({
                title: "Ошибка",
                message: "Не удалось создать заявку.",
                color: "red",
            });
        },
    });

    const handleCreate = () => {
        if (!selectedRental) {
            notifications.show({
                title: "Нужна аренда",
                message: "Выберите аренду для заявки.",
                color: "orange",
            });
            return;
        }
        if (!description.trim()) {
            notifications.show({
                title: "Нужно описание",
                message: "Опишите проблему в заявке.",
                color: "orange",
            });
            return;
        }

        createApplicationMutation.mutate({
            warehouseId: selectedRental.warehouseId,
            description: description.trim(),
            file: photoFile,
        });
    };

    const handleToggle = (rentalId: string) => {
        setOpenedId((prev) => (prev === rentalId ? null : rentalId));
    };

    const getStatusBadge = (status: string) => {
        const option = STATUS_OPTIONS.find((item) => item.value === status);
        if (!option) {
            return { label: status, color: "#F3F4F6", text: "#4B5563" };
        }
        return option;
    };

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000";
        const socket = io(wsUrl, { withCredentials: true });

        socket.on("applications:updated", () => {
            queryClient.invalidateQueries({ queryKey: ["applications", currentUser?.id] });
        });

        return () => {
            socket.disconnect();
        };
    }, [currentUser?.id, queryClient]);

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <Text fw={700} size="xl">
                            Мои аренды
                        </Text>
                        <Text size="sm" c="dimmed">
                            Договоры аренды и текущие условия
                        </Text>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>Создать заявку</Button>
                </div>

                <div className="space-y-4">
                    {visibleRentals.map((rental) => {
                        const warehouseTitle =
                            warehousesById.get(rental.warehouseId) ?? `Склад #${rental.warehouseId}`;

                        return (
                            <div key={rental.id} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                                <button
                                    type="button"
                                    className="flex w-full flex-wrap items-center justify-between gap-4 px-5 py-4 text-left"
                                    onClick={() => handleToggle(rental.id)}
                                >
                                    <div>
                                        <Text fw={700}>{warehouseTitle}</Text>
                                        <Text size="xs" c="dimmed">
                                            {formatCells(rental)}
                                        </Text>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6">
                                        <div className="text-right">
                                            <Text size="xs" c="dimmed">
                                                СТОИМОСТЬ
                                            </Text>
                                            <Text fw={700}>{formatCurrency(rental.totalPrice)} руб</Text>
                                        </div>
                                        <div className="text-right">
                                            <Text size="xs" c="dimmed">
                                                СРОК
                                            </Text>
                                            <Text fw={700}>
                                                {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                            </Text>
                                        </div>
                                        {openedId === rental.id ? (
                                            <ChevronUpIcon size={18} className="text-gray-500" />
                                        ) : (
                                            <ChevronDownIcon size={18} className="text-gray-500" />
                                        )}
                                    </div>
                                </button>

                                {openedId === rental.id && (
                                    <div className="border-t border-gray-200 px-5 pb-5">
                                        <div className="grid grid-cols-1 gap-6 py-5 md:grid-cols-[2fr,1fr]">
                                            <div className="space-y-2">
                                                <Text size="sm" fw={600}>
                                                    Склад
                                                </Text>
                                                <Text size="sm" c="dimmed">
                                                    {warehouseTitle}
                                                </Text>
                                                <Text size="sm" fw={600}>
                                                    Ячейки
                                                </Text>
                                                <Text size="sm" c="dimmed">
                                                    {formatCells(rental)}
                                                </Text>
                                            </div>
                                            <div className="space-y-2">
                                                <Text size="sm" fw={600}>
                                                    Стоимость
                                                </Text>
                                                <Text size="sm" c="dimmed">
                                                    {formatCurrency(rental.totalPrice)} руб
                                                </Text>
                                                <Text size="sm" fw={600}>
                                                    Период аренды
                                                </Text>
                                                <Text size="sm" c="dimmed">
                                                    {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                                </Text>
                                            </div>
                                        </div>
                                        <div className="space-y-3 border-t border-gray-200 pt-4">
                                            <Text size="sm" fw={600}>
                                                Заявки по аренде
                                            </Text>
                                            {(applicationsByRentalId.get(rental.id) ?? []).length === 0 ? (
                                                <Text size="sm" c="dimmed">
                                                    Заявок по этой аренде пока нет.
                                                </Text>
                                            ) : (
                                                <div className="space-y-3">
                                                    {(applicationsByRentalId.get(rental.id) ?? []).map((application) => {
                                                        const statusBadge = getStatusBadge(application.status);
                                                        return (
                                                            <div
                                                                key={application.id}
                                                                className="rounded-md border border-gray-200 bg-white p-3"
                                                            >
                                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                                    <Text size="sm" fw={600}>
                                                                        {formatDate(application.createdAt)}
                                                                    </Text>
                                                                    <Badge
                                                                        variant="filled"
                                                                        style={{
                                                                            backgroundColor: statusBadge.color,
                                                                            color: statusBadge.text,
                                                                        }}
                                                                    >
                                                                        {statusBadge.label}
                                                                    </Badge>
                                                                </div>
                                                                <Text size="sm" c="dimmed" mt={6}>
                                                                    {application.description}
                                                                </Text>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {visibleRentals.length === 0 && (
                        <div className="rounded-lg border border-gray-200 bg-white px-6 py-8 text-center">
                            <Text fw={600}>Аренд пока нет</Text>
                            <Text size="sm" c="dimmed">
                                Как только договор аренды будет активен, он появится здесь.
                            </Text>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                opened={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                centered
                size="lg"
                title="Создать заявку"
            >
                <div className="space-y-4">
                    <Select
                        label="Аренда"
                        placeholder="Выберите аренду"
                        value={selectedRentalId}
                        onChange={setSelectedRentalId}
                        data={rentalOptions}
                        searchable
                        nothingFoundMessage="Аренды не найдены"
                        required
                    />
                    <Textarea
                        label="Описание проблемы"
                        value={description}
                        onChange={(event) => setDescription(event.currentTarget.value)}
                        minRows={4}
                        placeholder="Опишите проблему или задачу"
                        required
                    />
                    <FileInput
                        label="Фото"
                        placeholder="Прикрепите фото"
                        value={photoFile}
                        onChange={setPhotoFile}
                        accept="image/*"
                    />
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="default" onClick={() => setIsCreateOpen(false)}>
                            Отмена
                        </Button>
                        <Button
                            onClick={handleCreate}
                            loading={createApplicationMutation.isLoading}
                        >
                            Создать
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
