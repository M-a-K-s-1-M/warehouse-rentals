import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";
import { ApplicationOpenStatus, ApplicationStatus, RoleType } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { ApplicationsService } from "./applications.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";
import { UpdateApplicationOpenStatusDto } from "./dto/update-application-open-status.dto";
import { AssignEngineersDto } from "./dto/assign-engineers.dto";

@Controller("applications")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) { }

    @Post()
    async createApplication(@Body() body: CreateApplicationDto, @Req() req: { user?: { id: string; role: RoleType } }) {
        const userId = body.userId ?? req.user?.id;
        if (!userId) {
            throw new ForbiddenException("User required");
        }

        if (body.userId && req.user?.role !== RoleType.MANAGER) {
            throw new ForbiddenException("Можно создавать заявку только для себя");
        }

        return this.applicationsService.createApplication({
            warehouseId: body.warehouseId,
            userId,
            description: body.description,
        });
    }

    @Get()
    async listApplications(
        @Query("status") status?: ApplicationStatus,
        @Query("openStatus") openStatus?: ApplicationOpenStatus,
        @Query("userId") userId?: string,
        @Query("warehouseId") warehouseId?: string,
    ) {
        return this.applicationsService.listApplications({ status, openStatus, userId, warehouseId });
    }

    @Get(":id")
    async getApplication(@Param("id") id: string) {
        return this.applicationsService.getApplicationById(id);
    }

    @Patch(":id/status")
    @Roles(RoleType.MANAGER, RoleType.ENGINEER)
    async updateStatus(@Param("id") id: string, @Body() body: UpdateApplicationStatusDto) {
        return this.applicationsService.updateStatus(id, body.status);
    }

    @Patch(":id/open-status")
    @Roles(RoleType.MANAGER)
    async updateOpenStatus(@Param("id") id: string, @Body() body: UpdateApplicationOpenStatusDto) {
        return this.applicationsService.updateOpenStatus(id, body.openStatus);
    }

    @Post(":id/engineers")
    @Roles(RoleType.MANAGER)
    async assignEngineers(@Param("id") id: string, @Body() body: AssignEngineersDto) {
        return this.applicationsService.assignEngineers({
            applicationId: id,
            engineerIds: body.engineerIds,
        });
    }
}
