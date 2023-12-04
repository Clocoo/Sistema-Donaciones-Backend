const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const models = require("./models");
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const jwt = require('jsonwebtoken');

const miPassport = require('./miPassport.js');

process.env.port = 4001;

const llavePrivada = fs.readFileSync("C:\\Users\\J4VI\\private.key");
const certificado = fs.readFileSync("C:\\Users\\J4VI\\certificate.crt");
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

  app.use(express.json()); // Middleware para parsear el cuerpo de las solicitudes como JSON

  app.use(cors());

//

// Ruta para autenticar con Google y generar el token JWT
app.post('/authenticate', async (req, res) => {
  const googleToken = req.body.token;
  try {
    // Decodificar el token de Google
    const decodedToken = jwt.decode(googleToken);
    const userEmail = decodedToken?.email;

    console.log(userEmail)
    if (!userEmail) {
      throw new Error('No se pudo obtener el correo electrónico del usuario desde el token de Google.');
    }

// Verificación si el usuario es de la UABC.
if (userEmail.endsWith('@uabc.edu.mx')) {
  try {
    // Verifica si el correo ya existe en la base de datos
    const existeCorreo = await verificarCorreoExistente(userEmail);

    if (existeCorreo) {
      // Si el correo ya existe, genera un token y se envía al frontend
      const jwtToken = jwt.sign({ email: userEmail }, 'secret', { expiresIn: '1h' });
      res.json({ jwtToken });
    } else {
      // Si el correo no existe, crea un nuevo registro en la base de datos
      await createRegistrado(userEmail);

      // Genera un token y se envía al frontend
      const jwtToken = jwt.sign({ email: userEmail }, 'secret', { expiresIn: '1h' });
      res.json({ jwtToken });
    }
  } catch (error) {
    console.error('Error al verificar el correo en la base de datos:', error);
    res.status(500).json({ error: 'Error al verificar el correo en la base de datos' });
  }
} else {
  // Si la dirección de correo no es válida, envía un mensaje de error al frontend
  res.status(400).json({ error: 'Correo no válido para el registro' });
}
  } catch (error) {
    res.status(500).json({ error: 'Error al autenticar con Google' });
  }
});
  
//

// Rutas protegidas con Passport
app.get('/', miPassport.authenticate('jwt', { session: false }), (req, res) => {
    res.end("Hola Usuario Autenticado");
});

// RUTAS GET PARA OBTENER TODOS LOS REGISTROS
// Ruta protegida para obtener todas las personas
app.get('/personas', miPassport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Realizar una consulta a la base de datos para obtener todas las personas
    const personas = await models.Persona.findAll(); // Ajusta el modelo según tu configuración
/*
    const personas = await models.Persona.findAll({
      attributes: ['id', 'rfc', 'nombre', 'createdAt', 'updatedAt'],
    });
*/
    // Enviar las personas como respuesta
    res.json(personas);
  } catch (error) {
    // Manejar cualquier error y enviar una respuesta de error al cliente
    console.error('Error al obtener las personas:', error);
    res.status(500).json({ error: 'Error al obtener las personas' });
  }
});

// Ruta protegida para obtener todos los proyectos
app.get('/proyectos', miPassport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Realizar una consulta a la base de datos para obtener todos los proyectos
    const proyectos = await models.Proyecto.findAll(); // Ajusta el modelo según tu configuración

    // Enviar los proyectos como respuesta
    res.json(proyectos);
  } catch (error) {
    // Manejar cualquier error y enviar una respuesta de error al cliente
    console.error('Error al obtener los proyectos:', error);
    res.status(500).json({ error: 'Error al obtener los proyectos' });
  }
});

// Ruta protegida para obtener todos los donadores
app.get('/donadores', miPassport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Realizar una consulta a la base de datos para obtener todos los donadores
    const donadores = await models.Donador.findAll(); // Ajusta el modelo según tu configuración

    // Enviar los donadores como respuesta
    res.json(donadores);
  } catch (error) {
    // Manejar cualquier error y enviar una respuesta de error al cliente
    console.error('Error al obtener los donadores:', error);
    res.status(500).json({ error: 'Error al obtener los donadores' });
  }
});

app.get('/registrados', miPassport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Realizar una consulta a la base de datos para obtener todas las personas
    const registrados = await models.registrado.findAll(); // Ajusta el modelo según tu configuración
/*
    const personas = await models.Persona.findAll({
      attributes: ['id', 'rfc', 'nombre', 'createdAt', 'updatedAt'],
    });
*/
    // Enviar las personas como respuesta
    res.json(registrados);
  } catch (error) {
    // Manejar cualquier error y enviar una respuesta de error al cliente
    console.error('Error al obtener las personas:', error);
    res.status(500).json({ error: 'Error al obtener las personas' });
  }
});

// RUTAS DELETE
// Ruta para eliminar una persona mediante DELETE
app.delete('/persona/:id', miPassport.authenticate('jwt', { session: false }), async (req, res) => {
  const personaId = req.params.id; // Obtener el ID de la persona desde los parámetros de la URL

  try {
    const result = await deletePersona(personaId);
    console.log('Recibida una solicitud DELETE a /persona');

    res.json(result); // Respondemos con un mensaje de éxito u otra información
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la persona: ' + error.message });
    console.error('Error en la solicitud DELETE a /persona:', error);
  }
});

// Ruta para eliminar un donador mediante DELETE
app.delete('/donador/:id', miPassport.authenticate('jwt', { session: false }), async (req, res) => {
  const donadorId = req.params.id;

  try {
    const result = await deleteDonador(donadorId);
    console.log('Recibida una solicitud DELETE a /donador');

    res.json(result); // Puedes responder con un mensaje de éxito u otra información según tu preferencia
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el donador: ' + error.message });
    console.error('Error en la solicitud DELETE a /donador:', error);
  }
});

// Ruta para eliminar un proyecto mediante DELETE
app.delete('/proyecto/:id', miPassport.authenticate('jwt', { session: false }), async (req, res) => {
  const proyectoId = req.params.id;

  try {
    const result = await deleteProyecto(proyectoId);
    console.log('Recibida una solicitud DELETE a /proyecto');

    res.json(result); // Puedes responder con un mensaje de éxito u otra información según tu preferencia
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el proyecto: ' + error.message });
    console.error('Error en la solicitud DELETE a /proyecto:', error);
  }
});

// RUTAS POST
// Ruta para crear una nueva persona mediante POST
app.post('/persona', miPassport.authenticate('jwt', { session: false }), async (req, res) => {
  const { rfc, nombre } = req.body; // Suponiendo que el cuerpo de la solicitud contiene rfc y nombre

  try {
      const persona = await createPersona(rfc, nombre);
      console.log('Recibida una solicitud POST a /persona');

      res.status(201).json(persona); // Respondemos con el código 201 (Creado) y la persona creada
  } catch (error) {
      res.status(500).json({ error: 'Error al crear una nueva persona: ' + error.message });
      console.error('Error en la solicitud POST a /persona:', error);
  }
});

// Ruta para crear un nuevo donador mediante POST
app.post('/donador', miPassport.authenticate('jwt', { session: false }), async (req, res) => {
  const { idPersona, idProyecto, cantDonada } = req.body; // Suponiendo que el cuerpo de la solicitud contiene nombre, dirección y teléfono

  try {
    const donador = await createDonador(idPersona, idProyecto, cantDonada);
    console.log('Recibida una solicitud POST a /donador');

    res.status(201).json(donador); // Respondemos con el código 201 (Creado) y el donador creado
  } catch (error) {
    res.status(500).json({ error: 'Error al crear un nuevo donador: ' + error.message });
    console.error('Error en la solicitud POST a /donador:', error);
  }
});

// Ruta para crear un nuevo proyecto mediante POST
app.post('/proyecto', miPassport.authenticate('jwt', { session: false }), async (req, res) => {
  const { nombreProyecto, descProyecto, donatarioId } = req.body; // Suponiendo que el cuerpo de la solicitud contiene nombre, descripción y presupuesto

  try {
    const proyecto = await createProyecto(nombreProyecto, descProyecto, donatarioId);
    console.log('Recibida una solicitud POST a /proyecto');

    res.status(201).json(proyecto); // Respondemos con el código 201 (Creado) y el proyecto creado
  } catch (error) {
    res.status(500).json({ error: 'Error al crear un nuevo proyecto: ' + error.message });
    console.error('Error en la solicitud POST a /proyecto:', error);
  }
});

app.post('/registrado', miPassport.authenticate('jwt', { session: false }), async (req, res) => {
  const { correo } = req.body; // Suponiendo que el cuerpo de la solicitud contiene rfc y nombre

  try {
      const registrado = await createRegistrado(correo);
      console.log('Recibida una solicitud POST a /persona');

      res.status(201).json(registrado); // Respondemos con el código 201 (Creado) y la persona creada
  } catch (error) {
      res.status(500).json({ error: 'Error al crear una nueva persona: ' + error.message });
      console.error('Error en la solicitud POST a /persona:', error);
  }
});

// RUTAS PUT
// Ruta para editar una persona mediante PUT
app.put('/persona/:id', miPassport.authenticate('jwt', { session: false }), async (req, res) => {
  const personaId = req.params.id;
  const { rfc, nombre } = req.body; // Suponiendo que el cuerpo de la solicitud contiene rfc y nombre

  try {
    const result = await updatePersona(personaId, rfc, nombre);
    console.log('Recibida una solicitud PUT a /persona');

    res.json(result); // Puedes responder con un mensaje de éxito u otra información según tu preferencia
  } catch (error) {
    res.status(500).json({ error: 'Error al editar la persona: ' + error.message });
    console.error('Error en la solicitud PUT a /persona:', error);
  }
});

// Ruta para editar un proyecto mediante PUT
app.put('/proyecto/:id', miPassport.authenticate('jwt', { session: false }), async (req, res) => {
  const { nombreProyecto, descProyecto, donatarioId } = req.body;
  const proyectoId = req.params.id;

  try {
    // Llamar a la función para editar el proyecto
    const proyectoEditado = await editProyecto(proyectoId, nombreProyecto, descProyecto, donatarioId);

    // Responder con el proyecto editado
    res.json(proyectoEditado);
  } catch (error) {
    // Manejar errores y enviar una respuesta de error al cliente
    console.error('Error al editar el proyecto:', error.message);
    res.status(500).json({ error: 'Error al editar el proyecto' });
  }
});

// Ruta para editar un donador mediante PUT
app.put('/donador/:id', miPassport.authenticate('jwt', { session: false }), async (req, res) => {
  const { idPersona, idProyecto, cantDonada } = req.body;
  const donadorId = req.params.id;

  try {
    // Llamar a la función para editar el donador
    const donadorEditado = await editDonador(donadorId, idPersona, idProyecto, cantDonada);

    // Responder con el donador editado
    res.json(donadorEditado);
  } catch (error) {
    // Manejar errores y enviar una respuesta de error al cliente
    console.error('Error al editar el donador:', error.message);
    res.status(500).json({ error: 'Error al editar el donador' });
  }
});

// Otras funciones
async function findPersonaByRFC(rfc) {
    try {
      const persona = await models.Persona.findOne({
        where: { rfc: rfc },
      });
      return persona;
    } catch (error) {
      throw new Error('Error al buscar la persona por RFC: ' + error.message);
    }
  }
  
  async function findDonadorById(id) {
    try {
      const donador = await models.Donador.findByPk(id);
      return donador;
    } catch (error) {
      throw new Error('Error al buscar el donador por ID: ' + error.message);
    }
  }
  
  async function findProyectoById(id) {
    try {
      const proyecto = await models.Proyecto.findByPk(id);
      return proyecto;
    } catch (error) {
      throw new Error('Error al buscar el proyecto por ID: ' + error.message);
    }
  }

  /*
  // Uso:
  findProyectoById(1)
    .then((proyecto) => console.log(proyecto))
    .catch((error) => console.error(error));

  // Uso:
  findDonadorById(1)
    .then((donador) => console.log(donador))
    .catch((error) => console.error(error));
  
  // Uso:
  findPersonaByRFC('2ASDDS')
    .then((persona) => console.log(persona))
    .catch((error) => console.error(error));
  */

  // Funciones para crear registros
    async function createPersona(rfc, nombre) {
        try {
          const persona = await models.Persona.create({
            rfc: rfc,
            nombre: nombre,
          });
          return persona;
        } catch (error) {
          throw new Error('Error al crear una nueva persona: ' + error.message);
        }
      }

      async function createDonador(idPersona, idProyecto, cantDonada) {
        try {
          const donador = await models.Donador.create({
            idPersona: idPersona,
            idProyecto: idProyecto,
            cantDonada: cantDonada,
          });
          return donador;
        } catch (error) {
          throw new Error('Error al crear un nuevo donador: ' + error.message);
        }
      }

      async function createProyecto(nombreProyecto, descProyecto, donatarioId) { // cambiar por donatarioId
        try {
          const proyecto = await models.Proyecto.create({
            nombreProyecto: nombreProyecto,
            descProyecto: descProyecto,
            donatarioId: donatarioId, // cambiar por donatarioId
          });
          return proyecto;
        } catch (error) {
          throw new Error('Error al crear un nuevo proyecto: ' + error.message);
        }
      }

      async function createRegistrado(correo) {
        try {
          const registrado = await models.registrado.create({
            correo: correo
          });
          return registrado;
        } catch (error) {
          throw new Error('Error al crear un nuevo registro: ' + error.message);
        }
      }

    /*
      // Uso:
      createProyecto('NuevoProyecto', 'Descripción del nuevo proyecto',1)
        .then((proyecto) => console.log('Nuevo proyecto creado:', proyecto))
        .catch((error) => console.error(error));
      */
    /*
      // Uso:
      createDonador(1, 1, 5000)
        .then((donador) => console.log('Nuevo donador creado:', donador))
        .catch((error) => console.error(error));
      */
    /*
      // Uso:
      createPersona('T34M0', 'Nirvana')
        .then((persona) => console.log('Nueva persona creada:', persona))
        .catch((error) => console.error(error));
      */

// Funciones para eliminar registros.
async function deletePersona(personaId) {
  try {
    // Buscar la persona por su ID
    const persona = await models.Persona.findByPk(personaId);

    // Verificar si la persona existe
    if (!persona) {
      throw new Error('Persona no encontrada');
    }

    // Eliminar la persona
    await persona.destroy();

    // Devolver un mensaje de éxito o cualquier otro dato que desees
    return { message: 'Persona eliminada exitosamente' };
  } catch (error) {
    throw new Error('Error al eliminar la persona: ' + error.message);
  }
}

async function deleteDonador(donadorId) {
  try {
    // Buscar el donador por su ID
    const donador = await models.Donador.findByPk(donadorId);

    // Verificar si el donador existe
    if (!donador) {
      throw new Error('Donador no encontrado');
    }

    // Eliminar el donador
    await donador.destroy();

    // Devolver un mensaje de éxito o cualquier otro dato que desees
    return { message: 'Donador eliminado exitosamente' };
  } catch (error) {
    throw new Error('Error al eliminar el donador: ' + error.message);
  }
}

async function deleteProyecto(proyectoId) {
  try {
    // Buscar el proyecto por su ID
    const proyecto = await models.Proyecto.findByPk(proyectoId);

    // Verificar si el proyecto existe
    if (!proyecto) {
      throw new Error('Proyecto no encontrado');
    }

    // Eliminar el proyecto
    await proyecto.destroy();

    // Devolver un mensaje de éxito o cualquier otro dato que desees
    return { message: 'Proyecto eliminado exitosamente' };
  } catch (error) {
    throw new Error('Error al eliminar el proyecto: ' + error.message);
  }
}

// Funciones para editar registros.
async function updatePersona(id, rfc, nombre) {
  try {
    const persona = await models.Persona.findByPk(id); // Buscamos la persona por su ID

    if (!persona) {
      throw new Error('Persona no encontrada');
    }

    // Actualizamos los datos de la persona
    persona.rfc = rfc;
    persona.nombre = nombre;

    // Guardamos los cambios en la base de datos
    await persona.save();

    return persona; // Puedes retornar la persona actualizada o un mensaje de éxito según tu preferencia
  } catch (error) {
    throw new Error('Error al editar la persona: ' + error.message);
  }
}

// Función para editar un proyecto
async function editProyecto(id, nombreProyecto, descProyecto, donatarioId) {
  try {
    // Buscar el proyecto por ID
    const proyecto = await models.Proyecto.findByPk(id);

    // Verificar si el proyecto existe
    if (!proyecto) {
      throw new Error('Proyecto no encontrado');
    }

    // Actualizar los campos del proyecto
    proyecto.nombreProyecto = nombreProyecto;
    proyecto.descProyecto = descProyecto;
    proyecto.donatarioId = donatarioId; // cambiar por donatarioId

    // Guardar los cambios en la base de datos
    await proyecto.save();

    return proyecto;
  } catch (error) {
    throw new Error('Error al editar el proyecto: ' + error.message);
  }
}

// Función para editar un donador
async function editDonador(id, idPersona, idProyecto, cantDonada) {
  try {
    // Buscar el donador por ID
    const donador = await models.Donador.findByPk(id);

    // Verificar si el donador existe
    if (!donador) {
      throw new Error('Donador no encontrado');
    }

    // Actualizar los campos del donador
    donador.idPersona = idPersona;
    donador.idProyecto = idProyecto;
    donador.cantDonada = cantDonada;

    // Guardar los cambios en la base de datos
    await donador.save();

    return donador;
  } catch (error) {
    throw new Error('Error al editar el donador: ' + error.message);
  }
}

async function verificarCorreoExistente(correo) {
  try {
    // Busca un registro con el correo dado en la base de datos
    const registro = await models.registrado.findOne({
      where: {
        correo: correo,
      },
    });

    // Si el registro existe, devuelve true; de lo contrario, devuelve false
    return !!registro;
  } catch (error) {
    // Maneja cualquier error que pueda ocurrir durante la consulta
    console.error('Error al verificar el correo en la base de datos:', error);
    throw new Error('Error al verificar el correo en la base de datos');
  }
}