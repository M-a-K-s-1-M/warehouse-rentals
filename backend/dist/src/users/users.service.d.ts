import { PrismaService } from "../prisma/prisma.service";
import { RoleType } from "@prisma/client";
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private readonly safeSelect;
    createUser(input: {
        email: string;
        password?: string;
        role: RoleType;
        firstName?: string;
        lastName?: string;
        middleName?: string;
        phone?: string;
    }): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        middleName: string | null;
        phone: string | null;
        createdAt: Date;
        role: import("@prisma/client").$Enums.RoleType;
    }>;
    listUsers(): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        middleName: string | null;
        phone: string | null;
        createdAt: Date;
        role: import("@prisma/client").$Enums.RoleType;
    }[]>;
    getUser(id: string): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        middleName: string | null;
        phone: string | null;
        createdAt: Date;
        role: import("@prisma/client").$Enums.RoleType;
    }>;
    updateUser(id: string, input: {
        email?: string;
        password?: string;
        role?: RoleType;
        firstName?: string;
        lastName?: string;
        middleName?: string;
        phone?: string;
    }): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        middleName: string | null;
        phone: string | null;
        createdAt: Date;
        role: import("@prisma/client").$Enums.RoleType;
    }>;
    deleteUser(id: string): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        middleName: string | null;
        phone: string | null;
        createdAt: Date;
        role: import("@prisma/client").$Enums.RoleType;
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        firstName: string | null;
        lastName: string | null;
        middleName: string | null;
        phone: string | null;
        createdAt: Date;
        role: import("@prisma/client").$Enums.RoleType;
    } | null>;
}
