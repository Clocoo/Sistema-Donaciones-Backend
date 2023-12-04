const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const models = require('./models');

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';

passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
    try {
        console.log("jwt", jwt_payload);
        console.log("jwt email", jwt_payload.email);

        // Realizar la consulta a la base de datos para verificar si el correo existe
        const registrado = await models.registrado.findOne({
            where: { correo: jwt_payload.email }
        });

        if (registrado) {
            // Si el correo existe en la base de datos, autorizar
            return done(null, jwt_payload.email);
        } else {
            // Si el correo no existe en la base de datos, denegar
            return done(null, false);
        }
    } catch (error) {
        console.error('Error al verificar el correo en la base de datos:', error);
        return done(error, false);
    }
}));

module.exports = passport;