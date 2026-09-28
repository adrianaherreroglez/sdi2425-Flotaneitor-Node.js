const {ObjectId} = require("mongodb");
module.exports = function(app, employeesRepository, usersRepository, logsRepository, tripsRepository) {

    /**
     * Lista preliminar de empleados
     * @type {[{dni: string, name: string, surname: string, role: string},{dni: string, name: string, surname: string, role: string},{dni: string, name: string, surname: string, role: string}]}
     */
    let employees = [{
        "dni": "12345678D",
        "name": "Pepe",
        "surname": "Pepín",
        "role": "employee"
    },
    {
        "dni": "12345678P",
        "name": "Pepa",
        "surname": "Pepina",
        "role": "employee"
    },
    {
        "dni": "12345678C",
        "name": "Pepin",
        "surname": "Peponcio",
        "role": "employee"
    }];

    /**
     * Router GET para mostrar la lista de empleados preliminar de la aplicación
     */
    app.get("/employees", function(req, res){
        let response = {
            seller: 'Lista de empleados',
            employees: employees
        };
        res.render("employees/employees.twig", response);
    });

    /**
     * Router GET que carga la vista para añadir empleados
     */
    app.get("/employees/add", function(req, res){
        res.render("employees/add.twig");
    });

    /**
     * Router POST para registrar a un nuevo empleado
     * Primero se comprueba que no sea un duplicado de algún empleado de la base de datos,
     * obteniendo los datos del formulario. Automáticamente, se generan con él role de "employee"
     *
     * Luego se añade el empleado, se genera un correo electrónico y una contraseña y se registra el usuario
     * correspondiente al perfil del empleado creado. Se registra también un log de tipo "ALTA" en la bbdd.
     *
     * Se verifica que el DNI no esté registrado previamente en la bbdd y que el resto de campos del formulario
     * no sean vacios o tengan espacios vacios al principio o al final.
     *
     * Sí ocurre algún error, se muestra en pantalla.
     */
    app.post("/employees/add", function(req, res){

        // Se recuperan los datos del formulario
        let employee = {
           dni: req.body.dni,
           name: req.body.name,
           surname: req.body.surname,
           role: "employee"
       }

       // Función para mostrar el error en pantalla
       const renderWithError = (message) => {
         return res.render("employees/add.twig", {
             error: message,
             formData: employee
         });
       };

        // Se validan los contenidos del formulario
       let validatedResult = validateEmployeeData(employee);
       if(validatedResult !== "ok"){
           return renderWithError(validatedResult);
       }else{
           // Se buscan duplicados
           employeesRepository.findEmployee({dni: employee.dni}, {}).then(foundEmployee => {
               if(foundEmployee === null || foundEmployee === undefined){
                   // Se registra el empleado
                   employeesRepository.insertEmployee(employee).then(insertedID => {
                       if (insertedID) {
                           // Generamos un correo electrónico y una contraseña para el usuario
                           generateEmailAndPassword(employee, async function (emailAndPassword) {

                               // Creamos el cuerpo del log
                               let content = req.originalUrl + " - " + req.method + " - " +
                                   req.body.dni + " - " + req.body.name + " - " + req.body.surname + " - "
                                   + employee.role;

                               let registeredEmployeeLog = {
                                   type: "ALTA",
                                   date: new Date().toLocaleString('es-ES', {
                                       day: '2-digit', month: '2-digit', year: 'numeric',
                                       hour: '2-digit', minute: '2-digit'
                                   }),
                                   content: content
                               }

                               // Registramos el log
                               await logsRepository.insertLog(registeredEmployeeLog);

                               let newEmail = emailAndPassword.email;
                               let newPassword = emailAndPassword.password;

                               // Encriptamos la contraseña y registramos el usuario en la bbdd
                               let securePassword = app.get("crypto").createHmac('sha256', app.get('clave'))
                                   .update(newPassword).digest('hex');

                               let newUser = {
                                   dni: employee.dni,
                                   password: securePassword,
                                   email: newEmail
                               }

                               usersRepository.insertUser(newUser).then(async userId => {
                                   if (userId) {

                                       content = req.originalUrl + " - " + req.method + " - " +
                                           newUser.dni + " - " + newUser.password + " - " + newUser.email;

                                       let registeredUserLog = {
                                           type: "ALTA",
                                           date: new Date().toLocaleString('es-ES', {
                                               day: '2-digit', month: '2-digit', year: 'numeric',
                                               hour: '2-digit', minute: '2-digit'
                                           }),
                                           content: content
                                       }

                                       await logsRepository.insertLog(registeredUserLog);

                                       let employeeUser = {
                                           dni: employee.dni,
                                           password: newPassword
                                       }

                                       let response = {
                                           user: employeeUser
                                       }
                                       res.render('employees/credentials.twig', response);
                                   } else {
                                       return renderWithError("Se ha producido un error al registrar el usuario");
                                   }

                               }).catch(error => {
                                   return renderWithError("Se ha producido un error al registrar el usuario: "+ error);
                               });
                           });

                       } else {
                           return renderWithError("Error al añadir empleado: " + insertedID.error);
                       }
                   }).catch(error => {
                       return renderWithError("Se ha producido un error al insertar al empleado: "+ error);
                   });
               }else{
                   return renderWithError("El dni ya se encuentra en la base de datos");
               }

           }).catch(error => {
               return renderWithError("Error al buscar duplicado en la base de datos: "+ error);
           });
       }
    });

    /**
     * Router GET que muestra la lista de empleados recuperada de la base de datos,
     * se cargan usando paginación mostrando 5 empleados por página.
     * Si el parámetro de página es válido, se calcula la página actual y las páginas vecinas.
     */
    app.get("/employees/list", function(req, res){
        let filter = {};
        let options = {};

        let page = parseInt(req.query.page);
        if(typeof req.query.page === "undefined" || req.query.page === null || req.query.page === "0"){
            page = 1;
        }

        employeesRepository.getEmployeesPg(filter, options, page).then(result => {
           let lastPageEmployees = result.total/5;

           if(result.total % 5 > 0){
               lastPageEmployees = lastPageEmployees + 1;
           }

           let pages = [];

           for(let i=page-2; i<page+2; i++){
               if(i>0 && i <= lastPageEmployees){
                   pages.push(i);
               }
           }

           let response = {
               employees: result.employees,
               pages: pages,
               currentPage: page
           }
           res.render("employees/list.twig", response);
        }).catch(error => {
            res.send("Se ha producido un error al listar los empleados "+ error);
        });
    });

    /**
     * Router GET que muestra la vista para editar a un empleado en específico.
     * Se obtienen los datos editables del empleado de la base de datos y se rellenan los
     * respectivos campos del formulario con ellos.
     *
     * El rol actual del empleado se muestra seleccionado en el selector de roles.
     */
    app.get("/employees/edit/:id", function(req, res){

       let roles = [{
           "name": "employee",
           "value": "Empleado"
       },{
           "name": "admin",
           "value": "Administrador"
       }];

       let filter = {_id:new ObjectId(req.params.id)};
       employeesRepository.findEmployee(filter, {}).then(employee => {

           let response = {
               employee: employee,
               roles: roles
           }

           res.render("employees/edit.twig", response);
       }).catch(error => {
           res.send("Se ha producido un error al recuperar al empleado: "+error);
       });
    });

    /**
     * Router POST que recoge los datos del formulario de edición de un empleado, los valida y registra el nuevo empleado
     * Primero comprueba que los campos no estén vacios y no empiecen o terminen con espacios en blanco.
     * Después se comprueba que el nuevo dni no se encuentre repetido en la base de datos.
     *
     * Si todos los datos son válidos se actualiza el perfil del empleado en la bbdd. Luego se actualiza el dni del
     * usuario de inicio del empleado en la bbdd. La contraseña y el correo electrónico no cambian.
     */
    app.post("/employees/edit/:id", function(req, res){

        let employeeId = req.params.id;
        let employeeFilter = {_id: new ObjectId(employeeId)};

        employeesRepository.findEmployee(employeeFilter, {}).then(oldEmployee => {

            let employee = {
                dni: req.body.dni,
                name: req.body.name,
                surname: req.body.surname,
                role: req.body.role
            }

            let validatedResult = validateEmployeeData(employee);
            if(validatedResult !== "ok") {
                res.redirect("/employees/edit/" + employeeId +
                    "?message=" + validatedResult + "&messageType=alert-warning ");
            }else if(employee.role === null || employee.role === undefined){
                    res.redirect("/employees/edit/" + employeeId +
                        "?message=El rol del empleado no puede ser nulo o vacio&messageType=alert-warning ");
            }else{

                let duplicateFilter = {dni: employee.dni,
                    _id:{$ne: new ObjectId(employeeId)}};

                employeesRepository.findEmployee(duplicateFilter, {}).then(otherEmployee => {
                   if(otherEmployee === null || otherEmployee === undefined){
                       const options = {upsert: false}
                       // Primero, actualizamos el perfil del empleado, y luego su usuario
                       employeesRepository.updateEmployee(employee, employeeFilter, options).then(newEmployee => {
                           if(newEmployee){
                               //Ahora actualizamos el usuario del empleado
                               usersRepository.findUser({dni: oldEmployee.dni}, {}).then(oldUser => {
                                   let newUser = {
                                       dni: employee.dni,
                                       password: oldUser.password,
                                       email: oldUser.email
                                   }
                                   let userId = oldUser._id;
                                   let userFilter = {_id: new ObjectId(userId)};
                                   usersRepository.updateUser(newUser, userFilter, options).then(updatedUser => {
                                       if(updatedUser){
                                            res.redirect("/employees/list");
                                       }else{
                                           res.redirect("/employees/list"+
                                               "?message=Se ha producido un error al actualizar al usuario: "+
                                               + "&messageType=alert.danger ");
                                       }
                                   }).catch(error => {
                                       res.redirect("/employees/list"+
                                           "?message=Se ha producido un error al actualizar al usuario: "+error+
                                           + "&messageType=alert.danger ");
                                   })
                               }).catch(error => {
                                   res.redirect("/employees/list"+
                                       "?message=Se ha producido un error al actualizar al usuario: "+error+
                                       + "&messageType=alert.danger ");
                               })
                           }else{
                               res.redirect("/employees/list"+
                                   "?message=Se ha producido un error al actualizar al usuario"
                                   + "&messageType=alert.danger ");
                           }
                       }).catch(error => {
                           res.redirect("/employees/list"+
                               "?message=Se ha producido un error al actualizar al usuario: "+error+
                               + "&messageType=alert.danger ");
                       });
                   }else{
                       res.redirect("/employees/edit/"+employeeId +
                       "?message=El dni seleccionado ya se encuentra registrado&messageType=alert-warning ");
                   }
                }).catch(error =>{
                    res.send("Se ha producido un error al buscar duplicados: "+error);
                })

            }

        }).catch(error => {
           res.send("Se ha producido un error al buscar al empleado: "+error);
        });
    });

    /**
     * Router POST que elimina un empleado de la bbdd. Además de eliminar el empleado, también
     * elimina el usuario asociado y los trayectos asociados a ese empleado.
     */
    app.post('/employees/delete/:id', async function (req, res) {
        let employeeId = req.params.id;
        let employeeFilter = {_id: new ObjectId(employeeId)};

        try {
            let employeeToRemove = await employeesRepository.findEmployee(employeeFilter, {});

            await tripsRepository.deleteTrips({dni: {$in: employeeToRemove.dni}});
            await usersRepository.deleteUser({dni: {$in: employeeToRemove.dni}});

            let result = await employeesRepository.deleteEmployee(employeeFilter, {});

            if(!result || result.deletedCount === 0){
                res.send("No se ha podido borrar al usuario");
            }else{
                res.redirect("/employees/list");
            }

        } catch (error) {
            res.send("Error al intentar eliminar el empleado");
        }

    });

    /**
     * Función que genera un correo electrónico y una contraseña para el usuario utilizando su DNI.
     * El formato del correo electrónico es DNI@flotaneitor.com
     * El formato de la contraseña Us3r@nEmpleado-DNI
     * @param employee
     * @param callback
     */
    function generateEmailAndPassword(employee, callback){
        employeesRepository.getNumberOfEmployees().then(nEmployees =>{
            if (employee !== null && employee !== undefined) {
                if(nEmployees !== null && nEmployees !== undefined){
                    let email = employee.dni + '@flotaneitor.com';
                    let password = 'Us3r@'+nEmployees.toString()+'-'+employee.dni;
                    callback({email, password});
                }
            } else {
                callback(null);
            }
        });
    }

    /**
     * Función que valida los datos del formulario.
     * @param employee
     * @returns {string}
     */
    function validateEmployeeData(employee){

        if(employee.dni === null || employee.dni === undefined || employee.dni.trim() === "") {
            return "El dni no puede ser nulo o vacio";
        }
        if (employee.dni.length !== 9 || !/^[0-9]{8}[A-Za-z]$/.test(employee.dni)) {
            return "Formato de dni incorrecto";
        }
        if (/^\s/.test(employee.dni) || /\s$/.test(employee.dni)) {
            return "El dni no puede empezar o terminar con espacios vacíos";
        }
        if (employee.name === null || employee.name === undefined || employee.name.trim() === "") {
            return "El nombre del empleado no puede ser nulo o vacío";
        }
        if (/^\s/.test(employee.name) || /\s$/.test(employee.name)) {
            return "El nombre no puede empezar o terminar con espacios vacíos";
        }

        if (employee.surname === null || employee.surname === undefined || employee.surname.trim() === "") {
            return "El apellido del empleado no puede ser nulo o vacío";
        }
        if (/^\s/.test(employee.surname) || /\s$/.test(employee.surname)) {
            return "El apellido no puede empezar o terminar con espacios vacíos";
        }
        return "ok";
    }

}