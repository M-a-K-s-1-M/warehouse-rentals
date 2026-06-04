'use client'

import { ListWarehouses, RoleGuard } from "@/components"
import { RoleType } from "@/lib";

export default function MainPage() {
    return (
        <RoleGuard allowedRoles={[RoleType.MANAGER]}>
            <div className="p-[clamp(16px,4vw,32px)]">
                <ListWarehouses />
            </div>
        </RoleGuard>
    )
}
