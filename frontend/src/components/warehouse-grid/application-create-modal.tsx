'use client';

import { Button, FileInput, Group, Modal, MultiSelect, Select, Text, Textarea } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import type { IUser } from "@/lib";

const PHOTO_KIND_OPTIONS = [
    { value: "BREAKDOWN", label: "Поломка" },
    { value: "REPAIR", label: "Ремонт" },
];

type ApplicationCreateModalProps = {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: {
        engineerIds: string[];
        description: string;
        photoFile?: File | null;
        photoKind?: string;
    }) => void;
    isSubmitting: boolean;
    engineers: IUser[];
    selectedLabels: string[];
    warehouseTitle: string;
};

export function ApplicationCreateModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    engineers,
    selectedLabels,
    warehouseTitle,
}: ApplicationCreateModalProps) {
    const [engineerIds, setEngineerIds] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoKind, setPhotoKind] = useState<string | null>("BREAKDOWN");

    useEffect(() => {
        if (!opened) {
            setEngineerIds([]);
            setDescription("");
            setPhotoFile(null);
            setPhotoKind("BREAKDOWN");
        }
    }, [opened]);

    const engineerOptions = useMemo(
        () =>
            engineers.map((engineer) => ({
                value: engineer.id,
                label: engineer.email,
            })),
        [engineers],
    );

    const selectionLabel = selectedLabels.length
        ? selectedLabels.map((label) => label.toUpperCase()).join(", ")
        : "";

    return (
        <Modal opened={opened} onClose={onClose} title="Создать заявку" centered>
            <div className="space-y-4">
                <div className="rounded-md border border-gray-200 p-3">
                    <Text size="sm" fw={600}>
                        {warehouseTitle}
                    </Text>
                    <Text size="sm" c="dimmed">
                        Ячейки: {selectionLabel || "не выбраны"}
                    </Text>
                </div>

                <MultiSelect
                    label="Инженеры"
                    placeholder="Выберите инженеров"
                    value={engineerIds}
                    onChange={setEngineerIds}
                    data={engineerOptions}
                    searchable
                    nothingFoundMessage="Инженеры не найдены"
                />

                <Textarea
                    label="Описание"
                    placeholder="Опишите проблему"
                    value={description}
                    onChange={(event) => setDescription(event.currentTarget.value)}
                    minRows={3}
                    required
                />

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr,1fr]">
                    <FileInput
                        label="Фото"
                        placeholder="Выберите файл"
                        value={photoFile}
                        onChange={setPhotoFile}
                        accept="image/*"
                    />
                    <Select
                        label="Тип фото"
                        data={PHOTO_KIND_OPTIONS}
                        value={photoKind}
                        onChange={setPhotoKind}
                    />
                </div>

                <Group justify="flex-end">
                    <Button variant="default" onClick={onClose} disabled={isSubmitting}>
                        Отмена
                    </Button>
                    <Button
                        onClick={() =>
                            onSubmit({
                                engineerIds,
                                description,
                                photoFile,
                                photoKind: photoKind ?? "BREAKDOWN",
                            })
                        }
                        loading={isSubmitting}
                        disabled={!description.trim()}
                    >
                        Создать
                    </Button>
                </Group>
            </div>
        </Modal>
    );
}
