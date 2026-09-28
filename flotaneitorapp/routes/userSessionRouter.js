const express = require('express');
const userSessionRouter = express.Router();

/**
 * Middleware de seguridad para usuarios autenticados.
 */
userSessionRouter.use(function(req, res, next) {
    console.log("routerUsuarioSession");

    const user = req.session.user;
    const path = req.originalUrl;

    if (user) {
        // Redirección tras login
        if (path === "/users/login") {
            if (user.role === "admin") {
                return res.redirect("/employees/list");
            } else {
                return res.redirect("/trips");
            }
        }

        const role = user.role;

        const forbiddenAccess = (
            (path.startsWith("/employees") && role !== "admin") ||
            (path.startsWith("/vehicles") && !["admin", "employee"].includes(role)) ||
            (path.startsWith("/refuels") && !["admin", "employee"].includes(role)) ||
            (path.startsWith("/trips") && role === "admin") ||  // Admins no pueden entrar a /trips
            (path.startsWith("/vehicles/trips") && role === "admin")
        );

        if (forbiddenAccess) {
            console.log(`Acceso denegado a ${path} para rol ${role}`);
            return res.status(403).send("Acceso denegado");
        }

        return next();
    } else {
        // Usuario no autenticado
        if (path === "/users/login") {
            return next();
        } else {
            console.log("No autenticado, va a: " + path);
            return res.redirect("/users/login");
        }
    }
});

module.exports = userSessionRouter;
