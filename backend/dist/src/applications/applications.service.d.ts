import { ApplicationStatus, ApplicationOpenStatus, PhotoKind } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
export declare class ApplicationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private readonly engineerSelect;
    createApplication(input: {
        warehouseId: number;
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
            url: string;
            id: string;
            createdAt: Date;
            applicationId: string;
            uploadedById: string | null;
            kind: import("@prisma/client").$Enums.PhotoKind;
        }[];
    } & {
        id: string;
        createdAt: Date;
        description: string;
        warehouseId: number;
        userId: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
    }>;
    addPhoto(input: {
        applicationId: string;
        url: string;
        kind: PhotoKind;
        uploadedById?: string;
    }): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        applicationId: string;
        uploadedById: string | null;
        kind: import("@prisma/client").$Enums.PhotoKind;
    }>;
    getApplicationById(id: string): Promise<{
        user: {
            id: string;
            email: string;
            passwordHash: string;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
            phone: string | null;
            createdAt: Date;
            role: import("@prisma/client").$Enums.RoleType;
        };
        warehouse: {
            id: number;
            createdAt: Date;
            title: string;
            address: string;
            description: string | null;
            square: number;
            cellSquare: number;
            gridRows: number;
            gridCols: number;
            pricePerCell: number;
            updatedAt: Date;
        };
        photos: {
            url: string;
            id: string;
            createdAt: Date;
            applicationId: string;
            uploadedById: string | null;
            kind: import("@prisma/client").$Enums.PhotoKind;
        }[];
        engineers: ({
            engineer: {
                id: string;
                email: string;
                createdAt: Date;
                role: import("@prisma/client").$Enums.RoleType;
            };
        } & {
            applicationId: string;
            assignedAt: Date;
            engineerId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        description: string;
        warehouseId: number;
        userId: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
    }>;
    listApplications(params: {
        status?: ApplicationStatus;
        openStatus?: ApplicationOpenStatus;
        userId?: string;
        warehouseId?: number;
    }): Promise<({
        photos: {
            url: string;
            id: string;
            createdAt: Date;
            applicationId: string;
            uploadedById: string | null;
            kind: import("@prisma/client").$Enums.PhotoKind;
        }[];
        engineers: ({
            engineer: {
                id: string;
                email: string;
                createdAt: Date;
                role: import("@prisma/client").$Enums.RoleType;
            };
        } & {
            applicationId: string;
            assignedAt: Date;
            engineerId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        description: string;
        warehouseId: number;
        userId: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
    })[]>;
    updateStatus(id: string, status: ApplicationStatus): Promise<{
        id: string;
        createdAt: Date;
        description: string;
        warehouseId: number;
        userId: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
    }>;
    updateOpenStatus(id: string, openStatus: ApplicationOpenStatus): Promise<{
        id: string;
        createdAt: Date;
        description: string;
        warehouseId: number;
        userId: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
    }>;
    assignEngineers(input: {
        applicationId: string;
        engineerIds: string[];
    }): Promise<{
        engineers: ({
            engineer: {
                id: string;
                email: string;
                createdAt: Date;
                role: import("@prisma/client").$Enums.RoleType;
            };
        } & {
            applicationId: string;
            assignedAt: Date;
            engineerId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        description: string;
        warehouseId: number;
        userId: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
    }>;
}
