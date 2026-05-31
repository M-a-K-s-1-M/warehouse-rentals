'use client';

import { CreateEngineerModal } from "@/components";
import { ApplicationsApi, UsersApi, WarehousesApi } from "@/lib";
import { Button, Select, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useMemo, useState } from "react";

type SortOrder = "desc" | "asc";

type EngineerErrors = Partial<Record<
    "lastName" | "firstName" | "middleName" | "phone" | "email",
    string
>>;

function formatCount(value: number) {
    return new Intl.NumberFormat("ru-RU").format(value);
}

function getEngineerName(input: {
    firstName?: string | null;
    lastName?: string | null;
    middleName?: string | null;
    email: string;
}) {
    const parts = [input.lastName, input.firstName, input.middleName].filter(Boolean);
    return parts.length ? parts.join(" ") : input.email;
}

function getStatusLabel(now: Date, applications: { status: string; openStatus: string; createdAt: string }[]) {
    const active = applications.some((application) => application.openStatus === "OPEN");
    if (active) {
        return { label: "АКТИВЕН", color: "#DCFCE7", text: "#166534" };
    }

    const recent = applications.some((application) => {
        const created = new Date(application.createdAt);
        const diff = now.getTime() - created.getTime();
        return diff <= 1000 * 60 * 60 * 24 * 14;
    });

    if (recent) {
        return { label: "В ПРОЦЕССЕ", color: "#E0F2FE", text: "#0369A1" };
    }

    return { label: "НЕАКТИВЕН", color: "#F3F4F6", text: "#4B5563" };
}

export function EngineersList() {
    const queryClient = useQueryClient();
    const [openedEngineerId, setOpenedEngineerId] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<EngineerErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    const { data: users } = useQuery({
        queryKey: ["users"],
        queryFn: () => UsersApi.listUsers(),
    });

    const { data: applications } = useQuery({
        queryKey: ["applications"],
        queryFn: () => ApplicationsApi.listApplications(),
    });

    const { data: warehouses } = useQuery({
        queryKey: ["warehouses"],
        queryFn: () => WarehousesApi.listWarehouses(),
    });

    const createEngineerMutation = useMutation({
        mutationFn: (input: {
            lastName: string;
            firstName: string;
            middleName: string;
            phone: string;
            email: string;
            password: string;
        }) =>
            UsersApi.createUser({
                email: input.email,
                password: input.password,
                role: "ENGINEER",
                firstName: input.firstName,
                lastName: input.lastName,
                middleName: input.middleName,
                phone: input.phone,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            notifications.show({
                title: "Инженер добавлен",
                message: "Карточка инженера создана.",
                color: "green",
            });
            setIsCreateOpen(false);
            setFieldErrors({});
            setFormError(null);
        },
        onError: (error) => {
            const payload = (error as { response?: { data?: { message?: string | string[] } } })
                .response?.data?.message;
            const message = Array.isArray(payload) ? payload[0] : payload;

            if (message === "Email already exists") {
                setFieldErrors({ email: "Почта уже занята" });
                return;
            }
            if (message === "Phone already exists") {
                setFieldErrors({ phone: "Телефон уже занят" });
                return;
            }
            if (message === "User already exists") {
                setFieldErrors({ lastName: "Пользователь уже существует" });
                return;
            }

            setFormError("Не удалось создать инженера.");
        },
    });

    const engineers = useMemo(
        () => (users ?? []).filter((user) => user.role === "ENGINEER"),
        [users],
    );

    const warehousesById = useMemo(() => {
        const map = new Map<number, string>();
        (warehouses ?? []).forEach((warehouse) => map.set(warehouse.id, warehouse.title));
        return map;
    }, [warehouses]);

    const applicationsByEngineer = useMemo(() => {
        const map = new Map<string, typeof applications>();
        (applications ?? []).forEach((application) => {
            application.engineers.forEach((engineer) => {
                const current = map.get(engineer.engineerId) ?? [];
                map.set(engineer.engineerId, [...current, application]);
            });
        });
        return map;
    }, [applications]);

    const engineersWithMetrics = useMemo(() => {
        const now = new Date();
        return engineers
            .map((engineer) => {
                const engineerApplications = applicationsByEngineer.get(engineer.id) ?? [];
                const status = getStatusLabel(now, engineerApplications.map((app) => ({
                    status: app.status,
                    openStatus: app.openStatus,
                    createdAt: app.createdAt,
                })));
                return {
                    engineer,
                    engineerApplications,
                    totalCount: engineerApplications.length,
                    status,
                };
            })
            .sort((a, b) =>
                sortOrder === "desc" ? b.totalCount - a.totalCount : a.totalCount - b.totalCount,
            );
    }, [applicationsByEngineer, engineers, sortOrder]);

    const handleEngineerToggle = (engineerId: string) => {
        setOpenedEngineerId((prev) => (prev === engineerId ? null : engineerId));
    };

    const handleCreateEngineer = (values: {
        lastName: string;
        firstName: string;
        middleName: string;
        phone: string;
        email: string;
        password: string;
    }) => {
        setFieldErrors({});
        setFormError(null);
        createEngineerMutation.mutate(values);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Text fw={700} size="xl">
                        Список инженеров
                    </Text>
                    <Text size="sm" c="dimmed">
                        Текущие заявки инженеров
                    </Text>
                </div>
                <Select
                    label="Сортировка"
                    value={sortOrder}
                    onChange={(value) => setSortOrder((value as SortOrder) ?? "desc")}
                    data={[
                        { value: "desc", label: "Сортировать по количеству (убыв.)" },
                        { value: "asc", label: "Сортировать по количеству (возр.)" },
                    ]}
                    w={260}
                />
            </div>

            <div className="space-y-4">
                {engineersWithMetrics.map(({ engineer, engineerApplications, totalCount, status }) => (
                    <div key={engineer.id} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <button
                            type="button"
                            className="flex w-full flex-wrap items-center justify-between gap-4 px-5 py-4 text-left"
                            onClick={() => handleEngineerToggle(engineer.id)}
                        >
                            <div>
                                <Text fw={700}>{getEngineerName(engineer)}</Text>
                                <Text size="xs" c="dimmed">
                                    ID: {engineer.id}
                                </Text>
                            </div>

                            <div className="flex flex-wrap items-center gap-6">
                                <div className="text-right">
                                    <Text size="xs" c="dimmed">
                                        ЗАЯВОК
                                    </Text>
                                    <Text fw={700}>{formatCount(totalCount)}</Text>
                                </div>
                                <div
                                    className="rounded px-3 py-1 text-xs font-semibold"
                                    style={{ backgroundColor: status.color, color: status.text }}
                                >
                                    {status.label}
                                </div>
                                {openedEngineerId === engineer.id ? (
                                    <ChevronUpIcon size={18} className="text-gray-500" />
                                ) : (
                                    <ChevronDownIcon size={18} className="text-gray-500" />
                                )}
                            </div>
                        </button>

                        {openedEngineerId === engineer.id && (
                            <div className="border-t border-gray-200 px-5 pb-4">
                                <div className="grid grid-cols-1 gap-3 py-4 text-xs font-semibold text-gray-400 sm:grid-cols-4">
                                    <div>СКЛАД</div>
                                    <div>СТАТУС</div>
                                    <div>ЗАЯВКА</div>
                                    <div className="text-right">СОЗДАНА</div>
                                </div>
                                <div className="space-y-3">
                                    {engineerApplications.length === 0 ? (
                                        <Text size="sm" c="dimmed">
                                            У инженера пока нет заявок.
                                        </Text>
                                    ) : (
                                        engineerApplications.map((application) => (
                                            <div
                                                key={application.id}
                                                className="grid grid-cols-1 items-center gap-3 rounded-md border border-gray-200 px-4 py-3 text-sm sm:grid-cols-4"
                                            >
                                                <div className="font-semibold">
                                                    {warehousesById.get(application.warehouseId) ?? `Склад #${application.warehouseId}`}
                                                </div>
                                                <div>{application.status}</div>
                                                <div className="truncate" title={application.description}>
                                                    {application.description}
                                                </div>
                                                <div className="text-right">
                                                    {new Date(application.createdAt).toLocaleDateString("ru-RU")}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Button onClick={() => setIsCreateOpen(true)}>Добавить инженера</Button>

            <CreateEngineerModal
                opened={isCreateOpen}
                onClose={() => {
                    setIsCreateOpen(false);
                    setFieldErrors({});
                    setFormError(null);
                }}
                onSubmit={handleCreateEngineer}
                isSubmitting={createEngineerMutation.isPending}
                fieldErrors={fieldErrors}
                formError={formError}
                onFieldChange={(field) => {
                    setFieldErrors((prev) => {
                        if (!prev[field]) {
                            return prev;
                        }
                        return { ...prev, [field]: "" };
                    });
                    setFormError(null);
                }}
            />
        </div>
    );
}
