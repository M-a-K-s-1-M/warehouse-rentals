'use client';

import { ApplicationsApi, AuthApi, WarehousesApi } from "@/lib";
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

const PHOTO_KIND_OPTIONS = [
    { value: "BREAKDOWN", label: "Поломка" },
    { value: "REPAIR", label: "Ремонт" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("ru-RU");
}

function formatName(input?: {
    firstName?: string | null;
    lastName?: string | null;
    middleName?: string | null;
    email?: string | null;
}) {
    if (!input) {
        return "";
    }
    const parts = [input.lastName, input.firstName, input.middleName].filter(Boolean);
    return parts.length ? parts.join(" ") : input.email ?? "";
}

export function ApplicationsEngineerList() {
    const queryClient = useQueryClient();
    const [openedId, setOpenedId] = useState<string | null>(null);
    const [photoDrafts, setPhotoDrafts] = useState<Record<string, { file: File | null; kind: string }>>({});
    const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
    const [openedPhoto, setOpenedPhoto] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [warehouseFilter, setWarehouseFilter] = useState<string | null>(null);

    const { data: currentUser } = useQuery({
        queryKey: ["me"],
        queryFn: () => AuthApi.me(),
    });

    const { data: applications } = useQuery({
        queryKey: ["applications"],
        queryFn: () => ApplicationsApi.listApplications(),
    });

    const { data: warehouses } = useQuery({
        queryKey: ["warehouses"],
        queryFn: () => WarehousesApi.listWarehouses(),
    });

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000";
        const socket = io(wsUrl, { withCredentials: true });

        socket.on("applications:updated", () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
        });

        return () => {
            socket.disconnect();
        };
    }, [queryClient]);

    useEffect(() => {
        if (!applications) {
            return;
        }

        setPhotoDrafts((prev) => {
            const next = { ...prev };
            applications.forEach((application) => {
                if (!next[application.id]) {
                    next[application.id] = { file: null, kind: "BREAKDOWN" };
                }
            });
            return next;
        });

        setCommentDrafts((prev) => {
            const next = { ...prev };
            applications.forEach((application) => {
                if (next[application.id] === undefined) {
                    next[application.id] = application.engineerComment ?? "";
                }
            });
            return next;
        });
    }, [applications]);

    const warehousesById = useMemo(() => {
        const map = new Map<number, string>();
        (warehouses ?? []).forEach((warehouse) => map.set(warehouse.id, warehouse.title));
        return map;
    }, [warehouses]);

    const warehouseOptions = useMemo(
        () =>
            (warehouses ?? []).map((warehouse) => ({
                value: String(warehouse.id),
                label: warehouse.title,
            })),
        [warehouses],
    );

    const visibleApplications = useMemo(() => {
        const list = applications ?? [];
        if (!currentUser?.id) {
            return [];
        }
        return list.filter((application) => {
            const assigned = application.engineers.some((engineer) => engineer.engineerId === currentUser.id);
            if (!assigned) {
                return false;
            }
            if (statusFilter && application.status !== statusFilter) {
                return false;
            }
            if (warehouseFilter && String(application.warehouseId) !== warehouseFilter) {
                return false;
            }
            return true;
        });
    }, [applications, currentUser?.id, statusFilter, warehouseFilter]);

    const updateStatusMutation = useMutation({
        mutationFn: (input: { applicationId: string; status: string }) =>
            ApplicationsApi.updateStatus(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            notifications.show({
                title: "Статус обновлен",
                message: "Статус заявки изменен.",
                color: "green",
            });
        },
        onError: () => {
            notifications.show({
                title: "Ошибка",
                message: "Не удалось обновить статус.",
                color: "red",
            });
        },
    });

    const addPhotoMutation = useMutation({
        mutationFn: (input: { applicationId: string; file: File; kind: string }) =>
            ApplicationsApi.uploadPhoto(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            notifications.show({
                title: "Фото добавлено",
                message: "Фото прикреплено к заявке.",
                color: "green",
            });
        },
        onError: () => {
            notifications.show({
                title: "Ошибка",
                message: "Не удалось добавить фото.",
                color: "red",
            });
        },
    });

    const updateCommentMutation = useMutation({
        mutationFn: (input: { applicationId: string; comment: string }) =>
            ApplicationsApi.updateEngineerComment(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            notifications.show({
                title: "Комментарий сохранен",
                message: "Комментарий инженера обновлен.",
                color: "green",
            });
        },
        onError: () => {
            notifications.show({
                title: "Ошибка",
                message: "Не удалось сохранить комментарий.",
                color: "red",
            });
        },
    });

    const handleToggle = (applicationId: string) => {
        setOpenedId((prev) => (prev === applicationId ? null : applicationId));
    };

    const getStatusBadge = (status: string) => {
        const option = STATUS_OPTIONS.find((item) => item.value === status);
        if (!option) {
            return { label: status, color: "#F3F4F6", text: "#4B5563" };
        }
        return option;
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <Text fw={700} size="xl">
                            Заявки инженера
                        </Text>
                        <Text size="sm" c="dimmed">
                            Заявки, назначенные администратором
                        </Text>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <Select
                            label="Статус"
                            placeholder="Все статусы"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            data={STATUS_OPTIONS.map((option) => ({
                                value: option.value,
                                label: option.label,
                            }))}
                            clearable
                            w={220}
                        />
                        <Select
                            label="Склад"
                            placeholder="Все склады"
                            value={warehouseFilter}
                            onChange={setWarehouseFilter}
                            data={warehouseOptions}
                            clearable
                            searchable
                            nothingFoundMessage="Склады не найдены"
                            w={260}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {visibleApplications.map((application) => {
                        const statusBadge = getStatusBadge(application.status);
                        const warehouseTitle =
                            application.warehouse?.title ??
                            warehousesById.get(application.warehouseId) ??
                            `Склад #${application.warehouseId}`;
                        const photoDraft = photoDrafts[application.id] ?? { file: null, kind: "BREAKDOWN" };

                        return (
                            <div key={application.id} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                                <button
                                    type="button"
                                    className="flex w-full flex-wrap items-center justify-between gap-4 px-5 py-4 text-left"
                                    onClick={() => handleToggle(application.id)}
                                >
                                    <div>
                                        <Text fw={700}>{warehouseTitle}</Text>
                                        <Text size="xs" c="dimmed">
                                            {application.user ? formatName(application.user) : `Клиент #${application.userId}`}
                                        </Text>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4">
                                        <Badge
                                            variant="filled"
                                            style={{ backgroundColor: statusBadge.color, color: statusBadge.text }}
                                        >
                                            {statusBadge.label}
                                        </Badge>
                                        <Text size="xs" c="dimmed">
                                            {formatDate(application.createdAt)}
                                        </Text>
                                        {openedId === application.id ? (
                                            <ChevronUpIcon size={18} className="text-gray-500" />
                                        ) : (
                                            <ChevronDownIcon size={18} className="text-gray-500" />
                                        )}
                                    </div>
                                </button>

                                {openedId === application.id && (
                                    <div className="border-t border-gray-200 px-5 pb-5">
                                        <div className="grid grid-cols-1 gap-6 py-5 lg:grid-cols-[2fr,1fr]">
                                            <div className="space-y-4">
                                                <div>
                                                    <Text size="sm" fw={600}>
                                                        Описание
                                                    </Text>
                                                    <Textarea
                                                        value={application.description}
                                                        minRows={3}
                                                        readOnly
                                                        disabled
                                                    />
                                                </div>

                                                <div>
                                                    <Text size="sm" fw={600}>
                                                        Фото
                                                    </Text>
                                                    {application.photos.length === 0 ? (
                                                        <Text size="sm" c="dimmed">
                                                            Фото пока не добавлены.
                                                        </Text>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-3">
                                                            {application.photos.map((photo) => {
                                                                const photoUrl = photo.url.startsWith("http")
                                                                    ? photo.url
                                                                    : `${API_ORIGIN}${photo.url}`;

                                                                return (
                                                                    <div
                                                                        key={photo.id}
                                                                        className="h-28 w-40 overflow-hidden rounded-md border border-gray-200"
                                                                    >
                                                                        <button
                                                                            type="button"
                                                                            className="h-full w-full"
                                                                            onClick={() => setOpenedPhoto(photoUrl)}
                                                                            aria-label="Открыть фото"
                                                                        >
                                                                            <img
                                                                                src={photoUrl}
                                                                                alt={photo.kind}
                                                                                className="h-full w-full cursor-zoom-in object-cover"
                                                                            />
                                                                        </button>
                                                                        <div className="flex items-center justify-between gap-2 border-t border-gray-200 bg-white px-2 py-1 text-[11px]">
                                                                            <a
                                                                                href={photoUrl}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="text-blue-600 hover:underline"
                                                                            >
                                                                                Открыть
                                                                            </a>
                                                                            <a
                                                                                href={photoUrl}
                                                                                download
                                                                                className="text-blue-600 hover:underline"
                                                                            >
                                                                                Скачать
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[2fr,1fr,auto]">
                                                        <FileInput
                                                            placeholder="Выберите файл"
                                                            value={photoDraft.file}
                                                            onChange={(file) =>
                                                                setPhotoDrafts((prev) => ({
                                                                    ...prev,
                                                                    [application.id]: {
                                                                        ...photoDraft,
                                                                        file,
                                                                    },
                                                                }))
                                                            }
                                                            accept="image/*"
                                                        />
                                                        <Select
                                                            data={PHOTO_KIND_OPTIONS}
                                                            value={photoDraft.kind}
                                                            onChange={(value) =>
                                                                setPhotoDrafts((prev) => ({
                                                                    ...prev,
                                                                    [application.id]: {
                                                                        ...photoDraft,
                                                                        kind: value ?? "BREAKDOWN",
                                                                    },
                                                                }))
                                                            }
                                                        />
                                                        <Button
                                                            onClick={() => {
                                                                if (!photoDraft.file) {
                                                                    notifications.show({
                                                                        title: "Нужен файл",
                                                                        message: "Выберите фото для загрузки.",
                                                                        color: "orange",
                                                                    });
                                                                    return;
                                                                }
                                                                addPhotoMutation.mutate({
                                                                    applicationId: application.id,
                                                                    file: photoDraft.file,
                                                                    kind: photoDraft.kind,
                                                                });
                                                                setPhotoDrafts((prev) => ({
                                                                    ...prev,
                                                                    [application.id]: {
                                                                        ...photoDraft,
                                                                        file: null,
                                                                    },
                                                                }));
                                                            }}
                                                        >
                                                            Добавить фото
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Text size="sm" fw={600}>
                                                        Комментарий инженера
                                                    </Text>
                                                    <Textarea
                                                        value={commentDrafts[application.id] ?? ""}
                                                        onChange={(event) => {
                                                            const nextValue = event?.currentTarget?.value ?? "";
                                                            setCommentDrafts((prev) => ({
                                                                ...prev,
                                                                [application.id]: nextValue,
                                                            }));
                                                        }}
                                                        minRows={3}
                                                        placeholder="Опишите выполненные работы или примечания"
                                                    />
                                                    <Button
                                                        mt="sm"
                                                        size="xs"
                                                        onClick={() =>
                                                            updateCommentMutation.mutate({
                                                                applicationId: application.id,
                                                                comment: commentDrafts[application.id] ?? "",
                                                            })
                                                        }
                                                    >
                                                        Сохранить комментарий
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <Text size="sm" fw={600}>
                                                        Статус заявки
                                                    </Text>
                                                    <Select
                                                        data={STATUS_OPTIONS.map((option) => ({
                                                            value: option.value,
                                                            label: option.label,
                                                        }))}
                                                        value={application.status}
                                                        onChange={(value) => {
                                                            if (!value) {
                                                                return;
                                                            }
                                                            updateStatusMutation.mutate({
                                                                applicationId: application.id,
                                                                status: value,
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {visibleApplications.length === 0 && (
                        <div className="rounded-lg border border-gray-200 bg-white px-6 py-8 text-center">
                            <Text fw={600}>Заявок пока нет</Text>
                            <Text size="sm" c="dimmed">
                                Когда появятся новые заявки, они будут показаны здесь.
                            </Text>
                        </div>
                    )}
                </div>
            </div>
            <Modal opened={Boolean(openedPhoto)} onClose={() => setOpenedPhoto(null)} centered size="lg" title="Фото">
                {openedPhoto && (
                    <img
                        src={openedPhoto}
                        alt="Фото заявки"
                        className="max-h-[70vh] w-full rounded-md object-contain"
                    />
                )}
            </Modal>
        </>
    );
}
