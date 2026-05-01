import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { RoleType } from "@prisma/client";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    private readonly safeSelect = {
        id: true,
        email: true,
        role: true,
        createdAt: true,
    };

    async createUser(input: { email: string; password: string; role: RoleType }) {
        const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
        if (existing) {
            throw new BadRequestException("Email already exists");
        }

        const passwordHash = await bcrypt.hash(input.password, 10);

        return this.prisma.user.create({
            data: {
                email: input.email,
                passwordHash,
                role: input.role,
            },
            select: this.safeSelect,
        });
    }

    async listUsers() {
        return this.prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: this.safeSelect,
        });
    }

    async getUser(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: this.safeSelect,
        });
        if (!user) {
            throw new NotFoundException("User not found");
        }
        return user;
    }

    async updateUser(id: string, input: { email?: string; password?: string; role?: RoleType }) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const data: { email?: string; passwordHash?: string; role?: RoleType } = {};
        if (input.email) {
            data.email = input.email;
        }
        if (input.password) {
            data.passwordHash = await bcrypt.hash(input.password, 10);
        }
        if (input.role) {
            data.role = input.role;
        }

        return this.prisma.user.update({
            where: { id },
            data,
            select: this.safeSelect,
        });
    }

    async deleteUser(id: string) {
        await this.getUser(id);
        return this.prisma.user.delete({
            where: { id },
            select: this.safeSelect,
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }
}
