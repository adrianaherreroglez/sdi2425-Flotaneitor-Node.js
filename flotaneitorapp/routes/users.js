let express = require('express');
let router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('listado de usuarios');
});

module.exports = function(app, usersRepository, employeesRepository, tripsRepository, logsRepository) {
   /**
   * Router GET que devuelve el mensaje de lista de usuarios
   */
  app.get('/users', function(req, res){
    res.send("Lista de usuarios");
  })

  /**
  * Router GET que muestra la vista de login
  */
  app.get('/users/login', function(req, res){
    res.render("login.twig");
  })

  /**
  * Router POST que valida los datos de inicio de sesión de un usuario y
   * redirecciona a una lista u a otra dependiendo del rol del empleado autenticado.
   *
   * Primero comprueba que el usuario esté registrado en la base de datos y que sus credenciales de login
   * sean correctas.
   *
   * Luego busca el empleado asociado a ese usuario usando el DNI para comprobar el rol del usuario,
   * si el rol es "employee" se le redirige a la vista que muestra un listado con los trayectos realizados por él mismo,
   * si el rol es "admin" se le redirige a la vista que muestra un listado con todos los empleados registrados
   * en la bbdd incluidos los admins y ellos mismos.
   *
   * Los datos deben encontrarse registrados en la base de datos para un mismo usuario, no ser vacios
   * y no empezar o acabar con espacios en blanco.
   *
   * Se registra un log de inicio de sesión correcto en caso de que las credenciales sean válidas.
  */
  app.post('/users/login', async function (req, res) {

      let formUser = {
          dni: req.body.dni,
          password: req.body.password
      }

      const renderWithError = (message) => {
          return res.render("login.twig", {
              error: message,
              formData: formUser
          });
      };

      if (req.body.dni === null || req.body.dni === undefined || req.body.dni === "") {

          let loginUserLog = {
              type: "LOGIN-ERR",
              date: new Date().toLocaleString('es-ES', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
              }),
              content: req.body.dni
          }

          await logsRepository.insertLog(loginUserLog);

          return renderWithError("El dni no puede ser vacio o nulo");
      }

      if (req.body.password === null || req.body.password === undefined || req.body.password === "") {

          let loginUserLog = {
              type: "LOGIN-ERR",
              date: new Date().toLocaleString('es-ES', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
              }),
              content: req.body.dni
          }

          await logsRepository.insertLog(loginUserLog);

          return renderWithError("La contraseña no puede ser vacia o nula");
      }

      let securePassword = app.get("crypto").createHmac('sha256', app.get('clave'))
          .update(req.body.password).digest('hex');

      let filter = {
          dni: req.body.dni,
          password: securePassword
      }

      let options = {}

      usersRepository.findUser(filter, options).then(async user => {
          if (user == null) {

              let loginUserLog = {
                  type: "LOGIN-ERR",
                  date: new Date().toLocaleString('es-ES', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                  }),
                  content: req.session.user.dni
              }

              await logsRepository.insertLog(loginUserLog);

              req.session.user = null;
              return renderWithError("DNI o contraseña incorrectos");
          } else {
              let employeeFilter = {
                  dni: user.dni
              }
              employeesRepository.findEmployee(employeeFilter, options).then(async employee => {

                  let tripFilter = {
                      dni: user.dni,
                      startDateTime: {$ne: null},
                      duration: null
                  }

                  let content = user.dni;

                  let loginUserLog = {
                      type: "LOGIN-EX",
                      date: new Date().toLocaleString('es-ES', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                      }),
                      content: content
                  }

                  await logsRepository.insertLog(loginUserLog);

                  tripsRepository.findTrip(tripFilter, options).then(trip => {

                      if (trip === null) {
                          req.session.user = {
                              dni: employee.dni,
                              role: employee.role,
                              name: employee.name
                          };
                      } else {
                          req.session.user = {
                              dni: employee.dni,
                              role: employee.role,
                              name: employee.name,
                              activeTrip: trip
                          };
                      }

                      if (employee.role === "employee") {
                          res.redirect('/trips');
                      } else {
                          res.redirect('/employees/list');
                      }


                  }).catch(async error => {

                      let loginUserLog = {
                          type: "LOGIN-ERR",
                          date: new Date().toLocaleString('es-ES', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                          }),
                          content: req.session.user.dni
                      }

                      await logsRepository.insertLog(loginUserLog);

                      req.session.user = null;

                      return renderWithError("Se ha producido un error al comprobar la base de datos: "+error);

                  });
              }).catch(async error => {

                  let loginUserLog = {
                      type: "LOGIN-ERR",
                      date: new Date().toLocaleString('es-ES', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                      }),
                      content: req.body.dni
                  }

                  await logsRepository.insertLog(loginUserLog);

                  return renderWithError("Se ha producido un error al buscar al usuario: "+error);
              })
          }
      }).catch(async error => {
          req.session.user = null;

          let loginUserLog = {
              type: "LOGIN-ERR",
              date: new Date().toLocaleString('es-ES', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
              }),
              content: req.body.dni
          }

          await logsRepository.insertLog(loginUserLog);

          return renderWithError("Se ha producido un error al buscar el usuario: " + error);
      })
  })

  /**
  * Router GET para cerrar sesión, se establece el usuario de la sesión como null.
   * Se registra un log de cierre de sesión.
  */
  app.get('/users/logout', async function(req, res){

      let logoutUserLog = {
          type: "LOGOUT",
          date: new Date().toLocaleString('es-ES', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
          }),
          content: req.session.user.dni
      }

      await logsRepository.insertLog(logoutUserLog);

      req.session.user = null;

    res.redirect("/users/login" +
        "?message=El usuario se ha desconectado correctamente"+
        "&messageType=alert-success ");
  })

}
