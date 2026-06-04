'use client'

import { RoleGuard } from "@/components";
import { RoleType } from "@/lib";

export default function ApplicationsClient() {
    return (
        <RoleGuard allowedRoles={[RoleType.CLIENT]}>
            <div>ApplicationsClient</div>
        </RoleGuard>
    )
}
