import { $api } from "../config";
import { IApplication } from "../types";

export class ApplicationsApi {
    static async listApplications(): Promise<IApplication[]> {
        const res = await $api.get("/applications");
        return res.data;
    }
}
