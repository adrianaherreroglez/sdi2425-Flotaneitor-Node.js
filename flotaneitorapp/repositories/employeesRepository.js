/**
 * Repositorio de empleados permite añadir, recuperar, paginar, eliminar y editar empleados de la base de datos.
 * @type {{mongoClient: null, app: null, database: string, collectionName: string, init: exports.init, getEmployeesPg: ((function(*, *, *): Promise<{employees: *, total: *}|undefined>)|*), getNumberOfEmployees: ((function(): Promise<*|undefined>)|*), findEmployee: ((function(*, *): Promise<*|undefined>)|*), insertEmployee: ((function(*): Promise<any|undefined>)|*), updateEmployee: ((function(*, *, *): Promise<*|undefined>)|*), deleteEmployee: ((function(*, *): Promise<*|undefined>)|*)}}
 */
module.exports = {
    mongoClient:null,
    app: null,
    database: "flotaneitor_db",
    collectionName:"employees",
    init: function(app, dbClient){
        this.dbClient = dbClient;
        this.app = app;
    },
    getEmployeesPg: async function(filter, options, page){
      try{
          const limit=5;
          await this.dbClient.connect();
          const database = this.dbClient.db(this.database);
          const employeeCollection = database.collection("employees");
          const employeeCollectionCount = await employeeCollection.count();
          const cursor = employeeCollection.find(filter, options).skip((page-1)*limit).limit(limit);
          const employees = await cursor.toArray();
          return {employees: employees, total: employeeCollectionCount};
      }catch(error){
          throw(error);
      }
    },
    getNumberOfEmployees: async function(){
        try{
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const employeeCollection = database.collection("employees");
            return await employeeCollection.count();
        }catch(error){
            throw(error);
        }
    },
    findEmployee: async function(filter, options){
        try{
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const employeesCollection = database.collection(this.collectionName);
            return await employeesCollection.findOne(filter, options);
        }catch(error){
            throw(error);
        }
    },
    insertEmployee: async function(employee){
        try{
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const employeesCollection = database.collection(this.collectionName);
            const result = await employeesCollection.insertOne(employee);
            return result.insertedId;
        }catch(error){
            throw(error);
        }
    },
    updateEmployee: async function(newEmployee, filter, options){
        try{
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const employeeCollection = database.collection(this.collectionName);
            return await employeeCollection.updateOne(filter, {$set: newEmployee}, options);
        }catch(error){
            throw(error);
        }
    },
    deleteEmployee: async function(filter, options){
        try{
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const employeeCollection = database.collection(this.collectionName);
            return await employeeCollection.deleteOne(filter, options);
        }catch(error){
            throw(error);
        }
    }
}
