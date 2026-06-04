'use client'

import { RoleGuard } from "@/components";
import { RoleType } from "@/lib";

export default function SettingsClient() {
    return (
        <RoleGuard allowedRoles={[RoleType.CLIENT]}>
            <div>SettingsClient</div>
        </RoleGuard>
    )
}
