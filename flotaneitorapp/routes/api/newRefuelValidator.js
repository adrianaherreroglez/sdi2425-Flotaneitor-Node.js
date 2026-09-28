const {check} = require('express-validator');

exports.newRefuelValidatorInsert = [
    check('id', 'Debe introducir el ID del vehículo a repostar').trim().not().isEmpty(),
    check('stationName', 'El nombre de la estación de servicio debe especificarse.').trim().not().isEmpty(),
    check('pricePerUnit', 'Debe indicar el precio unitario del combustible.').trim().not().isEmpty(),
    check('pricePerUnit', 'El precio unitario debe ser un valor numérico.').isNumeric(),
    check('quantity', "Debe especificar la cantidad que está repostando.").trim().not().isEmpty(),
    check('quantity', "La cantidad repostada debe ser un valor numérico.").isNumeric(),
    check('isTankFull', 'Es obligatorio indicar si el depósito se ha llenado en el repostaje.').trim().not().isEmpty(),
    check('odometerRefuelValue', 'Debe especificar el valor del odómetro a la hora de repostar.').trim().not().isEmpty(),
    check('odometerRefuelValue', 'El valor del odómetro debe ser un valor numérico.').isNumeric(),
    check('pricePerUnit').custom(value => { if (value < 0) { throw new Error('El precio unitario del combustible debe ser un valor positivo.') } return true; }),
    check('quantity').custom(value => { if (value < 0) { throw new Error('La cantidad repostada debe ser un valor positivo.') } return true; })
    ]

