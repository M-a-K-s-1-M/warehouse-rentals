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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const refresh_dto_1 = require("./dto/refresh.dto");
const logout_dto_1 = require("./dto/logout.dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(body, res) {
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
    async refresh(res, body, req) {
        const token = body.refreshToken ?? req.cookies?.refresh_token;
        if (!token) {
            throw new common_1.UnauthorizedException("Refresh token required");
        }
        const tokens = await this.authService.refreshTokens(token);
        this.setAuthCookies(res, tokens);
        return { accessTokenExpiresIn: tokens.accessTokenExpiresIn };
    }
    async logout(res, body, req) {
        const token = body.refreshToken ?? req.cookies?.refresh_token;
        if (!token) {
            return { success: true };
        }
        await this.authService.logout(token);
        this.clearAuthCookies(res);
        return { success: true };
    }
    setAuthCookies(res, tokens) {
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
    clearAuthCookies(res) {
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("access_token", { httpOnly: true, sameSite: "lax", secure: isProduction });
        res.clearCookie("refresh_token", { httpOnly: true, sameSite: "lax", secure: isProduction });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("login"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)("refresh"),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, refresh_dto_1.RefreshDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)("logout"),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, logout_dto_1.LogoutDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map