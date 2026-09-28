/**
 * Repositorio de refuels permite añadir, paginar y eliminar repostajes de la base de datos.
 * @type {{mongoClient: null, app: null, database: string, collectionName: string, init: exports.init, getRefuelsPg: ((function(*, *, *): Promise<{refuels: *, total: *}|undefined>)|*), deleteRefuels: ((function(*): Promise<*|undefined>)|*), insertRefuel: ((function(*): Promise<any|undefined>)|*)}}
 */
module.exports = {
    mongoClient: null,
    app:null,
    database: "flotaneitor_db",
    collectionName: "refuels",
    init: function(app, dbClient){
        this.dbClient = dbClient;
        this.app = app;
    },
    getRefuelsPg: async function(filter, options, page){
        try{
            const limit = 5;
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const refuelCollection = database.collection("refuels");
            const refuelCollectionCount = await refuelCollection.count();
            const cursor = refuelCollection.find(filter, options).skip((page-1)*limit).limit(limit);
            const refuels = await cursor.toArray();
            return {refuels: refuels, total: refuelCollectionCount};
        }catch(error){
            throw(error);
        }
    },
    deleteRefuels: async function (filter) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const refuelsCollection = database.collection(this.collectionName);
            return await refuelsCollection.deleteMany(filter);
        } catch (error) {
            throw (error);
        }
    },
    insertRefuel: async function(refuel){
        try{
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const refuelCollection = database.collection(this.collectionName);
            const result = await refuelCollection.insertOne(refuel);
            return result.insertedId;
        }catch(error){
            throw(error);
        }
    }
}
