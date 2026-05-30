import { $api } from "../config";
import { IRental } from "../types";

export class RentalsApi {
    static async listRentals(warehouseId?: number, userId?: string): Promise<IRental[]> {
        const params: { warehouseId?: number; userId?: string } = {};
        if (warehouseId !== undefined) {
            params.warehouseId = warehouseId;
        }
        if (userId !== undefined) {
            params.userId = userId;
        }

        const res = await $api.get("/rentals", { params });
        return res.data;
    }

    static async createRental(input: {
        warehouseId: number;
        userId: string;
        startDate: string;
        endDate: string;
        autoRenew?: boolean;
        rowStart: number;
        rowEnd: number;
        colStart: number;
        colEnd: number;
        extraContactName?: string;
        extraContactEmail?: string;
        color?: string;
    }): Promise<IRental> {
        const res = await $api.post("/rentals", input);
        return res.data;
    }
}
