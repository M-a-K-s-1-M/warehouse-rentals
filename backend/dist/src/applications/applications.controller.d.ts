import { ApplicationOpenStatus, ApplicationStatus, RoleType } from "@prisma/client";
import { ApplicationsService } from "./applications.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";
import { UpdateApplicationOpenStatusDto } from "./dto/update-application-open-status.dto";
import { AssignEngineersDto } from "./dto/assign-engineers.dto";
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    createApplication(body: CreateApplicationDto, req: {
        user?: {
            id: string;
            role: RoleType;
        };
    }): Promise<{
        photos: {
            id: string;
            createdAt: Date;
            kind: import("@prisma/client").$Enums.PhotoKind;
            url: string;
            uploadedById: string | null;
            applicationId: string;
        }[];
    } & {
        warehouseId: number;
        description: string;
        userId: string;
        id: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
    }>;
    listApplications(status?: ApplicationStatus, openStatus?: ApplicationOpenStatus, userId?: string, warehouseId?: number): Promise<({
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
            engineerId: string;
            applicationId: string;
        })[];
    } & {
        warehouseId: number;
        description: string;
        userId: string;
        id: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
    })[]>;
    getApplication(id: string): Promise<{
        warehouse: {
            description: string | null;
            id: number;
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
            engineerId: string;
            applicationId: string;
        })[];
    } & {
        warehouseId: number;
        description: string;
        userId: string;
        id: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
    }>;
    updateStatus(id: string, body: UpdateApplicationStatusDto): Promise<{
        warehouseId: number;
        description: string;
        userId: string;
        id: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
    }>;
    updateOpenStatus(id: string, body: UpdateApplicationOpenStatusDto): Promise<{
        warehouseId: number;
        description: string;
        userId: string;
        id: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
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
            engineerId: string;
            applicationId: string;
        })[];
    } & {
        warehouseId: number;
        description: string;
        userId: string;
        id: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
        createdAt: Date;
    }>;
}
