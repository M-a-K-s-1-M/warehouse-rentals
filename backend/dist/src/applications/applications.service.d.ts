import { ApplicationStatus, PhotoKind } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
export declare class ApplicationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createApplication(input: {
        warehouseId: string;
        userId: string;
        description: string;
        status?: ApplicationStatus;
        photos?: Array<{
            url: string;
            kind: PhotoKind;
            uploadedById?: string;
        }>;
    }): Promise<{
        photos: {
            id: string;
            createdAt: Date;
            applicationId: string;
            uploadedById: string | null;
            kind: import("@prisma/client").$Enums.PhotoKind;
            url: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        description: string;
        warehouseId: string;
        userId: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
    }>;
    addPhoto(input: {
        applicationId: string;
        url: string;
        kind: PhotoKind;
        uploadedById?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        applicationId: string;
        uploadedById: string | null;
        kind: import("@prisma/client").$Enums.PhotoKind;
        url: string;
    }>;
    getApplicationById(id: string): Promise<({
        user: {
            id: string;
            email: string;
            passwordHash: string;
            createdAt: Date;
            role: import("@prisma/client").$Enums.RoleType;
        };
        warehouse: {
            id: string;
            createdAt: Date;
            title: string;
            address: string;
            description: string | null;
            square: number;
            price: number;
            updatedAt: Date;
        };
        photos: {
            id: string;
            createdAt: Date;
            applicationId: string;
            uploadedById: string | null;
            kind: import("@prisma/client").$Enums.PhotoKind;
            url: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        description: string;
        warehouseId: string;
        userId: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
    }) | null>;
    listApplications(params: {
        status?: ApplicationStatus;
        userId?: string;
        warehouseId?: string;
    }): Promise<({
        photos: {
            id: string;
            createdAt: Date;
            applicationId: string;
            uploadedById: string | null;
            kind: import("@prisma/client").$Enums.PhotoKind;
            url: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        description: string;
        warehouseId: string;
        userId: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
    })[]>;
}
