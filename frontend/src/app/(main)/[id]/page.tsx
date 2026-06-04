'use client';

import { RoleGuard, WarehouseGrid } from "@/components";
import { RoleType } from "@/lib";

export default function WarehosePage() {
    return (
        <RoleGuard allowedRoles={[RoleType.MANAGER]}>
            <div className="p-[clamp(16px,4vw,32px)]">
                <WarehouseGrid />
            </div>
        </RoleGuard>
    )
}
