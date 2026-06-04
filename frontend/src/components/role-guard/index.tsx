'use client';

import { AuthApi, RoleType, getDefaultRouteByRole } from "@/lib";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

type RoleGuardProps = {
    allowedRoles: RoleType[];
    children: ReactNode;
};

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
    const router = useRouter();
    const { data: currentUser, isLoading } = useQuery({
        queryKey: ["me"],
        queryFn: () => AuthApi.me(),
    });

    useEffect(() => {
        if (!currentUser) {
            return;
        }

        if (!allowedRoles.includes(currentUser.role as RoleType)) {
            router.replace(getDefaultRouteByRole(currentUser.role as RoleType));
        }
    }, [allowedRoles, currentUser, router]);

    if (isLoading || !currentUser) {
        return null;
    }

    if (!allowedRoles.includes(currentUser.role as RoleType)) {
        return null;
    }

    return <>{children}</>;
}
