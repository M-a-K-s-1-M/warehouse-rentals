'use client';

import { AuthApi, $api } from "@/lib";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";

type AuthStatus = "checking" | "authed" | "guest";

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [status, setStatus] = useState<AuthStatus>("checking");
    const refreshPromiseRef = useRef<Promise<void> | null>(null);
    const interceptorAttachedRef = useRef(false);

    const isAuthRoute = pathname?.startsWith("/auth");

    const runRefresh = () => {
        if (!refreshPromiseRef.current) {
            refreshPromiseRef.current = AuthApi.refresh()
                .then(() => {
                    setStatus("authed");
                })
                .catch((error) => {
                    setStatus("guest");
                    throw error;
                })
                .finally(() => {
                    refreshPromiseRef.current = null;
                });
        }

        return refreshPromiseRef.current;
    };

    useEffect(() => {
        if (interceptorAttachedRef.current) {
            return;
        }

        interceptorAttachedRef.current = true;
        $api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const statusCode = error?.response?.status;
                const originalConfig = error?.config;

                if (!originalConfig || statusCode !== 401) {
                    return Promise.reject(error);
                }

                if (originalConfig.__isRetry) {
                    return Promise.reject(error);
                }

                const url: string = originalConfig.url ?? "";
                if (url.includes("/auth/login") || url.includes("/auth/refresh") || url.includes("/auth/logout")) {
                    return Promise.reject(error);
                }

                originalConfig.__isRetry = true;

                try {
                    await runRefresh();
                    return $api(originalConfig);
                } catch (refreshError) {
                    if (!isAuthRoute) {
                        router.replace("/auth");
                    }
                    return Promise.reject(refreshError);
                }
            },
        );
    }, [isAuthRoute, router]);

    useEffect(() => {
        if (status === "checking") {
            runRefresh()
                .then(() => {
                    if (isAuthRoute) {
                        router.replace("/");
                    }
                })
                .catch(() => {
                    if (!isAuthRoute) {
                        router.replace("/auth");
                    }
                });
        }
    }, [isAuthRoute, router, status]);

    return <>{children}</>;
}
