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
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let ApplicationsService = class ApplicationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createApplication(input) {
        return this.prisma.application.create({
            data: {
                warehouseId: input.warehouseId,
                userId: input.userId,
                description: input.description,
                status: input.status ?? client_1.ApplicationStatus.PENDING_REVIEW,
                photos: input.photos?.length
                    ? {
                        create: input.photos.map((photo) => ({
                            url: photo.url,
                            kind: photo.kind,
                            uploadedById: photo.uploadedById ?? null,
                        })),
                    }
                    : undefined,
            },
            include: {
                photos: true,
            },
        });
    }
    async addPhoto(input) {
        return this.prisma.applicationPhoto.create({
            data: {
                applicationId: input.applicationId,
                url: input.url,
                kind: input.kind,
                uploadedById: input.uploadedById ?? null,
            },
        });
    }
    async getApplicationById(id) {
        return this.prisma.application.findUnique({
            where: { id },
            include: {
                photos: true,
                user: true,
                warehouse: true,
            },
        });
    }
    async listApplications(params) {
        const where = {
            status: params.status,
            userId: params.userId,
            warehouseId: params.warehouseId,
        };
        return this.prisma.application.findMany({
            where,
            include: {
                photos: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map