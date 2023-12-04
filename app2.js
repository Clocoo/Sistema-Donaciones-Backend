  const agregaDonadores = async () => {
    const proy = await models.Proyecto.findByPk(1);
    const pers = await models.Persona.findByPk(2);
  
    // Usamos el método createDonador para agregar un donador al proyecto
    const donador = await proy.createDonador({
      idPersona: pers.id, // Asegúrate de que idPersona sea el campo correcto
      cantDonada: 0, // Otra información del donador
    });
  
    // Recuperamos la lista de donadores asociados al proyecto
    const donadores = await proy.getDonadores();
  
    // Iteramos a través de los donadores y mostramos sus nombres
    donadores.forEach((donador) => {
      console.log(donador.nombre);
    });
  }