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
} from "@nestjs/common";
import { RoleType } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateRentalDto } from "./dto/create-rental.dto";
import { UpdateRentalDto } from "./dto/update-rental.dto";
import { RentalsService } from "./rentals.service";

@Controller("rentals")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.MANAGER)
export class RentalsController {
    constructor(private readonly rentalsService: RentalsService) { }

    @Post()
    async createRental(@Body() body: CreateRentalDto) {
        return this.rentalsService.createRental({
            ...body,
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
        });
    }

    @Get()
    async listRentals(
        @Query("warehouseId", ParseIntPipe) warehouseId?: number,
        @Query("userId") userId?: string,
    ) {
        return this.rentalsService.listRentals({ warehouseId, userId });
    }

    @Get(":id")
    async getRental(@Param("id") id: string) {
        return this.rentalsService.getRental(id);
    }

    @Patch(":id")
    async updateRental(@Param("id") id: string, @Body() body: UpdateRentalDto) {
        return this.rentalsService.updateRental(id, {
            ...body,
            startDate: body.startDate ? new Date(body.startDate) : undefined,
            endDate: body.endDate ? new Date(body.endDate) : undefined,
        });
    }

    @Delete(":id")
    async deleteRental(@Param("id") id: string) {
        return this.rentalsService.deleteRental(id);
    }
}
