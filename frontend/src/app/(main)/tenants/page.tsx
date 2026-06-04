'use client'

import { RoleGuard, TenantsList } from "@/components"
import { RoleType } from "@/lib";

export default function TenantsPage() {

    return (
        <RoleGuard allowedRoles={[RoleType.MANAGER]}>
            <div className="p-[clamp(16px,4vw,32px)]">
                <TenantsList />
            </div>
        </RoleGuard>
    )
}
