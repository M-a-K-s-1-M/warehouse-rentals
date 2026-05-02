'use client'

import { MainSidebar } from "@/components";
import { siteConfig } from "@/lib";
import {
    ActionIcon,
    AppShell,
    AppShellHeader,
    AppShellMain,
    AppShellNavbar,
    Burger,
    Group,
    Title,
} from "@mantine/core";

import { useDisclosure } from "@mantine/hooks";
import { WarehouseIcon } from "lucide-react";

export default function MainPageLayout({ children }: { children: React.ReactNode }) {
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell
            layout="alt"
            header={{ height: 64 }}
            navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}

        >
            <AppShellHeader >
                <Group className="h-full px-md">
                    <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

                    <h1 className="text-2xl font-semibold">WarehouseRentals</h1>
                </Group>
            </AppShellHeader>

            <AppShellNavbar>
                <div className="flex gap-1 items-center p-3 pt-5 mb-5">
                    <ActionIcon
                        variant="gradient"
                        size={'lg'}
                        gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                    >
                        <WarehouseIcon size={20} />
                    </ActionIcon>

                    <h2 className="text-xl font-semibold">{siteConfig.name}</h2>
                </div>

                <MainSidebar />
            </AppShellNavbar>

            <AppShellMain className="bg-gray-100/80">
                {children}
            </AppShellMain>
        </AppShell>
    )
}
