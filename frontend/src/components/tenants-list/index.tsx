'use client'

import { CreateTenantModal } from "@/components";
import { RentalsApi, UsersApi, WarehousesApi } from "@/lib";
import { Button, Select, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useMemo, useState } from "react";

type SortOrder = "desc" | "asc";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("ru-RU").format(value);
}

function formatArea(value: number) {
    return new Intl.NumberFormat("ru-RU").format(value);
}

function getTenantName(input: {
    firstName?: string | null;
    lastName?: string | null;
    middleName?: string | null;
    email: string;
}) {
    const parts = [input.lastName, input.firstName, input.middleName].filter(Boolean);
    return parts.length ? parts.join(" ") : input.email;
}

function getStatusLabel(now: Date, rentals: { startDate: string; endDate: string }[]) {
    const active = rentals.some((rental) => {
        const start = new Date(rental.startDate);
        const end = new Date(rental.endDate);
        return start <= now && end >= now;
    });

    if (active) {
        return { label: "АКТИВЕН", color: "#DCFCE7", text: "#166534" };
    }

    const upcoming = rentals.some((rental) => {
        const end = new Date(rental.endDate);
        return end >= now;
    });

    if (upcoming) {
        return { label: "ИСТЕКАЕТ", color: "#FEF3C7", text: "#92400E" };
    }

    return { label: "НЕАКТИВЕН", color: "#F3F4F6", text: "#4B5563" };
}

export function TenantsList() {
    const queryClient = useQueryClient();
    const [openedTenantId, setOpenedTenantId] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<
        "lastName" | "firstName" | "middleName" | "phone" | "email",
        string
    >>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    const { data: users } = useQuery({
        queryKey: ["users"],
        queryFn: () => UsersApi.listUsers(),
    });

    const { data: rentals } = useQuery({
        queryKey: ["rentals"],
        queryFn: () => RentalsApi.listRentals(),
    });

    const { data: warehouses } = useQuery({
        queryKey: ["warehouses"],
        queryFn: () => WarehousesApi.listWarehouses(),
    });

    const createTenantMutation = useMutation({
        mutationFn: (input: {
            lastName: string;
            firstName: string;
            middleName: string;
            phone: string;
            email: string;
        }) =>
            UsersApi.createUser({
                email: input.email,
                role: "CLIENT",
                firstName: input.firstName,
                lastName: input.lastName,
                middleName: input.middleName,
                phone: input.phone,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            notifications.show({
                title: "Арендатор добавлен",
                message: "Карточка арендатора создана.",
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

            setFormError("Не удалось создать арендатора.");
        },
    });

    const tenants = useMemo(
        () => (users ?? []).filter((user) => user.role === "CLIENT"),
        [users],
    );

    const warehousesById = useMemo(() => {
        const map = new Map<number, string>();
        (warehouses ?? []).forEach((warehouse) => map.set(warehouse.id, warehouse.title));
        return map;
    }, [warehouses]);

    const rentalsByUser = useMemo(() => {
        const map = new Map<string, typeof rentals>();
        (rentals ?? []).forEach((rental) => {
            const current = map.get(rental.userId) ?? [];
            map.set(rental.userId, [...current, rental]);
        });
        return map;
    }, [rentals]);

    const tenantsWithMetrics = useMemo(() => {
        const now = new Date();
        return tenants
            .map((tenant) => {
                const tenantRentals = rentalsByUser.get(tenant.id) ?? [];
                const totalPrice = tenantRentals.reduce((sum, rental) => sum + rental.totalPrice, 0);
                const totalArea = tenantRentals.reduce((sum, rental) => sum + rental.areaSquare, 0);
                const status = getStatusLabel(now, tenantRentals);
                return { tenant, tenantRentals, totalPrice, totalArea, status };
            })
            .sort((a, b) =>
                sortOrder === "desc" ? b.totalArea - a.totalArea : a.totalArea - b.totalArea,
            );
    }, [rentalsByUser, sortOrder, tenants]);

    const handleTenantToggle = (tenantId: string) => {
        setOpenedTenantId((prev) => (prev === tenantId ? null : tenantId));
    };

    const handleCreateTenant = (values: {
        lastName: string;
        firstName: string;
        middleName: string;
        phone: string;
        email: string;
    }) => {
        setFieldErrors({});
        setFormError(null);
        createTenantMutation.mutate(values);
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Text fw={700} size="xl">
                        Список арендаторов
                    </Text>
                    <Text size="sm" c="dimmed">
                        Действующие договоры аренды
                    </Text>
                </div>
                <Select
                    label="Сортировка"
                    value={sortOrder}
                    onChange={(value) => setSortOrder((value as SortOrder) ?? "desc")}
                    data={[
                        { value: "desc", label: "Сортировать по площади (убыв.)" },
                        { value: "asc", label: "Сортировать по площади (возр.)" },
                    ]}
                    w={260}
                />
            </div>

            <div className="space-y-4">
                {tenantsWithMetrics.map(({ tenant, tenantRentals, totalPrice, totalArea, status }) => (
                    <div key={tenant.id} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <button
                            type="button"
                            className="flex w-full flex-wrap items-center justify-between gap-4 px-5 py-4 text-left"
                            onClick={() => handleTenantToggle(tenant.id)}
                        >
                            <div>
                                <Text fw={700}>{getTenantName(tenant)}</Text>
                                <Text size="xs" c="dimmed">
                                    ID: {tenant.id}
                                </Text>
                            </div>

                            <div className="flex flex-wrap items-center gap-6">
                                <div className="text-right">
                                    <Text size="xs" c="dimmed">
                                        ОБЩАЯ СТАВКА
                                    </Text>
                                    <Text fw={700}>{formatCurrency(totalPrice)} руб/мес</Text>
                                </div>
                                <div className="text-right">
                                    <Text size="xs" c="dimmed">
                                        ОБЩАЯ ПЛОЩАДЬ
                                    </Text>
                                    <Text fw={700}>{formatArea(totalArea)} кв.м</Text>
                                </div>
                                <div
                                    className="rounded px-3 py-1 text-xs font-semibold"
                                    style={{ backgroundColor: status.color, color: status.text }}
                                >
                                    {status.label}
                                </div>
                                {openedTenantId === tenant.id ? (
                                    <ChevronUpIcon size={18} className="text-gray-500" />
                                ) : (
                                    <ChevronDownIcon size={18} className="text-gray-500" />
                                )}
                            </div>
                        </button>

                        {openedTenantId === tenant.id && (
                            <div className="border-t border-gray-200 px-5 pb-4">
                                <div className="grid grid-cols-1 gap-3 py-4 text-xs font-semibold text-gray-400 sm:grid-cols-4">
                                    <div>СКЛАД</div>
                                    <div>СЕКЦИЯ</div>
                                    <div>ПЛОЩАДЬ</div>
                                    <div className="text-right">СРОК ДО</div>
                                </div>
                                <div className="space-y-3">
                                    {tenantRentals.length === 0 ? (
                                        <Text size="sm" c="dimmed">
                                            У арендатора пока нет аренд.
                                        </Text>
                                    ) : (
                                        tenantRentals.map((rental) => (
                                            <div
                                                key={rental.id}
                                                className="grid grid-cols-1 items-center gap-3 rounded-md border border-gray-200 px-4 py-3 text-sm sm:grid-cols-4"
                                            >
                                                <div className="font-semibold">
                                                    {warehousesById.get(rental.warehouseId) ?? `Склад #${rental.warehouseId}`}
                                                </div>
                                                <div>{`${String.fromCharCode(64 + rental.rowStart)}${rental.colStart}-${String.fromCharCode(64 + rental.rowEnd)}${rental.colEnd}`}</div>
                                                <div>{formatArea(rental.areaSquare)} кв.м</div>
                                                <div className="text-right">
                                                    {new Date(rental.endDate).toLocaleDateString("ru-RU")}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {tenantRentals.length > 0 && (
                                    <div className="mt-4 flex items-center justify-end gap-6 border-t border-gray-100 pt-3 text-sm font-semibold">
                                        <span>ИТОГО</span>
                                        <span>{formatArea(totalArea)} кв.м</span>
                                        <span>{formatCurrency(totalPrice)} руб/мес</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Button onClick={() => setIsCreateOpen(true)}>Добавить арендатора</Button>

            <CreateTenantModal
                opened={isCreateOpen}
                onClose={() => {
                    setIsCreateOpen(false);
                    setFieldErrors({});
                    setFormError(null);
                }}
                onSubmit={handleCreateTenant}
                isSubmitting={createTenantMutation.isPending}
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
