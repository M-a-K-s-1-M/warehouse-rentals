import { $api } from "../config";
import { IWarehouse, IWarehouseBlock } from "../types";

export class WarehousesApi {
    static async listWarehouses(squareOrder?: "asc" | "desc"): Promise<IWarehouse[]> {
        const res = await $api.get("/warehouses", {
            params: squareOrder ? { squareOrder } : undefined,
        });
        return res.data;
    }

    static async getWarehouse(id: number): Promise<IWarehouse> {
        const res = await $api.get(`/warehouses/${id}`);
        return res.data;
    }

    static async listBlocks(warehouseId: number): Promise<IWarehouseBlock[]> {
        const res = await $api.get(`/warehouses/${warehouseId}/blocks`);
        return res.data;
    }

    static async blockCells(warehouseId: number, labels: string[]): Promise<IWarehouseBlock[]> {
        const res = await $api.post(`/warehouses/${warehouseId}/blocks`, { labels });
        return res.data;
    }

    static async unblockCells(warehouseId: number, labels: string[]): Promise<IWarehouseBlock[]> {
        const res = await $api.delete(`/warehouses/${warehouseId}/blocks`, {
            data: { labels },
        });
        return res.data;
    }

    static async createWarehouse(input: {
        title: string;
        address: string;
        description?: string | null;
        square: number;
        cellSquare: number;
        pricePerCell: number;
    }): Promise<IWarehouse> {
        const res = await $api.post("/warehouses", input);
        return res.data;
    }

    static async deleteWarehouse(warehouseId: number): Promise<void> {
        await $api.delete(`/warehouses/${warehouseId}`);
    }
}