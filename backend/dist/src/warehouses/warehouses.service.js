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
exports.WarehousesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WarehousesService = class WarehousesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createWarehouse(input) {
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
    async listWarehouses() {
        return this.prisma.warehouse.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    async getWarehouse(id) {
        const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });
        if (!warehouse) {
            throw new common_1.NotFoundException("Warehouse not found");
        }
        return warehouse;
    }
    async updateWarehouse(id, input) {
        const warehouse = await this.getWarehouse(id);
        const nextSquare = input.square ?? warehouse.square;
        const nextCellSquare = input.cellSquare ?? warehouse.cellSquare;
        const grid = this.calculateGrid(nextSquare, nextCellSquare);
        return this.prisma.warehouse.update({
            where: { id },
            data: {
                title: input.title ?? warehouse.title,
                address: input.address ?? warehouse.address,
                description: input.description === undefined ? warehouse.description : input.description,
                square: nextSquare,
                cellSquare: nextCellSquare,
                gridRows: grid.rows,
                gridCols: grid.cols,
                pricePerCell: input.pricePerCell ?? warehouse.pricePerCell,
            },
        });
    }
    async deleteWarehouse(id) {
        await this.getWarehouse(id);
        return this.prisma.warehouse.delete({ where: { id } });
    }
    calculateGrid(square, cellSquare) {
        if (square <= 0 || cellSquare <= 0) {
            throw new common_1.BadRequestException("Square values must be positive");
        }
        if (square % cellSquare !== 0) {
            throw new common_1.BadRequestException("Square must be divisible by cellSquare");
        }
        const totalCells = square / cellSquare;
        let rows = Math.floor(Math.sqrt(totalCells));
        while (rows > 1 && totalCells % rows !== 0) {
            rows -= 1;
        }
        const cols = totalCells / rows;
        return { rows, cols };
    }
};
exports.WarehousesService = WarehousesService;
exports.WarehousesService = WarehousesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarehousesService);
//# sourceMappingURL=warehouses.service.js.map