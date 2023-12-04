const models = require("./models");
//models.sequelize.sync().then(()=>)
models.Proyecto.findAll()
.then(r=>{
    r.forEach(proyecto=>{
        console.log(proyecto.dataValues);
    });
    //models.sequelize.close();
});
//});

//models.sequelize.sync().then(()=>)
models.Persona.findAll()
.then(r=>{
    r.forEach(persona=>{
        console.log(persona.dataValues);
    });
    //models.sequelize.close();
});
//});

models.Donador.findAll()
  .then((r) => {
    r.forEach((donador) => {
      console.log(donador.dataValues);
    });
  })
  .catch((error) => {
    console.error('Error al listar los donadores:', error);
  })
  .finally(() => {
    //models.sequelize.close();
  });
/*
  const agregaDonadores = async () => {
    const proy = await models.Proyecto.findByPk(1);
    const pers = await models.Persona.findByPk(2);
    console.log("Función Agregar Donadores.");
    console.log("Nombre del Donador agregado: "+pers.nombre);
    console.log("Nombre del Proyecto al que el Donador Dona: "+proy.nombreProyecto);
    // Usamos el método add/setDonador para asociar el donador con el proyecto
    await proy.setDonadores(pers);
  
    // Recuperamos la lista de donadores asociados al proyecto
    const donadores = await proy.getDonadores();
  
    // Iteramos a través de los donadores y mostramos sus nombres
    await donadores.forEach(donador => {
      console.log("Id de la Persona Donante: "+donador.idPersona);
    });
  }

  const agregaDonatario = async () => {
    const proy = await models.Proyecto.findByPk(1);
    const pers = await models.Persona.findByPk(2);
  
    // Usamos el método setDonatario para establecer el donatario del proyecto
    await proy.setDonatario(pers);
  
    // Recuperamos el donatario asociado al proyecto
    const donatario = await proy.getDonatario();
  
    // Mostramos el nombre del donatario en la consola
    if (donatario) {
      console.log("Función Agregar Donatario.");
      console.log("Nombre del Donatario: "+donatario.nombre);
      console.log("Nombre del Proyecto del Donatario: "+proy.nombreProyecto);
    } else {
      console.log("El proyecto no tiene donatario asignado.");
    }
  }

  //console.log(" = Donatarios =");
    agregaDonatario();

  //console.log(" = Donadores = ");
    agregaDonadores();
    */