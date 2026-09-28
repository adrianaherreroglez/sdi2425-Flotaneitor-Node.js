/*
Repositorio de vehículos
 */
module.exports = {
    mongoClient: null,
    app: null,
    database: "flotaneitor_db",
    collectionName: "vehicles",
    init: function(app, dbClient) {
        this.dbClient = dbClient;
        this.app = app;
    },
    insertVehicle: async function(vehicle) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const vehiclesCollection = database.collection(this.collectionName);
            const result = await vehiclesCollection.insertOne(vehicle);
            return result.insertedId;
        } catch (error) {
            throw (error);
        }
    },
    findVehicle: async function (filter, options) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const vehiclesCollection = database.collection(this.collectionName);
            return await vehiclesCollection.findOne(filter, options);
        } catch (error) {
            throw (error);
        }
    },

    deleteVehicle: async function (filter, options) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const vehiclesCollection = database.collection(this.collectionName);
            return await vehiclesCollection.deleteMany(filter, options);
        } catch (error) {
            throw (error);
        }
    },

    updateVehicle: async function(newVehicle, filter, options = {}) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const collection = database.collection(this.collectionName);
            return await collection.updateOne(filter, { $set: newVehicle }, options);
        } catch (error) {
            throw error;
        }
    },

    getVehicles: async function(filter, options) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const vehiclesCollection = database.collection(this.collectionName);
            return await vehiclesCollection.find(filter, options).toArray();
        } catch (error) {
            throw (error);
        }
    },
    getVehiclesPg: async function(filter, options, page){
        try {
            const limit = 5;
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const vehiclesCollection = database.collection("vehicles");

            const vehiclesCount = await vehiclesCollection.countDocuments(filter);


            const cursor = vehiclesCollection.find(filter, options)
                .sort({ _id: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            const vehicles = await cursor.toArray();

            return { vehicles: vehicles, total: vehiclesCount };
        } catch (error) {
            throw error;
        }
    }




};

