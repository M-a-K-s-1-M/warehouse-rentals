'use client';

import { ActionIcon } from "@mantine/core";
import { Trash2Icon } from "lucide-react";
import type { MouseEvent } from "react";

type DeleteWarehouseButtonProps = {
    onClick: () => void;
    className?: string;
};

export function DeleteWarehouseButton({
    onClick,
    className,
}: DeleteWarehouseButtonProps) {
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        event.preventDefault();
        onClick();
    };

    return (
        <ActionIcon
            variant="subtle"
            color="red"
            className={className}
            onClick={handleClick}
        >
            <Trash2Icon size={18} />
        </ActionIcon>
    );
}
