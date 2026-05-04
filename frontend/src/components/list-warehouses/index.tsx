'use client';

import { CreateWarehouseButton, DeleteWarehouseButton } from "@/components";
import { WarehousesApi } from "@/lib";
import {
    Button,
    Group,
    Modal,
    NumberInput,
    Select,
    Slider,
    Skeleton,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type CreateWarehouseForm = {
    title: string;
    address: string;
    description: string;
    square?: number;
    cellSquare?: number;
    pricePerCell?: number;
};

export function ListWarehouses() {
    const queryClient = useQueryClient();
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<CreateWarehouseForm>({
        defaultValues: {
            title: "",
            address: "",
            description: "",
            square: undefined,
            cellSquare: undefined,
            pricePerCell: undefined,
        },
    });

    const squareValue = watch("square");
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cellSquareCandidates = useMemo(() => {
        if (!squareValue || squareValue <= 0) {
            return [] as number[];
        }

        const candidates: number[] = [];
        for (let value = 5; value <= 100; value += 5) {
            if (squareValue % value === 0) {
                candidates.push(value);
            }
        }

        return candidates;
    }, [squareValue]);

    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (!squareValue || squareValue <= 0) {
            return;
        }

        debounceTimerRef.current = setTimeout(() => {
            if (cellSquareCandidates.length === 0) {
                return;
            }

            const current = watch("cellSquare") ?? cellSquareCandidates[0];
            let closest = cellSquareCandidates[0];
            let bestDiff = Math.abs(current - cellSquareCandidates[0]);

            for (const candidate of cellSquareCandidates) {
                const diff = Math.abs(current - candidate);
                if (diff < bestDiff) {
                    bestDiff = diff;
                    closest = candidate;
                }
            }

            setValue("cellSquare", closest, { shouldValidate: true });
        }, 600);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [squareValue, cellSquareCandidates, setValue, watch]);

    const squareOrderParam = searchParams.get("squareOrder");
    const squareOrder = squareOrderParam === "asc" || squareOrderParam === "desc"
        ? squareOrderParam
        : null;

    const { data: warehouses, isLoading, error } = useQuery({
        queryKey: ["warehouses", squareOrder],
        queryFn: () => WarehousesApi.listWarehouses(squareOrder ?? undefined)
    });

    const deleteWarehouseMutation = useMutation({
        mutationFn: (warehouseId: number) => WarehousesApi.deleteWarehouse(warehouseId),
        onSuccess: () => {
            notifications.show({
                color: "green",
                title: "Склад удален",
                message: "Склад успешно удален.",
            });
            setDeleteTargetId(null);
            queryClient.invalidateQueries({ queryKey: ["warehouses"] });
        },
        onError: () => {
            notifications.show({
                color: "red",
                title: "Ошибка удаления",
                message: "Не удалось удалить склад. Попробуйте еще раз.",
            });
        },
    });

    const createWarehouseMutation = useMutation({
        mutationFn: (input: {
            title: string;
            address: string;
            description?: string | null;
            square: number;
            cellSquare: number;
            pricePerCell: number;
        }) => WarehousesApi.createWarehouse(input),
        onSuccess: (created) => {
            notifications.show({
                color: "green",
                title: "Склад создан",
                message: `Склад "${created.title}" успешно создан.`,
            });
            setIsCreateModalOpen(false);
            reset();
            queryClient.invalidateQueries({ queryKey: ["warehouses"] });
        },
        onError: () => {
            notifications.show({
                color: "red",
                title: "Ошибка создания",
                message: "Не удалось создать склад. Проверьте данные и попробуйте еще раз.",
            });
        },
    });

    const sortedWarehouses = warehouses ?? [];

    const handleSquareOrderChange = (value: string | null) => {
        const nextParams = new URLSearchParams(searchParams.toString());

        if (value) {
            nextParams.set("squareOrder", value);
        } else {
            nextParams.delete("squareOrder");
        }

        const queryString = nextParams.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    };

    const handleCreateSubmit = handleSubmit((values) => {
        createWarehouseMutation.mutate({
            title: values.title.trim(),
            address: values.address.trim(),
            description: values.description.trim() ? values.description.trim() : null,
            square: values.square ?? 0,
            cellSquare: values.cellSquare ?? 0,
            pricePerCell: values.pricePerCell ?? 0,
        });
    });

    return (
        <>
            <div className="mb-4 flex items-center justify-between gap-3">
                <Group align="flex-end" gap="md">
                    <Select
                        label="Сортировка по площади"
                        placeholder="Выберите порядок"
                        value={squareOrder}
                        onChange={handleSquareOrderChange}
                        data={[
                            { value: "asc", label: "По возрастанию площади" },
                            { value: "desc", label: "По убыванию площади" },
                        ]}
                        clearable
                        w={260}
                    />

                    <CreateWarehouseButton onClick={() => setIsCreateModalOpen(true)} />
                </Group>

                <Text c="dimmed" size="sm" className="hidden xs:block">
                    {sortedWarehouses.length} склад(ов)
                </Text>
            </div>

            {error && (
                <Text size="sm" c="red" mb="md">
                    Не удалось загрузить список складов.
                </Text>
            )}

            <Modal
                opened={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Новый склад"
                centered
            >
                <form onSubmit={handleCreateSubmit}>
                    <Controller
                        name="title"
                        control={control}
                        rules={{ required: "Укажите название" }}
                        render={({ field }) => (
                            <TextInput
                                label="Название"
                                placeholder="Например, Склад на пр. Победы"
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.title?.message}
                                required
                                mb="sm"
                            />
                        )}
                    />
                    <Controller
                        name="address"
                        control={control}
                        rules={{ required: "Укажите адрес" }}
                        render={({ field }) => (
                            <TextInput
                                label="Адрес"
                                placeholder="Город, улица, дом"
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.address?.message}
                                required
                                mb="sm"
                            />
                        )}
                    />
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                label="Описание"
                                placeholder="Дополнительная информация"
                                value={field.value}
                                onChange={field.onChange}
                                autosize
                                minRows={3}
                                mb="sm"
                            />
                        )}
                    />
                    <Controller
                        name="square"
                        control={control}
                        rules={{
                            required: "Укажите площадь",
                            min: { value: 1, message: "Минимум 1" },
                        }}
                        render={({ field }) => (
                            <NumberInput
                                label="Площадь (м²)"
                                placeholder="Например, 1200"
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.square?.message}
                                min={1}
                                required
                                mb="sm"
                            />
                        )}
                    />
                    <Controller
                        name="cellSquare"
                        control={control}
                        rules={{
                            required: "Укажите площадь ячейки",
                            min: { value: 5, message: "Минимум 5" },
                            max: { value: 100, message: "Максимум 100" },
                        }}
                        render={({ field }) => (
                            <div className="mb-sm">
                                <Text size="sm" fw={500} mb={6}>
                                    Площадь ячейки (м²)
                                </Text>
                                <Slider
                                    value={field.value ?? 5}
                                    onChange={(value) => {
                                        if (cellSquareCandidates.length === 0) {
                                            field.onChange(value);
                                            return;
                                        }

                                        let closest = cellSquareCandidates[0];
                                        let bestDiff = Math.abs(value - closest);
                                        for (const candidate of cellSquareCandidates) {
                                            const diff = Math.abs(value - candidate);
                                            if (diff < bestDiff) {
                                                bestDiff = diff;
                                                closest = candidate;
                                            }
                                        }

                                        field.onChange(closest);
                                    }}
                                    min={5}
                                    max={100}
                                    step={5}
                                    marks={cellSquareCandidates.length
                                        ? cellSquareCandidates.map((value) => ({
                                            value,
                                            label: String(value),
                                        }))
                                        : [
                                            { value: 5, label: "5" },
                                            { value: 25, label: "25" },
                                            { value: 50, label: "50" },
                                            { value: 75, label: "75" },
                                            { value: 100, label: "100" },
                                        ]}
                                />
                                {errors.cellSquare?.message && (
                                    <Text size="xs" c="red" mt={4}>
                                        {errors.cellSquare.message}
                                    </Text>
                                )}
                            </div>
                        )}
                    />
                    <Controller
                        name="pricePerCell"
                        control={control}
                        rules={{
                            required: "Укажите цену",
                            min: { value: 1, message: "Минимум 1" },
                        }}
                        render={({ field }) => (
                            <NumberInput
                                label="Цена за м²"
                                placeholder="Например, 450"
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.pricePerCell?.message}
                                min={1}
                                required
                            />
                        )}
                    />

                    <Group justify="flex-end" mt="lg">
                        <Button
                            variant="default"
                            onClick={() => setIsCreateModalOpen(false)}
                            disabled={createWarehouseMutation.isPending}
                            type="button"
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            loading={createWarehouseMutation.isPending}
                        >
                            Создать
                        </Button>
                    </Group>
                </form>
            </Modal>

            <Modal
                opened={deleteTargetId !== null}
                onClose={() => setDeleteTargetId(null)}
                title="Удалить склад?"
                centered
            >
                <Text size="sm" c="dimmed" mb="md">
                    Это действие нельзя отменить. Удалить выбранный склад?
                </Text>
                <Group justify="flex-end">
                    <Button
                        variant="default"
                        onClick={() => setDeleteTargetId(null)}
                        disabled={deleteWarehouseMutation.isPending}
                    >
                        Отмена
                    </Button>
                    <Button
                        color="red"
                        onClick={() => {
                            if (deleteTargetId !== null) {
                                deleteWarehouseMutation.mutate(deleteTargetId);
                            }
                        }}
                        loading={deleteWarehouseMutation.isPending}
                    >
                        Удалить
                    </Button>
                </Group>
            </Modal>

            <ul className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {isLoading
                    ? Array.from({ length: 10 }).map((_, index) => (
                        <li key={`skeleton-${index}`} className="border-2 border-gray-200 p-4 bg-white">
                            <Skeleton height={18} width={70} mb="sm" />
                            <Skeleton height={20} width="80%" mb="sm" />
                            <Skeleton height={16} width="60%" mb="sm" />
                            <Skeleton height={16} width="90%" mb="xs" />
                            <Skeleton height={16} width="70%" />
                        </li>
                    ))
                    : sortedWarehouses.map((warehouse) => (
                        <li
                            key={warehouse.id}
                            className="relative border-2 border-gray-300 p-4 bg-white cursor-pointer duration-200 hover:scale-103"
                            onClick={() => router.push(`/${warehouse.id}`)}
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <p className="text-base text-gray-600 font-semibold truncate ">#{warehouse.id}</p>


                                <DeleteWarehouseButton
                                    className="absolute right-3 top-3"
                                    onClick={() => setDeleteTargetId(warehouse.id)}
                                />
                            </div>

                            <h3 className="text-lg font-semibold">{warehouse.title}</h3>
                            <p className="text-base text-gray-600 mb-3">{warehouse.address}</p>
                            <p className="text-base font-semibold text-gray-600 mb-2">Площадь: <span className="bg-indigo-50 p-1 px-2 ml-2 rounded-md text-indigo-900">{warehouse.square} м²</span></p>
                            <p className="text-base font-semibold text-gray-600">Цена за м²: <span className="bg-orange-50 p-1 px-2 ml-2 rounded-md text-orange-900">{warehouse.pricePerCell} руб.</span></p>
                        </li>
                    ))}
            </ul>
        </>
    )
}
