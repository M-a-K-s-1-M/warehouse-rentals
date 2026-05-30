import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WarehousesService {
    constructor(private readonly prisma: PrismaService) { }

    async createWarehouse(input: {
        title: string;
        address: string;
        description?: string;
        square: number;
        cellSquare: number;
        pricePerCell: number;
    }) {
        const grid = this.calculateGrid(input.square, input.cellSquare);

        return this.prisma.warehouse.create({
            data: {
                title: input.title,
                address: input.address,
                description: input.description ?? null,
                square: input.square,
                cellSquare: input.cellSquare,
                gridRows: grid.rows,
                gridCols: grid.cols,
                pricePerCell: input.pricePerCell,
            },
        });
    }

    async listWarehouses(squareOrder?: "asc" | "desc") {
        const orderBy: Prisma.WarehouseOrderByWithRelationInput = squareOrder
            ? { square: squareOrder === "asc" ? Prisma.SortOrder.asc : Prisma.SortOrder.desc }
            : { createdAt: Prisma.SortOrder.desc };
        return this.prisma.warehouse.findMany({
            orderBy,
        });
    }

    async getWarehouse(id: number) {
        const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });
        if (!warehouse) {
            throw new NotFoundException("Warehouse not found");
        }
        return warehouse;
    }

    async updateWarehouse(
        id: number,
        input: {
            title?: string;
            address?: string;
            description?: string;
            square?: number;
            cellSquare?: number;
            pricePerCell?: number;
        },
    ) {
        const warehouse = await this.getWarehouse(id);
        const nextSquare = input.square ?? warehouse.square;
        const nextCellSquare = input.cellSquare ?? warehouse.cellSquare;
        const grid = this.calculateGrid(nextSquare, nextCellSquare);

        return this.prisma.warehouse.update({
            where: { id },
            data: {
                title: input.title ?? warehouse.title,
                address: input.address ?? warehouse.address,
                description:
                    input.description === undefined ? warehouse.description : input.description,
                square: nextSquare,
                cellSquare: nextCellSquare,
                gridRows: grid.rows,
                gridCols: grid.cols,
                pricePerCell: input.pricePerCell ?? warehouse.pricePerCell,
            },
        });
    }

    async deleteWarehouse(id: number) {
        await this.getWarehouse(id);
        return this.prisma.warehouse.delete({ where: { id } });
    }

    async listBlocks(warehouseId: number) {
        await this.getWarehouse(warehouseId);
        return this.prisma.warehouseBlock.findMany({
            where: { warehouseId },
            orderBy: { createdAt: "desc" },
        });
    }

    async blockCells(warehouseId: number, labels: string[]) {
        const warehouse = await this.getWarehouse(warehouseId);
        const normalized = this.normalizeLabels(labels);

        for (const label of normalized) {
            const coords = this.parseLabel(label);
            this.assertGridBounds(warehouse.gridRows, warehouse.gridCols, {
                rowStart: coords.row,
                rowEnd: coords.row,
                colStart: coords.col,
                colEnd: coords.col,
            });
        }

        await this.prisma.warehouseBlock.createMany({
            data: normalized.map((label) => ({ warehouseId, label })),
            skipDuplicates: true,
        });

        return this.listBlocks(warehouseId);
    }

    async unblockCells(warehouseId: number, labels: string[]) {
        await this.getWarehouse(warehouseId);
        const normalized = this.normalizeLabels(labels);

        await this.prisma.warehouseBlock.deleteMany({
            where: {
                warehouseId,
                label: { in: normalized },
            },
        });

        return this.listBlocks(warehouseId);
    }

    private calculateGrid(square: number, cellSquare: number) {
        if (square <= 0 || cellSquare <= 0) {
            throw new BadRequestException("Square values must be positive");
        }

        if (square % cellSquare !== 0) {
            throw new BadRequestException("Square must be divisible by cellSquare");
        }

        const totalCells = square / cellSquare;
        let rows = Math.floor(Math.sqrt(totalCells));

        while (rows > 1 && totalCells % rows !== 0) {
            rows -= 1;
        }

        const cols = totalCells / rows;

        return { rows, cols };
    }

    private parseLabel(label: string) {
        const trimmed = label.trim().toUpperCase();
        const match = /^([A-Z]+)(\d+)$/.exec(trimmed);
        if (!match) {
            throw new BadRequestException(`Invalid cell label: ${label}`);
        }

        const letters = match[1];
        const digits = match[2];
        let row = 0;
        for (const char of letters) {
            row = row * 26 + (char.charCodeAt(0) - 64);
        }

        const col = Number(digits);
        if (!Number.isFinite(col) || col <= 0) {
            throw new BadRequestException(`Invalid cell label: ${label}`);
        }

        return { row, col };
    }

    private normalizeLabels(labels: string[]) {
        return Array.from(
            new Set(labels.map((label) => label.trim().toUpperCase()).filter(Boolean)),
        );
    }

    private assertGridBounds(
        maxRows: number,
        maxCols: number,
        input: { rowStart: number; rowEnd: number; colStart: number; colEnd: number },
    ) {
        if (input.rowStart <= 0 || input.colStart <= 0) {
            throw new BadRequestException("Координаты сетки должны быть положительными");
        }
        if (input.rowStart > input.rowEnd || input.colStart > input.colEnd) {
            throw new BadRequestException("Начало области должно быть раньше конца");
        }
        if (input.rowEnd > maxRows || input.colEnd > maxCols) {
            throw new BadRequestException("Область выходит за границы склада");
        }
    }
}
