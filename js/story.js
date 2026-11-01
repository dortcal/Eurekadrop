/* ==========================================================
   EUREKA DROP · story.js
   Guion: escenas breves, diálogos de guardianes, misiones
   secundarias, reliquias coleccionables y el rival Rayo.
   ========================================================== */
(function (EZ) {
  'use strict';
  const S = (EZ.story = {});

  S.intro = [
    { who: 'borron', text: '¡JA, JA, JA! ¡Me he tragado la Gran Enciclopedia Viva! Pronto nadie recordará ni las tablas de multiplicar.' },
    { who: 'chispa', text: 'Soy Chispa, el búho-dron de David OZC, que ha diseñado este juego. ¡Bienvenido a Eureka Drop!' },
    { who: 'chispa', text: '¡Alerta máxima! El archipiélago Eureka se ha partido en cinco islas y sus guardianes están cubiertos de tinta.' },
    { who: 'chispa', text: 'Necesito a alguien curioso, valiente y con buena puntería mental. ¿Tú? ¡Perfecto, sube al globo!' },
    { who: 'rayo', text: 'Je, ¿ese es tu héroe, Chispa? Yo recuperaré los fragmentos antes. ¡Mis récords son imbatibles!' },
    { who: 'chispa', text: 'Ignora a Rayo. Recupera los cinco Fragmentos Eureka y liberaremos a los guardianes. ¿Preparado? ¡DROP!' }
  ];
  S.ending = [
    { who: 'chispa', text: '¡Lo has conseguido! La Gran Enciclopedia Viva vuelve a brillar y las cinco islas están unidas otra vez.' },
    { who: 'rayo', text: 'Vale, vale… eres mejor que yo. Por ahora. ¿Revancha en el Desafío del Día?' },
    { who: 'chispa', text: 'Descarga tu diploma, Sabio Eureka. ¡Te lo has ganado a pulso!' }
  ];

  S.arrive = {
    mat: 'Numérica City: aquí hasta las farolas sabían dividir. ¡Ahora Calculatrón dice que 2 + 2 = pez!',
    len: 'Biblioteca Infinita: los libros han perdido sus letras y Doña Tilde pone tildes donde no toca. ¡Qué drama ortográfico!',
    med: 'Isla Volcana, tierra de dragos y malpaís. Magmo lo ha mezclado todo… ¡hay un pingüino tomando el sol en el volcán!',
    ing: 'Port Hello, el puerto internacional. Captain Polyglot ha olvidado los idiomas y solo dice «¿qué?» en catorce acentos.',
    ef: 'Estadio Turbo. Rinoturbo era el mejor entrenador… hasta que el Borrón le borró el calentamiento. ¡Se lesiona hasta bostezando!',
    mix: 'Desafío del Día: el Borrón ha mezclado retos de TODAS las islas. ¡Hoy toca un poco de todo!',
    final: 'La nube del Borrón. Con los cinco fragmentos podemos devolver la Enciclopedia. ¡Es ahora o nunca!'
  };

  S.boss = {
    mat: { name: 'Calculatrón', taunt: 'CALCULANDO… TU DERROTA ES 100 % + 1. ¡ERROR! ¡ERROR! ¡NO QUIERO SABER LA RESPUESTA!', freed: 'Recalculando… ¡2 + 2 = 4! ¡Qué alivio! Toma el Cristal Pi: tiene infinitos decimales de agradecimiento.' },
    len: { name: 'Doña Tilde', taunt: '¡Shhhh! Ésto es una vivlioteca… ¡Ay! ¡El Borrón me lía las letras! ¡Fuera de mis estanterías!', freed: '¡Cada tilde en su sitio, por fin! Llévate la Pluma Infinita: nunca escribe faltas… si tú no la dejas.' },
    med: { name: 'Magmo', taunt: 'GRRR… las lagartijas vuelan, los peces escalan… ¡ya no sé nada! ¡FUERA DE MI VOLCÁN!', freed: 'Uf, qué dolor de cráter. Gracias por recordarme que la naturaleza se cuida. Aquí tienes la Semilla Gaia.' },
    ing: { name: 'Captain Polyglot', taunt: '¿Qué? What? Quoi? ¡SQUAWK! I am… yo soy… ¡No me entiendo ni yo!', freed: 'Thank you! ¡Gracias! Take the Babel Compass: it always points to new friends.' },
    ef: { name: 'Rinoturbo', taunt: '¡SIN CALENTAR! ¡A TODA VELOCIDAD! ¡Las reglas son para los aburridos! ¡EMBESTIDA!', freed: '¡Primero calentar, luego correr! Ya me acuerdo. Toma el Silbato Turbo. ¡Juego limpio siempre!' },
    mix: { name: 'Borroncito Gigante', taunt: '¡He venido a mezclar asignaturas! ¡Fracciones en inglés con sentadillas!', freed: '¡Vale, vale! Me vuelvo a mi charco. Hasta mañana…' },
    final: { name: 'El Borrón', taunt: '¿Cinco fragmentos? ¡Bah! Soy todos los deberes sin repasar del universo. ¡No puedes borrarme!', freed: 'Nooo… me estoy… aclarando… Oye, pues ser una nube blanquita no está tan mal. Gracias, supongo.' }
  };

  S.quest = {
    mat: { name: 'Ingeniera Tuerca', item: 'engranajes', text: '¡Se me han caído 3 engranajes por la ciudad! Sin ellos mi calculadora gigante no arranca. ¿Me ayudas?' },
    len: { name: 'Poeta Rimador', item: 'páginas', text: 'He perdido 3 páginas de mi poema… ¡y ya no rima ni con «queso»! ¿Las buscas por mí?' },
    med: { name: 'Bióloga Brezo', item: 'semillas', text: '¡Mis 3 semillas de tajinaste se han esparcido! Es una planta endémica de Canarias. ¡Ayúdame a recuperarlas!' },
    ing: { name: 'Tourist Tom', item: 'postcards', text: 'Excuse me! I lost 3 postcards. Can you help me find them, please? (¡Busca 3 postales!)' },
    ef: { name: 'Árbitra Ágata', item: 'silbatos', text: '¡Mis 3 silbatos han desaparecido! Sin silbato no hay juego limpio. ¿Los encuentras?' },
    mix: { name: 'Rayo', item: 'estrellas', text: 'Vale… no se lo digas a nadie, pero he perdido 3 estrellas de mi colección. ¿Me echas un cable?' }
  };

  /** Reliquias: 3 por isla (una por nivel) + 3 del Desafío del Día. */
  S.relics = {
    mat: ['Ábaco dorado', 'Compás estelar', 'Dado de Pitágoras'],
    len: ['Tintero mágico', 'Marcapáginas eterno', 'Diccionario de bolsillo'],
    med: ['Fósil de ammonites', 'Flor de tajinaste', 'Lupa de naturalista'],
    ing: ['Postcard from London', 'Pasaporte sellado', 'Mini globo terráqueo'],
    ef: ['Medalla de la amistad', 'Zapatilla alada', 'Cronómetro dorado'],
    mix: ['Reloj de arena del día', 'Moneda del tiempo', 'Estrella fugaz']
  };

  /** Récords del rival Rayo (para picarse). */
  S.rival = (area, level) => [0, 2600, 4200, 6400][level] + (area === 'final' ? 2000 : 0);
})(window.EZ);
