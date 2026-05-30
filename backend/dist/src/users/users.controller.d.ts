import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createUser(body: CreateUserDto): Promise<{
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
    updateUser(id: string, body: UpdateUserDto): Promise<{
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
}
