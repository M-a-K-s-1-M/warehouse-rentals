export interface IWarehouse {
    "id": number,
    "title": string,
    "address": string,
    "description": string | null,
    "square": number,
    "cellSquare": number,
    "gridRows": number,
    "gridCols": number,
    "pricePerCell": number,
    "createdAt": string,
    "updatedAt": string
}