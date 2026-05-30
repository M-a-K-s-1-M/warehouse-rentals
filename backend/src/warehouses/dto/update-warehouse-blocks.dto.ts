import { IsArray, IsString, ArrayNotEmpty } from "class-validator";

export class UpdateWarehouseBlocksDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    labels: string[];
}
