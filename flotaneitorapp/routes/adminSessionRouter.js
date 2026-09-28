const express = require('express');
const employeesRepository = require('../repositories/employeesRepository');
const adminSessionRouter = express.Router();

/**
 * Middleware de seguridad para acceso de los administradores
 */
adminSessionRouter.use(function (req, res, next) {
    console.log("adminRouter");
    let userDNI = req.session.user.dni
    let filter = {dni: userDNI};
    let options = {}

    employeesRepository.findEmployee(filter, options).then(employee =>{
        if(employee.role !== "admin"){
            res.redirect('/trips');
        }else{
            next();
        }
    }).catch(error => {
        res.redirect("/trips?message=Se ha producido un error al comprobar las credenciales del usuario: "+error+
        + "&messageType=alert.danger ");
    });

});
module.exports = adminSessionRouter;