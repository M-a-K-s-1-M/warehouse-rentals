export interface IApplication {
    id: string;
    warehouseId: number;
    userId: string;
    description: string;
    engineerComment?: string | null;
    status: string;
    openStatus: string;
    createdAt: string;
    photos: Array<{
        id: string;
        applicationId: string;
        uploadedById?: string | null;
        kind: string;
        url: string;
        createdAt: string;
    }>;
    user?: {
        id: string;
        email: string;
        firstName?: string | null;
        lastName?: string | null;
        middleName?: string | null;
    };
    warehouse?: {
        id: number;
        title: string;
        address: string;
    };
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
