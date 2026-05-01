import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleType } from "@prisma/client";

export const ROLES_KEY = "roles";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext) {
        const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userRole = request.user?.role;

        if (!userRole || !requiredRoles.includes(userRole)) {
            throw new ForbiddenException("Forbidden");
        }

        return true;
    }
}
