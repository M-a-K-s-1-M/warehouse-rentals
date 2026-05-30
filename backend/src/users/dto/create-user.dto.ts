import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { RoleType } from "@prisma/client";

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    middleName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsEnum(RoleType)
    role: RoleType;
}
