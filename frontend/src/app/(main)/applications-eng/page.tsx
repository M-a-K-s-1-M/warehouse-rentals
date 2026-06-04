'use client'

import { ApplicationsEngineerList, RoleGuard } from "@/components";
import { RoleType } from "@/lib";

export default function ApplicationsEngineer() {
    return (
        <RoleGuard allowedRoles={[RoleType.ENGINEER]}>
            <div className="p-[clamp(16px,4vw,32px)]">
                <ApplicationsEngineerList />
            </div>
        </RoleGuard>
    )
}
