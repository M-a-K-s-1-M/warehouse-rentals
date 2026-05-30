import { RoleType } from "@prisma/client";
export declare class CreateUserDto {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone?: string;
    role: RoleType;
}
