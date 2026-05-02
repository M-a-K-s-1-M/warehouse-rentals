import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateApplicationDto {
    @IsUUID()
    warehouseId: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsUUID()
    userId?: string;
}
