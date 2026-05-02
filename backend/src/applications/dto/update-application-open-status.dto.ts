import { IsEnum } from "class-validator";
import { ApplicationOpenStatus } from "@prisma/client";

export class UpdateApplicationOpenStatusDto {
    @IsEnum(ApplicationOpenStatus)
    openStatus: ApplicationOpenStatus;
}
