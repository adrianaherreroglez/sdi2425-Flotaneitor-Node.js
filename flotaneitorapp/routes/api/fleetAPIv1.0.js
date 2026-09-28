const {ObjectId} = require("mongodb");
const {loginEntryValidatorInsert} = require("./loginEntryValidator");
const {validationResult} = require("express-validator");
const {newRefuelValidatorInsert} = require("./newRefuelValidator");
module.exports = function(app, usersRepository, vehiclesRepository, tripsRepository, refuelsRepository) {

    /**
     * Endpoint para el inicio de sesión en la API REST.
     *
     * Recibe el email y la constraseña en el cuerpo de la petición POST, valida ambos
     * campos sirviéndose del middleware "loginEntryValidatorInsert", y genera un token
     * para el usuario si las credenciales son correctas.
     *
     * Si el login se realiza correctamente, devuelve un código de éxito 200
     * Si las credenciales son incorrectas, devuelve un código 401: Unauthorized
     * Si la validación falla, devuelve un código 422: Unprocessable Entity
     * Si la petición falla por otra razón, devuelve un código de error interno 500
     *
     *
     */
    app.post('/api/v1.0/users/login', loginEntryValidatorInsert, function (req, res){

        try{
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                res.status(422); //Código 422: Unprocessable Entity
                res.json({
                    errors: errors.array()
                });
            }
            else{
                try{
                    //Genera la contraseña hasheada para buscar en la BDD
                    let securePassword = app.get("crypto").createHmac('sha256', app.get('clave'))
                        .update(req.body.password).digest('hex');

                    let filter = {
                        email: req.body.email,
                        password: securePassword
                    }

                    let options = {};

                    usersRepository.findUser(filter, options).then(user => {
                        if(user==null){
                            //Si las credenciales no son correctas (no se encuentra el usuario), falla con código 401
                            res.status(401); //Código 401: Unauthorized
                            res.json({errors : [{
                                msg: "Usuario o contraseña incorrectos.",
                                authenticated: false
                            }]})
                        }else{
                            //Genera el token si las credenciales son correctas
                            let token = app.get('jwt').sign(
                                {user:user.email, time: Date.now() / 1000}, "secreto");
                            res.status(200); //Código 200: OK
                            res.json({
                                msg: "Usuario autorizado.",
                                authenticated: true,
                                token: token
                            })
                        }
                    }).catch(() =>{
                        res.status(401);
                        res.json({errors: [{
                            msg: "Se ha producido un error al verificar las credenciales.",
                            authenticated: false
                        }]})
                    })
                }catch (e){
                    res.status(500); //Código 500: Internal Server Error
                    res.json({errors: [{
                        msg: "Se ha producido un error al verificar las credenciales.",
                        authenticated: false
                    }]})
                }
            }
        }catch(e){
            res.status(500);
            res.json({errors: [{
                msg: "Se ha producido un error al intentar iniciar sesión"
            }]})
        }
    });

    /**
     * Endpoint para obtener el listado de vehículos disponibles vía API REST.
     *
     * Hace una consulta a la base de datos para recuperar una lista con todos los
     * vehículos cuyo estado sea "LIBRE".
     *
     * Si se recupera la lista correctamente, la devuelve en formato JSON con código de éxito 200
     * Si falla al recuperar la lista, devuelve un error 500 con mensaje apropiado
     */
    app.get('/api/v1.0/vehicles', function (req, res){
        let filter = { state: "LIBRE" };
        let options = {};

        vehiclesRepository.getVehicles(filter, options).then(vehicles => {
            res.status(200);
            res.send({vehicles: vehicles})
        }).catch(() =>{
            res.status(500);
            res.json({
                error: "Se ha producido error al recuperar los vehículos."
            });
        });

    });

    /**
     * Endpoint para obtener los trayectos de un vehículo dado su ID en la API REST
     *
     * Recupera los trayectos del vehículo especificado mediante su id (embebida)
     *
     * Si recupera el listado, lo devuelve en JSON con código 200
     * Si el vehículo no se encuentra, devuelve un error 404: Not Found
     * Si falla por otro motivo, devuelve un error 500
     */
    app.get('/api/v1.0/vehicles/trips/:id', function (req, res){
        try {
            let vehicleID = new ObjectId(req.params.id)
            let vehicleFilter = {_id: vehicleID};
            let options = {};

            vehiclesRepository.findVehicle(vehicleFilter, options).then(vehicle =>{
                if(vehicle === null){
                    //Si no encuentra el vehículo, da error 404
                    res.status(404); //Código 404: Not Found
                    res.json({error: "ID inválido o no existe"});
                }else{
                    //Si lo encuentra, recupera sus trayectos
                    let tripsFilter = {plate: vehicle.plate}
                    tripsRepository.getTrips(tripsFilter, options).then(trips => {

                            res.status(200); //Código 200: OK
                            res.send({
                                trips: trips
                            });
                    }).catch(() =>{
                        res.status(500); //Código 500: Internal Server Error
                        res.json({error: "Se ha producido un error a recuperar los trayectos del vehículo."})
                    });
                    }
            }).catch(() =>{
                res.status(500);
                res.json({error: "Se ha producido un error al recuperar la información del vehículo."})
            });
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error :" + e})
        }

    });

    /**
     * Endpoint de la API REST para iniciar/registrar un nuevo trayecto
     *
     * Verifica que el usuario no tenga trayectos en curso, y que el vehículo seleccionado
     * no esté ya en un trayecto (su estado sea "LIBRE"), en este caso, registra el trayecto.
     *
     * Devuelve un código de éxito 201 con el id del trayecto si se inicia correctamente
     * En caso de haber un conflicto (ya tiene un trayecto o vehículo ocupado), devuelve un código 409: Conflict
     * Si no se ecuentra algún objeto, devuelve un error 404
     * Si hay algún otro fallo, devuelve un error 500
     */
    app.post('/api/v1.0/trips/start', function(req, res){

        let authUser = res.user
        let userFilter = {email: authUser}
        let userOptions = {}

        usersRepository.findUser(userFilter, userOptions).then(user => {
            if(user === null){
                res.status(404)
                res.json({error: "Usuario no encontrado."})
            }else{
                let userDni = user.dni
                //Buscamos trayectos con el valor final del odómetro en null porque esto indica que aún están en curso
                let tripFilter = {dni: userDni, endingOdometer: null}
                let tripOptions = {}

                tripsRepository.findTrip(tripFilter, tripOptions).then(trip => {
                    if(trip === null){
                        //No tiene trayectos en curso.
                        let plate = req.body.plate
                        let vehicleFilter = {plate: plate}
                        let vehicleOptions = {}

                        vehiclesRepository.findVehicle(vehicleFilter, vehicleOptions).then(vehicle => {
                            if(vehicle ===null){
                                res.status(404)
                                res.json({error: "Vehículo no encontrado."})
                            }else {
                                if (vehicle.state === "OCUPADO") {
                                    res.status(409) //Código 409: Conflict
                                    res.json({error: "El vehículo seleccionado está ocupado."})
                                } else {
                                    //No está ocupado, se registra el trayecto
                                    tripsRepository.getLastTripByPlate(plate).then(lastTrip => {

                                            let newTrip = {
                                                dni: userDni,
                                                plate: plate,
                                                startDateTime: new Date().toISOString(),
                                                startingOdometer: lastTrip ? lastTrip.endingOdometer : 0,
                                                duration: null,
                                                endingOdometer: null
                                            };

                                            tripsRepository.insertTrip(newTrip).then(tripId => {
                                                if (tripId) {
                                                    vehiclesRepository.updateVehicle({ state: "OCUPADO" }, { plate: plate }, {}).then(() => {
                                                        res.status(201) //Código 201: Created
                                                        res.json({
                                                            msg: "Trayecto iniciado correctamente.",
                                                            _id: tripId
                                                        })
                                                    }).catch(() => {
                                                        res.status(500)
                                                        res.json({error: "Se ha producido un error al actualizar el estado del vehículo."})
                                                    });
                                                }
                                            }).catch(() =>{
                                                res.status(500)
                                                res.json({error: "Se ha producido un error al registrar el inicio del trayecto."})
                                            })
                                        }).catch(() =>{
                                        res.json(500)
                                        res.status({error: "Se ha producido un error al recuperar el último trayecto del vehículo."})
                                    })
                                }
                            }
                        }).catch(() => {
                            res.status(500)
                            res.json({
                                error: "Se ha producido un error al recuperar la información del vehículo."
                            })
                        });
                    }else{
                        res.status(409) //Código 409: Conflict
                        res.json({error: "El usuario no puede iniciar un trayecto si ya tiene alguno en curso."})
                    }
                }).catch(() =>{
                    res.status(500)
                    res.json({error: "Se ha producido un error al recuperar la información de los trayectos."})
                });
            }
        }).catch(() =>{
            res.status(500)
            res.json({error: "Se ha producido un error al recuperar la información del usuario autenticado."})
        });
    });

    /**
     * Endpoint de la API REST para obtener el listado de trayectos del usuario autenticado
     *
     * Devuelve la lista de trayectos del usuario autenticado vía token en la API
     *
     * Si se recupera la lista, la devuelve en formato JSON con código 200
     * Si el usuario no se encuentra, devuelve un error 404
     * En caso de otro error, devuelve un error 500
     *
     */
    app.get('/api/v1.0/trips', function (req, res){
        let authUser = res.user
        let usersFilter = {email: authUser}
        let usersOptions = {}

        usersRepository.findUser(usersFilter, usersOptions).then(user =>{
            if(user === null){
                res.status(404)
                res.json({error: "Usuario no encontrado."})
            }else{

                let userDni = user.dni
                let tripsFilter = {dni: userDni}
                let tripsOptions = {}

                tripsRepository.getTrips(tripsFilter, tripsOptions).then(trips=>{
                    res.status(200)
                    res.json({
                        trips: trips
                    })
                }).catch(() =>{
                    res.status(500)
                    res.json({error: "Se ha producido un error al recuperar los trayectos."})
                })
            }

        }).catch(() =>{
            res.status(500)
            res.json({error: "Se ha producido un error al recuperar la información del usuario autenticado."})
        })

    });

    /**
     * Endpoint de la API REST para registrar un repostaje
     *
     * Comprueba que el ususario tenga un trayecto en curso, que el vehículo que va a repostar
     * existe y está en trayecto con el usuario, y valida los campos necesarios para registrar
     * un repostaje.
     *
     * Si el repostaje se registra correctamente, retorna el id del repostaje con código 201
     * Si el usuario no tiene trayecto en curso o el vehículo no está asociado a dicho trayecto,
     * devuelve un código de conflicto 409
     * Si no se encuentra algún objeto, devuelve un 404
     * En caso de otro error, retorna un código 500
     *
     */
    app.post('/api/v1.0/refuel', newRefuelValidatorInsert, function(req, res){

        try{
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                res.status(422)
                res.json({errors: errors.array()})
            }
            else{
                let vehicleID = new ObjectId(req.body.id)
                let vehicleFilter = {_id: vehicleID}
                let vehicleOptions = {}

                //Busca el vehículo especificado por su ID
                vehiclesRepository.findVehicle(vehicleFilter, vehicleOptions).then(vehicle=>{
                    if(vehicle===null){
                        //El vehículo especificado no existe
                        res.status(404)
                        res.json({errors:[{msg: "El vehículo especificado no existe."}]})
                    }
                    else{
                        //Si el vehículo indicado es correcto, busca al usuario
                        let authUser = res.user
                        let userFilter = {email: authUser}
                        let userOptions = {}

                        usersRepository.findUser(userFilter, userOptions).then(user=> {
                            if (user === null) {
                                res.status(404)
                                res.json({errors: [{msg: "Usuario no encontrado."}]})
                            } else {
                                //Si el usuario existe, busca si tiene algún trayecto en curso
                                //para ese usuario con ese vehículo
                                let userDni = user.dni
                                let vehiclePlate = vehicle.plate
                                let tripsFilter = {dni: userDni, plate: vehiclePlate, endingOdometer: null}
                                let tripsOptions = {}

                                tripsRepository.findTrip(tripsFilter, tripsOptions).then(trip =>{

                                    if(trip===null){
                                        //No tiene ningún trayecto en curso, por tanto no puede iniciar un repostaje
                                        res.status(409)
                                        res.json({errors: [{msg: "El usuario no puede realizar un repostaje " +
                                                    "si no tiene un trayecto en curso con el vehículo indicado."}]})
                                    }else{
                                        //En caso contrario, puedce realizar un repostaje
                                        let newRefuel = {
                                            plate: vehiclePlate,
                                            station : req.body.stationName,
                                            ppu: req.body.pricePerUnit,
                                            quantity: req.body.quantity,
                                            odometer : req.body.odometerRefuelValue,
                                            date: new Date().toISOString(),
                                            fuelType: vehicle.fuelType,
                                            total: (req.body.pricePerUnit*req.body.quantity).toFixed(2)
                                        }

                                        //Registra el repostaje en BDD
                                        refuelsRepository.insertRefuel(newRefuel).then(refuelID =>{
                                            res.status(201)
                                            res.json({
                                                msg: "Repostaje realizado correctamente.",
                                                _id: refuelID
                                            })
                                        }).catch(()=>
                                        {res.status(500)
                                            res.json({errors: [{msg: "Se ha producido un error al registrar el repostaje."}]})})

                                    }

                                }).catch(() =>{
                                    res.status(500)
                                    res.json({errors: [{msg: "Se ha producido un error al recuperar los trayectos."}]})
                                })
                            }
                        }).catch(()=>{
                                res.status(500)
                                res.json({errors: [{msg: "Se ha producido un error al recuperar la información del usuario autenticado."}]})
                            }
                        )
                    }
                }).catch(()=>{
                    res.status(500)
                    res.json({errors: [{
                            msg: "Se ha producido un error al recuperar la información del vehículo."
                        }]})
                })
            }
        }catch(e){
            res.status(500)
            res.json({errors: [{msg: "Se ha producido un error a la hora de registrar el repostaje."}]})
        }
    });

    /**
     * Endpoint que permite por medio del ID introducido en la dirección de la petición, obtener
     * el coche asociado
     */
    app.get('/api/v1.0/vehicle/:id', function (req, res) {
        let vehicleID = new ObjectId(req.params.id)
        let vehicleFilter = {_id: vehicleID};
        let options = {};

        vehiclesRepository.findVehicle(vehicleFilter, options).then(vehicle =>{
            // Si no encuentra ningún vehículo con el id introducido
            if(vehicle === null){
                res.status(404);
                res.json({error: "No existe vehículo con el ID introducido"});
            }
            // Si encuentra vehículo con el id introducido
            else {
                res.json({
                    vehicle: vehicle
                })
            }
        })
    })

    /**
     * Endpoint que permite obtener todos los coches de la base de datos
     */
    app.get('/api/v1.0/vehicles/all', function (req, res){
        let filter = {};
        let options = {};

        vehiclesRepository.getVehicles(filter, options).then(vehicles => {
            res.status(200);
            res.send({vehicles: vehicles})
        }).catch(() =>{
            res.status(500);
            res.json({
                error: "Se ha producido error al recuperar los vehículos."
            });
        });

    });
}
