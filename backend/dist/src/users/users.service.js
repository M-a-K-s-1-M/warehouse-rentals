"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    safeSelect = {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        middleName: true,
        phone: true,
        createdAt: true,
    };
    async createUser(input) {
        const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
        if (existing) {
            throw new common_1.BadRequestException("Email already exists");
        }
        const rawPassword = input.password ?? Math.random().toString(36).slice(2, 12);
        const passwordHash = await bcryptjs_1.default.hash(rawPassword, 10);
        return this.prisma.user.create({
            data: {
                email: input.email,
                passwordHash,
                role: input.role,
                firstName: input.firstName ?? null,
                lastName: input.lastName ?? null,
                middleName: input.middleName ?? null,
                phone: input.phone ?? null,
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
    async getUser(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: this.safeSelect,
        });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        return user;
    }
    async updateUser(id, input) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        const data = {};
        if (input.email) {
            data.email = input.email;
        }
        if (input.password) {
            data.passwordHash = await bcryptjs_1.default.hash(input.password, 10);
        }
        if (input.role) {
            data.role = input.role;
        }
        if (input.firstName !== undefined) {
            data.firstName = input.firstName ?? null;
        }
        if (input.lastName !== undefined) {
            data.lastName = input.lastName ?? null;
        }
        if (input.middleName !== undefined) {
            data.middleName = input.middleName ?? null;
        }
        if (input.phone !== undefined) {
            data.phone = input.phone ?? null;
        }
        return this.prisma.user.update({
            where: { id },
            data,
            select: this.safeSelect,
        });
    }
    async deleteUser(id) {
        await this.getUser(id);
        return this.prisma.user.delete({
            where: { id },
            select: this.safeSelect,
        });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map