import { IsInt, IsOptional, IsPositive, IsString, IsUUID } from "class-validator";

export class CreateApplicationDto {
    @IsInt()
    @IsPositive()
    warehouseId: number;

    @IsString()
    description: string;

    @IsOptional()
    @IsUUID()
    userId?: string;
}
