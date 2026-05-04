import {
    IsBoolean,
    IsDateString,
    IsEmail,
    IsInt,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
} from "class-validator";

export class CreateRentalDto {
    @IsInt()
    @IsPositive()
    warehouseId: number;

    @IsUUID()
    userId: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsOptional()
    @IsBoolean()
    autoRenew?: boolean;

    @IsInt()
    @IsPositive()
    rowStart: number;

    @IsInt()
    @IsPositive()
    rowEnd: number;

    @IsInt()
    @IsPositive()
    colStart: number;

    @IsInt()
    @IsPositive()
    colEnd: number;

    @IsOptional()
    @IsString()
    extraContactName?: string;

    @IsOptional()
    @IsEmail()
    extraContactEmail?: string;
}
