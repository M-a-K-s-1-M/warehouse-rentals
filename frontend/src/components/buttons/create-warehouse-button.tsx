'use client';

import { WarehousesApi } from "@/lib";
import {
    Button,
    Group,
    Modal,
    NumberInput,
    Slider,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
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

type CreateWarehouseButtonProps = {
    disabled?: boolean;
    onCreated?: () => void;
};

export function CreateWarehouseButton({
    disabled = false,
    onCreated,
}: CreateWarehouseButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
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
            setIsOpen(false);
            reset();
            onCreated?.();
        },
        onError: () => {
            notifications.show({
                color: "red",
                title: "Ошибка создания",
                message: "Не удалось создать склад. Проверьте данные и попробуйте еще раз.",
            });
        },
    });

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
            <Button
                leftSection={<PlusIcon size={16} />}
                onClick={() => setIsOpen(true)}
                disabled={disabled}
            >
                Создать склад
            </Button>

            <Modal
                opened={isOpen}
                onClose={() => setIsOpen(false)}
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
                            onClick={() => setIsOpen(false)}
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
        </>
    );
}
