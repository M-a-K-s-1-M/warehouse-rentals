import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto";
import { UpdateWarehouseBlocksDto } from "./dto/update-warehouse-blocks.dto";
import { WarehousesService } from "./warehouses.service";
export declare class WarehousesController {
    private readonly warehousesService;
    constructor(warehousesService: WarehousesService);
    createWarehouse(body: CreateWarehouseDto): Promise<{
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
    listBlocks(id: number): Promise<{
        id: number;
        createdAt: Date;
        warehouseId: number;
        label: string;
    }[]>;
    blockCells(id: number, body: UpdateWarehouseBlocksDto): Promise<{
        id: number;
        createdAt: Date;
        warehouseId: number;
        label: string;
    }[]>;
    unblockCells(id: number, body: UpdateWarehouseBlocksDto): Promise<{
        id: number;
        createdAt: Date;
        warehouseId: number;
        label: string;
    }[]>;
    updateWarehouse(id: number, body: UpdateWarehouseDto): Promise<{
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
}
