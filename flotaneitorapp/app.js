let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let jwt = require('jsonwebtoken');
let crypto = require('crypto');


let app = express();

// Cliente Ligero Setup
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin",
      "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
  // Debemos especificar todas las headers que se aceptan. Content-Type , token
  next();
});

let expressSession = require('express-session');
app.use(expressSession({
  secret: 'abcdefg',
  resave: true,
  saveUninitialized: true
}));

app.use((req, res, next) =>{
  res.locals.user = req.session.user;
  next();
});


let rest = require('request');
app.set('rest', rest);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');
app.set('jwt', jwt);
app.set('crypto', crypto);
app.set('clave', 'abcdefg')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// ZONA DE ROUTERS
const indexRouter = require('./routes/index');
app.use('/', indexRouter);
const usersRouter = require('./routes/users');
app.use('/users', usersRouter);
const userTokenRouter = require('./routes/userTokenRouter');
app.use("/api/v1.0/vehicles/", userTokenRouter); //Requiere autenticación para cualquier endpoint de .../vehicles/...
app.use("/api/v1.0/trips/", userTokenRouter); //Requiere autenticación para cualquier endpoint de .../trips/...
app.use("/api/v1.0/refuel/", userTokenRouter); //Requiere autenticación para repostar
const userSessionRouter = require('./routes/userSessionRouter');
app.use("/employees", userSessionRouter);
app.use("/employees/", userSessionRouter);
app.use("/vehicles/", userSessionRouter);
app.use("/trips/", userSessionRouter);
app.use("/trips", userSessionRouter);
app.use("/refuels", userSessionRouter);
app.use("/refuels/", userSessionRouter);
app.use("/log/", userSessionRouter);
const employeeSessionRouter = require('./routes/employeeSessionRouter');
app.use("/trips", employeeSessionRouter);
app.use("/trips/", employeeSessionRouter);
app.use("/vehicles/available", employeeSessionRouter);
app.use("/refuels", employeeSessionRouter);
app.use("/refuels/", employeeSessionRouter);
const adminSessionRouter = require('./routes/adminSessionRouter');
app.use("/employees/", adminSessionRouter);
const logRequestRouter = require('./routes/logRequestRouter');
app.use("/*", logRequestRouter);

// ZONA DE REPOSITORIOS
const { MongoClient } = require('mongodb');
const mongoUrl = 'mongodb://localhost:27017/';
const dbClient = new MongoClient(mongoUrl);
let vehiclesRepository = require("./repositories/vehiclesRepository.js");
vehiclesRepository.init(app, dbClient);
let tripsRepository = require("./repositories/tripsRepository.js");
tripsRepository.init(app, dbClient);
let usersRepository = require("./repositories/usersRepository.js");
usersRepository.init(app, dbClient);
let employeesRepository = require("./repositories/employeesRepository.js");
employeesRepository.init(app, dbClient);
let refuelsRepository = require("./repositories/refuelsRepository.js");
refuelsRepository.init(app, dbClient);
let logsRepository = require("./repositories/logsRepository.js");
logsRepository.init(app, dbClient);

require('./routes/api/fleetAPIv1.0.js')(app, usersRepository, vehiclesRepository, tripsRepository, refuelsRepository);
require('./routes/vehicles.js')(app, vehiclesRepository,tripsRepository,refuelsRepository, logsRepository);
require('./routes/trips.js')(app, tripsRepository,vehiclesRepository, logsRepository);
require("./routes/users.js")(app, usersRepository, employeesRepository, tripsRepository, logsRepository);
require("./routes/employees.js")(app, employeesRepository, usersRepository, logsRepository, tripsRepository);
require("./routes/refuels.js")(app, refuelsRepository, vehiclesRepository, logsRepository);
require("./routes/log.js")(app, logsRepository);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const { run } = require("./public/javascripts/initDB.js");
run(true).catch(err => {
  console.error("Error inicializando la base de datos: ", err);
});


module.exports = app;
