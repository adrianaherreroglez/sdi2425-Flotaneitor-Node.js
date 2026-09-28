let express = require('express');
let router = express.Router();

/*
  Ruta GET para la página de inicio ('/').
  Cuando un usuario accede a la página de inicio, se le redirige automáticamente
  a la página de login en '/users/login'.
*/
router.get('/', function(req, res) {
  res.redirect('/users/login');
});

module.exports = router;
