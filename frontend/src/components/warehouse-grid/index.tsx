'use client'

import { RentalCreateModal } from "@/components";
import { ApplicationsApi, RentalsApi, UsersApi, WarehousesApi } from "@/lib";
import { Button, Group, Modal, Skeleton, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ApplicationCreateModal } from "./application-create-modal";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const cellSize = 40;

function toAlphaLabel(index: number) {
    let n = index + 1;
    let label = "";

    while (n > 0) {
        const remainder = (n - 1) % 26;
        label = alphabet[remainder] + label;
        n = Math.floor((n - 1) / 26);
    }

    return label;
}

function parseLabel(label: string) {
    const match = /^([A-Z]+)(\d+)$/.exec(label.trim().toUpperCase());
    if (!match) {
        return null;
    }

    const letters = match[1];
    const digits = match[2];
    let row = 0;
    for (const char of letters) {
        row = row * 26 + (char.charCodeAt(0) - 64);
    }

    const col = Number(digits);
    if (!Number.isFinite(col) || col <= 0) {
        return null;
    }

    return { row, col };
}

function buildLabel(row: number, col: number) {
    return `${toAlphaLabel(row - 1)}${col}`;
}

function getSelectionRect(labels: string[]) {
    if (labels.length === 0) {
        return null;
    }

    const coords = labels.map(parseLabel).filter(Boolean) as { row: number; col: number }[];
    if (coords.length !== labels.length) {
        return null;
    }

    const rows = coords.map((c) => c.row);
    const cols = coords.map((c) => c.col);
    const rowStart = Math.min(...rows);
    const rowEnd = Math.max(...rows);
    const colStart = Math.min(...cols);
    const colEnd = Math.max(...cols);

    const set = new Set(labels.map((label) => label.toUpperCase()));
    let isRectangle = true;
    for (let row = rowStart; row <= rowEnd; row += 1) {
        for (let col = colStart; col <= colEnd; col += 1) {
            if (!set.has(buildLabel(row, col))) {
                isRectangle = false;
                break;
            }
        }
        if (!isRectangle) {
            break;
        }
    }

    return { rowStart, rowEnd, colStart, colEnd, isRectangle };
}

function rectanglesOverlap(
    a: { rowStart: number; rowEnd: number; colStart: number; colEnd: number },
    b: { rowStart: number; rowEnd: number; colStart: number; colEnd: number },
) {
    const rowsOverlap = a.rowStart <= b.rowEnd && a.rowEnd >= b.rowStart;
    const colsOverlap = a.colStart <= b.colEnd && a.colEnd >= b.colStart;
    return rowsOverlap && colsOverlap;
}

function datesOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
    return startA <= endB && endA >= startB;
}

export function WarehouseGrid() {
    const params = useParams<{ id: string }>();
    const warehouseId = Number(params?.id);
    const queryClient = useQueryClient();

    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [confirmAction, setConfirmAction] = useState<"block" | "unblock" | null>(null);
    const [isRentalOpen, setIsRentalOpen] = useState(false);
    const [isApplicationOpen, setIsApplicationOpen] = useState(false);

    const { data: warehouse, isLoading, error } = useQuery({
        queryKey: ["warehouse", warehouseId],
        queryFn: () => WarehousesApi.getWarehouse(warehouseId),
        enabled: Number.isFinite(warehouseId),
    });

    const { data: blocks } = useQuery({
        queryKey: ["warehouse-blocks", warehouseId],
        queryFn: () => WarehousesApi.listBlocks(warehouseId),
        enabled: Number.isFinite(warehouseId),
    });

    const { data: rentals } = useQuery({
        queryKey: ["rentals", warehouseId],
        queryFn: () => RentalsApi.listRentals(warehouseId),
        enabled: Number.isFinite(warehouseId),
    });

    const { data: users } = useQuery({
        queryKey: ["users"],
        queryFn: () => UsersApi.listUsers(),
    });

    const tenants = useMemo(
        () => (users ?? []).filter((user) => user.role === "CLIENT"),
        [users],
    );

    const engineers = useMemo(
        () => (users ?? []).filter((user) => user.role === "ENGINEER"),
        [users],
    );

    const blockedSet = useMemo(() => new Set((blocks ?? []).map((block) => block.label)), [blocks]);

    const rentedColorMap = useMemo(() => {
        const map = new Map<string, string>();
        const now = new Date();

        (rentals ?? []).forEach((rental) => {
            const start = new Date(rental.startDate);
            const end = new Date(rental.endDate);
            if (!datesOverlap(start, end, now, now)) {
                return;
            }

            for (let row = rental.rowStart; row <= rental.rowEnd; row += 1) {
                for (let col = rental.colStart; col <= rental.colEnd; col += 1) {
                    map.set(buildLabel(row, col), rental.color ?? "#93C5FD");
                }
            }
        });

        return map;
    }, [rentals]);

    const selectionRect = useMemo(() => getSelectionRect(selectedLabels), [selectedLabels]);
    const selectionSet = useMemo(
        () => new Set(selectedLabels.map((label) => label.toUpperCase())),
        [selectedLabels],
    );
    const hasSelection = selectedLabels.length > 0;
    const allSelectedBlocked = hasSelection && selectedLabels.every((label) => blockedSet.has(label));

    const blockMutation = useMutation({
        mutationFn: (labels: string[]) => WarehousesApi.blockCells(warehouseId, labels),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["warehouse-blocks", warehouseId] });
            setSelectedLabels([]);
            notifications.show({
                title: "Блоки заблокированы",
                message: "Выбранные блоки успешно заблокированы.",
                color: "green",
            });
        },
        onError: () => {
            notifications.show({
                title: "Ошибка блокировки",
                message: "Не удалось заблокировать блоки.",
                color: "red",
            });
        },
    });

    const unblockMutation = useMutation({
        mutationFn: (labels: string[]) => WarehousesApi.unblockCells(warehouseId, labels),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["warehouse-blocks", warehouseId] });
            setSelectedLabels([]);
            notifications.show({
                title: "Блоки разблокированы",
                message: "Выбранные блоки успешно разблокированы.",
                color: "green",
            });
        },
        onError: () => {
            notifications.show({
                title: "Ошибка разблокировки",
                message: "Не удалось разблокировать блоки.",
                color: "red",
            });
        },
    });

    const createRentalMutation = useMutation({
        mutationFn: (input: {
            userId: string;
            startDate: string;
            endDate: string;
            autoRenew: boolean;
            color?: string;
        }) => {
            if (!selectionRect) {
                throw new Error("invalid selection");
            }

            return RentalsApi.createRental({
                warehouseId,
                userId: input.userId,
                startDate: input.startDate,
                endDate: input.endDate,
                autoRenew: input.autoRenew,
                rowStart: selectionRect.rowStart,
                rowEnd: selectionRect.rowEnd,
                colStart: selectionRect.colStart,
                colEnd: selectionRect.colEnd,
                color: input.color,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rentals", warehouseId] });
            setSelectedLabels([]);
            setIsRentalOpen(false);
            notifications.show({
                title: "Аренда создана",
                message: "Аренда успешно создана.",
                color: "green",
            });
        },
        onError: () => {
            notifications.show({
                title: "Ошибка аренды",
                message: "Не удалось создать аренду.",
                color: "red",
            });
        },
    });

    const createApplicationMutation = useMutation({
        mutationFn: async (input: {
            description: string;
            engineerIds: string[];
            photoFile?: File | null;
            photoKind?: string;
        }) => {
            const selectionInfo = selectedLabels.length
                ? `\n\nЯчейки: ${selectedLabels.map((label) => label.toUpperCase()).join(", ")}`
                : "";
            const application = await ApplicationsApi.createApplication({
                warehouseId,
                description: `${input.description.trim()}${selectionInfo}`,
            });

            if (input.engineerIds.length > 0) {
                await ApplicationsApi.assignEngineers({
                    applicationId: application.id,
                    engineerIds: input.engineerIds,
                });
            }

            if (input.photoFile) {
                await ApplicationsApi.uploadPhoto({
                    applicationId: application.id,
                    file: input.photoFile,
                    kind: input.photoKind ?? "BREAKDOWN",
                });
            }

            return application;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            setSelectedLabels([]);
            setIsApplicationOpen(false);
            notifications.show({
                title: "Заявка создана",
                message: "Заявка успешно создана.",
                color: "green",
            });
        },
        onError: () => {
            notifications.show({
                title: "Ошибка заявки",
                message: "Не удалось создать заявку.",
                color: "red",
            });
        },
    });

    if (!Number.isFinite(warehouseId)) {
        return (
            <Text size="sm" c="red">
                Некорректный идентификатор склада.
            </Text>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton height={18} width={160} />
                <Skeleton height={360} />
            </div>
        );
    }

    if (error || !warehouse) {
        return (
            <Text size="sm" c="red">
                Не удалось загрузить сетку склада.
            </Text>
        );
    }

    const rows = Math.max(warehouse.gridRows ?? 0, 0);
    const cols = Math.max(warehouse.gridCols ?? 0, 0);

    const handleCellClick = (label: string) => {
        setSelectedLabels((prev) =>
            prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label],
        );
    };

    const handleConfirmBlocks = () => {
        if (!hasSelection) {
            return;
        }

        const labels = selectedLabels.map((label) => label.toUpperCase());
        if (confirmAction === "block") {
            blockMutation.mutate(labels);
        } else if (confirmAction === "unblock") {
            unblockMutation.mutate(labels);
        }
        setConfirmAction(null);
    };

    const handleOpenRental = () => {
        if (!selectionRect || !selectionRect.isRectangle) {
            notifications.show({
                title: "Неверный выбор",
                message: "Выберите прямоугольную область без пропусков.",
                color: "red",
            });
            return;
        }

        const hasBlocked = selectedLabels.some((label) => blockedSet.has(label));
        if (hasBlocked) {
            notifications.show({
                title: "Есть заблокированные",
                message: "Сначала разблокируйте выбранные блоки.",
                color: "red",
            });
            return;
        }

        setIsRentalOpen(true);
    };

    const handleCreateRental = (values: {
        userId: string;
        startDate: string;
        endDate: string;
        autoRenew: boolean;
        color?: string;
    }) => {
        if (!selectionRect || !selectionRect.isRectangle) {
            notifications.show({
                title: "Неверный выбор",
                message: "Выберите прямоугольную область без пропусков.",
                color: "red",
            });
            return;
        }

        const hasBlocked = selectedLabels.some((label) => blockedSet.has(label));
        if (hasBlocked) {
            notifications.show({
                title: "Есть заблокированные",
                message: "Сначала разблокируйте выбранные блоки.",
                color: "red",
            });
            return;
        }

        const start = new Date(values.startDate);
        const end = new Date(values.endDate);
        const overlap = (rentals ?? []).some((rental) => {
            const rentalStart = new Date(rental.startDate);
            const rentalEnd = new Date(rental.endDate);
            if (!datesOverlap(start, end, rentalStart, rentalEnd)) {
                return false;
            }

            return rectanglesOverlap(
                {
                    rowStart: selectionRect.rowStart,
                    rowEnd: selectionRect.rowEnd,
                    colStart: selectionRect.colStart,
                    colEnd: selectionRect.colEnd,
                },
                {
                    rowStart: rental.rowStart,
                    rowEnd: rental.rowEnd,
                    colStart: rental.colStart,
                    colEnd: rental.colEnd,
                },
            );
        });

        if (overlap) {
            notifications.show({
                title: "Есть пересечения",
                message: "Выбранные блоки уже заняты на эти даты.",
                color: "red",
            });
            return;
        }

        createRentalMutation.mutate(values);
    };

    return (
        <div className="space-y-4">
            <div>
                <Text fw={600} size="xl">
                    {warehouse.title}
                </Text>
                <Text size="md" c="dimmed">
                    {warehouse.address}
                </Text>
            </div>

            <div className="overflow-x-auto">
                <div
                    className="inline-block rounded-lg border border-gray-200 bg-white p-1 py-2 shadow-sm"
                    style={{
                        width: (cols + 1) * cellSize + cols * 8 + 32,
                    }}
                >
                    <div className="overflow-x-auto">
                        <div
                            className="grid gap-2"
                            style={{
                                gridTemplateColumns: `repeat(${cols + 1}, ${cellSize}px)`,
                            }}
                        >
                            <div />
                            {Array.from({ length: cols }).map((_, colIndex) => (
                                <div
                                    key={`col-${colIndex}`}
                                    className="text-center text-[11px] font-semibold text-gray-500"
                                >
                                    {colIndex + 1}
                                </div>
                            ))}

                            {Array.from({ length: rows }).map((_, rowIndex) => (
                                <div key={`row-${rowIndex}`} className="contents">
                                    <div className="flex items-center justify-center text-[11px] font-semibold text-gray-500">
                                        {toAlphaLabel(rowIndex)}
                                    </div>
                                    {Array.from({ length: cols }).map((_, colIndex) => {
                                        const label = buildLabel(rowIndex + 1, colIndex + 1);
                                        const isSelected = selectionSet.has(label);
                                        const isBlocked = blockedSet.has(label);
                                        const rentedColor = rentedColorMap.get(label);

                                        return (
                                            <button
                                                key={`cell-${rowIndex}-${colIndex}`}
                                                type="button"
                                                onClick={() => handleCellClick(label)}
                                                className={`h-10 w-10 rounded-[4px] border transition ${isBlocked
                                                    ? "border-gray-300 bg-gray-200"
                                                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                                    } ${isSelected ? "ring-2 ring-blue-400" : ""}`}
                                                style={
                                                    rentedColor && !isBlocked
                                                        ? { backgroundColor: rentedColor, borderColor: rentedColor }
                                                        : undefined
                                                }
                                                aria-label={`Ячейка ${label}`}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-center border-t border-gray-200 pt-3">
                        <span className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-500">
                            СВОБОДНО
                        </span>
                    </div>
                </div>
            </div>

            {hasSelection && (
                <Group justify="start">
                    <Text size="sm" c="dimmed">
                        Выбрано: {selectedLabels.length} блок(ов)
                    </Text>
                    <Group>
                        <Button
                            color={allSelectedBlocked ? "gray" : "red"}
                            onClick={() => setConfirmAction(allSelectedBlocked ? "unblock" : "block")}
                        >
                            {allSelectedBlocked ? "Разблокировать блоки" : "Заблокировать блоки"}
                        </Button>
                        <Button onClick={handleOpenRental}>Создать аренду</Button>
                        <Button variant="outline" onClick={() => setIsApplicationOpen(true)}>
                            Создать заявку
                        </Button>
                    </Group>
                </Group>
            )}

            <Modal
                opened={confirmAction !== null}
                onClose={() => setConfirmAction(null)}
                title={confirmAction === "unblock" ? "Разблокировать блоки" : "Заблокировать блоки"}
                centered
            >
                <Text size="sm" c="dimmed" mb="md">
                    {confirmAction === "unblock"
                        ? "Разблокировать выбранные блоки?"
                        : "Заблокировать выбранные блоки?"}
                </Text>
                <Group justify="flex-end">
                    <Button variant="default" onClick={() => setConfirmAction(null)}>
                        Отмена
                    </Button>
                    <Button
                        color={confirmAction === "unblock" ? "gray" : "red"}
                        onClick={handleConfirmBlocks}
                        loading={blockMutation.isPending || unblockMutation.isPending}
                    >
                        Подтвердить
                    </Button>
                </Group>
            </Modal>

            <RentalCreateModal
                opened={isRentalOpen}
                onClose={() => setIsRentalOpen(false)}
                onSubmit={handleCreateRental}
                isSubmitting={createRentalMutation.isPending}
                tenants={tenants}
                totalCells={
                    selectionRect && selectionRect.isRectangle
                        ? (selectionRect.rowEnd - selectionRect.rowStart + 1)
                        * (selectionRect.colEnd - selectionRect.colStart + 1)
                        : 0
                }
                pricePerCell={warehouse.pricePerCell}
            />

            <ApplicationCreateModal
                opened={isApplicationOpen}
                onClose={() => setIsApplicationOpen(false)}
                onSubmit={(values) => {
                    if (!hasSelection) {
                        notifications.show({
                            title: "Нет выбора",
                            message: "Сначала выберите блоки.",
                            color: "orange",
                        });
                        return;
                    }
                    createApplicationMutation.mutate(values);
                }}
                isSubmitting={createApplicationMutation.isPending}
                engineers={engineers}
                selectedLabels={selectedLabels}
                warehouseTitle={warehouse.title}
            />
        </div>
    );
}
