//controlador de la aplicación
class App {

	

	constructor(){

		//conexion websocket
		this.ctrl = new Vue({
			el : "#index",//index es el div que contiene la vista
			data:{
				socket:null,//conexion al servidor por medio de websocket
				destinos:[{id:1,nombre:"Bogotá"},{id:2,nombre:"Medellín"}],//los destinos ofrecidos
				form_consulta:{//formulario para consulta de vuelos
					fecha:'',
					origen:1,
					destino:2
				},
				reserva:{//formulario para reserva de vuelos
					cedula:0,
					fnacimiento:''
				},
				maxdate:'',//la fecha maximo que se puede seleccionar al hacder la reserva
				itinerario:Array(),//el listado de itinerarios disponibles según los resultados de búsqueda
				isdisabledbtn:false,//deshabilita los botones del formulario mientras se procesa la peticion en el servidr. importante ya que las peticiones son asyncronas.
				lista_reservas:Array()//listado de reservas del cliente cuando se busca por cédula
			},
			methods:{
				//funcion para consultar  vuelos disponibles
				reservas_fconsulta_fecha:function(){
					if(this.form_consulta.origen!=this.form_consulta.destino && this.form_consulta.origen>0 && this.form_consulta.destino>0){
						this.isdisabledbtn=true;//deshabilita botones antes de procesar

						//emite el evento para consultar los vuelos
						this.socket.emit("reservas_fconsulta_fecha",this.form_consulta,(listado_itinerarios)=>{
							this.isdisabledbtn=false;//habilita botones despues de recibir el callback
							if(listado_itinerarios){//si no es null indica que hay resultados

								//una vez obtenido el listado lo agrego a la lista itinerario para que se muestre en pantalla
								this.itinerario.splice(0,this.itinerario.length);
								var n = listado_itinerarios.length;
								for(var i=0; i<n; i++){
									listado_itinerarios[i].ver=false;//se usa cuando el usuario hace clic en reservar. muestra al formulario de reserva
									this.itinerario.push(listado_itinerarios[i]);
								}
							}
							else{
								//si hay error listado_itinerarios==null entonces muestro el error
								alert("Error al consultar itinerario");
							}
						});
					}
					else{
						alert("El destino debe ser diferente al origen");
					}
				},
				formatear_fecha:function(fecha){
					var f = new Date(fecha);
					return f.getHours().toString().padStart(2,"0")+":"+f.getMinutes().toString().padStart(2,"0");
				},
				fecha_vuelo:function(fecha){
					var f = new Date(fecha);
					return f.toString();
				},
				//el usuario confirma la reserva, trae como parámetro el item que contiene la fecha y hora de reserva
				reservar:function(it){

					//el _id del item es el id del vuelo en el que se está haciendo la reserva. importante enviarlo al servidor para una busqueda mas exacta y eficiente.
					var _id=it._id;
					if(this.reserva.cedula>0 && this.reserva.fnacimiento.length==10){
						this.isdisabledbtn=true;
						this.socket.emit("reservas_reservar",{info:this.reserva,_id:_id},(msj,rta)=>{
							//una vez el servidor devuelve los resultados se notifica al usuario
							this.isdisabledbtn=false;
							if(!msj){
								alert("Su reserva fue registrada");
								it.ver=false;
							}
							else{
								alert(msj);
							}
						});
					}
					else{
						alert("Digite cedula y seleccione su fecha de nacimiento");
					}
				},
				//funcion para consultar las reservas de un cliente
				reservas_consultar:function(){
					this.isdisabledbtn=true;
					this.socket.emit("reservas_consultar",this.reserva.cedula,(err,lista)=>{
						this.isdisabledbtn=false;
						if(!err){
							var n = lista.length;
							for(var i=0; i<n; i++){
								this.lista_reservas.push(lista[i]);
							}
							if(lista.length==0){
								alert("No hay reservas para el número de cédula digitado");
							}
						}
						else{
							alert(err);
						}

					});
				}
			},
			created:function(){
				//una vez el controlador ha sido creado se realiza la conexion websocket al servidor
				this.socket = io();
				//la fecha actual, se le restan 18 años para establecer la fecha máxima que el usuario puede seleccionar cuando realiza una reserva
				var f = new Date();
				f.setFullYear(f.getFullYear()-18);
				this.maxdate = f.getFullYear()+"-"+f.getMonth().toString().padStart(2,"0")+"-"+f.getDate().toString().padStart(2,"0");

			}
		});
	}
}

