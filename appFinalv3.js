const express = require("express");
const app = express();
const fs = require("fs");
const https = require("https");

const miPassport = require('./miPassport.js');

process.env.port = 4001;

const llavePrivada = fs.readFileSync("C:\\Users\\osmar\\Desktop\\Semestres\\Web Meta Final\\private.key");
const certificado = fs.readFileSync("C:\\Users\\osmar\\Desktop\\Semestres\\Web Meta Final\\certificate.crt");
const credenciales = {
    key: llavePrivada,
    cert: certificado,
    passphrase: "qwerty12"
};
const httpsServer = https.createServer(credenciales,app);

httpsServer.listen(process.env.port,()=>{
    console.log("Servidor https escuchando por el puerto: ",process.env.port);
}).on("error",err=>{
    console.log("Error al iniciar el servidor",err);
});

// Rutas protegidas con Passport
app.get('/', miPassport.authenticate('jwt', { session: false }), (req, res) => {
    res.end("Hola Usuario Autenticado");
});
