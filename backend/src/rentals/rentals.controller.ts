import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
    ParseIntPipe,
    BadRequestException,
    Req,
} from "@nestjs/common";
import { RoleType } from "@prisma/client";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateRentalDto } from "./dto/create-rental.dto";
import { UpdateRentalDto } from "./dto/update-rental.dto";
import { RentalsService } from "./rentals.service";

@Controller("rentals")
@UseGuards(JwtAuthGuard, RolesGuard)
export class RentalsController {
    constructor(private readonly rentalsService: RentalsService) { }

    @Post()
    @Roles(RoleType.MANAGER)
    async createRental(@Body() body: CreateRentalDto) {
        return this.rentalsService.createRental({
            ...body,
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
        });
    }

    @Get()
    @Roles(RoleType.MANAGER, RoleType.CLIENT)
    async listRentals(
        @Req() request: Request & { user?: { id: string; role: RoleType } },
        @Query("warehouseId") warehouseId?: string,
        @Query("userId") userId?: string,
    ) {
        const role = request.user?.role;
        const requesterId = request.user?.id;
        const parsedWarehouseId = warehouseId ? Number(warehouseId) : undefined;
        if (warehouseId && !Number.isFinite(parsedWarehouseId)) {
            throw new BadRequestException("warehouseId must be a number");
        }

        if (role === RoleType.CLIENT) {
            if (!requesterId) {
                throw new BadRequestException("User not found");
            }
            return this.rentalsService.listRentals({
                warehouseId: parsedWarehouseId,
                userId: requesterId,
            });
        }

        return this.rentalsService.listRentals({
            warehouseId: parsedWarehouseId,
            userId,
        });
    }

    @Get(":id")
    @Roles(RoleType.MANAGER)
    async getRental(@Param("id") id: string) {
        return this.rentalsService.getRental(id);
    }

    @Patch(":id")
    @Roles(RoleType.MANAGER)
    async updateRental(@Param("id") id: string, @Body() body: UpdateRentalDto) {
        return this.rentalsService.updateRental(id, {
            ...body,
            startDate: body.startDate ? new Date(body.startDate) : undefined,
            endDate: body.endDate ? new Date(body.endDate) : undefined,
        });
    }

    @Delete(":id")
    @Roles(RoleType.MANAGER)
    async deleteRental(@Param("id") id: string) {
        return this.rentalsService.deleteRental(id);
    }
}
