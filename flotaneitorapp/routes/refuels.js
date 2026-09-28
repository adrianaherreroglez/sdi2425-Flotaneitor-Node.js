module.exports = function(app, refuelsRepository, vehiclesRepository, logsRepository) {

    /**
     * Router GET que redirige a la vista de vehículos disponibles
     */
    app.get("/refuels",function(req, res){
        res.redirect("/vehicles/available");
    });

    /**
     * Router GET que muestra el formulario para registrar repostajes
     */
    app.get("/refuels/add", function(req, res){
       res.render("refuels/add.twig");
    });

    /**
     * Router POST que recoge los datos del formulario para añadir repostajes, valida esos datos,
     * y registra el repostaje en la base de datos.
     *
     * Los datos no pueden ser vacios, empezar o terminar con espacios en blanco.
     * Los datos numéricos no pueden ser negativos.
     * El valor del odometraje no puede ser menor que el valor del odometro del vehículo del trayecto activo.
     */
    app.post("/refuels/add", function(req, res){

        let userActiveTrip = req.session.user.activeTrip;
        let activePlate = userActiveTrip.plate;

        vehiclesRepository.findVehicle({plate: activePlate}, {}).then(vehicle => {

            let refuelForm = {
                stationName: req.body.stationName,
                pricePerUnit: parseFloat(req.body.pricePerUnit),
                quantity: parseFloat(req.body.quantity),
                isTankFull: req.body.isTankFull,
                odometerRefuelValue: parseFloat(req.body.odometerRefuelValue),
                observations: req.body.observations
            }

            const renderWithError = (message) => {
              return res.render("refuels/add.twig", {
                 error: message,
                 formData: refuelForm
              });
            };

            let validatedForm = validateRefuelForm(refuelForm, vehicle);

            if(validatedForm !== "ok"){
                return renderWithError(validatedForm);
            }else{
                let newRefuel = {
                    plate: activePlate,
                    station : refuelForm.stationName,
                    ppu: refuelForm.pricePerUnit,
                    quantity: refuelForm.quantity,
                    isTankFull: req.body.isTankFull !== undefined ,
                    odometer : refuelForm.odometerRefuelValue,
                    date: new Date().toISOString(),
                    fuelType: vehicle.fuelType,
                    total: (refuelForm.pricePerUnit*refuelForm.quantity).toFixed(2),
                    observations: refuelForm.observations
                }

                refuelsRepository.insertRefuel(newRefuel).then(async refuel => {
                    if (refuel !== null) {

                        let content = req.originalUrl + " - " + req.method + " - " +
                            newRefuel.plate + " - " + newRefuel.station + " - " +
                            +newRefuel.ppu + " - " + newRefuel.quantity + " - " +
                            +newRefuel.odometer + " - " + newRefuel.date + " - " +
                            +newRefuel.fuelType + " - " + newRefuel.total;

                        let registeredRefuelLog = {
                            type: "ALTA",
                            date: new Date().toLocaleString('es-ES', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            }),
                            content: content
                        }

                        await logsRepository.insertLog(registeredRefuelLog);

                        res.redirect("/refuels/" + vehicle.plate);
                    } else {
                        renderWithError("No se ha podido registrar el repostaje");
                    }
                }).catch(error => {
                   renderWithError("Se ha producido un error al registrar el repostaje "+ error);
                });
            }
        })
    });

    /**
     * Router GET que muestra la lista de repostajes para un vehículo utilizando la matrícula del vehículo.
     * Utiliza paginación para mostrar los repostajes de 5 en 5.
     */
    app.get("/refuels/:plate", function(req, res){
        let filter = {plate: req.params.plate};
        let options = {};

        let page = parseInt(req.query.page);
        if(typeof req.query.page === "undefined" || req.query.page === null || req.query.page === "0"){
            page = 1;
        }

        refuelsRepository.getRefuelsPg(filter, options, page).then(result => {

            let lastPageRefuels = result.total/5;

            if(result.total % 5 > 0){
                lastPageRefuels = lastPageRefuels + 1;
            }

            let pages = [];

            for(let i=page-2; i<page+2; i++){
                if(i>0 && i <= lastPageRefuels){
                    pages.push(i);
                }
            }

            let response = {
                plate: req.params.plate,
                refuels: result.refuels,
                pages: pages,
                currentPage: page
            }
            res.render("refuels/list.twig", response);

        }).catch(error => {
           res.send("Se ha producido un error al listar los empleados "+ error);
        });
    });

    /**
     * Función que válida los datos del formulario.
     * @param form
     * @param vehicle
     * @returns {string}
     */
    function validateRefuelForm(form, vehicle){

        if(form.stationName === null || form.stationName === undefined || form.stationName.trim() === ""){
            return "El nombre de la estación no puede ser nulo o vacio";
        }
        if(/^\s/.test(form.stationName) || /\s$/.test(form.stationName)){
            return "El nombre de la estación no puede empezar o terminar con espacios vacios";
        }
        if(form.observations === null || form.observations === undefined){
            return "Las observaciones no pueden ser nulas";
        }
        if(form.observations !== ""){
            if(/^\s/.test(form.observations) || /\s$/.test(form.observations)){
                return "Las observaciones no pueden empezar o terminar con espacios vacios";
            }
        }
        if(form.pricePerUnit === null || form.pricePerUnit === undefined || isNaN(form.pricePerUnit)){
            return "El precio por unidad no puede ser nulo o vacio";
        }
        if(form.pricePerUnit < 0){
            return "El precio por unidad no puede ser negativo";
        }
        if(form.quantity === null || form.quantity === undefined || isNaN(form.quantity)){
            return "La cantidad no puede ser nula o vacia";
        }
        if(form.quantity < 0){
            return "La cantidad no puede ser negativa";
        }
        if(form.odometerRefuelValue === null || form.odometerRefuelValue === undefined || isNaN(form.odometerRefuelValue)){
            return "El valor del odometraje no puede ser nulo o vacio";
        }
        if(form.odometerRefuelValue < vehicle.kilometers){
            return "El valor del odometro al repostar no puede ser menor que al comienzo del trayecto";
        }
        return "ok";
    }
}