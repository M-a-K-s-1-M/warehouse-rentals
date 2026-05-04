'use client';

import { CreateWarehouseButton, DeleteWarehouseButton } from "@/components";
import { WarehousesApi } from "@/lib";
import { Group, Select, Skeleton, Text } from "@mantine/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ListWarehouses() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const squareOrderParam = searchParams.get("squareOrder");
    const squareOrder = squareOrderParam === "asc" || squareOrderParam === "desc"
        ? squareOrderParam
        : null;

    const { data: warehouses, isLoading, error } = useQuery({
        queryKey: ["warehouses", squareOrder],
        queryFn: () => WarehousesApi.listWarehouses(squareOrder ?? undefined)
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

                    <CreateWarehouseButton
                        onCreated={() => queryClient.invalidateQueries({ queryKey: ["warehouses"] })}
                    />
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
                            onClick={(event) => {
                                if (event.defaultPrevented) {
                                    return;
                                }

                                const target = event.target as HTMLElement | null;
                                if (target?.closest("button")) {
                                    return;
                                }

                                router.push(`/${warehouse.id}`);
                            }}
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <p className="text-base text-gray-600 font-semibold truncate ">#{warehouse.id}</p>

                                <DeleteWarehouseButton
                                    className="absolute right-3 top-3"
                                    warehouseId={warehouse.id}
                                    onDeleted={() => queryClient.invalidateQueries({ queryKey: ["warehouses"] })}
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
