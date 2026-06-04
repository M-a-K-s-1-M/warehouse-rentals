'use client'

import { RoleGuard } from "@/components";
import { RoleType } from "@/lib";

export default function SettingsEngineer() {
    return (
        <RoleGuard allowedRoles={[RoleType.ENGINEER]}>
            <div>SettingsEngineer</div>
        </RoleGuard>
    )
}
