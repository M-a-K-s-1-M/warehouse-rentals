import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../prisma/prisma.service";
import { RoleType } from "@prisma/client";
export type AuthTokens = {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
};
export declare class AuthService {
    private readonly jwtService;
    private readonly usersService;
    private readonly prisma;
    constructor(jwtService: JwtService, usersService: UsersService, prisma: PrismaService);
    validateUser(email: string, password: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        role: import("@prisma/client").$Enums.RoleType;
    }>;
    issueTokens(userId: string, role?: RoleType): Promise<AuthTokens>;
    refreshTokens(refreshToken: string): Promise<AuthTokens>;
    logout(refreshToken: string): Promise<void>;
    private verifyRefreshToken;
    private getAccessTokenSecret;
    private getRefreshTokenSecret;
    private getAccessTokenTtlSeconds;
    private getRefreshTokenTtlSeconds;
}
