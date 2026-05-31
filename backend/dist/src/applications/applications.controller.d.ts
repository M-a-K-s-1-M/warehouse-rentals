import { ApplicationOpenStatus, ApplicationStatus, RoleType } from "@prisma/client";
import { ApplicationsService } from "./applications.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";
import { UpdateApplicationOpenStatusDto } from "./dto/update-application-open-status.dto";
import { AssignEngineersDto } from "./dto/assign-engineers.dto";
import { AddApplicationPhotoDto } from "./dto/add-application-photo.dto";
import { UpdateApplicationDescriptionDto } from "./dto/update-application-description.dto";
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    createApplication(body: CreateApplicationDto, req: {
        user?: {
            id: string;
            role: RoleType;
        };
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
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
        warehouseId: number;
        userId: string;
    }>;
    listApplications(status?: ApplicationStatus, openStatus?: ApplicationOpenStatus, userId?: string, warehouseId?: string): Promise<({
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
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
        warehouseId: number;
        userId: string;
    })[]>;
    getApplication(id: string): Promise<{
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
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
        warehouseId: number;
        userId: string;
    }>;
    updateStatus(id: string, body: UpdateApplicationStatusDto): Promise<{
        id: string;
        description: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
        warehouseId: number;
        userId: string;
    }>;
    updateOpenStatus(id: string, body: UpdateApplicationOpenStatusDto): Promise<{
        id: string;
        description: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
        warehouseId: number;
        userId: string;
    }>;
    assignEngineers(id: string, body: AssignEngineersDto): Promise<{
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
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
        warehouseId: number;
        userId: string;
    }>;
    addPhoto(id: string, body: AddApplicationPhotoDto, req: {
        user?: {
            id: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        kind: import("@prisma/client").$Enums.PhotoKind;
        url: string;
        uploadedById: string | null;
        applicationId: string;
    }>;
    uploadPhoto(id: string, file: Express.Multer.File, kind: AddApplicationPhotoDto["kind"], req: {
        user?: {
            id: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        kind: import("@prisma/client").$Enums.PhotoKind;
        url: string;
        uploadedById: string | null;
        applicationId: string;
    }>;
    updateDescription(id: string, body: UpdateApplicationDescriptionDto): Promise<{
        id: string;
        description: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
        warehouseId: number;
        userId: string;
    }>;
}
