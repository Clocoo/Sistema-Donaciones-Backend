const models = require("./models");

// Función para listar proyectos
const listarProyectos = async () => {
  try {
    const proyectos = await models.Proyecto.findAll();
    proyectos.forEach((proyecto) => {
      console.log(proyecto.dataValues);
    });
  } catch (error) {
    console.error('Error al listar proyectos:', error);
  }
};

// Función para listar personas
const listarPersonas = async () => {
  try {
    const personas = await models.Persona.findAll();
    personas.forEach((persona) => {
      console.log(persona.dataValues);
    });
  } catch (error) {
    console.error('Error al listar personas:', error);
  }
};

// Función para listar donadores
const listarDonadores = async () => {
  try {
    const donadores = await models.Donador.findAll();
    donadores.forEach((donador) => {
      console.log(donador.dataValues);
    });
  } catch (error) {
    console.error('Error al listar donadores:', error);
  }
};

// Función para agregar donatarios y donadores
const agregarDonatariosYDonadores = async () => {
  try {
    const proy = await models.Proyecto.findByPk(1);
    const pers = await models.Persona.findByPk(2);

    // Agregar donatario al proyecto
    await proy.setDonatario(pers);

    // Agregar donador al proyecto
    await proy.addDonador(pers);

    // Recuperar el donatario
    const donatario = await proy.getDonatario();

    // Mostrar el donatario
    if (donatario) {
      console.log(donatario.nombre);
    } else {
      console.log("El proyecto no tiene donatario asignado.");
    }

    // Recuperar donadores
    const donadores = await proy.getDonadores();

    // Mostrar los nombres de los donadores
    donadores.forEach((donador) => {
      console.log(donador.nombre);
    });
  } catch (error) {
    console.error('Error al agregar donatario o donador:', error);
  }
};

// Realizar las operaciones en el orden adecuado
listarProyectos()
  .then(() => listarPersonas())
  .then(() => listarDonadores())
  .then(() => agregarDonatariosYDonadores())
  .then(() => {
    // Cerrar la conexión a la base de datos
    models.sequelize.close();
  })
  .catch((error) => {
    console.error('Error general:', error);
    models.sequelize.close();
  });
