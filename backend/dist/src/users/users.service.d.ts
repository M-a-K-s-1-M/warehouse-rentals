import { PrismaService } from "../prisma/prisma.service";
import { RoleType } from "@prisma/client";
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private readonly safeSelect;
    createUser(input: {
        email: string;
        password: string;
        role: RoleType;
    }): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        role: import("@prisma/client").$Enums.RoleType;
    }>;
    listUsers(): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        role: import("@prisma/client").$Enums.RoleType;
    }[]>;
    getUser(id: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        role: import("@prisma/client").$Enums.RoleType;
    }>;
    updateUser(id: string, input: {
        email?: string;
        password?: string;
        role?: RoleType;
    }): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        role: import("@prisma/client").$Enums.RoleType;
    }>;
    deleteUser(id: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        role: import("@prisma/client").$Enums.RoleType;
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        role: import("@prisma/client").$Enums.RoleType;
    } | null>;
}
