import { $api } from "../config";
import { IWarehouse } from "../types";

export class WarehousesApi {
    static async listWarehouses(squareOrder?: "asc" | "desc"): Promise<IWarehouse[]> {
        const res = await $api.get("/warehouses", {
            params: squareOrder ? { squareOrder } : undefined,
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