const express = require('express');
const employeesRepository = require('../repositories/employeesRepository');
const employeeSessionRouter = express.Router();

/**
 * Middleware de seguridad para acceso de los empleados
 */
employeeSessionRouter.use(function (req, res, next) {
    console.log("employeeRouter");
    let userDNI = req.session.user.dni
    let filter = {dni: userDNI};
    let options = {}

    employeesRepository.findEmployee(filter, options).then(employee =>{
        if(employee.role !== "employee"){
            res.redirect('/employees/list');
        }else{
            next();
        }
    }).catch(error => {
        res.redirect("/trips?message=Se ha producido un error al comprobar las credenciales del usuario: "+error+
            + "&messageType=alert.danger ");
    });

});
module.exports = employeeSessionRouter;