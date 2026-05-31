import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { LogoutDto } from "./dto/logout.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { UsersService } from "../users/users.service";

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) { }

    @Post("login")
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.validateUser(body.email, body.password);
        const tokens = await this.authService.issueTokens(user.id, user.role);

        this.setAuthCookies(res, tokens);

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }

    @Post("refresh")
    async refresh(
        @Res({ passthrough: true }) res: Response,
        @Body() body: RefreshDto,
        @Req() req: Request,
    ) {
        const token = body.refreshToken ?? req.cookies?.refresh_token;
        if (!token) {
            throw new UnauthorizedException("Refresh token required");
        }

        const tokens = await this.authService.refreshTokens(token);
        this.setAuthCookies(res, tokens);

        return { accessTokenExpiresIn: tokens.accessTokenExpiresIn };
    }

    @Post("logout")
    async logout(
        @Res({ passthrough: true }) res: Response,
        @Body() body: LogoutDto,
        @Req() req: Request,
    ) {
        const token = body.refreshToken ?? req.cookies?.refresh_token;
        if (!token) {
            return { success: true };
        }

        await this.authService.logout(token);
        this.clearAuthCookies(res);
        return { success: true };
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    async me(@Req() req: { user?: { id: string } }) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException("User not found");
        }
        const user = await this.usersService.getUser(userId);
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
        };
    }

    private setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string; accessTokenExpiresIn: number; refreshTokenExpiresIn: number }) {
        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("access_token", tokens.accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: isProduction,
            maxAge: tokens.accessTokenExpiresIn * 1000,
        });
        res.cookie("refresh_token", tokens.refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: isProduction,
            maxAge: tokens.refreshTokenExpiresIn * 1000,
        });
    }

    private clearAuthCookies(res: Response) {
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("access_token", { httpOnly: true, sameSite: "lax", secure: isProduction });
        res.clearCookie("refresh_token", { httpOnly: true, sameSite: "lax", secure: isProduction });
    }
}
