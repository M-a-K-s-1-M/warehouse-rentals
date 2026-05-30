import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    ParseIntPipe,
    UseGuards,
} from "@nestjs/common";
import { RoleType } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto";
import { UpdateWarehouseBlocksDto } from "./dto/update-warehouse-blocks.dto";
import { WarehousesService } from "./warehouses.service";

@Controller("warehouses")
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(RoleType.MANAGER)
export class WarehousesController {
    constructor(private readonly warehousesService: WarehousesService) { }

    @Post()
    async createWarehouse(@Body() body: CreateWarehouseDto) {
        return this.warehousesService.createWarehouse(body);
    }

    @Get()
    async listWarehouses(@Query("squareOrder") squareOrder?: "asc" | "desc") {
        return this.warehousesService.listWarehouses(squareOrder);
    }

    @Get(":id")
    async getWarehouse(@Param("id", ParseIntPipe) id: number) {
        return this.warehousesService.getWarehouse(id);
    }

    @Get(":id/blocks")
    async listBlocks(@Param("id", ParseIntPipe) id: number) {
        return this.warehousesService.listBlocks(id);
    }

    @Post(":id/blocks")
    async blockCells(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: UpdateWarehouseBlocksDto,
    ) {
        return this.warehousesService.blockCells(id, body.labels);
    }

    @Delete(":id/blocks")
    async unblockCells(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: UpdateWarehouseBlocksDto,
    ) {
        return this.warehousesService.unblockCells(id, body.labels);
    }

    @Patch(":id")
    async updateWarehouse(@Param("id", ParseIntPipe) id: number, @Body() body: UpdateWarehouseDto) {
        return this.warehousesService.updateWarehouse(id, body);
    }

    @Delete(":id")
    async deleteWarehouse(@Param("id", ParseIntPipe) id: number) {
        return this.warehousesService.deleteWarehouse(id);
    }
}
