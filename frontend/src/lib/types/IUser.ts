export interface IUser {
    id: string;
    email: string;
    role: "MANAGER" | "ENGINEER" | "CLIENT";
    firstName?: string | null;
    lastName?: string | null;
    middleName?: string | null;
    phone?: string | null;
    createdAt: string;
}
