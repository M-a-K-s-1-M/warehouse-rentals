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
        price: number;
    }): Promise<{
        id: string;
        title: string;
        address: string;
        description: string | null;
        square: number;
        cellSquare: number;
        gridRows: number;
        gridCols: number;
        price: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listWarehouses(): Promise<{
        id: string;
        title: string;
        address: string;
        description: string | null;
        square: number;
        cellSquare: number;
        gridRows: number;
        gridCols: number;
        price: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getWarehouse(id: string): Promise<{
        id: string;
        title: string;
        address: string;
        description: string | null;
        square: number;
        cellSquare: number;
        gridRows: number;
        gridCols: number;
        price: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateWarehouse(id: string, input: {
        title?: string;
        address?: string;
        description?: string;
        square?: number;
        cellSquare?: number;
        price?: number;
    }): Promise<{
        id: string;
        title: string;
        address: string;
        description: string | null;
        square: number;
        cellSquare: number;
        gridRows: number;
        gridCols: number;
        price: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteWarehouse(id: string): Promise<{
        id: string;
        title: string;
        address: string;
        description: string | null;
        square: number;
        cellSquare: number;
        gridRows: number;
        gridCols: number;
        price: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private calculateGrid;
}
