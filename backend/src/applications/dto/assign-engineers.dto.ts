import { ArrayUnique, IsArray, IsUUID } from "class-validator";

export class AssignEngineersDto {
    @IsArray()
    @ArrayUnique()
    @IsUUID("4", { each: true })
    engineerIds: string[];
}
