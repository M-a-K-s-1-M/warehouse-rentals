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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    jwtService;
    usersService;
    prisma;
    constructor(jwtService, usersService, prisma) {
        this.jwtService = jwtService;
        this.usersService = usersService;
        this.prisma = prisma;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        return user;
    }
    async issueTokens(userId, role) {
        const accessTokenExpiresIn = this.getAccessTokenTtlSeconds();
        const refreshTokenExpiresIn = this.getRefreshTokenTtlSeconds();
        const refreshTokenId = (0, crypto_1.randomUUID)();
        const resolvedRole = role ?? (await this.usersService.getUser(userId)).role;
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({ sub: userId, type: "access", role: resolvedRole }, {
                secret: this.getAccessTokenSecret(),
                expiresIn: accessTokenExpiresIn,
            }),
            this.jwtService.signAsync({ sub: userId, type: "refresh", tokenId: refreshTokenId }, {
                secret: this.getRefreshTokenSecret(),
                expiresIn: refreshTokenExpiresIn,
            }),
        ]);
        const refreshTokenHash = await bcryptjs_1.default.hash(refreshToken, 10);
        const expiresAt = new Date(Date.now() + refreshTokenExpiresIn * 1000);
        await this.prisma.refreshToken.create({
            data: {
                id: refreshTokenId,
                userId,
                tokenHash: refreshTokenHash,
                expiresAt,
            },
        });
        return {
            accessToken,
            refreshToken,
            accessTokenExpiresIn,
            refreshTokenExpiresIn,
        };
    }
    async refreshTokens(refreshToken) {
        const payload = await this.verifyRefreshToken(refreshToken);
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { id: payload.tokenId },
        });
        if (!tokenRecord || tokenRecord.userId !== payload.sub) {
            throw new common_1.UnauthorizedException("Invalid refresh token");
        }
        if (tokenRecord.revokedAt || tokenRecord.expiresAt <= new Date()) {
            throw new common_1.UnauthorizedException("Refresh token expired");
        }
        const isMatch = await bcryptjs_1.default.compare(refreshToken, tokenRecord.tokenHash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException("Invalid refresh token");
        }
        await this.prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revokedAt: new Date() },
        });
        return this.issueTokens(payload.sub);
    }
    async logout(refreshToken) {
        const payload = await this.verifyRefreshToken(refreshToken);
        await this.prisma.refreshToken.updateMany({
            where: {
                id: payload.tokenId,
                userId: payload.sub,
                revokedAt: null,
            },
            data: { revokedAt: new Date() },
        });
    }
    async verifyRefreshToken(token) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.getRefreshTokenSecret(),
            });
            if (payload?.type !== "refresh" || !payload?.tokenId) {
                throw new common_1.UnauthorizedException("Invalid refresh token");
            }
            return payload;
        }
        catch {
            throw new common_1.UnauthorizedException("Invalid refresh token");
        }
    }
    getAccessTokenSecret() {
        const secret = process.env.JWT_ACCESS_SECRET;
        if (!secret) {
            throw new Error("JWT_ACCESS_SECRET is not set");
        }
        return secret;
    }
    getRefreshTokenSecret() {
        const secret = process.env.JWT_REFRESH_SECRET;
        if (!secret) {
            throw new Error("JWT_REFRESH_SECRET is not set");
        }
        return secret;
    }
    getAccessTokenTtlSeconds() {
        return Number(process.env.ACCESS_TOKEN_TTL ?? 900);
    }
    getRefreshTokenTtlSeconds() {
        return Number(process.env.REFRESH_TOKEN_TTL ?? 60 * 60 * 24 * 7);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        users_service_1.UsersService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map