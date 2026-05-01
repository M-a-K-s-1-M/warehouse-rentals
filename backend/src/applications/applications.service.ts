import { Injectable } from "@nestjs/common";
import {
    ApplicationStatus,
    PhotoKind,
    Prisma,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ApplicationsService {
    constructor(private readonly prisma: PrismaService) { }

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
        return this.prisma.application.findUnique({
            where: { id },
            include: {
                photos: true,
                user: true,
                warehouse: true,
            },
        });
    }

    async listApplications(params: {
        status?: ApplicationStatus;
        userId?: string;
        warehouseId?: string;
    }) {
        const where: Prisma.ApplicationWhereInput = {
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
}
