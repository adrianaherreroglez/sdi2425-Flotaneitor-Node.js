const {ObjectId} = require("mongodb");
module.exports = function(app,tripsRepository,vehiclesRepository, logsRepository) {

    /**
     * Devuelve la fecha y hora local en formato ISO (YYYY-MM-DDTHH:mm).
     * Ajusta la hora actual para la zona horaria local y la convierte a una cadena ISO.
     */
    function getLocalDateTimeString() {
        let now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    }

    /**
     * Ruta para mostrar el formulario de agregar un viaje.
     * Obtiene los vehículos disponibles (en estado "LIBRE") y la hora local actual.
     * Luego renderiza la vista 'trips/add.twig' pasando los vehículos y la hora actual.
     */
    app.get('/trips/add', async (req, res) => {
        let vehicles = await vehiclesRepository.getVehicles({ state: "LIBRE" }, {});
        let now = getLocalDateTimeString();
        res.render('trips/add.twig', {
            vehicles,
            now
        });
    });


    /**
     * Ruta para mostrar la lista de viajes de un usuario, con paginación.
     * Obtiene el DNI del usuario desde la sesión y busca los viajes asociados a ese DNI.
     * Si el parámetro de página es válido, se calcula la página actual y las páginas vecinas.
     * Los viajes se formatean para mostrar la fecha y hora en formato local (España).
     * En caso de error, muestra un mensaje de error en la vista.
     */
    app.get('/trips', async function (req, res) {
        let dni = req.session.user.dni;
        let filter = { dni: dni };
        let options = {};

        let page = parseInt(req.query.page);
        if (typeof req.query.page === "undefined" || req.query.page === null || req.query.page === "0" || isNaN(page)) {
            page = 1;
        }

        try {
            let result = await tripsRepository.getTripsPg(filter, options, page);

            let lastPageTrips = result.total / 5;
            if (result.total % 5 > 0) {
                lastPageTrips = lastPageTrips + 1;
            }

            let pages = [];

            for (let i = page - 2; i < page + 2; i++) {
                if (i > 0 && i <= lastPageTrips) {
                    pages.push(i);
                }
            }

            res.render("trips/list.twig", {
                trips: result.trips.map(function (trip) {
                    trip.startDateTime = new Date(trip.startDateTime).toLocaleString('es-ES', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    });
                    return trip;
                }),
                pages: pages,
                currentPage: page,
                message: null,
                messageType: null
            });
        } catch (error) {
            res.render("trips/list.twig", {
                trips: [],
                message: "Error al obtener los trayectos",
                messageType: "alert-danger"
            });
        }
    });


    /**
     * Ruta para mostrar el historial de vehículos disponibles en forma de paginación.
     * Obtiene todos los vehículos y los muestra en la vista 'trips/select.twig'
     * Calcula las páginas vecinas a la página actual y muestra los vehículos correspondientes.
     * En caso de error, muestra un mensaje.
     */
    app.get('/trips/history', function (req, res) {
        let filter = {};
        let options = {};
        vehiclesRepository.getVehicles(filter, options).then(vehicles => {
            res.render("trips/select.twig", {vehicles: vehicles});
        }).catch(error => {
            res.send("Se ha producido un error al mostrar la consulta del historial:" + error)
        });
    })



    /**
     * Ruta para mostrar el detalle de un trayecto específico y finalizarlo.
     * Busca un trayecto por su ID (pasado como parámetro en la URL) y renderiza la vista 'trips/finish.twig'.
     * Si ocurre un error al obtener los datos del trayecto, muestra un mensaje de error.
     */
    app.get('/trips/finish/:id', function (req, res) {
        let filter = { _id: new ObjectId(req.params.id) };
        tripsRepository.findTrip(filter, {}).then(trip => {
            res.render("trips/finish.twig", { trip: trip });
        }).catch(error => {
            res.send("Se ha producido un error al obtener los datos del trayecto: " + error);
        });
    });

    /**
     * Ruta POST para finalizar un trayecto.
     * Actualiza el trayecto con el odómetro final, observaciones y duración.
     * Verifica que el valor del odómetro final sea válido (no negativo, no vacío y mayor que el odómetro inicial).
     * Calcula la duración del trayecto y actualiza tanto el trayecto como el vehículo.
     * Si ocurre un error, muestra un mensaje de error.
     */
    app.post('/trips/finish/:id', async function (req, res) {
        let tripId = new ObjectId(req.params.id);
        let endingOdometer = parseFloat(req.body.endingOdometer);
        let observation = req.body.observation || "";
        let now = new Date();

        try {
            let trip = await tripsRepository.findTrip({ _id: tripId }, {});
            if (!trip) {
                return res.send("Trayecto no encontrado.");
            }

            if (endingOdometer < 0) {
                return res.render("trips/finish.twig", {
                    trip: trip,
                    error: "El valor del odómetro final no puede ser negativo."
                });
            }else if (req.body.endingOdometer === ""){
                return res.render("trips/finish.twig", {
                    trip: trip,
                    error: "El valor del odómetro final no puede estar vacío."
                });
            }else if( endingOdometer <= trip.startingOdometer ){
                return res.render("trips/finish.twig", {
                    trip: trip,
                    error: "El valor del odómetro final no puede ser menor o igual que el inicial."
                });
            }

            let startTime = new Date(trip.startDateTime);
            let durationMs = now - startTime;
            let durationFormatted = formatDuration(durationMs);

            let updateData = {
                endingOdometer: endingOdometer,
                observation: observation,
                endDateTime: now.toISOString(),
                duration: durationFormatted
            };

            await tripsRepository.updateTrip(updateData, { _id: tripId }, {});

            await vehiclesRepository.updateVehicle(
                { kilometers: endingOdometer, state: "LIBRE" },
                { plate: trip.plate },
                {}
            );

            return res.redirect(`/vehicles/trips/${trip.plate}`);


        } catch (error) {
            console.error("Error finalizando trayecto:", error);
            return res.send("Se ha producido un error al finalizar el trayecto: " + error.message);
        }

        // Función para formatear la duración
        function formatDuration(durationMs) {
            let seconds = Math.floor(durationMs / 1000);
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);

            if (minutes === 0) {
                return `${seconds} seg`;
            } else if (minutes >= 60) {
                let remainingMinutes = minutes % 60;
                return `${hours} h ${remainingMinutes} min`;
            } else {
                return `${minutes} min`;
            }
        }
    });

    /**
     * Ruta para iniciar un nuevo trayecto.
     * Verifica si el usuario tiene una sesión activa y si ya tiene un trayecto en curso.
     * Si el usuario tiene un trayecto en curso, muestra el listado de trayectos con un mensaje de advertencia.
     * Si no hay vehículos libres disponibles, muestra un mensaje indicando la falta de vehículos.
     * Si no hay trayecto en curso y hay vehículos disponibles, redirige al usuario a la página para agregar un nuevo trayecto.
     */
    app.get('/trips/start', async function(req, res) {
        let dni = req.session.user.dni;

        if (!dni) {
            return res.redirect("/users/login?message=Sesión expirada&messageType=alert-warning");
        }

        try {
            // Comprobar si el usuario ya tiene un trayecto en curso
            let existingTrip = await tripsRepository.findTrip({ dni: dni, endingOdometer: null }, {});

            if (existingTrip) {
                // Si ya hay un trayecto en curso, mostrar el listado de trayectos con un mensaje
                let trips = await tripsRepository.getTrips({ dni }, {});
                return res.render("trips/list.twig", {
                    trips: trips.map(function(trip) {
                        trip.startDateTime = new Date(trip.startDateTime).toLocaleString('es-ES', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        });
                        return trip;
                    }),
                    message: "No puedes iniciar un nuevo trayecto. Ya tienes uno en curso.",
                    messageType: "alert-warning"
                });
            }

            // Verificar si hay vehículos libres disponibles
            let vehiclesAvailable = await vehiclesRepository.getVehicles({ state: "LIBRE" }, {});

            if (!vehiclesAvailable || vehiclesAvailable.length === 0) {
                // Si no hay vehículos libres, mostrar mensaje de error
                let trips = await tripsRepository.getTrips({ dni }, {});
                return res.render("trips/list.twig", {
                    trips: trips.map(function(trip) {
                        trip.startDateTime = new Date(trip.startDateTime).toLocaleString('es-ES', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        });
                        return trip;
                    }),
                    message: "No hay vehículos disponibles en el sistema.",
                    messageType: "alert-warning"
                });
            }

            // Si no hay trayecto en curso y sí hay vehículos libres, redirigir a la página de añadir trayecto
            return res.redirect("/trips/add");

        } catch (error) {
            res.send("Error al verificar trayectos en curso o vehículos disponibles: " + error);
        }
    });



    /**
     * Ruta POST para agregar un nuevo trayecto.
     * Verifica que el usuario tenga una sesión activa y no tenga trayectos en curso.
     * Si el usuario tiene un trayecto en curso, muestra el listado de trayectos con un mensaje de advertencia.
     * Si no tiene trayecto en curso, crea un nuevo trayecto basado en la placa del vehículo,
     * registra el inicio del trayecto, y actualiza el estado del vehículo a "OCUPADO".
     * También registra un log con la acción de inicio de trayecto.
     * Si ocurre un error en cualquiera de los pasos, muestra un mensaje de error.
     */
    app.post('/trips/add', async function(req, res) {
        let dni = req.session.user.dni;
        let plate = req.body.plate;
        let name = req.session.user.name;

        if (!dni) {
            return res.redirect("/users/login?message=Sesión expirada&messageType=alert-warning");
        }

        try {
            let existingTrip = await tripsRepository.findTrip({ dni: dni, endingOdometer: null }, {});
            if (existingTrip) {
                let userTrips = await tripsRepository.getTrips({ dni: dni }, {});
                return res.render("trips/list.twig", {
                    trips: userTrips.map(trip => {
                        trip.startDateTime = new Date(trip.startDateTime).toLocaleString('es-ES', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        });
                        return trip;
                    }),
                    message: "Ya tienes un trayecto en curso",
                    messageType: "alert-warning"
                });
            }

            let lastTrip = await tripsRepository.getLastTripByPlate(plate);
            let now = new Date();

            let newTrip = {
                dni: dni,
                name: name,
                plate: plate,
                startDateTime: now.toISOString(),
                startingOdometer: lastTrip ? lastTrip.endingOdometer : 0,
                duration: null,
                endingOdometer: null
            };

            let tripId = await tripsRepository.insertTrip(newTrip);

            if (tripId) {

                let content = req.originalUrl + " - " + req.method + " - " +
                    newTrip.dni + " - " + newTrip.plate + " - " +
                    +newTrip.startDateTime + " - " + newTrip.startingOdometer + " - " +
                    +newTrip.duration + " - " + newTrip.endingOdometer;

                let registeredRefuelLog = {
                    type: "ALTA",
                    date: new Date().toLocaleString('es-ES', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    }),
                    content: content
                }

                await logsRepository.insertLog(registeredRefuelLog);

                req.session.user.activeTrip = newTrip;
                await vehiclesRepository.updateVehicle({ state: "OCUPADO" }, { plate: plate }, {});
                return res.redirect(`/vehicles/trips/${plate}`);
            } else {
                res.send("Error al registrar el inicio del trayecto.");
            }
        } catch (error) {
            res.send("Error al registrar el inicio del trayecto: " + error);
        }
    });

};