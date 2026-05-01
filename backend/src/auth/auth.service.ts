import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../prisma/prisma.service";
import { RoleType } from "@prisma/client";

export type AuthTokens = {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
};

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly prisma: PrismaService,
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return user;
    }

    async issueTokens(userId: string, role?: RoleType): Promise<AuthTokens> {
        const accessTokenExpiresIn = this.getAccessTokenTtlSeconds();
        const refreshTokenExpiresIn = this.getRefreshTokenTtlSeconds();
        const refreshTokenId = randomUUID();
        const resolvedRole = role ?? (await this.usersService.getUser(userId)).role;

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                { sub: userId, type: "access", role: resolvedRole },
                {
                    secret: this.getAccessTokenSecret(),
                    expiresIn: accessTokenExpiresIn,
                },
            ),
            this.jwtService.signAsync(
                { sub: userId, type: "refresh", tokenId: refreshTokenId },
                {
                    secret: this.getRefreshTokenSecret(),
                    expiresIn: refreshTokenExpiresIn,
                },
            ),
        ]);

        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
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

    async refreshTokens(refreshToken: string): Promise<AuthTokens> {
        const payload = await this.verifyRefreshToken(refreshToken);
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { id: payload.tokenId },
        });

        if (!tokenRecord || tokenRecord.userId !== payload.sub) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        if (tokenRecord.revokedAt || tokenRecord.expiresAt <= new Date()) {
            throw new UnauthorizedException("Refresh token expired");
        }

        const isMatch = await bcrypt.compare(refreshToken, tokenRecord.tokenHash);
        if (!isMatch) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        await this.prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revokedAt: new Date() },
        });

        return this.issueTokens(payload.sub);
    }

    async logout(refreshToken: string) {
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

    private async verifyRefreshToken(token: string) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.getRefreshTokenSecret(),
            });

            if (payload?.type !== "refresh" || !payload?.tokenId) {
                throw new UnauthorizedException("Invalid refresh token");
            }

            return payload as { sub: string; tokenId: string; type: "refresh" };
        } catch {
            throw new UnauthorizedException("Invalid refresh token");
        }
    }

    private getAccessTokenSecret() {
        const secret = process.env.JWT_ACCESS_SECRET;
        if (!secret) {
            throw new Error("JWT_ACCESS_SECRET is not set");
        }
        return secret;
    }

    private getRefreshTokenSecret() {
        const secret = process.env.JWT_REFRESH_SECRET;
        if (!secret) {
            throw new Error("JWT_REFRESH_SECRET is not set");
        }
        return secret;
    }

    private getAccessTokenTtlSeconds() {
        return Number(process.env.ACCESS_TOKEN_TTL ?? 900);
    }

    private getRefreshTokenTtlSeconds() {
        return Number(process.env.REFRESH_TOKEN_TTL ?? 60 * 60 * 24 * 7);
    }
}
