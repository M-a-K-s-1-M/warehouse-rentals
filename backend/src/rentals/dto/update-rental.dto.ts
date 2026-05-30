import {
    IsBoolean,
    IsDateString,
    IsEmail,
    IsEnum,
    IsInt,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
} from "class-validator";
import { RentalStatusType } from "@prisma/client";

export class UpdateRentalDto {
    @IsOptional()
    @IsInt()
    @IsPositive()
    warehouseId?: number;

    @IsOptional()
    @IsUUID()
    userId?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsBoolean()
    autoRenew?: boolean;

    @IsOptional()
    @IsInt()
    @IsPositive()
    rowStart?: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    rowEnd?: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    colStart?: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    colEnd?: number;

    @IsOptional()
    @IsString()
    extraContactName?: string;

    @IsOptional()
    @IsEmail()
    extraContactEmail?: string;

    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsEnum(RentalStatusType)
    rentalStatus?: RentalStatusType;
}
