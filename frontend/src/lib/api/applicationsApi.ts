import { $api } from "../config";
import { IApplication } from "../types";

export class ApplicationsApi {
    static async listApplications(params?: {
        status?: string;
        openStatus?: string;
        userId?: string;
        warehouseId?: number;
    }): Promise<IApplication[]> {
        const res = await $api.get("/applications", { params });
        return res.data;
    }

    static async createApplication(input: { warehouseId: number; description: string }) {
        const res = await $api.post("/applications", input);
        return res.data as IApplication;
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

    static async uploadPhoto(input: { applicationId: string; file: File; kind: string }) {
        const data = new FormData();
        data.append("file", input.file);
        data.append("kind", input.kind);
        const res = await $api.post(`/applications/${input.applicationId}/photos/upload`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    }

    static async updateDescription(input: { applicationId: string; description: string }) {
        const res = await $api.patch(`/applications/${input.applicationId}/description`, {
            description: input.description,
        });
        return res.data as IApplication;
    }

    static async updateEngineerComment(input: { applicationId: string; comment: string }) {
        const res = await $api.patch(`/applications/${input.applicationId}/engineer-comment`, {
            comment: input.comment,
        });
        return res.data as IApplication;
    }
}
