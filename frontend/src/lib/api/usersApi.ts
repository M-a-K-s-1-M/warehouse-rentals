import { $api } from "../config";
import { IUser } from "../types";

export class UsersApi {
    static async listUsers(): Promise<IUser[]> {
        const res = await $api.get("/users");
        return res.data;
    }

    static async createUser(input: {
        email: string;
        password: string;
        role: "MANAGER" | "ENGINEER" | "CLIENT";
        firstName?: string;
        lastName?: string;
        middleName?: string;
        phone?: string;
    }): Promise<IUser> {
        const res = await $api.post("/users", input);
        return res.data;
    }
}
