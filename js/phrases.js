/* ==========================================================
   EUREKA DROP · phrases.js
   Bancos de frases (derrota, victoria, rachas, reacciones).
   No se repite ninguna de las 3 últimas frases del jugador.
   ========================================================== */
(function (EZ) {
  'use strict';
  const P = (EZ.phrases = {});

  P.lose = [
    '¡El Borrón te ha mandado de vacaciones antes de tiempo!',
    '¡Tu personaje ha pedido la baja por exceso de aventuras!',
    '¡Hasta el mapa se ha quedado sin palabras!',
    '¡La misión ha podido contigo… por ahora!',
    '¡Necesitas recargar las neuronas antes de volver!',
    '¡Chispa ha tenido que llamar a la grúa de héroes!',
    '¡Los Borroncitos están celebrando una fiesta… a tu costa!',
    '¡Tu cerebro ha entrado en modo ahorro de energía!',
    '¡Error 404: héroe no encontrado (temporalmente)!',
    '¡El globo te ha recogido justo a tiempo para un descanso!',
    '¡Las islas te echan de menos! Vuelve con más fuerza.',
    '¡Has descubierto 37 formas nuevas de no ganar! Eso también es ciencia.',
    '¡Un tropiezo no es un final, es un calentamiento!',
    '¡Tus zapatillas han dicho «basta» por hoy!',
    '¡El Borrón se ha reído tanto que le ha dado hipo!',
    '¡Misión en pausa: el héroe necesita un bocadillo!',
    '¡Te has quedado sin corazones, pero no sin cabeza!',
    '¡Hasta los genios se tropiezan con sus propios cordones!',
    '¡El guardián dice que la revancha está permitida!',
    '¡Cuidado, que el Borrón se está acostumbrando a ganar!',
    '¡Tu brújula interior ha perdido el norte un momentito!',
    '¡Has sido borroneado! Por suerte, la tinta se quita.',
    '¡Chispa ha anotado tus errores para que la próxima vez los esquives!',
    '¡La isla ha ganado esta ronda, pero la partida no ha terminado!',
    '¡Tus neuronas piden prórroga!',
    '¡Fin del episodio! Próximamente: «La gran remontada».',
    '¡Has caído con estilo, eso hay que reconocerlo!',
    '¡El marcador dice «casi», y «casi» es el primo de «ya casi»!',
    '¡Un Borroncito te ha robado la merienda y la concentración!',
    '¡Hoy no, pero mañana sí! Así se forjan las leyendas.',
    '¡Tu energía Eureka está en la reserva!',
    '¡Has gastado todas las vidas… y ninguna excusa!',
    '¡La aventura te ha dado un tirón de orejas cariñoso!',
    '¡Los guardianes han pedido el VAR y han dado por buena la derrota!',
    '¡Tu globo necesita repostar sabiduría!',
    '¡El Borrón se ha apuntado un punto. Tú, una lección!',
    '¡Hasta el mejor sabio necesita repasar los apuntes!',
    '¡Has desbloqueado el logro secreto «Volveré»! (Bueno, casi.)',
    '¡Chispa ha hecho un drama épico por tu caída! Vuelve a animarla.',
    '¡Tu cerebro ha pulsado el botón de reinicio!',
    '¡Fallaste… pero ahora sabes justo dónde mejorar!',
    '¡Los Borroncitos ya están temblando por tu próxima partida!',
    '¡Has perdido la batalla, no la memoria de lo aprendido!',
    '¡El mapa ha decidido que necesitas otra vuelta!',
    '¡Has tocado fondo… del archipiélago! Toca subir.',
    '¡La tinta ha ganado hoy. Mañana, el papel en blanco es tuyo!',
    '¡Respira, estira y vuelve: así se entrena un campeón!',
    '¡Tu aventura ha terminado en un bonito aterrizaje forzoso!',
    '¡Has sido derrotado por la gravedad del conocimiento!',
    '¡La revancha te está esperando con la puerta abierta!'
  ];

  P.win = [
    '¡Eres oficialmente una amenaza para el Borrón!',
    '¡Tu cerebro acaba de subir de nivel!',
    '¡La isla entera grita tu nombre! (Bueno, Chispa lo grita por todos.)',
    '¡Misión cumplida con matrícula de honor aventurera!',
    '¡Los Borroncitos están pensando en cambiar de profesión!',
    '¡Has dejado el listón tan alto que hace falta una escalera!',
    '¡Victoria! Hasta las piedras de la isla aplauden.',
    '¡Leyenda en construcción: progreso al 100 %!',
    '¡Has convertido la tinta en confeti!',
    '¡Chispa ha llorado de emoción (y se le ha empañado la cámara)!',
    '¡El guardián te debe una gorda!',
    '¡Sabiduría desbloqueada, enemigo despejado!',
    '¡Tus neuronas están haciendo la ola!',
    '¡El conocimiento ha vuelto a casa gracias a ti!',
    '¡Pocas veces se ha visto tanto talento en tan poco tiempo!',
    '¡El Borrón ha tenido que buscar «derrota» en el diccionario!',
    '¡Eres más rápido que una calculadora con prisa!',
    '¡Victoria limpia, sin manchas de tinta!',
    '¡Has iluminado el archipiélago entero!',
    '¡Tu globo vuela hoy un poquito más alto!',
    '¡Fenomenal! Esto se cuenta en los libros de historia de las islas.',
    '¡Bravo! Has demostrado que el saber sí ocupa lugar: ¡el primero!',
    '¡Has ganado y encima has aprendido! Doble premio.',
    '¡Aventura superada con estilo de campeonato!',
    '¡El mapa necesita un color nuevo para marcar tu victoria!',
    '¡Has hecho que el Borrón se quede en blanco!',
    '¡Eureka! Y esta vez el grito es tuyo.',
    '¡Has dejado a los guardianes con la boca abierta!',
    '¡Cerebro legendario confirmado por expertos (Chispa)!',
    '¡Ni una nube de tinta puede con tu brillo!',
    '¡Tu racha de aventuras es imparable!',
    '¡Los Borroncitos han firmado la rendición!',
    '¡Qué partidazo! El estadio se ha venido arriba.',
    '¡Has juntado cabeza y corazón: combinación ganadora!',
    '¡Has borrado al Borrón de este territorio!',
    '¡El archipiélago respira tranquilo gracias a ti!',
    '¡Tu nombre ya brilla en el diario de aventuras!',
    '¡Victoria épica! Que suene la música.',
    '¡Has convertido cada error en un escalón!',
    '¡Nivel de genio activado y verificado!',
    '¡Has ganado con más ingenio que un búho con gafas!',
    '¡Esto no ha sido suerte: ha sido sabiduría!',
    '¡Los guardianes te quieren en su equipo!',
    '¡Has escrito un final feliz sin una sola falta!',
    '¡Has vuelto a encender la Gran Enciclopedia Viva!'
  ];

  P.streak = {
    3: '¡RACHA IMPARABLE!', 5: '¡CEREBRO LEGENDARIO!', 8: '¡NIVEL DE GENIO ACTIVADO!', 10: '¡NO HAY QUIEN TE PARE!',
    13: '¡MODO EUREKA TOTAL!', 16: '¡SUPERNOVA DEL SABER!', 20: '¡LEYENDA VIVIENTE!'
  };

  P.correct = ['¡Correcto!', '¡Bien visto!', '¡Exacto!', '¡Así se hace!', '¡Clavado!', '¡Impecable!', '¡Eso es!', '¡Brillante!', '¡Perfecto!', '¡Toma ya!'];
  P.wrong = ['¡Ups!', '¡Casi!', '¡Por poco!', '¡Ay, ay, ay!', '¡Uy!', '¡Esa se resiste!'];

  P.chispaWrong = [
    'Chispa: «Tranqui, hasta yo confundí una vez un búho con una lechuza. Bueno, dos veces.»',
    'Chispa: «Lee la explicación: es el atajo secreto para la próxima.»',
    'Chispa: «¡Los errores son pistas disfrazadas!»',
    'Chispa: «Respira. Mi hélice también se lía a veces.»',
    'Chispa: «El Borrón se ha reído… ¡pero nosotros reímos los últimos!»',
    'Chispa: «Anotado en mi libreta de “cosas que vamos a dominar”.»',
    'Chispa: «Fallar es de valientes. Rendirse no está en el menú.»',
    'Chispa: «¡Mira la respuesta correcta! Así tu cerebro la guarda.»'
  ];
  P.chispaHurt = ['¡Ay! ¡Cuidado con la tinta!', '¡Esquiva, esquiva!', '¡Uf, eso ha dolido a mis circuitos!', '¡Salta por encima la próxima vez!', '¡Vigila el suelo!'];

  /** Elige una frase evitando las 3 últimas guardadas para ese tipo. */
  P.pick = function (kind) {
    const list = P[kind];
    const recent = EZ.save.phrases[kind] || [];
    const options = list.map((_, i) => i).filter((i) => !recent.includes(i));
    const i = options[Math.floor(Math.random() * options.length)];
    recent.push(i);
    while (recent.length > 3) recent.shift();
    EZ.save.phrases[kind] = recent;
    return list[i];
  };
})(window.EZ);
