import { BarChartIcon, ChartAreaIcon, DrillIcon, FileTextIcon, HammerIcon, HousePlusIcon, NewspaperIcon, SettingsIcon, UsersIcon, WrenchIcon } from "lucide-react";

export interface ISiteConfig {
    name: string;
    description: string;

    navLinks: {
        MANAGER: INavLink[];
        ENGINEER: INavLink[];
        CLIENT: INavLink[];
    }
}

interface IIconProps {
    size?: number | string;
    color?: string;
    strokeWidth?: number;
    absoluteStrokeWidth?: boolean;
}

export enum RoleType {
    MANAGER = 'MANAGER',
    ENGINEER = 'ENGINEER',
    CLIENT = 'CLIENT',
}

export interface INavLink {
    name: string;
    href: string;
    icon: React.FC<IIconProps>
}




export const siteConfig: ISiteConfig = {
    name: 'WarehouseRentals',
    description: 'Платформа для аренды складов',

    navLinks: {
        MANAGER: [
            { name: 'Субъекты', href: '/', icon: HousePlusIcon },
            { name: 'Арендаторы', href: '/tenants', icon: UsersIcon },
            { name: 'Инженеры', href: '/engineers', icon: HammerIcon },
            { name: 'Заявки', href: '/applications', icon: NewspaperIcon },
            { name: 'Аналитика', href: '/analytics', icon: ChartAreaIcon },
            { name: 'Настройки', href: '/settings', icon: SettingsIcon },
        ],

        ENGINEER: [
            { name: 'Заявки', href: '/applications', icon: NewspaperIcon },
            { name: 'Настройки', href: '/settings', icon: SettingsIcon },
        ],

        CLIENT: [
            { name: 'Заявки', href: '/applications', icon: NewspaperIcon },
            { name: 'Настройки', href: '/settings', icon: SettingsIcon },
        ]
    }
}