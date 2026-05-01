import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
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
        price: number;
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
                price: input.price,
            },
        });
    }

    async listWarehouses() {
        return this.prisma.warehouse.findMany({
            orderBy: { createdAt: "desc" },
        });
    }

    async getWarehouse(id: string) {
        const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });
        if (!warehouse) {
            throw new NotFoundException("Warehouse not found");
        }
        return warehouse;
    }

    async updateWarehouse(
        id: string,
        input: {
            title?: string;
            address?: string;
            description?: string;
            square?: number;
            cellSquare?: number;
            price?: number;
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
                price: input.price ?? warehouse.price,
            },
        });
    }

    async deleteWarehouse(id: string) {
        await this.getWarehouse(id);
        return this.prisma.warehouse.delete({ where: { id } });
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
}
