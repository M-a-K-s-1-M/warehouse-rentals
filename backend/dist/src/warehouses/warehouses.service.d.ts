import { PrismaService } from "../prisma/prisma.service";
export declare class WarehousesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createWarehouse(input: {
        title: string;
        address: string;
        description?: string;
        square: number;
        cellSquare: number;
        pricePerCell: number;
    }): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        address: string;
        description: string | null;
        square: number;
        cellSquare: number;
        gridRows: number;
        gridCols: number;
        pricePerCell: number;
        updatedAt: Date;
    }>;
    listWarehouses(squareOrder?: "asc" | "desc"): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        address: string;
        description: string | null;
        square: number;
        cellSquare: number;
        gridRows: number;
        gridCols: number;
        pricePerCell: number;
        updatedAt: Date;
    }[]>;
    getWarehouse(id: number): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        address: string;
        description: string | null;
        square: number;
        cellSquare: number;
        gridRows: number;
        gridCols: number;
        pricePerCell: number;
        updatedAt: Date;
    }>;
    updateWarehouse(id: number, input: {
        title?: string;
        address?: string;
        description?: string;
        square?: number;
        cellSquare?: number;
        pricePerCell?: number;
    }): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        address: string;
        description: string | null;
        square: number;
        cellSquare: number;
        gridRows: number;
        gridCols: number;
        pricePerCell: number;
        updatedAt: Date;
    }>;
    deleteWarehouse(id: number): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        address: string;
        description: string | null;
        square: number;
        cellSquare: number;
        gridRows: number;
        gridCols: number;
        pricePerCell: number;
        updatedAt: Date;
    }>;
    private calculateGrid;
}
