'use client';

import { WarehousesApi } from "@/lib";
import { ActionIcon, Button, Group, Modal, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
import type { MouseEvent } from "react";
import { useState } from "react";

type DeleteWarehouseButtonProps = {
    warehouseId: number;
    className?: string;
    onDeleted?: () => void;
};

export function DeleteWarehouseButton({
    warehouseId,
    className,
    onDeleted,
}: DeleteWarehouseButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const deleteWarehouseMutation = useMutation({
        mutationFn: (id: number) => WarehousesApi.deleteWarehouse(id),
        onSuccess: () => {
            notifications.show({
                color: "green",
                title: "Склад удален",
                message: "Склад успешно удален.",
            });
            setIsOpen(false);
            onDeleted?.();
        },
        onError: () => {
            notifications.show({
                color: "red",
                title: "Ошибка удаления",
                message: "Не удалось удалить склад. Попробуйте еще раз.",
            });
        },
    });

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        event.preventDefault();
        setIsOpen(true);
    };

    return (
        <>
            <ActionIcon
                variant="subtle"
                color="red"
                className={className}
                onClick={handleClick}
            >
                <Trash2Icon size={18} />
            </ActionIcon>

            <Modal
                opened={isOpen}
                onClose={() => setIsOpen(false)}
                title="Удалить склад?"
                centered
            >
                <Text size="sm" c="dimmed" mb="md">
                    Это действие нельзя отменить. Удалить выбранный склад?
                </Text>
                <Group justify="flex-end">
                    <Button
                        variant="default"
                        onClick={() => setIsOpen(false)}
                        disabled={deleteWarehouseMutation.isPending}
                    >
                        Отмена
                    </Button>
                    <Button
                        color="red"
                        onClick={() => deleteWarehouseMutation.mutate(warehouseId)}
                        loading={deleteWarehouseMutation.isPending}
                    >
                        Удалить
                    </Button>
                </Group>
            </Modal>
        </>
    );
}
