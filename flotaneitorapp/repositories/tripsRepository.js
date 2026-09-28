/*
Repositorio de trayectos
 */
module.exports = {
    mongoClient: null,
    app: null,
    database: "flotaneitor_db",
    collectionName: "trips",

    init: function (app, dbClient) {
        this.dbClient = dbClient;
        this.app = app;
    },

    insertTrip: async function (trip) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const tripsCollection = database.collection(this.collectionName);
            const result = await tripsCollection.insertOne(trip);
            return result.insertedId;
        } catch (error) {
            throw (error);
        }
    },
    getLastTripByPlate: async function (plate) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const tripsCollection = database.collection(this.collectionName);

            const lastTrip = await tripsCollection
                .find({ plate })
                .sort({ startDateTime: -1 })
                .limit(1)
                .toArray();

            return lastTrip[0] || null;
        } catch (error) {
            throw (error);
        }
    },

    findTrip: async function (filter, options) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const tripsCollection = database.collection(this.collectionName);
            return await tripsCollection.findOne(filter, options);
        } catch (error) {
            throw (error);
        }
    },

    deleteTrips: async function (filter) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const tripsCollection = database.collection(this.collectionName);
            return await tripsCollection.deleteMany(filter);
        } catch (error) {
            throw (error);
        }
    },

    updateTrip: async function(newTrip, filter, options = {}) {
    try {
        await this.dbClient.connect();
        const database = this.dbClient.db(this.database);
        const collection = database.collection(this.collectionName);
        return await collection.updateOne(filter, { $set: newTrip }, options);
    } catch (error) {
        throw error;
    }
},

    getTrips: async function (filter, options) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const tripsCollection = database.collection(this.collectionName);
            return await tripsCollection.find(filter, options).toArray();
        } catch (error) {
            throw (error);
        }
    },
    getTripsPg: async function(filter, options, page) {
        try {
            const limit = 5;
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const tripsCollection = database.collection("trips");
            const tripsCount = await tripsCollection.countDocuments(filter);
            const cursor = tripsCollection.find(filter, options).skip((page - 1) * limit).limit(limit);
            const trips = await cursor.toArray();
            return { trips: trips, total: tripsCount };
        } catch (error) {
            throw error;
        }
    }

};