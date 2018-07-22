//declaración de variables
var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var conf = require("./conf.js");//configuración general

app.use(express.static('html'));


//conexion a MongoDB//
mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect(conf.mongo);
mongoose.Promise = global.Promise;


var dbm = mongoose.connection;
dbm.once('open', function (callback) {
	modulo_reservas.iniciar();
});
dbm.on('error',function(){
    console.log("erro de conexion");
});
//////////////////////


//controlador de reservas.
var modulo_reservas = require("./modulos/reservas");


io.on('connection', function(socket){
	socket.on("reservas_fconsulta_fecha",modulo_reservas.reservas_fconsulta_fecha);
	socket.on("reservas_reservar",modulo_reservas.reservas_reservar);
	socket.on("reservas_consultar",modulo_reservas.reservas_consultar);
});


http.listen(conf.bind.pto,()=>{
	console.log("servidor iniciado");
});