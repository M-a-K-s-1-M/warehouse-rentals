"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let RentalsService = class RentalsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRental(input) {
        const warehouse = await this.getWarehouse(input.warehouseId);
        this.assertGridBounds(warehouse.gridRows, warehouse.gridCols, input);
        const totals = this.calculateTotals(warehouse.cellSquare, warehouse.pricePerCell, input);
        await this.assertNoOverlap({
            warehouseId: warehouse.id,
            startDate: input.startDate,
            endDate: input.endDate,
            rowStart: input.rowStart,
            rowEnd: input.rowEnd,
            colStart: input.colStart,
            colEnd: input.colEnd,
        });
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
                rentalStatus: client_1.RentalStatusType.MORE_THAN_60_DAYS,
            },
        });
    }
    async listRentals(params) {
        return this.prisma.rental.findMany({
            where: {
                warehouseId: params.warehouseId,
                userId: params.userId,
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async getRental(id) {
        const rental = await this.prisma.rental.findUnique({ where: { id } });
        if (!rental) {
            throw new common_1.NotFoundException("Rental not found");
        }
        return rental;
    }
    async updateRental(id, input) {
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
        this.assertGridBounds(warehouse.gridRows, warehouse.gridCols, {
            rowStart,
            rowEnd,
            colStart,
            colEnd,
        });
        const totals = this.calculateTotals(warehouse.cellSquare, warehouse.pricePerCell, {
            rowStart,
            rowEnd,
            colStart,
            colEnd,
        });
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
                extraContactName: input.extraContactName === undefined
                    ? existing.extraContactName
                    : input.extraContactName,
                extraContactEmail: input.extraContactEmail === undefined
                    ? existing.extraContactEmail
                    : input.extraContactEmail,
                rentalStatus: input.rentalStatus ?? existing.rentalStatus,
            },
        });
    }
    async deleteRental(id) {
        await this.getRental(id);
        return this.prisma.rental.delete({ where: { id } });
    }
    async getWarehouse(id) {
        const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });
        if (!warehouse) {
            throw new common_1.NotFoundException("Warehouse not found");
        }
        return warehouse;
    }
    assertGridBounds(maxRows, maxCols, input) {
        if (input.rowStart <= 0 || input.colStart <= 0) {
            throw new common_1.BadRequestException("Grid coordinates must be positive");
        }
        if (input.rowStart > input.rowEnd || input.colStart > input.colEnd) {
            throw new common_1.BadRequestException("Grid start must be before end");
        }
        if (input.rowEnd > maxRows || input.colEnd > maxCols) {
            throw new common_1.BadRequestException("Grid area exceeds warehouse bounds");
        }
    }
    calculateTotals(cellSquare, pricePerCell, input) {
        const totalCells = (input.rowEnd - input.rowStart + 1) * (input.colEnd - input.colStart + 1);
        const areaSquare = totalCells * cellSquare;
        const totalPrice = totalCells * pricePerCell;
        return { totalCells, areaSquare, pricePerCell, totalPrice };
    }
    async assertNoOverlap(input) {
        const overlapping = await this.prisma.rental.findMany({
            where: {
                warehouseId: input.warehouseId,
                id: input.excludeRentalId ? { not: input.excludeRentalId } : undefined,
                endDate: { gte: input.startDate },
                startDate: { lte: input.endDate },
            },
        });
        const hasOverlap = overlapping.some((rental) => this.rectanglesOverlap({ rowStart: rental.rowStart, rowEnd: rental.rowEnd, colStart: rental.colStart, colEnd: rental.colEnd }, { rowStart: input.rowStart, rowEnd: input.rowEnd, colStart: input.colStart, colEnd: input.colEnd }));
        if (hasOverlap) {
            throw new common_1.BadRequestException("Rental area overlaps existing contract");
        }
    }
    rectanglesOverlap(a, b) {
        const rowsOverlap = a.rowStart <= b.rowEnd && a.rowEnd >= b.rowStart;
        const colsOverlap = a.colStart <= b.colEnd && a.colEnd >= b.colStart;
        return rowsOverlap && colsOverlap;
    }
};
exports.RentalsService = RentalsService;
exports.RentalsService = RentalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RentalsService);
//# sourceMappingURL=rentals.service.js.map