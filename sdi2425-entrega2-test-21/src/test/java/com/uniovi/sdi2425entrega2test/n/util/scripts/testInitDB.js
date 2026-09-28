// Import the required MongoDB and Crypto libraries
const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const {ObjectId} = require('mongodb');

// Define a secret key for password hashing
const clave = "abcdefg";

// Define MongoDB connection URL
const url = 'mongodb://localhost:27017/';
const client = new MongoClient(url);

/**
 * Asynchronously seeds the MongoDB database 'flotaneitor_db'
 * with an admin user and 15 employee users.
 */
async function run(closeAfter = true) {
    try {
        // Connect to the MongoDB server
        await client.connect();

        // Select the 'flotaneitor_db' database
        const database = client.db("flotaneitor_db");

        // Get references to 'users' and 'employees' collections
        const usersCollection = database.collection("users");
        const employeesCollection = database.collection("employees");
        const vehiclesCollection = database.collection("vehicles");
        const tripsCollection = database.collection("trips");
        const refuelsCollection = database.collection("refuels");

        await database.dropDatabase();
        console.log("Database dropped");

        // Hash the admin's password securely
        let securePassword = crypto
            .createHmac("sha256", clave)
            .update("@Dm1n1str@D0r")
            .digest("hex");

        // Define admin user and employee records
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

        // Insert admin user and employee records into the database
        await usersCollection.insertOne(adminUser);
        await employeesCollection.insertOne(adminEmployee);

        console.log("Admin registered");

        // Insert 15 regular employee users
        for (let i = 1; i <= 15; i++) {
            let userDniCode = 10000001 + i;
            let userDni = userDniCode.toString() + "E";
            let userName = "Us3r@" + i;
            let userPassword = userName + "-PASSWORD";

            // Hash the employee's password securely
            securePassword = crypto
                .createHmac("sha256", clave)
                .update(userPassword)
                .digest("hex");

            // Define employee user record
            let userEmployee = {
                dni: userDni,
                password: securePassword,
                email: userDni + '@flotaneitor.com'
            };

            // Define corresponding employee details record
            let employeeEmployee = {
                dni: userDni,
                name: userName,
                surname: "Userino",
                role: "employee"
            };

            // Insert employee user and employee details into the database
            await usersCollection.insertOne(userEmployee);
            await employeesCollection.insertOne(employeeEmployee);

            console.log("Employee registered");
        }

        const freeVehicles = [
            {
                _id : new ObjectId("aaaaaaaaaaaaaaaaaaaaaaaa"),
                //id is assigned manually for testing purposes
                plate: '1234BCD',
                chassisNumber: '1HGCM82633A004352',
                brand: 'Toyota',
                model: 'Corolla',
                fuelType: 'GASOLINA',
                kilometers: 250,
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
            },
            {
                plate: '7890LMN',
                chassisNumber: 'WVWZZZ1JZXW000001',
                brand: 'Volkswagen',
                model: 'Golf',
                fuelType: 'HÍBRIDO',
                kilometers: 15230,
                state: "OCUPADO"
            },
            {
                plate: '3333CDF',
                chassisNumber: 'WERFHJ78960RTFEJK',
                brand: 'Toyota',
                model: 'X1',
                fuelType: 'GASOLINA',
                kilometers: 0,
                state: "LIBRE"
            },
            {
                plate: '2222FGH',
                chassisNumber: 'WSDRTYJKLMN12345T',
                brand: 'BMW',
                model: '4x4',
                fuelType: 'GLP',
                kilometers: 0,
                state: "LIBRE"
            },
            {
                plate: '5467DTY',
                chassisNumber: 'FGNMKLP9876TFGCVB',
                brand: 'Ford',
                model: 'B4',
                fuelType: 'Eléctrico',
                kilometers: 0,
                state: "LIBRE"
            }
        ];


        await Promise.all(freeVehicles.map(vehicle => {
            return vehiclesCollection.insertOne(vehicle);
        }));

        console.log("Vehicles registered");

        // Añadir 10 trayectos a cada vehículo
        await Promise.all(freeVehicles.map(async vehicle => {
            const trips = [
                { dni: "10000003E", plate: vehicle.plate, startDateTime: "2025-05-02T08:15:00.081Z", startingOdometer: 0, endingOdometer: 150, endDateTime: "2025-05-02T08:15:01.081Z", duration: 1800 },
                { dni: "10000002E", plate: vehicle.plate, startDateTime: "2025-05-02T09:00:00.081Z", startingOdometer: 1, endingOdometer: 2, endDateTime: "2025-05-02T09:00:01.081Z", duration: 1800 },
                { dni: "10000002E", plate: vehicle.plate, startDateTime: "2025-05-02T09:45:00.081Z", startingOdometer: 2, endingOdometer: 3, endDateTime: "2025-05-02T09:45:01.081Z", duration: 1800 },
                { dni: "10000002E", plate: vehicle.plate, startDateTime: "2025-05-02T10:30:00.081Z", startingOdometer: 3, endingOdometer: 4, endDateTime: "2025-05-02T10:30:01.081Z", duration: 1800 },
                { dni: "10000002E", plate: vehicle.plate, startDateTime: "2025-05-02T11:15:00.081Z", startingOdometer: 4, endingOdometer: 5, endDateTime: "2025-05-02T11:15:01.081Z", duration: 1800 },
                { dni: "10000002E", plate: vehicle.plate, startDateTime: "2025-05-02T12:00:00.081Z", startingOdometer: 5, endingOdometer: 6, endDateTime: "2025-05-02T12:00:01.081Z", duration: 1800 },
                { dni: "10000002E", plate: vehicle.plate, startDateTime: "2025-05-02T12:45:00.081Z", startingOdometer: 6, endingOdometer: 7, endDateTime: "2025-05-02T12:45:01.081Z", duration: 1800 },
                { dni: "10000002E", plate: vehicle.plate, startDateTime: "2025-05-02T13:30:00.081Z", startingOdometer: 7, endingOdometer: 8, endDateTime: "2025-05-02T13:30:01.081Z", duration: 1800 },
                { dni: "10000002E", plate: vehicle.plate, startDateTime: "2025-05-02T14:15:00.081Z", startingOdometer: 8, endingOdometer: 9, endDateTime: "2025-05-02T14:15:01.081Z", duration: 1800 },
                { dni: "10000002E", plate: vehicle.plate, startDateTime: "2025-05-02T15:00:00.081Z", startingOdometer: 9, endingOdometer: 10, endDateTime: "2025-05-02T15:00:01.081Z", duration: 1800 },
            ];

            await Promise.all(trips.map(trip => {
                return tripsCollection.insertOne(trip);
            }));
        }))

        const singleTrip = [{ dni: "10000004E", plate: "1234BCD", startDateTime: "2025-05-02T13:30:00.081Z", startingOdometer: 7, endingOdometer: null, endDateTime: null, duration: null }]

        await Promise.all(singleTrip.map(trip => {
            return tripsCollection.insertOne(trip);
        }));

        console.log("Trips registered")

        const refuels = [{
            plate: "5467DTY",
            station: "Snuckeys",
            ppu: 3.4,
            quantity: 12,
            odometer: 250,
            date: "2025-05-02T21:32:25.559Z",
            fuelType: "GASOLINA",
            total: "40.80",
            observations: "Have you seen my Bigfoot?"
        },{
            plate: "5467DTY",
            station: "Shell Fuenlabrada",
            ppu: 9.8,
            quantity: 3,
            odometer: 260,
            date: "2025-05-02T21:32:25.559Z",
            fuelType: "GASOLINA",
            total: "29.4",
            observations: "Holy mother of pearl in a sidecar going 80!"
        },{
            plate: "5467DTY",
            station: "Repostona",
            ppu: 4.3,
            quantity: 12,
            odometer: 270,
            date: "2025-05-02T21:32:25.559Z",
            fuelType: "GASOLINA",
            total: "51.6",
            observations: "Have you seen my Bigfoot?"
        },{
            plate: "5467DTY",
            station: "Petrona",
            ppu: 3.4,
            quantity: 12,
            odometer: 250,
            date: "2025-05-02T21:32:25.559Z",
            fuelType: "GASOLINA",
            total: "40.80",
            observations: "Have you seen my Bigfoot?"
        },{
            plate: "5467DTY",
            station: "Estacion1",
            ppu: 3.4,
            quantity: 12,
            odometer: 250,
            date: "2025-05-02T21:32:25.559Z",
            fuelType: "GASOLINA",
            total: "40.80",
            observations: "Have you seen my Bigfoot?"
        },{
            plate: "5467DTY",
            station: "Estacion2",
            ppu: 3.4,
            quantity: 12,
            odometer: 250,
            date: "2025-05-02T21:32:25.559Z",
            fuelType: "GASOLINA",
            total: "40.80",
            observations: "Have you seen my Bigfoot?"
        },{
            plate: "5467DTY",
            station: "Estacion3",
            ppu: 3.4,
            quantity: 12,
            odometer: 250,
            date: "2025-05-02T21:32:25.559Z",
            fuelType: "GASOLINA",
            total: "40.80",
            observations: "Have you seen my Bigfoot?"
        },{
            plate: "5467DTY",
            station: "MadrePetrolera",
            ppu: 3.4,
            quantity: 12,
            odometer: 250,
            date: "2025-05-02T21:32:25.559Z",
            fuelType: "GASOLINA",
            total: "40.80",
            observations: "Have you seen my Bigfoot?"
        },{
            plate: "5467DTY",
            station: "Estacion4",
            ppu: 3.4,
            quantity: 12,
            odometer: 250,
            date: "2025-05-02T21:32:25.559Z",
            fuelType: "GASOLINA",
            total: "40.80",
            observations: "Have you seen my Bigfoot?"
        },{
            plate: "5467DTY",
            station: "Estacion5",
            ppu: 3.4,
            quantity: 12,
            odometer: 250,
            date: "2025-05-02T21:32:25.559Z",
            fuelType: "GASOLINA",
            total: "40.80",
            observations: "Have you seen my Bigfoot?"
        },{
            plate: "5467DTY",
            station: "Estacion6",
            ppu: 3.4,
            quantity: 12,
            odometer: 250,
            date: "2025-05-02T21:32:25.559Z",
            fuelType: "GASOLINA",
            total: "40.80",
            observations: "Have you seen my Bigfoot?"
        },
            {
                plate: "5467DTY",
                station: "Gasolinera",
                ppu: 3.4,
                quantity: 12,
                odometer: 250,
                date: "2025-05-02T21:32:25.559Z",
                fuelType: "GASOLINA",
                total: "40.80",
                observations: "Have you seen my Bigfoot?"
            },
            {
                plate: "5467DTY",
                station: "Estacion7",
                ppu: 3.4,
                quantity: 12,
                odometer: 250,
                date: "2025-05-02T21:32:25.559Z",
                fuelType: "GASOLINA",
                total: "40.80",
                observations: "Have you seen my Bigfoot?"
            },{
                plate: "5467DTY",
                station: "Estacion8",
                ppu: 3.4,
                quantity: 12,
                odometer: 250,
                date: "2025-05-02T21:32:25.559Z",
                fuelType: "GASOLINA",
                total: "40.80",
                observations: "Have you seen my Bigfoot?"
            },{
                plate: "5467DTY",
                station: "Estacion9",
                ppu: 3.4,
                quantity: 12,
                odometer: 250,
                date: "2025-05-02T21:32:25.559Z",
                fuelType: "GASOLINA",
                total: "40.80",
                observations: "Have you seen my Bigfoot?"
            }];

        for (let i = 0; i < refuels.length; i++) {
            await refuelsCollection.insertOne(refuels[i]);
        }


        console.log("Refuels registered")

        console.log("Database successfully seeded");

    } catch (err) {
        console.log("Error inserting data: ", err);
    } finally {
        // Close the MongoDB connection
        if(closeAfter){
            await client.close();
        }
    }
}

if (require.main === module) {
    run().catch(err => {
        console.error("Fallo al ejecutar la inicialización de la base de datos:", err);
        process.exit(1);
    });
}
