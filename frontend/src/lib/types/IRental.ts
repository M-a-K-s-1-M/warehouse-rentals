export interface IRental {
    id: string;
    warehouseId: number;
    userId: string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
    rowStart: number;
    rowEnd: number;
    colStart: number;
    colEnd: number;
    totalCells: number;
    areaSquare: number;
    pricePerCell: number;
    totalPrice: number;
    extraContactName?: string | null;
    extraContactEmail?: string | null;
    rentalStatus: string;
    color?: string | null;
    createdAt: string;
}
