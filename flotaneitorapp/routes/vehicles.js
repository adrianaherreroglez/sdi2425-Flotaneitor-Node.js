const {ObjectId} = require("mongodb");
module.exports = function(app,vehiclesRepository,tripsRepository,refuelsRepository, logsRepository) {

    /**
     * Ruta GET para mostrar la página de agregar vehículos.
     * Verifica si el usuario tiene una sesión activa y si su rol es 'admin'.
     * Si el usuario no está autenticado o no tiene privilegios de administrador, se muestra un error 403
     * con un mensaje indicando que solo los administradores pueden acceder a esta sección.
     * Si el usuario es administrador, se renderiza la página de agregar vehículos.
     */
    app.get('/vehicles/add', function (req, res) {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).render('error.twig', {
                message: 'Acción prohibida: solo los administradores pueden acceder a esta sección.',
                error: { status: 403 }
            });

        }
        res.render("vehicles/add.twig");
    });

    /**
     * Ruta GET para mostrar la lista de vehículos.
     * Verifica si el usuario tiene una sesión activa y si su rol es 'admin'.
     * Si el usuario no está autenticado o no tiene privilegios de administrador, se muestra un error 403
     * con un mensaje indicando que solo los administradores pueden acceder a esta sección.
     * Si el usuario es administrador, se obtiene y muestra la lista de vehículos paginada.
     * Los resultados se obtienen utilizando el repositorio de vehículos con parámetros de filtro, opciones y la página actual.
     * También se calculan las páginas de paginación para la visualización de los vehículos.
     * En caso de error al obtener los vehículos, se muestra un mensaje de error.
     */
    app.get('/vehicles', function (req, res) {

        let filter = {};
        let options = {};

        let page = parseInt(req.query.page);
        if (typeof req.query.page === "undefined" || req.query.page === null || req.query.page === "0" || isNaN(page)) {
            page = 1;
        }

        vehiclesRepository.getVehiclesPg(filter, options, page).then(result => {
            let lastPageVehicles = result.total / 5;

            if (result.total % 5 > 0) {
                lastPageVehicles = lastPageVehicles + 1;
            }

            let pages = [];

            for (let i = page - 2; i < page + 2; i++) {
                if (i > 0 && i <= lastPageVehicles) {
                    pages.push(i);
                }
            }

            let response = {
                vehicles: result.vehicles,
                pages: pages,
                currentPage: page
            }

            res.render("vehicles/list.twig", response);
        }).catch(error => {
            res.send("Se ha producido un error al listar los vehículos del sistema: " + error);
        });
    });

    /**
     * Ruta GET para mostrar la lista de vehículos disponibles (en estado 'LIBRE').
     * La consulta obtiene los vehículos que tienen el estado 'LIBRE' y los muestra de forma paginada.
     * Si no se especifica la página en la solicitud, la página predeterminada es la 1.
     * Calcula el número total de páginas de acuerdo con los vehículos disponibles y los muestra en el frontend.
     * Si hay un error al obtener los vehículos, se muestra un mensaje de error.
     */
    app.get('/vehicles/available', function (req, res) {
        let filter = { state: "LIBRE" };
        let options = {};

        let page = parseInt(req.query.page);
        if (typeof req.query.page === "undefined" || req.query.page === null || req.query.page === "0" || isNaN(page)) {
            page = 1;
        }

        vehiclesRepository.getVehiclesPg(filter, options, page).then(result => {
            let lastPage = result.total / 5;
            if (result.total % 5 > 0) {
                lastPage += 1;
            }

            let pages = [];
            for (let i = page - 2; i < page + 2; i++) {
                if (i > 0 && i <= lastPage) {
                    pages.push(i);
                }
            }

            res.render("vehicles/listAvailables.twig", {
                vehicles: result.vehicles,
                pages: pages,
                currentPage: page
            });
        }).catch(error => {
            res.send("Se ha producido un error al listar los vehículos disponibles del sistema: " + error);
        });
    });

    /**
     * Ruta GET para mostrar los trayectos de un vehículo específico.
     * Se recibe la matrícula del vehículo como parámetro de la URL.
     * Primero se busca el vehículo por su matrícula en el repositorio de vehículos.
     * Si el vehículo no se encuentra, se muestra un mensaje de error.
     * Si el vehículo existe, se recuperan los trayectos asociados a ese vehículo.
     * Si ocurre un error al recuperar el vehículo o los trayectos, se muestra un mensaje de error correspondiente.
     * Finalmente, se renderiza una vista con los detalles del vehículo y su lista de trayectos.
     */
    app.get('/vehicles/trips/:id', function (req, res) {
        let vehiclePlate = req.params.id;

        let page = parseInt(req.query.page);
        if (typeof req.query.page === "undefined" || req.query.page === null || req.query.page === "0" || isNaN(page)) {
            page = 1;
        }

        vehiclesRepository.findVehicle({ plate: vehiclePlate }).then(vehicle => {
            if (!vehicle) {
                return res.send("Vehículo no encontrado");
            }

            tripsRepository.getTripsPg({ plate: vehiclePlate }, {}, page).then(result => {  // Cambié aquí el 'trips' por 'result'
                let lastPage = result.total / 5;
                if (result.total % 5 > 0) {
                    lastPage += 1;
                }

                let pages = [];
                for (let i = page - 2; i < page + 2; i++) {
                    if (i > 0 && i <= lastPage) {
                        pages.push(i);
                    }
                }
                res.render("vehicles/trips.twig", {
                    vehicle: vehicle,
                    trips: result.trips,
                    pages: pages,
                    currentPage: page
                });
            }).catch(error => {
                res.send("Se ha producido un error al recuperar los trayectos: " + error);
            });
        }).catch(error => {
            res.send("Se ha producido un error al recuperar el vehículo: " + error);
        });
    });



    app.get('/vehicles/delete', function (req, res) {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).render('error.twig', {
                message: 'Acción prohibida: solo los administradores pueden acceder a esta sección.',
                error: { status: 403 }
            });

        }
        res.render("vehicles/list.twig");
    });

    /**
     * Ruta GET para acceder a la sección de eliminación de vehículos.
     * Solo los usuarios con el rol de 'admin' pueden acceder a esta ruta.
     * Si el usuario no tiene permisos de administrador, se muestra un mensaje de error con el código de estado 403 (Prohibido).
     * Si el usuario tiene permisos de administrador, se renderiza la vista 'vehicles/list.twig' para que pueda gestionar la lista de vehículos.
     */
    app.post('/vehicles/delete', async function (req, res) {
        const { vehicleIds } = req.body;
        let ids = vehicleIds;

        if (!Array.isArray(ids)) {
            ids = [ids];
        }

        let objectIds = ids.map(id => new ObjectId(id));
        let filter = { _id: { $in: objectIds } };

        try {
            let vehicles = await vehiclesRepository.getVehicles(filter, {});
            let plates = vehicles.map(v => v.plate);


            if (vehicles.length === 0) {
                let page = parseInt(req.query.page) || 1;
                let result = await vehiclesRepository.getVehiclesPg({}, {}, page); // Obtener todos los vehículos para la paginación

                let lastPageVehicles = result.total / 5;
                if (result.total % 5 > 0) {
                    lastPageVehicles += 1;
                }

                let pages = [];
                for (let i = page - 2; i < page + 2; i++) {
                    if (i > 0 && i <= lastPageVehicles) {
                        pages.push(i);
                    }
                }

                return res.render('vehicles/list.twig', {
                    vehicles: result.vehicles,
                    pages: pages,
                    currentPage: page,
                    errorMessage: 'No hay ningún vehículo seleccionado para ser eliminado'
                });
            }

            await tripsRepository.deleteTrips({ plate: { $in: plates } });
            await refuelsRepository.deleteRefuels({ plate: { $in: plates } });

            let result = await vehiclesRepository.deleteVehicle(filter, {});

            if (!result || result.deletedCount === 0) {
                return res.render('vehicles/list.twig', {
                    errorMessage: 'No se pudo eliminar el vehículo',
                    vehicles: vehicles,
                    pages: [],
                    currentPage: 1
                });
            } else {
                return res.redirect("/vehicles");
            }
        } catch (error) {
            return res.send('Error al intentar eliminar los vehículos y sus viajes asociados: ' + error);
        }
    });


    /**
     * Ruta POST para agregar un nuevo vehículo al sistema.
     * Recibe los datos del formulario de un vehículo y realiza varias validaciones antes de intentar agregarlo.
     * Si alguno de los campos requeridos está vacío o no cumple con los requisitos, se muestra un mensaje de error y se vuelve a renderizar el formulario.
     * Si las validaciones son correctas, el vehículo se guarda en la base de datos y se registra una entrada en el log.
     */
    app.post('/vehicles/add', async function(req, res) {
        let vehicle = {
            plate: req.body.plate,
            chassisNumber: req.body.chassisNumber,
            brand: req.body.brand,
            model: req.body.model,
            fuelType: req.body.fuelType.toUpperCase(),
            kilometers: 0,
            state: "LIBRE"
        };

        const renderWithError = (message) => {
            return res.render('vehicles/add.twig', {
                error: message,
                formData: vehicle
            });
        };

        if (!vehicle.plate || !vehicle.chassisNumber || !vehicle.brand || !vehicle.model) {
            return renderWithError("No puede haber campos vacíos.");
        }

        if (vehicle.chassisNumber.length !== 17) {
            return renderWithError("El número de bastidor no tiene la longitud adecuada.");
        }

        let plateRegex = /^\d{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$/;
        if (!plateRegex.test(vehicle.plate)) {
            return renderWithError("La matrícula no tiene un formato válido para España.");
        }

        let vehicleWithThatPlate = await vehiclesRepository.findVehicle({ plate: vehicle.plate }, {});
        if (vehicleWithThatPlate) {
            return renderWithError("La matrícula introducida ya existe en el sistema.");
        }

        let vehicleWithThatChassisNumber = await vehiclesRepository.findVehicle({ chassisNumber: vehicle.chassisNumber }, {});
        if (vehicleWithThatChassisNumber) {
            return renderWithError("El número de bastidor introducido ya existe en el sistema.");
        }

        try {
            let vehicleId = await vehiclesRepository.insertVehicle(vehicle);

            if (vehicleId) {

                let content = req.originalUrl + " - " + req.method + " - " +
                    vehicle.plate + " - " + vehicle.chassisNumber + " - " + vehicle.brand
                    + " - " + vehicle.model + " - " + vehicle.fuelType + " - " + vehicle.kilometers
                    + " - " + vehicle.state;

                let registeredVehicle = {
                    type: "ALTA",
                    date: new Date().toLocaleString('es-ES', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    }),
                    content: content
                }

                await logsRepository.insertLog(registeredVehicle);

                return res.redirect("/vehicles");
            } else {
                return renderWithError("Error al insertar vehículo.");
            }
        } catch (error) {
            return renderWithError("Error al insertar vehículo: " + error.message);
        }
    });


};
