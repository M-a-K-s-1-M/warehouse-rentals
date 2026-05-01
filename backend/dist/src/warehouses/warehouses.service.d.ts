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
        id: string;
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
    listWarehouses(): Promise<{
        id: string;
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
    getWarehouse(id: string): Promise<{
        id: string;
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
    updateWarehouse(id: string, input: {
        title?: string;
        address?: string;
        description?: string;
        square?: number;
        cellSquare?: number;
        pricePerCell?: number;
    }): Promise<{
        id: string;
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
    deleteWarehouse(id: string): Promise<{
        id: string;
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
