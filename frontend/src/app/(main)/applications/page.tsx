'use client';

import { ApplicationsList, RoleGuard } from "@/components";
import { RoleType } from "@/lib";

export default function ApplicationsPage() {
    return (
        <RoleGuard allowedRoles={[RoleType.MANAGER]}>
            <div className="p-[clamp(16px,4vw,32px)]">
                <ApplicationsList />
            </div>
        </RoleGuard>
    )
}
