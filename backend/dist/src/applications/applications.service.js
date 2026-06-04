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
const common_2 = require("@nestjs/common");
const applications_gateway_1 = require("./applications.gateway");
let ApplicationsService = class ApplicationsService {
    prisma;
    gateway;
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    engineerSelect = {
        id: true,
        email: true,
        role: true,
        createdAt: true,
    };
    async createApplication(input) {
        const application = await this.prisma.application.create({
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
                user: true,
                warehouse: true,
                engineers: {
                    include: {
                        engineer: {
                            select: this.engineerSelect,
                        },
                    },
                    orderBy: {
                        assignedAt: "desc",
                    },
                },
            },
        });
        this.gateway.emitApplicationEvent({
            type: "created",
            applicationId: application.id,
        });
        return application;
    }
    async addPhoto(input) {
        const photo = await this.prisma.applicationPhoto.create({
            data: {
                applicationId: input.applicationId,
                url: input.url,
                kind: input.kind,
                uploadedById: input.uploadedById ?? null,
            },
        });
        this.gateway.emitApplicationEvent({
            type: "photo",
            applicationId: input.applicationId,
        });
        return photo;
    }
    async getApplicationById(id) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                photos: true,
                user: true,
                warehouse: true,
                engineers: {
                    include: {
                        engineer: {
                            select: this.engineerSelect,
                        },
                    },
                    orderBy: {
                        assignedAt: "desc",
                    },
                },
            },
        });
        if (!application) {
            throw new common_2.NotFoundException("Заявка не найдена");
        }
        return application;
    }
    async listApplications(params) {
        const where = {
            status: params.status,
            openStatus: params.openStatus,
            userId: params.userId,
            warehouseId: params.warehouseId,
        };
        return this.prisma.application.findMany({
            where,
            include: {
                photos: true,
                user: true,
                warehouse: true,
                engineers: {
                    include: {
                        engineer: {
                            select: this.engineerSelect,
                        },
                    },
                    orderBy: {
                        assignedAt: "desc",
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async updateStatus(id, status) {
        await this.getApplicationById(id);
        const application = await this.prisma.application.update({
            where: { id },
            data: { status },
        });
        this.gateway.emitApplicationEvent({
            type: "status",
            applicationId: id,
        });
        return application;
    }
    async updateOpenStatus(id, openStatus) {
        await this.getApplicationById(id);
        const application = await this.prisma.application.update({
            where: { id },
            data: { openStatus },
        });
        this.gateway.emitApplicationEvent({
            type: "openStatus",
            applicationId: id,
        });
        return application;
    }
    async assignEngineers(input) {
        const application = await this.getApplicationById(input.applicationId);
        const uniqueEngineerIds = Array.from(new Set(input.engineerIds));
        if (uniqueEngineerIds.length === 0) {
            const cleared = await this.prisma.application.update({
                where: { id: application.id },
                data: {
                    engineers: {
                        deleteMany: {},
                    },
                },
                include: {
                    engineers: {
                        include: {
                            engineer: {
                                select: this.engineerSelect,
                            },
                        },
                    },
                },
            });
            this.gateway.emitApplicationEvent({
                type: "assigned",
                applicationId: application.id,
            });
            return cleared;
        }
        const engineers = await this.prisma.user.findMany({
            where: {
                id: { in: uniqueEngineerIds },
                role: client_1.RoleType.ENGINEER,
            },
            select: { id: true },
        });
        if (engineers.length !== uniqueEngineerIds.length) {
            throw new common_2.BadRequestException("Можно назначать только инженеров");
        }
        const updated = await this.prisma.application.update({
            where: { id: application.id },
            data: {
                engineers: {
                    deleteMany: {},
                    create: uniqueEngineerIds.map((engineerId) => ({
                        engineerId,
                    })),
                },
            },
            include: {
                engineers: {
                    include: {
                        engineer: {
                            select: this.engineerSelect,
                        },
                    },
                },
            },
        });
        this.gateway.emitApplicationEvent({
            type: "assigned",
            applicationId: application.id,
        });
        return updated;
    }
    async updateDescription(id, description) {
        await this.getApplicationById(id);
        const application = await this.prisma.application.update({
            where: { id },
            data: { description },
        });
        this.gateway.emitApplicationEvent({
            type: "description",
            applicationId: id,
        });
        return application;
    }
    async updateEngineerComment(id, comment, user) {
        await this.getApplicationById(id);
        if (user.role === client_1.RoleType.ENGINEER) {
            const assignment = await this.prisma.applicationEngineer.findUnique({
                where: {
                    applicationId_engineerId: {
                        applicationId: id,
                        engineerId: user.id,
                    },
                },
            });
            if (!assignment) {
                throw new common_2.BadRequestException("Инженер не назначен на заявку");
            }
        }
        const application = await this.prisma.application.update({
            where: { id },
            data: { engineerComment: comment },
        });
        this.gateway.emitApplicationEvent({
            type: "comment",
            applicationId: id,
        });
        return application;
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        applications_gateway_1.ApplicationsGateway])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map