'use client';

import { Button, Checkbox, ColorInput, Group, Modal, Select, Text, TextInput } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import type { IUser } from "@/lib";

type RentalCreateModalProps = {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: {
        userId: string;
        startDate: string;
        endDate: string;
        autoRenew: boolean;
        color?: string;
    }) => void;
    isSubmitting: boolean;
    tenants: IUser[];
    totalCells: number;
    pricePerCell: number;
};

function diffDays(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
        return 0;
    }

    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) {
        return 0;
    }

    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function RentalCreateModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    tenants,
    totalCells,
    pricePerCell,
}: RentalCreateModalProps) {
    const [userId, setUserId] = useState<string | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [autoRenew, setAutoRenew] = useState(false);
    const [color, setColor] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!opened) {
            setUserId(null);
            setStartDate("");
            setEndDate("");
            setAutoRenew(false);
            setColor(undefined);
        }
    }, [opened]);

    const days = useMemo(() => diffDays(startDate, endDate), [startDate, endDate]);
    const totalPrice = useMemo(() => totalCells * pricePerCell * days, [totalCells, pricePerCell, days]);

    const handleSubmit = () => {
        if (!userId || !startDate || !endDate) {
            return;
        }

        onSubmit({
            userId,
            startDate,
            endDate,
            autoRenew,
            color,
        });
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Создать аренду" centered>
            <div className="space-y-4">
                <Select
                    label="Арендатор"
                    placeholder="Выберите арендатора"
                    value={userId}
                    onChange={setUserId}
                    data={tenants.map((tenant) => ({
                        value: tenant.id,
                        label: tenant.email,
                    }))}
                    searchable
                    nothingFoundMessage="Арендаторы не найдены"
                    required
                />

                <Group grow>
                    <TextInput
                        type="date"
                        label="Дата начала"
                        value={startDate}
                        onChange={(event) => setStartDate(event.currentTarget.value)}
                        required
                    />
                    <TextInput
                        type="date"
                        label="Дата окончания"
                        value={endDate}
                        onChange={(event) => setEndDate(event.currentTarget.value)}
                        required
                    />
                </Group>

                <ColorInput
                    label="Цвет аренды"
                    placeholder="#3B82F6"
                    value={color}
                    onChange={setColor}
                    withPicker
                    swatches={["#3B82F6", "#10B981", "#F97316", "#F43F5E", "#8B5CF6"]}
                />

                <Checkbox
                    label="Автопролонгация"
                    checked={autoRenew}
                    onChange={(event) => setAutoRenew(event.currentTarget.checked)}
                />

                <div className="rounded-md border border-gray-200 p-3">
                    <Text size="sm" c="dimmed">
                        Выбрано блоков: {totalCells}
                    </Text>
                    <Text size="sm" c="dimmed">
                        Дней аренды: {days || 0}
                    </Text>
                    <Text fw={600}>Итого: {totalPrice.toFixed(2)} руб.</Text>
                </div>

                <Group justify="flex-end">
                    <Button variant="default" onClick={onClose} disabled={isSubmitting}>
                        Отмена
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={!userId || !startDate || !endDate}
                    >
                        Создать
                    </Button>
                </Group>
            </div>
        </Modal>
    );
}
