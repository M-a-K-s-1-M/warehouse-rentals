import { IsInt, IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";

export class UpdateWarehouseDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @IsPositive()
    square?: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    cellSquare?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    pricePerCell?: number;
}
