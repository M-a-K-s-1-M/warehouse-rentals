import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import { RoleType } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto";
import { WarehousesService } from "./warehouses.service";

@Controller("warehouses")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.MANAGER)
export class WarehousesController {
    constructor(private readonly warehousesService: WarehousesService) { }

    @Post()
    async createWarehouse(@Body() body: CreateWarehouseDto) {
        return this.warehousesService.createWarehouse(body);
    }

    @Get()
    async listWarehouses() {
        return this.warehousesService.listWarehouses();
    }

    @Get(":id")
    async getWarehouse(@Param("id") id: string) {
        return this.warehousesService.getWarehouse(id);
    }

    @Patch(":id")
    async updateWarehouse(@Param("id") id: string, @Body() body: UpdateWarehouseDto) {
        return this.warehousesService.updateWarehouse(id, body);
    }

    @Delete(":id")
    async deleteWarehouse(@Param("id") id: string) {
        return this.warehousesService.deleteWarehouse(id);
    }
}
