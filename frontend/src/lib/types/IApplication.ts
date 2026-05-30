export interface IApplication {
    id: string;
    warehouseId: number;
    userId: string;
    description: string;
    status: string;
    openStatus: string;
    createdAt: string;
    engineers: Array<{
        engineerId: string;
        assignedAt: string;
        engineer: {
            id: string;
            email: string;
            role: string;
            createdAt: string;
        };
    }>;
}
