import { Injectable } from "@nestjs/common";
import {
    ApplicationStatus,
    ApplicationOpenStatus,
    PhotoKind,
    Prisma,
    RoleType,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ApplicationsGateway } from "./applications.gateway";

@Injectable()
export class ApplicationsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gateway: ApplicationsGateway,
    ) { }

    private readonly engineerSelect = {
        id: true,
        email: true,
        role: true,
        createdAt: true,
    };

    async createApplication(input: {
        warehouseId: number;
        userId: string;
        description: string;
        status?: ApplicationStatus;
        photos?: Array<{
            url: string;
            kind: PhotoKind;
            uploadedById?: string;
        }>;
    }) {
        const application = await this.prisma.application.create({
            data: {
                warehouseId: input.warehouseId,
                userId: input.userId,
                description: input.description,
                status: input.status ?? ApplicationStatus.PENDING_REVIEW,
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

    async addPhoto(input: {
        applicationId: string;
        url: string;
        kind: PhotoKind;
        uploadedById?: string;
    }) {
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

    async getApplicationById(id: string) {
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
            throw new NotFoundException("Заявка не найдена");
        }
        return application;
    }

    async listApplications(params: {
        status?: ApplicationStatus;
        openStatus?: ApplicationOpenStatus;
        userId?: string;
        warehouseId?: number;
    }) {
        const where: Prisma.ApplicationWhereInput = {
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

    async updateStatus(id: string, status: ApplicationStatus) {
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

    async updateOpenStatus(id: string, openStatus: ApplicationOpenStatus) {
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

    async assignEngineers(input: { applicationId: string; engineerIds: string[] }) {
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
                role: RoleType.ENGINEER,
            },
            select: { id: true },
        });

        if (engineers.length !== uniqueEngineerIds.length) {
            throw new BadRequestException("Можно назначать только инженеров");
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

    async updateDescription(id: string, description: string) {
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

    async updateEngineerComment(id: string, comment: string, user: { id: string; role: RoleType }) {
        await this.getApplicationById(id);

        if (user.role === RoleType.ENGINEER) {
            const assignment = await this.prisma.applicationEngineer.findUnique({
                where: {
                    applicationId_engineerId: {
                        applicationId: id,
                        engineerId: user.id,
                    },
                },
            });

            if (!assignment) {
                throw new BadRequestException("Инженер не назначен на заявку");
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
}
