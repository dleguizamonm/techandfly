// Define schema
var Schema = mongoose.Schema;

var itinerario = new Schema({
    fecha: Date,
    origen:Number,
    destino:Number,
    precio:Number,
    reservas:[{
    	cedula:Number
    }]    
});
var mitinerarios = mongoose.model('itinerarios', itinerario );
module.exports = mitinerarios;