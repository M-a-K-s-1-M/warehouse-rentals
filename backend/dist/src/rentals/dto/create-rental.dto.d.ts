export declare class CreateRentalDto {
    warehouseId: string;
    userId: string;
    startDate: string;
    endDate: string;
    autoRenew?: boolean;
    rowStart: number;
    rowEnd: number;
    colStart: number;
    colEnd: number;
    extraContactName?: string;
    extraContactEmail?: string;
}
