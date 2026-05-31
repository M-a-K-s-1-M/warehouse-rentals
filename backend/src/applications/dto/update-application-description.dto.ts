import { IsString } from "class-validator";

export class UpdateApplicationDescriptionDto {
    @IsString()
    description: string;
}
