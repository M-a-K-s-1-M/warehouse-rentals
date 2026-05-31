import { $api } from "../config";

export class AuthApi {
    static async login(input: { email: string; password: string }) {
        const res = await $api.post("/auth/login", input);
        return res.data as { user: { id: string; email: string; role: string } };
    }

    static async refresh() {
        const res = await $api.post("/auth/refresh");
        return res.data as { accessTokenExpiresIn: number };
    }

    static async logout() {
        const res = await $api.post("/auth/logout");
        return res.data as { success: boolean };
    }

    static async me() {
        const res = await $api.get("/auth/me");
        return res.data as {
            id: string;
            email: string;
            role: string;
            firstName?: string | null;
            lastName?: string | null;
            middleName?: string | null;
        };
    }
}
