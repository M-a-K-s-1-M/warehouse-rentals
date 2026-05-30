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
    listApplications(status?: ApplicationStatus, openStatus?: ApplicationOpenStatus, userId?: string, warehouseId?: number): Promise<({
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
    getApplication(id: string): Promise<{
        user: {
            id: string;
            email: string;
            passwordHash: string;
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
    updateStatus(id: string, body: UpdateApplicationStatusDto): Promise<{
        id: string;
        createdAt: Date;
        description: string;
        warehouseId: number;
        userId: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
    }>;
    updateOpenStatus(id: string, body: UpdateApplicationOpenStatusDto): Promise<{
        id: string;
        createdAt: Date;
        description: string;
        warehouseId: number;
        userId: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        openStatus: import("@prisma/client").$Enums.ApplicationOpenStatus;
    }>;
    assignEngineers(id: string, body: AssignEngineersDto): Promise<{
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
