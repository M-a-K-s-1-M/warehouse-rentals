import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import { RoleType } from "@prisma/client";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.MANAGER)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    async createUser(@Body() body: CreateUserDto) {
        return this.usersService.createUser(body);
    }

    @Get()
    async listUsers() {
        return this.usersService.listUsers();
    }

    @Get(":id")
    async getUser(@Param("id") id: string) {
        return this.usersService.getUser(id);
    }

    @Patch(":id")
    async updateUser(@Param("id") id: string, @Body() body: UpdateUserDto) {
        return this.usersService.updateUser(id, body);
    }

    @Delete(":id")
    async deleteUser(@Param("id") id: string) {
        return this.usersService.deleteUser(id);
    }
}
