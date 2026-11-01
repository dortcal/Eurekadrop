# EUREKA DROP

**Videojuego educativo de aventuras para Educación Primaria (de 1.º a 6.º), con preguntas y dificultad adaptadas a cada curso.**

*Diseñado por David OZC · 2026 · Licencia CC BY-NC-ND 4.0 · Uso gratuito en centros educativos.*
Cinco islas, un borrón gigante y toda tu sabiduría: explora, salta, resuelve retos y libera a los guardianes de Matemáticas, Lengua, Conocimiento del Medio, Inglés y Educación Física.

Funciona en el navegador (ordenador, tableta y móvil), sin instalar nada, sin registro, sin anuncios y sin compras. Después de la primera visita también funciona **sin conexión**.

---

## Características

- **Exploración real**: personaje controlable en escenarios 2.5D con puertas, cofres, interruptores, zonas secretas, suelos que se desmoronan, trampas intermitentes y enemigos (los Borroncitos) que puedes explotar saltándoles encima.
- **Cinco territorios con mecánica propia** (no son preguntas):
  - Numérica City · *Cristales de energía*: suma exacta con naturales, decimales y negativos.
  - Biblioteca Infinita · *Letras perdidas*: escribe palabras saltando sobre letras (b/v, h, tildes…).
  - Isla Volcana · *Restaura el ecosistema*: clasifica llevando objetos a su zona.
  - Port Hello · *Follow directions*: un turista te guía en inglés (con voz) hasta un edificio.
  - Estadio Turbo · *Pista Turbo* (carrera de obstáculos) y *Calentamiento al ritmo* (secuencias).
- **Guardianes finales** con patrones de ataque distintos; se derrotan con *orbes del saber* (retos).
- **8 formatos de reto**: elección múltiple, verdadero/falso, respuesta escrita, ordenar, colocar en huecos, relacionar, señalar en imagen (mapa de Canarias, coordenadas, gráficos) y escuchar (voz del navegador). Muchos incluyen gráficos, tablas, ángulos, fracciones o relojes.
- **Elige tu curso (1.º a 6.º):** las preguntas, las mecánicas de cada isla y la dificultad se ajustan al nivel. En 1.º-3.º hay más vidas, pistas gratis, enemigos y jefes más lentos, sin eventos con prisa y lectura en voz alta; en 4.º-5.º, apoyos intermedios. Pensado para que cualquier alumno pueda jugar y mejorar. Ver `docs/curriculo-canarias.md`.
- **Más de 900 retos** (y cálculo mental generado al vuelo en 1.º-5.º) en archivos JSON independientes + datos de las mecánicas. Informe por curso y tema en `docs/cobertura-preguntas.md`.
- **Memoria Eureka:** minijuego de parejas (palabra ↔ significado, operación ↔ resultado…) con contenido del curso, sin tiempo límite.
- **Botón «Leer»** en cada reto para escuchar la pregunta (voz del navegador).
- **Modos**: Historia (5 islas × 3 fases + combate final), Rápido (cualquier área y nivel) y **Desafío del Día** (mezcla de áreas, recompensa diaria y racha).
- **Niveles** Explorador / Aventurero / Leyenda y **dificultad adaptativa** dentro de la partida.
- Vidas, puntuación con rachas y multiplicadores, monedas, pistas, logros (22), reliquias (18), accesorios desbloqueables y rival (Rayo).
- **Eventos sorpresa**: tormenta de tinta, cofre dorado contrarreloj, pregunta relámpago y lluvia de monedas.
- **Revisión de errores** con respuesta correcta y explicación; **estadísticas** por área y bloque; **diario de aventuras**.
- **Diploma** personalizado descargable en PNG o PDF (generado en el propio navegador).
- Música y efectos **originales sintetizados por código** (Web Audio), con volúmenes separados y silencio.
- Accesibilidad: teclado completo, botones grandes, letra grande opcional, reducir animaciones, sin límite de tiempo obligatorio, información nunca solo por color.

## Controles

| Acción | Teclado | Ratón | Táctil |
|---|---|---|---|
| Moverse (mantener = correr) | Flechas o WASD | — | Cruceta (izquierda) |
| Saltar | Espacio | — | Botón SALTO |
| Interactuar / confirmar | Enter | Clic | Botón ACCIÓN |
| Elegir respuesta | 1-4 o A-D, Tab + Enter | Clic | Toque |
| Pausa | Esc o P | Botón ⏸ | Botón ⏸ |

## Cómo jugar

1. Pulsa **JUGAR**. La primera vez verás la historia y podrás crear tu personaje.
2. En el **mapa** elige una isla y una fase. Al superar la fase 1 de una isla se desbloquea la siguiente.
3. En cada fase: recorre las salas, resuelve las **puertas selladas**, supera la **sala de mecánica**, busca la **pared agrietada** que esconde la zona secreta y llega al **guardián**.
4. Contra el guardián, coge los orbes **?** y acierta para lanzárselos. Esquiva sus ataques.
5. Al final verás tus resultados, podrás **revisar los errores** y descargar tu **diploma**.

## Estructura del proyecto

```
eureka-drop/
├── index.html              Página única del juego
├── manifest.webmanifest    Datos de la app instalable (PWA)
├── sw.js                   Service Worker (modo sin conexión)
├── .nojekyll               Para que GitHub Pages sirva todo tal cual
├── css/
│   ├── style.css           Base, botones, capas y avisos
│   ├── menu.css            Pantallas y menús
│   └── game.css            HUD, retos, diálogos, controles táctiles, minijuegos
├── js/
│   ├── util.js             Utilidades y lista de áreas
│   ├── storage.js          Guardado automático (localStorage)
│   ├── icons.js            Iconos SVG
│   ├── audio.js            Música y efectos sintetizados, voz
│   ├── questions.js        Carga, selección y corrección de preguntas
│   ├── challenges.js       Interfaz de los 8 formatos de reto y sus gráficos
│   ├── art.js              Todo el dibujo (personajes, jefes, escenarios)
│   ├── level-gen.js        Generación de las fases
│   ├── mechanics.js        Mecánica exclusiva de cada territorio
│   ├── minigames.js        Minijuegos de Educación Física
│   ├── controls.js         Teclado, ratón y táctil
│   ├── phrases.js          Frases de victoria, derrota y rachas
│   ├── story.js            Guion, guardianes, misiones y reliquias
│   ├── scoring.js          Reglas de puntuación
│   ├── progression.js      Logros, historia, desafío diario, estadísticas
│   ├── game-engine.js      Bucle de juego, física, enemigos, jefes, eventos
│   ├── stats.js            Panel de seguimiento del aprendizaje
│   ├── diploma.js          Diploma PNG/PDF
│   ├── ui.js               Pantallas, menús, selector de curso, créditos y pie de licencia
│   ├── memory.js           Minijuego «Memoria Eureka»
│   └── main.js             Arranque
├── data/
│   ├── matematicas.json        74 retos originales (5.º-6.º)
│   ├── lengua.json             72 retos + palabras de «Letras perdidas» (con etiqueta de curso)
│   ├── conocimiento-medio.json 92 retos + clasificaciones (con etiqueta de curso)
│   ├── ingles.json             70 retos + lugares de «Follow directions»
│   ├── educacion-fisica.json   52 retos + movimientos y consejos
│   ├── *-cursos.json           Banco ampliado por cursos (1.º-6.º); campo "cursos": [mín, máx]
│   └── bundle.js               Copia generada para abrir sin servidor
├── assets/icons/           Iconos de la app
├── tools/
│   ├── content/*.py        Fuente de las preguntas por curso (se escriben en Python)
│   ├── build-questions.py  Regenera los *-cursos.json, el bundle y comprueba la estructura
│   ├── coverage-report.py  Informe de preguntas por curso y bloque
│   ├── build-bundle.py     Regenera data/bundle.js
│   ├── check-questions.py  Revisa la estructura de los JSON
│   └── test-bot.js         Pruebas automáticas en el navegador (desarrollo)
├── docs/guia-del-juego.md  Documento de diseño y guía docente
├── docs/curriculo-canarias.md  Relación con el currículo y estado de la verificación
└── docs/cobertura-preguntas.md Preguntas por curso y bloque
```

No hay carpetas de imágenes ni de música: todos los gráficos y sonidos se generan por código. Así el juego pesa poco, carga rápido y no usa recursos de terceros.

## Publicar en GitHub Pages (paso a paso)

1. Crea una cuenta gratuita en <https://github.com> si no la tienes.
2. Pulsa **New repository**, ponle un nombre (por ejemplo `eureka-drop`), márcalo como **Public** y pulsa **Create repository**.
3. En la página del repositorio, pulsa **uploading an existing file** (o *Add file → Upload files*).
4. Arrastra **el contenido** de la carpeta `eureka-drop` (no la carpeta en sí): `index.html`, `sw.js`, las carpetas `css`, `js`, `data`, etc. Pulsa **Commit changes**.
   - El archivo `.nojekyll` empieza por punto y algunos sistemas lo ocultan. Si no se sube, no pasa nada grave, pero conviene incluirlo.
5. Ve a **Settings → Pages**. En *Source* elige **Deploy from a branch**, rama **main** y carpeta **/ (root)**. Pulsa **Save**.
6. Espera uno o dos minutos y recarga la página de Settings: aparecerá la dirección, del tipo `https://TU-USUARIO.github.io/eureka-drop/`.
7. Abre esa dirección y comparte el enlace con tu alumnado.

> **Abrir sin internet ni servidor:** también puedes abrir `index.html` con doble clic. En ese caso el juego usa `data/bundle.js` y no se activa el modo sin conexión (PWA), que solo funciona desde una dirección web.

## Actualizar el juego

1. Sube los archivos modificados a GitHub (mismo método: *Add file → Upload files*, sustituyendo los antiguos).
2. **Importante:** abre `sw.js` y cambia el número de `VERSION` (por ejemplo `v1.0.0` → `v1.0.1`). Así los navegadores descargan la versión nueva.
3. Los jugadores verán los cambios la siguiente vez que abran el juego (a veces hace falta recargar dos veces).

## Añadir o corregir preguntas

Las preguntas por curso se escriben en `tools/content/*.py` y se generan con `python3 tools/build-questions.py` (también regenera `data/bundle.js` y comprueba la estructura). Las preguntas originales están en `data/*.json`. Para que una pregunta aparezca solo en ciertos cursos, añade `"cursos": [3, 4]` (mínimo y máximo, de 1 a 6); sin ese campo se considera de 5.º-6.º.

Las preguntas están en `data/*.json`. Puedes editarlas con cualquier editor de texto (recomendado: VS Code o la propia web de GitHub, pulsando el lápiz ✏️).

Todas comparten estos campos:

```json
{ "id": "mat-075", "bloque": "Fracciones", "nivel": 2, "tipo": "mc",
  "enunciado": "Texto de la pregunta",
  "pista": "Ayuda que hace pensar, sin dar la respuesta",
  "explicacion": "Se muestra al fallar y en la revisión de errores" }
```

- `id`: único en todo el juego. `nivel`: 1 (Explorador), 2 (Aventurero) o 3 (Leyenda). `bloque`: se usa en las estadísticas.

Campos según el `tipo`:

| tipo | Campos | Ejemplo |
|---|---|---|
| `mc` (elección) | `opciones` (lista), `correcta` (posición, empieza en 0) | `"opciones": ["16","196","24","14"], "correcta": 0` |
| `tf` (verdadero/falso) | `correcta`: `true` o `false` | `"correcta": false` |
| `input` (escribir) | `respuestas` (lista de válidas), opcional `unidad`, `estricto: true` para exigir tildes | `"respuestas": ["6,40", "6,4"], "unidad": "€"` |
| `order` (ordenar) | `elementos` en el orden correcto, `separador` | `"elementos": ["Planteamiento","Nudo","Desenlace"], "separador": " → "` |
| `place` (huecos) | `texto` con `___`, `huecos` (en orden), `distractores` | `"texto": "Vamos ___ si llueve", "huecos": ["a ver"], "distractores": ["haber"]` |
| `match` (relacionar) | `pares`: lista de `[izquierda, derecha]` | `"pares": [["Fusión","Sólido → líquido"], …]` |
| `hotspot` (imagen) | `visual`, `correcta` (id de la zona), `correctaTexto` | mapa: `{"tipo":"canarias"}`, `"correcta": "tenerife"` |
| `listen` (escuchar) | `audio` (texto que se lee), `opciones`, `correcta`, opcional `idioma` (`"es-ES"`) | |

Visuales disponibles (`"visual": {...}`): `barras` (`titulo`, `etiquetas`, `valores`, `mostrarValores`), `tabla` (`cabecera`, `filas`), `cuadricula` (`max`, `puntos`), `angulo` (`grados`), `fraccion` (`num`, `den`), `figura` (`forma`: `rect`/`triangulo`, `base`, `altura`, `unidad`), `reloj` (`h`, `m`), `canarias`.

Ids de las islas para el mapa: `lanzarote`, `la-graciosa`, `fuerteventura`, `gran-canaria`, `tenerife`, `la-gomera`, `la-palma`, `el-hierro`.

**Después de editar:**

```bash
python3 tools/check-questions.py
```

```bash
python3 tools/build-bundle.py
```

El primero detecta errores de estructura; el segundo actualiza la copia para abrir con doble clic. Si no tienes Python, el juego en GitHub Pages funciona igual (lee los JSON directamente).

### Datos de las mecánicas

En el mismo JSON, el apartado `mecanica` contiene: `palabras` (Lengua: `palabra`, `pista`, `trampas`, `nivel`, `aviso`), `clasificaciones` (Medio: `titulo`, `zonas`, `elementos` con `t`, `z` y opcional `por`), `lugares` (Inglés: `id`, `en`, `necesidad`) y `movimientos`/`consejos` (Educación Física). Los `id` de lugares con pictograma son: bakery, bank, library, hospital, pharmacy, cinema, school, post-office, cafe, supermarket, police-station, museum, sports-centre, zoo.

## Añadir escenarios y recursos

- **Colores y decorados** de cada isla: objeto `ART.THEMES` en `js/art.js` (colores de suelo, muros, peligro y lista de decorados).
- **Nuevos decorados**: añade un `case` en `ART.drawProp` y su nombre a la lista `props` del tema.
- **Textos de la historia**, guardianes, misiones y reliquias: `js/story.js`.
- **Frases** de victoria y derrota: `js/phrases.js`.
- **Estructura de las fases** (salas, enemigos, trampas): `js/level-gen.js`.
- **Música**: patrones en `TRACKS` de `js/audio.js`.
- Si añades archivos nuevos, inclúyelos en la lista `FILES` de `sw.js` y sube la `VERSION`.

## Privacidad

El juego no envía datos a ningún sitio. El progreso se guarda solo en el navegador del dispositivo (localStorage). Para proteger la privacidad de los datos personales, el nombre del jugador son **solo hasta 6 letras** (iniciales o apodo); se pide que no se escriba el nombre real. En equipos compartidos, usa **Ajustes → Reiniciar todo el progreso** entre alumnos.

## Autoría y licencia

**Diseñado por David OZC** (David 2026). Diseño, código, gráficos, música y textos originales. Sin personajes, nombres, música ni recursos de ninguna franquicia.

Obra bajo licencia **Creative Commons Reconocimiento-NoComercial-SinObraDerivada 4.0 (CC BY-NC-ND 4.0)**: hay que citar al autor, no se permite el uso comercial y no se pueden publicar versiones modificadas. **Uso gratuito en centros educativos.** Más información en [LICENSE](LICENSE) y en <https://creativecommons.org/licenses/by-nc-nd/4.0/deed.es>.

> Como la licencia es «SinObraDerivada», los apartados de este README sobre editar preguntas sirven para uso privado en tu aula. Si quieres difundir una versión modificada, pide permiso al autor.
