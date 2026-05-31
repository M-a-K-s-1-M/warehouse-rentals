import { IsEnum, IsString, IsUrl } from "class-validator";
import { PhotoKind } from "@prisma/client";

export class AddApplicationPhotoDto {
    @IsString()
    @IsUrl()
    url: string;

    @IsEnum(PhotoKind)
    kind: PhotoKind;
}
