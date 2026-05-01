import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";
import { RoleType } from "@prisma/client";

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsEnum(RoleType)
    role: RoleType;
}
