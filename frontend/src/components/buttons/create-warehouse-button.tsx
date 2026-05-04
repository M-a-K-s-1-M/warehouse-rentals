'use client';

import { Button } from "@mantine/core";
import { PlusIcon } from "lucide-react";

type CreateWarehouseButtonProps = {
    onClick: () => void;
    isLoading?: boolean;
    disabled?: boolean;
};

export function CreateWarehouseButton({
    onClick,
    isLoading = false,
    disabled = false,
}: CreateWarehouseButtonProps) {
    return (
        <Button
            leftSection={<PlusIcon size={16} />}
            onClick={onClick}
            loading={isLoading}
            disabled={disabled}
        >
            Создать склад
        </Button>
    );
}
