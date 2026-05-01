import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { RoleType } from "@prisma/client";

export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @IsOptional()
    @IsEnum(RoleType)
    role?: RoleType;
}
