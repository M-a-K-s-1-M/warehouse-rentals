'use client'

import { EngineersList, RoleGuard } from "@/components"
import { RoleType } from "@/lib";

export default function EngineersPage() {
    return (
        <RoleGuard allowedRoles={[RoleType.MANAGER]}>
            <div className="p-[clamp(16px,4vw,32px)]">
                <EngineersList />
            </div>
        </RoleGuard>
    )
}
