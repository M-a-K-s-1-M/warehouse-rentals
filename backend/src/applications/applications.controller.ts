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
    BadRequestException,
    UploadedFile,
    UseInterceptors,
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
import { AddApplicationPhotoDto } from "./dto/add-application-photo.dto";
import { UpdateApplicationDescriptionDto } from "./dto/update-application-description.dto";
import { UpdateApplicationCommentDto } from "./dto/update-application-comment.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";

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
        let resolvedWarehouseId: number | undefined = undefined;
        if (warehouseId !== undefined) {
            const parsed = Number(warehouseId);
            if (!Number.isFinite(parsed)) {
                throw new BadRequestException("Некорректный идентификатор склада");
            }
            resolvedWarehouseId = parsed;
        }

        return this.applicationsService.listApplications({
            status,
            openStatus,
            userId,
            warehouseId: resolvedWarehouseId,
        });
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

    @Post(":id/photos")
    @Roles(RoleType.MANAGER, RoleType.ENGINEER)
    async addPhoto(
        @Param("id") id: string,
        @Body() body: AddApplicationPhotoDto,
        @Req() req: { user?: { id: string } },
    ) {
        return this.applicationsService.addPhoto({
            applicationId: id,
            url: body.url,
            kind: body.kind,
            uploadedById: req.user?.id,
        });
    }

    @Post(":id/photos/upload")
    @Roles(RoleType.MANAGER, RoleType.ENGINEER)
    @UseInterceptors(
        FileInterceptor("file", {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const dest = path.join(process.cwd(), "uploads", "applications");
                    fs.mkdirSync(dest, { recursive: true });
                    cb(null, dest);
                },
                filename: (req, file, cb) => {
                    const ext = path.extname(file.originalname || "");
                    cb(null, `${randomUUID()}${ext}`);
                },
            }),
        }),
    )
    async uploadPhoto(
        @Param("id") id: string,
        @UploadedFile() file: Express.Multer.File,
        @Body("kind") kind: AddApplicationPhotoDto["kind"],
        @Req() req: { user?: { id: string } },
    ) {
        const relativePath = `/uploads/applications/${file.filename}`;
        return this.applicationsService.addPhoto({
            applicationId: id,
            url: relativePath,
            kind,
            uploadedById: req.user?.id,
        });
    }

    @Patch(":id/description")
    @Roles(RoleType.MANAGER, RoleType.ENGINEER)
    async updateDescription(
        @Param("id") id: string,
        @Body() body: UpdateApplicationDescriptionDto,
    ) {
        return this.applicationsService.updateDescription(id, body.description);
    }

    @Patch(":id/engineer-comment")
    @Roles(RoleType.MANAGER, RoleType.ENGINEER)
    async updateEngineerComment(
        @Param("id") id: string,
        @Body() body: UpdateApplicationCommentDto,
        @Req() req: { user?: { id: string; role: RoleType } },
    ) {
        if (!req.user) {
            throw new ForbiddenException("User required");
        }
        return this.applicationsService.updateEngineerComment(id, body.comment, req.user);
    }
}
