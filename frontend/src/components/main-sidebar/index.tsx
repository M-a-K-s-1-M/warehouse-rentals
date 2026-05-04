'use client';

import { siteConfig } from "@/lib";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { usePathname } from "next/navigation";


export function MainSidebar() {
    const role = 'MANAGER';
    const pathname = usePathname();

    interface IIconProps {
        size?: number | string;
        color?: string;
        strokeWidth?: number;
        absoluteStrokeWidth?: boolean;

        className: string;
    }

    return (
        <nav>
            <ul>
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
        </nav>
    )
}
