import { $api } from "../config";
import { IApplication } from "../types";

export class ApplicationsApi {
    static async listApplications(): Promise<IApplication[]> {
        const res = await $api.get("/applications");
        return res.data;
    }

    static async updateStatus(input: { applicationId: string; status: string }) {
        const res = await $api.patch(`/applications/${input.applicationId}/status`, {
            status: input.status,
        });
        return res.data as IApplication;
    }

    static async updateOpenStatus(input: { applicationId: string; openStatus: string }) {
        const res = await $api.patch(`/applications/${input.applicationId}/open-status`, {
            openStatus: input.openStatus,
        });
        return res.data as IApplication;
    }

    static async assignEngineers(input: { applicationId: string; engineerIds: string[] }) {
        const res = await $api.post(`/applications/${input.applicationId}/engineers`, {
            engineerIds: input.engineerIds,
        });
        return res.data as IApplication;
    }

    static async addPhoto(input: { applicationId: string; url: string; kind: string }) {
        const res = await $api.post(`/applications/${input.applicationId}/photos`, {
            url: input.url,
            kind: input.kind,
        });
        return res.data;
    }

    static async updateDescription(input: { applicationId: string; description: string }) {
        const res = await $api.patch(`/applications/${input.applicationId}/description`, {
            description: input.description,
        });
        return res.data as IApplication;
    }
}
