const models = require("./models");

const proyectoId = 3; // El ID del proyecto al que se desea asignar una persona donataria
const personaId = 1; // El ID de la persona a la que se desea asignar como donataria

models.Proyecto.findByPk(proyectoId)
.then(proyecto => {
  if (proyecto) {
    models.Persona.findByPk(personaId)
    .then(persona => {
      if (persona) {
        proyecto.setDonatario(persona)
        .then(() => {
          console.log('Donatario asignado con éxito al proyecto');
        })
        .catch(error => {
          console.error('Error al asignar el donatario al proyecto:', error);
        });
      } else {
        console.log('La persona no se encontró');
      }
    })
    .catch(error => {
      console.error('Error al consultar la persona:', error);
    });
  } else {
    console.log('El proyecto no se encontró');
  }
})
.catch(error => {
  console.error('Error al consultar el proyecto:', error);
});

models.Proyecto.findByPk(proyectoId, {
    include: [
      {
        model: models.Persona,
        as: 'donatario',
      },
    ],
  })
  .then(proyecto => {
    if (proyecto) {
      console.log('Proyecto actualizado:', proyecto.dataValues);
      if (proyecto.donatario) {
        console.log('Donatario:', proyecto.donatario.dataValues);
      }
    } else {
      console.log('El proyecto no se encontró');
    }
  })
  .catch(error => {
    console.error('Error al consultar el proyecto actualizado:', error);
  });