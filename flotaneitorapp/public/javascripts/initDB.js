import { MongoClient } from "mongodb";
import crypto from "crypto";

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const clave = 'abcdefg';

function generatePlate() {
    const numbers = Math.floor(Math.random() * 9000) + 1000;
    const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
    let plate = numbers.toString();
    for (let i = 0; i < 3; i++) {
        plate += consonants.charAt(Math.floor(Math.random() * consonants.length));
    }
    return plate;
}

export async function run(reset = true) {
    try {
        await client.connect();
        const database = client.db("flotaneitor_db");
        const usersCollection = database.collection("users");
        const employeesCollection = database.collection("employees");
        const vehiclesCollection = database.collection("vehicles");
        const tripsCollection = database.collection("trips");

        if (reset) {
            await database.dropDatabase();
            console.log("Database successfully dropped");
        } else {
            console.log("Database will not be dropped");
        }

        const existingAdmin = await usersCollection.findOne({ dni: "12345678Z" });
        if (existingAdmin) {
            console.log("Admin already exists");
            return;
        }

        let securePassword = crypto
            .createHmac("sha256", clave)
            .update("@Dm1n1str@D0r")
            .digest("hex");

        let adminUser = {
            dni: "12345678Z",
            password: securePassword
        };

        let adminEmployee = {
            dni: "12345678Z",
            name: "John",
            surname: "Doe",
            role: "admin"
        };

        await usersCollection.insertOne(adminUser);
        await employeesCollection.insertOne(adminEmployee);

        for (let i = 1; i <= 15; i++) {
            let userDniCode = 10000001 + i;
            let userDni = userDniCode.toString() + "E";
            let userName = "Us3r@" + i;
            let userPassword = userName + "-PASSWORD";

            let securePassword = crypto
                .createHmac("sha256", clave)
                .update(userPassword)
                .digest("hex");

            let userEmployee = {
                dni: userDni,
                password: securePassword,
                email: userDni + '@flotaneitor.com'
            };

            let employeeEmployee = {
                dni: userDni,
                name: userName,
                surname: "Userino",
                role: "employee"
            };

            await usersCollection.insertOne(userEmployee);
            await employeesCollection.insertOne(employeeEmployee);
        }

        const freeVehicles = [
            {
                plate: '1234BCD',
                chassisNumber: '1HGCM82633A004352',
                brand: 'Toyota',
                model: 'Corolla',
                fuelType: 'GASOLINA',
                kilometers: 0,
                state: "LIBRE"
            },
            {
                plate: '4567XYZ',
                chassisNumber: '3FAHP0HA6AR123456',
                brand: 'Ford',
                model: 'Focus',
                fuelType: 'DIESEL',
                kilometers: 0,
                state: "LIBRE"
            }
        ];

        try {
            await vehiclesCollection.insertMany(freeVehicles);
            console.log("Vehicles successfully inserted");
        } catch (vehicleErr) {
            console.error("Error inserting vehicles: ", vehicleErr);
        }

        const vehicleWithTrips = {
            plate: "9999XYZ",
            chassisNumber: "1HGCX123456789012",
            brand: "Ford",
            model: "Focus",
            fuelType: "DIESEL",
            kilometers: 100,
            state: "OCUPADO",
            assignedTo: "10000002E"
        };

        await vehiclesCollection.insertOne(vehicleWithTrips);

        const trips = [
            { dni: "10000002E", plate: "9999XYZ", startDateTime: "2025-05-02T08:15:00.081Z", startingOdometer: 0, endingOdometer: 1, endDateTime: "2025-05-02T08:15:01.081Z", duration: 1 },
            { dni: "10000002E", plate: "9999XYZ", startDateTime: "2025-05-02T09:00:00.081Z", startingOdometer: 1, endingOdometer: 2, endDateTime: "2025-05-02T09:00:01.081Z", duration: 1 },
            { dni: "10000002E", plate: "9999XYZ", startDateTime: "2025-05-02T09:45:00.081Z", startingOdometer: 2, endingOdometer: 3, endDateTime: "2025-05-02T09:45:01.081Z", duration: 1 },
            { dni: "10000002E", plate: "9999XYZ", startDateTime: "2025-05-02T10:30:00.081Z", startingOdometer: 3, endingOdometer: 4, endDateTime: "2025-05-02T10:30:01.081Z", duration: 1 },
            { dni: "10000002E", plate: "9999XYZ", startDateTime: "2025-05-02T11:15:00.081Z", startingOdometer: 4, endingOdometer: 5, endDateTime: "2025-05-02T11:15:01.081Z", duration: 1 },
            { dni: "10000002E", plate: "9999XYZ", startDateTime: "2025-05-02T12:00:00.081Z", startingOdometer: 5, endingOdometer: 6, endDateTime: "2025-05-02T12:00:01.081Z", duration: 1 },
            { dni: "10000002E", plate: "9999XYZ", startDateTime: "2025-05-02T12:45:00.081Z", startingOdometer: 6, endingOdometer: 7, endDateTime: "2025-05-02T12:45:01.081Z", duration: 1 },
            { dni: "10000002E", plate: "9999XYZ", startDateTime: "2025-05-02T13:30:00.081Z", startingOdometer: 7, endingOdometer: 8, endDateTime: "2025-05-02T13:30:01.081Z", duration: 1 },
            { dni: "10000002E", plate: "9999XYZ", startDateTime: "2025-05-02T14:15:00.081Z", startingOdometer: 8, endingOdometer: 9, endDateTime: "2025-05-02T14:15:01.081Z", duration: 1 },
            { dni: "10000002E", plate: "9999XYZ", startDateTime: "2025-05-02T15:00:00.081Z", startingOdometer: 9, endingOdometer: 10, endDateTime: "2025-05-02T15:00:01.081Z", duration: 1 },
            { dni: "10000002E", plate: "9999XYZ", startDateTime: "2025-05-02T15:45:00.081Z", startingOdometer: 10, endingOdometer: 11, endDateTime: "2025-05-02T15:45:01.081Z", duration: 1 },
            { dni: "10000002E", plate: "9999XYZ", startDateTime: "2025-05-02T16:30:00.081Z", startingOdometer: 11, endingOdometer: 12, endDateTime: "2025-05-02T16:30:01.081Z", duration: 1 },
            { dni: "10000002E", plate: "9999XYZ", startDateTime: "2025-05-02T17:15:00.081Z", startingOdometer: 12, endingOdometer: 13, endDateTime: "2025-05-02T17:15:01.081Z", duration: 1 },
            { dni: "10000002E", plate: "9999XYZ", startDateTime: "2025-05-02T18:00:00.081Z", startingOdometer: 13, endingOdometer: 14, endDateTime: "2025-05-02T18:00:01.081Z", duration: 1 },
            { dni: "10000002E", plate: "9999XYZ", startDateTime: "2025-05-02T18:45:00.081Z", startingOdometer: 14, endingOdometer: 100, endDateTime: "2025-05-02T18:45:01.081Z", duration: 1 }
        ];

        // Inserción de trayectos cerrados
        for (let trip of trips) {
            const dniNumber = parseInt(trip.dni.slice(0, -1)); // Quitar la "E"
            trip.name = "Us3r@" + (dniNumber - 10000001); // Por ejemplo, 10000002 → Us3r@1

            await tripsCollection.insertOne(trip);
        }

        // Inserción de vehículos y trayectos abiertos
        const occupiedVehiclesWithOpenTrips = [];

        for (let i = 0; i < 15; i++) {
            const plate = generatePlate();
            const dniEmpleado = "1000000" + (i + 2) + "E"; // Empleados 10000002E al 10000016E

            const vehicle = {
                plate: plate,
                chassisNumber: "CHASSIS" + i,
                brand: "Opel",
                model: "Corsa",
                fuelType: "GASOLINA",
                kilometers: 10 + i,
                state: "OCUPADO",
                assignedTo: dniEmpleado
            };

            const trip = {
                dni: dniEmpleado,
                plate: plate,
                startDateTime: new Date().toISOString(),
                startingOdometer: 10 + i,
                duration: null,
                state: "ACTIVO"
            };

            occupiedVehiclesWithOpenTrips.push({ vehicle, trip });
        }

        for (const { vehicle, trip } of occupiedVehiclesWithOpenTrips) {
            await vehiclesCollection.insertOne(vehicle);

            // Extraer el número del DNI, quitando la última letra 'E'
            const dniNumber = parseInt(trip.dni.slice(0, -1));

            // Comprobar si el número extraído es mayor que 10000001
            if (dniNumber > 10000001) {
                // Calcular el número base para el usuario
                let userNumber = dniNumber - 10000001;

                if (trip.dni.endsWith('3E')) {
                    userNumber -= 1;
                }

                trip.name = "Us3r@" + userNumber;
            } else {
                console.error("DNI no válido o fuera de rango para el cálculo del nombre");
            }

            await tripsCollection.insertOne(trip);
        }

        console.log("15 occupied vehicles with valid plates and open trips inserted.");

    } catch (err) {
        console.error("Error inserting data: ", err);
    } finally {
        await client.close();
    }
}


