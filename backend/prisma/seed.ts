import {
    ApplicationStatus,
    PhotoKind,
    PrismaClient,
    RentalStatusType,
    RoleType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const manager = await prisma.user.upsert({
        where: { email: "manager@example.com" },
        update: { role: RoleType.MANAGER },
        create: {
            email: "manager@example.com",
            passwordHash: "hashed_manager_password",
            role: RoleType.MANAGER,
        },
    });

    const engineer = await prisma.user.upsert({
        where: { email: "engineer@example.com" },
        update: { role: RoleType.ENGINEER },
        create: {
            email: "engineer@example.com",
            passwordHash: "hashed_engineer_password",
            role: RoleType.ENGINEER,
        },
    });

    const client = await prisma.user.upsert({
        where: { email: "client@example.com" },
        update: { role: RoleType.CLIENT },
        create: {
            email: "client@example.com",
            passwordHash: "hashed_client_password",
            role: RoleType.CLIENT,
        },
    });

    const existingWarehouse = await prisma.warehouse.findFirst({
        where: {
            title: "Main Warehouse",
            address: "Industrial Park 5",
        },
    });

    const cellSquare = 25;
    const totalCells = 1200 / cellSquare;
    const gridRows = 6;
    const gridCols = totalCells / gridRows;

    const warehouse =
        existingWarehouse ??
        (await prisma.warehouse.create({
            data: {
                title: "Main Warehouse",
                address: "Industrial Park 5",
                description: "Primary storage facility",
                square: 1200,
                cellSquare,
                gridRows,
                gridCols,
                price: 45000,
            },
        }));

    const existingRental = await prisma.rental.findFirst({
        where: {
            userId: client.id,
            warehouseId: warehouse.id,
        },
    });

    if (!existingRental) {
        await prisma.rental.create({
            data: {
                userId: client.id,
                warehouseId: warehouse.id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
                totalPrice: 90000,
                rentalStatus: RentalStatusType.MORE_THAN_60_DAYS,
            },
        });
    }

    const existingApplication = await prisma.application.findFirst({
        where: {
            userId: client.id,
            warehouseId: warehouse.id,
            description: "Broken loading dock door",
        },
    });

    const application =
        existingApplication ??
        (await prisma.application.create({
            data: {
                userId: client.id,
                warehouseId: warehouse.id,
                description: "Broken loading dock door",
                status: ApplicationStatus.IN_PROGRESS,
            },
        }));

    const existingPhotos = await prisma.applicationPhoto.findMany({
        where: {
            applicationId: application.id,
        },
    });

    if (existingPhotos.length === 0) {
        await prisma.applicationPhoto.createMany({
            data: [
                {
                    applicationId: application.id,
                    url: "https://example.com/photos/breakdown-1.jpg",
                    kind: PhotoKind.BREAKDOWN,
                    uploadedById: client.id,
                },
                {
                    applicationId: application.id,
                    url: "https://example.com/photos/repair-1.jpg",
                    kind: PhotoKind.REPAIR,
                    uploadedById: engineer.id,
                },
            ],
        });
    }

    await prisma.$disconnect();

    return { manager, engineer, client, warehouse, application };
}

main().catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
