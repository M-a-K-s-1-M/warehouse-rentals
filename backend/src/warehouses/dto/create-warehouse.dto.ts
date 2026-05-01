import { IsInt, IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";

export class CreateWarehouseDto {
    @IsString()
    title: string;

    @IsString()
    address: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsInt()
    @IsPositive()
    square: number;

    @IsInt()
    @IsPositive()
    cellSquare: number;

    @IsNumber()
    @Min(0)
    price: number;
}
