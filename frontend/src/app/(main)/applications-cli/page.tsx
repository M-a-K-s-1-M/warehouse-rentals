'use client';

import { ApplicationsClientList, RoleGuard } from "@/components";
import { RoleType } from "@/lib";

export default function ApplicationsClient() {
    return (
        <RoleGuard allowedRoles={[RoleType.CLIENT]}>
            <div className="p-[clamp(16px,4vw,32px)]">
                <ApplicationsClientList />
            </div>
        </RoleGuard>
    );
}
