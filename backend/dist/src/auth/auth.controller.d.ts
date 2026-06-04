import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { LogoutDto } from "./dto/logout.dto";
import { UsersService } from "../users/users.service";
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    login(body: LoginDto, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.RoleType;
        };
        accessToken: string;
        accessTokenExpiresIn: number;
    }>;
    refresh(res: Response, body: RefreshDto, req: Request): Promise<{
        accessToken: string;
        accessTokenExpiresIn: number;
    }>;
    logout(res: Response, body: LogoutDto, req: Request): Promise<{
        success: boolean;
    }>;
    me(req: {
        user?: {
            id: string;
        };
    }): Promise<{
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.RoleType;
        firstName: string | null;
        lastName: string | null;
        middleName: string | null;
    }>;
    private setAuthCookies;
    private clearAuthCookies;
}
