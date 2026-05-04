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
exports.RentalsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
const create_rental_dto_1 = require("./dto/create-rental.dto");
const update_rental_dto_1 = require("./dto/update-rental.dto");
const rentals_service_1 = require("./rentals.service");
let RentalsController = class RentalsController {
    rentalsService;
    constructor(rentalsService) {
        this.rentalsService = rentalsService;
    }
    async createRental(body) {
        return this.rentalsService.createRental({
            ...body,
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
        });
    }
    async listRentals(warehouseId, userId) {
        return this.rentalsService.listRentals({ warehouseId, userId });
    }
    async getRental(id) {
        return this.rentalsService.getRental(id);
    }
    async updateRental(id, body) {
        return this.rentalsService.updateRental(id, {
            ...body,
            startDate: body.startDate ? new Date(body.startDate) : undefined,
            endDate: body.endDate ? new Date(body.endDate) : undefined,
        });
    }
    async deleteRental(id) {
        return this.rentalsService.deleteRental(id);
    }
};
exports.RentalsController = RentalsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_rental_dto_1.CreateRentalDto]),
    __metadata("design:returntype", Promise)
], RentalsController.prototype, "createRental", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("warehouseId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], RentalsController.prototype, "listRentals", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RentalsController.prototype, "getRental", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_rental_dto_1.UpdateRentalDto]),
    __metadata("design:returntype", Promise)
], RentalsController.prototype, "updateRental", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RentalsController.prototype, "deleteRental", null);
exports.RentalsController = RentalsController = __decorate([
    (0, common_1.Controller)("rentals"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleType.MANAGER),
    __metadata("design:paramtypes", [rentals_service_1.RentalsService])
], RentalsController);
//# sourceMappingURL=rentals.controller.js.map