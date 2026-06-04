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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const applications_service_1 = require("./applications.service");
const create_application_dto_1 = require("./dto/create-application.dto");
const update_application_status_dto_1 = require("./dto/update-application-status.dto");
const update_application_open_status_dto_1 = require("./dto/update-application-open-status.dto");
const assign_engineers_dto_1 = require("./dto/assign-engineers.dto");
const add_application_photo_dto_1 = require("./dto/add-application-photo.dto");
const update_application_description_dto_1 = require("./dto/update-application-description.dto");
const update_application_comment_dto_1 = require("./dto/update-application-comment.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const crypto_1 = require("crypto");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let ApplicationsController = class ApplicationsController {
    applicationsService;
    constructor(applicationsService) {
        this.applicationsService = applicationsService;
    }
    async createApplication(body, req) {
        const userId = body.userId ?? req.user?.id;
        if (!userId) {
            throw new common_1.ForbiddenException("User required");
        }
        if (body.userId && req.user?.role !== client_1.RoleType.MANAGER) {
            throw new common_1.ForbiddenException("Можно создавать заявку только для себя");
        }
        if (req.user?.role === client_1.RoleType.CLIENT) {
            await this.applicationsService.assertUserHasRental({
                userId,
                warehouseId: body.warehouseId,
            });
        }
        return this.applicationsService.createApplication({
            warehouseId: body.warehouseId,
            userId,
            description: body.description,
        });
    }
    async listApplications(status, openStatus, userId, warehouseId, req) {
        let resolvedWarehouseId = undefined;
        if (warehouseId !== undefined) {
            const parsed = Number(warehouseId);
            if (!Number.isFinite(parsed)) {
                throw new common_1.BadRequestException("Некорректный идентификатор склада");
            }
            resolvedWarehouseId = parsed;
        }
        const role = req?.user?.role;
        const requesterId = req?.user?.id;
        const resolvedUserId = role === client_1.RoleType.CLIENT ? requesterId : userId;
        if (role === client_1.RoleType.CLIENT && !requesterId) {
            throw new common_1.ForbiddenException("User required");
        }
        return this.applicationsService.listApplications({
            status,
            openStatus,
            userId: resolvedUserId,
            warehouseId: resolvedWarehouseId,
        });
    }
    async getApplication(id) {
        return this.applicationsService.getApplicationById(id);
    }
    async updateStatus(id, body) {
        return this.applicationsService.updateStatus(id, body.status);
    }
    async updateOpenStatus(id, body) {
        return this.applicationsService.updateOpenStatus(id, body.openStatus);
    }
    async assignEngineers(id, body) {
        return this.applicationsService.assignEngineers({
            applicationId: id,
            engineerIds: body.engineerIds,
        });
    }
    async addPhoto(id, body, req) {
        if (req.user?.id) {
            await this.applicationsService.assertUserOwnsApplication(id, req.user.id);
        }
        return this.applicationsService.addPhoto({
            applicationId: id,
            url: body.url,
            kind: body.kind,
            uploadedById: req.user?.id,
        });
    }
    async uploadPhoto(id, file, kind, req) {
        if (req.user?.id) {
            await this.applicationsService.assertUserOwnsApplication(id, req.user.id);
        }
        const relativePath = `/uploads/applications/${file.filename}`;
        return this.applicationsService.addPhoto({
            applicationId: id,
            url: relativePath,
            kind,
            uploadedById: req.user?.id,
        });
    }
    async updateDescription(id, body) {
        return this.applicationsService.updateDescription(id, body.description);
    }
    async updateEngineerComment(id, body, req) {
        if (!req.user) {
            throw new common_1.ForbiddenException("User required");
        }
        return this.applicationsService.updateEngineerComment(id, body.comment, req.user);
    }
};
exports.ApplicationsController = ApplicationsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.RoleType.MANAGER, client_1.RoleType.CLIENT),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_application_dto_1.CreateApplicationDto, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "createApplication", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.RoleType.MANAGER, client_1.RoleType.ENGINEER, client_1.RoleType.CLIENT),
    __param(0, (0, common_1.Query)("status")),
    __param(1, (0, common_1.Query)("openStatus")),
    __param(2, (0, common_1.Query)("userId")),
    __param(3, (0, common_1.Query)("warehouseId")),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "listApplications", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getApplication", null);
__decorate([
    (0, common_1.Patch)(":id/status"),
    (0, roles_decorator_1.Roles)(client_1.RoleType.MANAGER, client_1.RoleType.ENGINEER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_application_status_dto_1.UpdateApplicationStatusDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(":id/open-status"),
    (0, roles_decorator_1.Roles)(client_1.RoleType.MANAGER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_application_open_status_dto_1.UpdateApplicationOpenStatusDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "updateOpenStatus", null);
__decorate([
    (0, common_1.Post)(":id/engineers"),
    (0, roles_decorator_1.Roles)(client_1.RoleType.MANAGER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_engineers_dto_1.AssignEngineersDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "assignEngineers", null);
__decorate([
    (0, common_1.Post)(":id/photos"),
    (0, roles_decorator_1.Roles)(client_1.RoleType.MANAGER, client_1.RoleType.ENGINEER, client_1.RoleType.CLIENT),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_application_photo_dto_1.AddApplicationPhotoDto, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "addPhoto", null);
__decorate([
    (0, common_1.Post)(":id/photos/upload"),
    (0, roles_decorator_1.Roles)(client_1.RoleType.MANAGER, client_1.RoleType.ENGINEER, client_1.RoleType.CLIENT),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file", {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = path_1.default.join(process.cwd(), "uploads", "applications");
                fs_1.default.mkdirSync(dest, { recursive: true });
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                const ext = path_1.default.extname(file.originalname || "");
                cb(null, `${(0, crypto_1.randomUUID)()}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)("kind")),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "uploadPhoto", null);
__decorate([
    (0, common_1.Patch)(":id/description"),
    (0, roles_decorator_1.Roles)(client_1.RoleType.MANAGER, client_1.RoleType.ENGINEER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_application_description_dto_1.UpdateApplicationDescriptionDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "updateDescription", null);
__decorate([
    (0, common_1.Patch)(":id/engineer-comment"),
    (0, roles_decorator_1.Roles)(client_1.RoleType.MANAGER, client_1.RoleType.ENGINEER),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_application_comment_dto_1.UpdateApplicationCommentDto, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "updateEngineerComment", null);
exports.ApplicationsController = ApplicationsController = __decorate([
    (0, common_1.Controller)("applications"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService])
], ApplicationsController);
//# sourceMappingURL=applications.controller.js.map