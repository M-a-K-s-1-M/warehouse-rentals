'use client';

import { AuthApi, siteConfig } from "@/lib";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CircleUserRoundIcon, SquareArrowRightExitIcon } from "lucide-react";


export function MainSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const { data: currentUser } = useQuery({
        queryKey: ["me"],
        queryFn: () => AuthApi.me(),
    });

    const role = (currentUser?.role ?? "MANAGER") as "MANAGER" | "ENGINEER" | "CLIENT";
    const userName = useMemo(() => {
        if (!currentUser) {
            return "";
        }
        const parts = [currentUser.lastName, currentUser.firstName, currentUser.middleName].filter(Boolean);
        return parts.length ? parts.join(" ") : currentUser.email ?? "";
    }, [currentUser]);

    const roleLabel = useMemo(() => {
        switch (role) {
            case "ENGINEER":
                return "Инженер";
            case "CLIENT":
                return "Клиент";
            default:
                return "Администратор";
        }
    }, [role]);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await AuthApi.logout();
            queryClient.clear();
            router.replace("/auth");
        } catch {
            notifications.show({
                title: "Ошибка",
                message: "Не удалось выйти из аккаунта.",
                color: "red",
            });
        } finally {
            setIsLoggingOut(false);
        }
    };

    interface IIconProps {
        size?: number | string;
        color?: string;
        strokeWidth?: number;
        absoluteStrokeWidth?: boolean;

        className: string;
    }

    return (
        <nav className="flex h-full flex-col gap-4">
            <ul className="flex-1">
                {siteConfig.navLinks[role].map(link => {
                    const Icon: React.FC<IIconProps> = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <li key={link.href}>
                            <Link href={link.href} className={`flex items-center gap-3 px-4 py-3 text-gray-700 cursor-pointer transition-colors duration-200
                            ${isActive ? 'bg-blue-100 text-indigo-900 border-r-2 border-indigo-900' : 'hover:bg-blue-100 hover:text-indigo-900'}`}>
                                <div className="flex justify-center items-center">
                                    {Icon ? <Icon size={22} className="inline-block" /> : null}
                                </div>

                                <p className={`text-base font-normal ${isActive ? 'font-semibold' : ''}`}>
                                    {link.name}
                                </p>
                            </Link>
                        </li>
                    )
                })}
            </ul>

            <div className="m-3 mt-auto mb-5 flex items-center gap-3 rounded-md bg-slate-100 px-4 py-3">
                {/* <div className="h-10 w-10 rounded-full bg-slate-300" /> */}
                <CircleUserRoundIcon size={40} className="inline-block text-gray-600" />
                <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-slate-900">
                        {userName || "Пользователь"}
                    </p>
                    <p className="text-sm text-slate-500">{roleLabel}</p>
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="mt-2 flex items-center gap-1 cursor-pointer text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {/* <span aria-hidden>⟵</span> */}
                        <SquareArrowRightExitIcon size={16} className="inline-block" />
                        <span>Выйти</span>
                    </button>
                </div>
            </div>
        </nav>
    )
}
