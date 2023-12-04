const passport = require("passport");
const passportJWT = require("passport-jwt");
const User = require("../models/user");
const llave = require("./llave"); // Archivo donde se guarda la llave con la que se codifica el Token

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = llave;
let strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next){
    let user = User.findById(jwt_payload.id); // Aquí se verifica el dato codificado en el token
    if (user) {
        next(null, user) // Si el Token es válido el requerimento pasa al controlador
    } else {
        next(null,false); // Si el Token es inválido se enviará Unauthorized
    }
});

passport.use(strategy);
module.exports = passport;