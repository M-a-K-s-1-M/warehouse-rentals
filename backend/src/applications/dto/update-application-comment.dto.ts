import { IsString } from "class-validator";

export class UpdateApplicationCommentDto {
    @IsString()
    comment: string;
}
