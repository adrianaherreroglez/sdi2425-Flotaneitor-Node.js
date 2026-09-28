/**
 * Repositorio de logs permite añadir, recuperar, y eliminar logs de la base de datos.
 * @type {{mongoClient: null, app: null, database: string, collectionName: string, init: exports.init, insertLog: ((function(*): Promise<any|undefined>)|*), getLogs: ((function(*, *): Promise<*|undefined>)|*), deleteLogs: ((function(*, *): Promise<*|undefined>)|*)}}
 */
module.exports = {
    mongoClient: null,
    app: null,
    database: "flotaneitor_db",
    collectionName: "logs",
    init: function(app, dbClient){
        this.dbClient = dbClient;
        this.app = app;
    },
    insertLog: async function(log){
        try{
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const logsCollection = database.collection("logs");
            const result = await logsCollection.insertOne(log);
            return result.insertedId;
        }catch(error){
            throw(error);
        }
    }, getLogs: async function(filter, options){
        try{
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const logsCollection = database.collection(this.collectionName);
            return await logsCollection.find(filter, options).toArray();
        }catch(error){
            throw(error);
        }
    }, deleteLogs: async function(filter, options){
        try{
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const logsCollection = database.collection("logs");
            return await logsCollection.deleteMany(filter, options);
        }catch(error){
            throw(error);
        }
    }

}
