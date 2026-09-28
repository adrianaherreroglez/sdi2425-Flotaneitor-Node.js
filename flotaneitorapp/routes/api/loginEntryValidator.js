const {check} = require('express-validator');

exports.loginEntryValidatorInsert = [
        check('email', 'Debe introducir un email.').trim().not().isEmpty(),
    check('email', 'El email debe tener un formato válido.').isEmail(),
    check('password', "Debe introducir una contraseña.").trim().not().isEmpty()
    ]
