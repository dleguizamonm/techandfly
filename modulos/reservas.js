var modelo_itinerario = require("../modelo/itinerario");

var reservas = {};

reservas.iniciar=function(){

	modelo_itinerario.countDocuments({},(errc,num)=>{
		if(num==0){
			for(var i=0; i<60; i++){
				reservas.crear_itinerario(i);
			}
		}
	});
}

reservas.crear_itinerario=function(i){

	var horario_manana = new Date();
	horario_manana.setDate(horario_manana.getDate()+i);

	var multiplicador = 1;
	var dia_de_la_semana = horario_manana.getDay();

	//domingo o sabado
	if(dia_de_la_semana==0 || dia_de_la_semana==6){
		multiplicador=1.1;//10% mas costoso que los días normales
	}

	
	horario_manana.setHours(8,0,0,0);
	var nuevo_itinerario = new modelo_itinerario({fecha:horario_manana,origen:1,destino:2,precio:(250000*multiplicador),reservas:[]});
	nuevo_itinerario.save((errni,resni)=>{
	});


	var horario_manana_regreso = new Date();
	horario_manana_regreso.setDate(horario_manana_regreso.getDate()+i);
	horario_manana_regreso.setHours(11,0,0,0);
	var nuevo_itinerario = new modelo_itinerario({fecha:horario_manana_regreso,origen:2,destino:1,precio:(250000*multiplicador),reservas:[]});
	nuevo_itinerario.save((errni,resni)=>{
	});


	var horario_tarde = new Date();
	horario_tarde.setDate(horario_tarde.getDate()+i);
	horario_tarde.setHours(14,0,0,0);
	var nuevo_itinerario = new modelo_itinerario({fecha:horario_tarde,origen:1,destino:2,precio:(300000*multiplicador),reservas:[]});
	nuevo_itinerario.save((errni,resni)=>{
	});


	var horario_tarde_regreso = new Date();
	horario_tarde_regreso.setDate(horario_tarde_regreso.getDate()+i);
	horario_tarde_regreso.setHours(17,0,0,0);
	var nuevo_itinerario = new modelo_itinerario({fecha:horario_tarde_regreso,origen:2,destino:1,precio:(300000*multiplicador),reservas:[]});
	nuevo_itinerario.save((errni,resni)=>{
	});


	
}

//funcion receptora del evento reservas_fconsulta_fecha enviado desde el cliente
//data.fecha: la fecha en la que se debe realizar la búsqueda
//data.origen: el id del la ciudad origen
//data.destino: el id del la ciudad destino
//callback funcion que se invoca luego de obtener el resultado, esta funcion es devuelta al cliente
reservas.reservas_fconsulta_fecha=function(data,callback){
	var inicio = new Date(data.fecha);//fecha inicial desde las 00
	var fin = new Date(data.fecha);
	fin.setDate(inicio.getDate()+1);//fecha final hasta las 00 del siguiente día
	//realiza la búqsqueda según el origen, el destino y la fecha
	modelo_itinerario.find({origen:data.origen,destino:data.destino,$and:[{fecha:{$gte:inicio}},{fecha:{$lte:fin}}]},{},(err,res)=>{
		if(!err){
			callback(res);
		}
		else{
			callback(null);
		}
	}).sort({fecha:1});
}
//cliente confirma la reserva
reservas.reservas_reservar=function(data,callback){

	//data._id es el id de la colección del vuelo seleccionado por el cliente
	//data.info contiene la cedula y fecha de nacimiento del cliente

	var fnacimiento = new Date(data.info.fnacimiento);
	var ahora = new Date();
	ahora.setFullYear(ahora.getFullYear()-18);
	ahora = ahora.getTime();
	if(fnacimiento.getTime()<=ahora){//solo si la fecha de nacimiento es 18 años menor que la actual
		
		//se obtiene la fecha del vuelo
		modelo_itinerario.findOne({_id:data._id},{fecha:1},(errf,resf)=>{
			if(!errf){
				if(resf){
					var inicio = new Date(resf.fecha);
					inicio.setHours(0,0,0);
					var fin = new Date(resf.fecha);
					fin.setDate(fin.getDate()+1);
					fin.setHours(0,0,0);
					//se verifica que el cliente no tenga una reserva para ese día
					modelo_itinerario.findOne({$and:[{fecha:{$gte:inicio}},{fecha:{$lt:fin}},{"reservas.cedula":data.info.cedula}]},{reservas:0},(err,res)=>{
						if(!err){
							if(res){
								callback("Ya tiene reservado un vuelo para este día",true);
							}
							else{
								modelo_itinerario.update({_id:data._id},{$push:{reservas:{cedula:data.info.cedula}}},{},(erru,resu)=>{
									if(!erru){
										if(resu.nModified==1){
											callback(null,true);
										}
										else{
											callback("Error al registrar reserva",null);
										}
									}
									else{
										callback("Error al registrar reserva",null);
									}
								});
							}
						}
						else{
							callback(null,true);
						}
					});

				}
			}
		});
		
	}
	else{
		callback("Debe ser mayor de edad para poder registrar su reserva",null);
	}
}
reservas.reservas_consultar=function(cedula,callback){
	modelo_itinerario.find({"reservas.cedula":cedula},{reservas:0},(err,res)=>{
		if(!err){
			callback(null,res);
		}
		else{
			callback("Error al consultar reservas",null);
		}
	});

}

module.exports = reservas;