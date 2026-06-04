import { $api } from "../config";
import { clearAccessToken, setAccessToken } from "../config/tokenStore";

export class AuthApi {
    static async login(input: { email: string; password: string }) {
        const res = await $api.post("/auth/login", input);
        const data = res.data as {
            user: { id: string; email: string; role: string };
            accessToken: string;
            accessTokenExpiresIn: number;
        };
        setAccessToken(data.accessToken);
        return data;
    }

    static async refresh() {
        const res = await $api.post("/auth/refresh");
        const data = res.data as { accessToken: string; accessTokenExpiresIn: number };
        setAccessToken(data.accessToken);
        return data;
    }

    static async logout() {
        const res = await $api.post("/auth/logout");
        clearAccessToken();
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
