import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto";
import { WarehousesService } from "./warehouses.service";
export declare class WarehousesController {
    private readonly warehousesService;
    constructor(warehousesService: WarehousesService);
    createWarehouse(body: CreateWarehouseDto): Promise<{
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
    updateWarehouse(id: string, body: UpdateWarehouseDto): Promise<{
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
}
