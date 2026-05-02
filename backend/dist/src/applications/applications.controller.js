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
        return this.applicationsService.createApplication({
            warehouseId: body.warehouseId,
            userId,
            description: body.description,
        });
    }
    async listApplications(status, openStatus, userId, warehouseId) {
        return this.applicationsService.listApplications({ status, openStatus, userId, warehouseId });
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
};
exports.ApplicationsController = ApplicationsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_application_dto_1.CreateApplicationDto, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "createApplication", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("status")),
    __param(1, (0, common_1.Query)("openStatus")),
    __param(2, (0, common_1.Query)("userId")),
    __param(3, (0, common_1.Query)("warehouseId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
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
exports.ApplicationsController = ApplicationsController = __decorate([
    (0, common_1.Controller)("applications"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService])
], ApplicationsController);
//# sourceMappingURL=applications.controller.js.map