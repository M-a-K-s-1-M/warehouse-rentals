import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RentalStatusType } from "@prisma/client";

@Injectable()
export class RentalsService {
    constructor(private readonly prisma: PrismaService) { }

    async createRental(input: {
        warehouseId: number;
        userId: string;
        startDate: Date;
        endDate: Date;
        autoRenew?: boolean;
        rowStart: number;
        rowEnd: number;
        colStart: number;
        colEnd: number;
        extraContactName?: string;
        extraContactEmail?: string;
        color?: string;
    }) {
        this.assertDateOrder(input.startDate, input.endDate);
        const warehouse = await this.getWarehouse(input.warehouseId);
        this.assertGridBounds(warehouse.gridRows, warehouse.gridCols, input);

        const totals = this.calculateTotals(
            warehouse.cellSquare,
            warehouse.pricePerCell,
            input,
            input.startDate,
            input.endDate,
        );
        await this.assertNoOverlap({
            warehouseId: warehouse.id,
            startDate: input.startDate,
            endDate: input.endDate,
            rowStart: input.rowStart,
            rowEnd: input.rowEnd,
            colStart: input.colStart,
            colEnd: input.colEnd,
        });

        const rentalStatus = this.getRentalStatus(input.startDate, input.endDate);

        return this.prisma.rental.create({
            data: {
                warehouseId: warehouse.id,
                userId: input.userId,
                startDate: input.startDate,
                endDate: input.endDate,
                autoRenew: input.autoRenew ?? false,
                rowStart: input.rowStart,
                rowEnd: input.rowEnd,
                colStart: input.colStart,
                colEnd: input.colEnd,
                totalCells: totals.totalCells,
                areaSquare: totals.areaSquare,
                pricePerCell: totals.pricePerCell,
                totalPrice: totals.totalPrice,
                extraContactName: input.extraContactName ?? null,
                extraContactEmail: input.extraContactEmail ?? null,
                color: input.color ?? null,
                rentalStatus,
            },
        });
    }

    async listRentals(params: { warehouseId?: number; userId?: string }) {
        return this.prisma.rental.findMany({
            where: {
                warehouseId: params.warehouseId,
                userId: params.userId,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async getRental(id: string) {
        const rental = await this.prisma.rental.findUnique({ where: { id } });
        if (!rental) {
            throw new NotFoundException("Аренда не найдена");
        }
        return rental;
    }

    async updateRental(
        id: string,
        input: {
            warehouseId?: number;
            userId?: string;
            startDate?: Date;
            endDate?: Date;
            autoRenew?: boolean;
            rowStart?: number;
            rowEnd?: number;
            colStart?: number;
            colEnd?: number;
            extraContactName?: string;
            extraContactEmail?: string;
            rentalStatus?: RentalStatusType;
            color?: string;
        },
    ) {
        const existing = await this.getRental(id);
        const warehouse = input.warehouseId
            ? await this.getWarehouse(input.warehouseId)
            : await this.getWarehouse(existing.warehouseId);

        const rowStart = input.rowStart ?? existing.rowStart;
        const rowEnd = input.rowEnd ?? existing.rowEnd;
        const colStart = input.colStart ?? existing.colStart;
        const colEnd = input.colEnd ?? existing.colEnd;
        const startDate = input.startDate ?? existing.startDate;
        const endDate = input.endDate ?? existing.endDate;

        this.assertDateOrder(startDate, endDate);

        this.assertGridBounds(warehouse.gridRows, warehouse.gridCols, {
            rowStart,
            rowEnd,
            colStart,
            colEnd,
        });

        const totals = this.calculateTotals(
            warehouse.cellSquare,
            warehouse.pricePerCell,
            { rowStart, rowEnd, colStart, colEnd },
            startDate,
            endDate,
        );

        await this.assertNoOverlap({
            warehouseId: warehouse.id,
            startDate,
            endDate,
            rowStart,
            rowEnd,
            colStart,
            colEnd,
            excludeRentalId: existing.id,
        });

        return this.prisma.rental.update({
            where: { id },
            data: {
                warehouseId: warehouse.id,
                userId: input.userId ?? existing.userId,
                startDate,
                endDate,
                autoRenew: input.autoRenew ?? existing.autoRenew,
                rowStart,
                rowEnd,
                colStart,
                colEnd,
                totalCells: totals.totalCells,
                areaSquare: totals.areaSquare,
                pricePerCell: totals.pricePerCell,
                totalPrice: totals.totalPrice,
                extraContactName:
                    input.extraContactName === undefined
                        ? existing.extraContactName
                        : input.extraContactName,
                extraContactEmail:
                    input.extraContactEmail === undefined
                        ? existing.extraContactEmail
                        : input.extraContactEmail,
                color: input.color === undefined ? existing.color : input.color,
                rentalStatus: input.rentalStatus ?? this.getRentalStatus(startDate, endDate),
            },
        });
    }

    async deleteRental(id: string) {
        await this.getRental(id);
        return this.prisma.rental.delete({ where: { id } });
    }

    private async getWarehouse(id: number) {
        const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });
        if (!warehouse) {
            throw new NotFoundException("Склад не найден");
        }
        return warehouse;
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

    private calculateTotals(
        cellSquare: number,
        pricePerCell: number,
        input: { rowStart: number; rowEnd: number; colStart: number; colEnd: number },
        startDate: Date,
        endDate: Date,
    ) {
        const totalCells = (input.rowEnd - input.rowStart + 1) * (input.colEnd - input.colStart + 1);
        const areaSquare = totalCells * cellSquare;
        const diffMs = endDate.getTime() - startDate.getTime();
        const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        const totalPrice = totalCells * pricePerCell * days;

        return { totalCells, areaSquare, pricePerCell, totalPrice };
    }

    private getRentalStatus(startDate: Date, endDate: Date) {
        const diffMs = endDate.getTime() - startDate.getTime();
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (days < 60) {
            return RentalStatusType.LESS_THAN_60_DAYS;
        }

        return RentalStatusType.MORE_THAN_60_DAYS;
    }

    private assertDateOrder(startDate: Date, endDate: Date) {
        if (endDate <= startDate) {
            throw new BadRequestException("Дата окончания должна быть позже даты начала");
        }
    }

    private async assertNoOverlap(input: {
        warehouseId: number;
        startDate: Date;
        endDate: Date;
        rowStart: number;
        rowEnd: number;
        colStart: number;
        colEnd: number;
        excludeRentalId?: string;
    }) {
        const overlapping = await this.prisma.rental.findMany({
            where: {
                warehouseId: input.warehouseId,
                id: input.excludeRentalId ? { not: input.excludeRentalId } : undefined,
                endDate: { gte: input.startDate },
                startDate: { lte: input.endDate },
            },
        });

        const hasOverlap = overlapping.some((rental) =>
            this.rectanglesOverlap(
                { rowStart: rental.rowStart, rowEnd: rental.rowEnd, colStart: rental.colStart, colEnd: rental.colEnd },
                { rowStart: input.rowStart, rowEnd: input.rowEnd, colStart: input.colStart, colEnd: input.colEnd },
            ),
        );

        if (hasOverlap) {
            throw new BadRequestException("Область пересекается с существующей арендой");
        }
    }

    private rectanglesOverlap(
        a: { rowStart: number; rowEnd: number; colStart: number; colEnd: number },
        b: { rowStart: number; rowEnd: number; colStart: number; colEnd: number },
    ) {
        const rowsOverlap = a.rowStart <= b.rowEnd && a.rowEnd >= b.rowStart;
        const colsOverlap = a.colStart <= b.colEnd && a.colEnd >= b.colStart;
        return rowsOverlap && colsOverlap;
    }
}
