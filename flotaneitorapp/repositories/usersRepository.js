/**
 * Repositorio de empleados permite añadir, recuperar, eliminar y editar usuarios de la base de datos.
 * @type {{mongoClient: null, app: null, database: string, collectionName: string, init: exports.init, findUser: ((function(*, *): Promise<*|undefined>)|*), insertUser: ((function(*): Promise<any|undefined>)|*), updateUser: ((function(*, *, *): Promise<*|undefined>)|*), deleteUser: ((function(*, *): Promise<*|undefined>)|*)}}
 */
module.exports = {
    mongoClient:null,
    app:null,
    database: "flotaneitor_db",
    collectionName: "users",
    init: function(app, dbClient){
        this.dbClient = dbClient;
        this.app = app;
    },
    findUser: async function(filter, options){
        try{
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const usersCollection = database.collection(this.collectionName);
            return await usersCollection.findOne(filter, options);
        }catch(error){
            throw(error);
        }
    },
    insertUser: async function (user){
        try{
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const usersCollection = database.collection(this.collectionName);
            const result = await usersCollection.insertOne(user);
            return result.insertedId;
        }catch(error){
            throw(error);
        }
    },
    updateUser: async function(newUser, filter, options){
        try{
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const usersCollection = database.collection(this.collectionName);
            return await usersCollection.updateOne(filter, {$set: newUser},options);
        }catch(error){
            throw(error);
        }
    },
    deleteUser: async function(filter, options){
        try{
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const usersCollection = database.collection(this.collectionName);
            return await usersCollection.deleteOne(filter, options);
        }catch(error){
            throw(error);
        }
    }
}
