import { ApplicationStatus, ApplicationOpenStatus, PhotoKind, RoleType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ApplicationsGateway } from "./applications.gateway";
export declare class ApplicationsService {
    private readonly prisma;
    private readonly gateway;
    constructor(prisma: PrismaService, gateway: ApplicationsGateway);
    private readonly engineerSelect;
    assertUserHasRental(input: {
        userId: string;
        warehouseId: number;
    }): Promise<void>;
    assertUserOwnsApplication(applicationId: string, userId: string): Promise<void>;
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
        warehouse: {
            id: number;
            description: string | null;
            createdAt: Date;
            title: string;
            address: string;
            square: number;
            cellSquare: number;
            gridRows: number;
            gridCols: number;
            pricePerCell: number;
            updatedAt: Date;
        };
        user: {
            id: string;
            createdAt: Date;
            email: string;
            passwordHash: string;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
            phone: string | null;
            role: import("@prisma/client").$Enums.RoleType;
        };
        photos: {
            id: string;
            createdAt: Date;
            kind: import("@prisma/client").$Enums.PhotoKind;
            url: string;
            uploadedById: string | null;
            applicationId: string;
        }[];
        engineers: ({
            engineer: {
                id: string;
                createdAt: Date;
                email: string;
                role: import("@prisma/client").$Enums.RoleType;
            };
        } & {
            assignedAt: Date;
            applicationId: string;
            engineerId: string;
        })[];
    } & {
        id: string;
        description: string;
        engineerComment: string | null;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
        warehouseId: number;
        userId: string;
    }>;
    addPhoto(input: {
        applicationId: string;
        url: string;
        kind: PhotoKind;
        uploadedById?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        kind: import("@prisma/client").$Enums.PhotoKind;
        url: string;
        uploadedById: string | null;
        applicationId: string;
    }>;
    getApplicationById(id: string): Promise<{
        warehouse: {
            id: number;
            description: string | null;
            createdAt: Date;
            title: string;
            address: string;
            square: number;
            cellSquare: number;
            gridRows: number;
            gridCols: number;
            pricePerCell: number;
            updatedAt: Date;
        };
        user: {
            id: string;
            createdAt: Date;
            email: string;
            passwordHash: string;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
            phone: string | null;
            role: import("@prisma/client").$Enums.RoleType;
        };
        photos: {
            id: string;
            createdAt: Date;
            kind: import("@prisma/client").$Enums.PhotoKind;
            url: string;
            uploadedById: string | null;
            applicationId: string;
        }[];
        engineers: ({
            engineer: {
                id: string;
                createdAt: Date;
                email: string;
                role: import("@prisma/client").$Enums.RoleType;
            };
        } & {
            assignedAt: Date;
            applicationId: string;
            engineerId: string;
        })[];
    } & {
        id: string;
        description: string;
        engineerComment: string | null;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
        warehouseId: number;
        userId: string;
    }>;
    listApplications(params: {
        status?: ApplicationStatus;
        openStatus?: ApplicationOpenStatus;
        userId?: string;
        warehouseId?: number;
    }): Promise<({
        warehouse: {
            id: number;
            description: string | null;
            createdAt: Date;
            title: string;
            address: string;
            square: number;
            cellSquare: number;
            gridRows: number;
            gridCols: number;
            pricePerCell: number;
            updatedAt: Date;
        };
        user: {
            id: string;
            createdAt: Date;
            email: string;
            passwordHash: string;
            firstName: string | null;
            lastName: string | null;
            middleName: string | null;
            phone: string | null;
            role: import("@prisma/client").$Enums.RoleType;
        };
        photos: {
            id: string;
            createdAt: Date;
            kind: import("@prisma/client").$Enums.PhotoKind;
            url: string;
            uploadedById: string | null;
            applicationId: string;
        }[];
        engineers: ({
            engineer: {
                id: string;
                createdAt: Date;
                email: string;
                role: import("@prisma/client").$Enums.RoleType;
            };
        } & {
            assignedAt: Date;
            applicationId: string;
            engineerId: string;
        })[];
    } & {
        id: string;
        description: string;
        engineerComment: string | null;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
        warehouseId: number;
        userId: string;
    })[]>;
    updateStatus(id: string, status: ApplicationStatus): Promise<{
        id: string;
        description: string;
        engineerComment: string | null;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
        warehouseId: number;
        userId: string;
    }>;
    updateOpenStatus(id: string, openStatus: ApplicationOpenStatus): Promise<{
        id: string;
        description: string;
        engineerComment: string | null;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
        warehouseId: number;
        userId: string;
    }>;
    assignEngineers(input: {
        applicationId: string;
        engineerIds: string[];
    }): Promise<{
        engineers: ({
            engineer: {
                id: string;
                createdAt: Date;
                email: string;
                role: import("@prisma/client").$Enums.RoleType;
            };
        } & {
            assignedAt: Date;
            applicationId: string;
            engineerId: string;
        })[];
    } & {
        id: string;
        description: string;
        engineerComment: string | null;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
        warehouseId: number;
        userId: string;
    }>;
    updateDescription(id: string, description: string): Promise<{
        id: string;
        description: string;
        engineerComment: string | null;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
        warehouseId: number;
        userId: string;
    }>;
    updateEngineerComment(id: string, comment: string, user: {
        id: string;
        role: RoleType;
    }): Promise<{
        id: string;
        description: string;
        engineerComment: string | null;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
        warehouseId: number;
        userId: string;
    }>;
}
