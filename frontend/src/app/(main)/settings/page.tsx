'use client';

import { RoleGuard } from "@/components";
import { RoleType } from "@/lib";

export default function SettingsPage() {
    return (
        <RoleGuard allowedRoles={[RoleType.MANAGER]}>
            <div className="p-[clamp(16px,4vw,32px)]">SettingsPage</div>
        </RoleGuard>
    )
}
