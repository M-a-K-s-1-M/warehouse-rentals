import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);

        if (!token) {
            throw new UnauthorizedException("Access token required");
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.getAccessTokenSecret(),
            });

            if (payload?.type !== "access") {
                throw new UnauthorizedException("Invalid access token");
            }

            request.user = {
                id: payload.sub,
                role: payload.role,
            };
            return true;
        } catch {
            throw new UnauthorizedException("Invalid access token");
        }
    }

    private extractToken(request: { headers?: { authorization?: string }; cookies?: Record<string, string> }) {
        const header = request.headers?.authorization;
        if (header?.startsWith("Bearer ")) {
            return header.slice("Bearer ".length);
        }

        return request.cookies?.access_token;
    }

    private getAccessTokenSecret() {
        const secret = process.env.JWT_ACCESS_SECRET;
        if (!secret) {
            throw new Error("JWT_ACCESS_SECRET is not set");
        }
        return secret;
    }
}
