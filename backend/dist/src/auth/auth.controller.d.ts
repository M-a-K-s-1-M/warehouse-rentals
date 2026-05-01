import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { LogoutDto } from "./dto/logout.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: LoginDto, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.RoleType;
        };
    }>;
    refresh(res: Response, body: RefreshDto, req: Request): Promise<{
        accessTokenExpiresIn: number;
    }>;
    logout(res: Response, body: LogoutDto, req: Request): Promise<{
        success: boolean;
    }>;
    private setAuthCookies;
    private clearAuthCookies;
}
