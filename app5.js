const models = require('./models');

const realizarOperaciones = async () => {
  try {
    // Realiza tus operaciones de base de datos aquí
    const proyecto = await models.Proyecto.findByPk(1);
    const persona = await models.Persona.findByPk(2);

    // Ejemplo: Asigna un donatario
    await proyecto.setDonatario(persona);

    // Ejemplo: Agrega donadores
    await proyecto.createDonador({
      idPersona: persona.id,
      cantDonada: 0,
    });

    // Otros pasos aquí...

    // Luego, cierra la conexión de Sequelize
    await models.sequelize.close();
  } catch (error) {
    console.error('Error en las operaciones de base de datos:', error);
    await models.sequelize.close();
  }
};

realizarOperaciones();
