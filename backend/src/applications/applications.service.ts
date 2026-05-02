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

@Injectable()
export class ApplicationsService {
    constructor(private readonly prisma: PrismaService) { }

    private readonly engineerSelect = {
        id: true,
        email: true,
        role: true,
        createdAt: true,
    };

    async createApplication(input: {
        warehouseId: string;
        userId: string;
        description: string;
        status?: ApplicationStatus;
        photos?: Array<{
            url: string;
            kind: PhotoKind;
            uploadedById?: string;
        }>;
    }) {
        return this.prisma.application.create({
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
            },
        });
    }

    async addPhoto(input: {
        applicationId: string;
        url: string;
        kind: PhotoKind;
        uploadedById?: string;
    }) {
        return this.prisma.applicationPhoto.create({
            data: {
                applicationId: input.applicationId,
                url: input.url,
                kind: input.kind,
                uploadedById: input.uploadedById ?? null,
            },
        });
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
        warehouseId?: string;
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
        return this.prisma.application.update({
            where: { id },
            data: { status },
        });
    }

    async updateOpenStatus(id: string, openStatus: ApplicationOpenStatus) {
        await this.getApplicationById(id);
        return this.prisma.application.update({
            where: { id },
            data: { openStatus },
        });
    }

    async assignEngineers(input: { applicationId: string; engineerIds: string[] }) {
        const application = await this.getApplicationById(input.applicationId);
        const uniqueEngineerIds = Array.from(new Set(input.engineerIds));

        if (uniqueEngineerIds.length === 0) {
            return this.prisma.application.update({
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

        return this.prisma.application.update({
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
    }
}
