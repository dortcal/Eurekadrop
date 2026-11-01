# EUREKA DROP — Documento de diseño y guía del juego

> Videojuego educativo de aventuras para 6.º de Educación Primaria (11-12 años).
> Este documento recoge la **Fase 1 (diseño)** y sirve de guía para docentes.

---

## 1. Nombre

Se valoraron tres propuestas:

| Propuesta | Idea | Valoración |
|---|---|---|
| **EUREKA DROP** | Saltas desde un globo a islas del conocimiento: «¡Eureka!» es el grito de quien descubre algo; *drop* es el salto a la isla. | **Elegida.** Corta, sonora, con energía de videojuego de acción y significado educativo. |
| Islas Cerebro | Archipiélago donde cada isla es una parte del cerebro. | Clara, pero suena más infantil. |
| Mentemanía | Concurso-aventura de mentes rápidas. | Pegadiza, pero se parece a «concurso de preguntas», justo lo que queremos evitar. |

## 2. Identidad visual

- **Estilo:** cartoon 2.5D. Todo se dibuja por código (Canvas y SVG): volúmenes con degradados, sombras proyectadas, brillos y contornos gruesos. No hay imágenes de terceros.
- **Paleta base:** cielo violeta-azul (`#1b1446 → #3a2a8c`), amarillo Eureka `#ffd23f`, rosa `#ff4f8b`, cian `#4cc9f0`, verde `#3ddc97`, violeta `#7b5cff`.
- **Tipografía:** fuentes redondeadas del sistema (sin descargas), mayúsculas en cursiva con contorno para títulos.
- **Interfaz:** botones gruesos con «suelo» 3D, paneles translúcidos, iconos dibujados.

## 3. Universo e historia

**El Borrón**, una mancha de tinta cósmica nacida de todos los apuntes que nadie repasó, se tragó la *Gran Enciclopedia Viva*. El Archipiélago Eureka se partió en cinco islas y sus guardianes quedaron «borroneados»: siguen ahí, pero confundidos y manchados de tinta.

El jugador es un aspirante a **Sabio/a Eureka**. Viaja en el **Globo Chispa** junto a **Chispa**, un búho-dron sabelotodo y algo dramático. En cada isla debe recuperar un **Fragmento Eureka** y liberar al guardián. Con los cinco fragmentos se enfrenta al Borrón en su nube.

| Isla | Área | Ambiente | Guardián | Fragmento |
|---|---|---|---|---|
| Numérica City | Matemáticas | Ciudad neón futurista, cubos y pirámides | **Calculatrón**, robot que ahora suma mal | Cristal Pi |
| Biblioteca Infinita | Lengua | Estanterías gigantes, libros flotantes | **Doña Tilde**, lechuza bibliotecaria que ha perdido sus tildes | Pluma Infinita |
| Isla Volcana | Conocimiento del Medio | Volcanes, dragos, malpaís canario | **Magmo**, gólem de lava gruñón | Semilla Gaia |
| Port Hello | Inglés | Puerto internacional, tiendas y farolas | **Captain Polyglot**, loro piloto que solo dice «¿qué?» | Brújula Babel |
| Estadio Turbo | Educación Física | Estadio futurista con pista y circuitos | **Rinoturbo**, rinoceronte entrenador sin aliento | Silbato Turbo |

Secundarios: **Borroncitos** (enemigos-gota que balbucean faltas de ortografía), personajes que piden ayuda (misiones secundarias) y el **rival Rayo**, cuyo récord aparece para picarte.

## 4. Mecánicas

**Exploración (vista cenital 2.5D):** mover en 4 direcciones, correr (acelera al mantener el movimiento), saltar (sobre charcos, huecos y Borroncitos: si caes encima de uno, lo «explotas» en confeti).

Cada fase es una cadena de salas: inicio → peligros y cofre → **sala de mecánica exclusiva** (con zona secreta encima) → puente que se desmorona → (Leyenda: sala extra con trampas) → **guardián**.

Elementos: monedas, corazones, bombillas (pistas), cofres con reto opcional, puertas con reto, interruptores que bajan barreras, paredes secretas, suelos que se desmoronan, trampas intermitentes, enemigos que patrullan o persiguen, misión secundaria de objetos perdidos y eventos sorpresa (tormenta de tinta, cofre dorado contrarreloj, pregunta relámpago, lluvia de monedas).

**Mecánica exclusiva por territorio (no son preguntas):**

| Territorio | Mecánica | Contenido que trabaja |
|---|---|---|
| Matemáticas | **Cristales de energía**: recoge cristales numerados hasta sumar *exactamente* la carga del generador. Si te pasas, sobrecarga. Nivel 2 añade decimales; nivel 3, negativos. | Cálculo mental, decimales, enteros negativos, estimación |
| Lengua | **Letras perdidas**: con una definición como pista, salta sobre las letras en orden para escribir la palabra. Hay letras trampa (b/v, g/j, h, ll/y, vocales con y sin tilde). | Ortografía, acentuación, vocabulario |
| Conocimiento del Medio | **Restaura el ecosistema**: lleva cada elemento a su zona (renovable/no renovable, vertebrado/invertebrado, productor/consumidor, provincia canaria...). | Clasificación, energía, seres vivos, Canarias |
| Inglés | **Follow directions**: un turista te da indicaciones en inglés (texto y voz) y debes caminar hasta el edificio correcto. Nivel 3: solo audio, con texto opcional. | Places in town, prepositions, listening |
| Educación Física | **Pista Turbo** (carrera con saltos en el momento justo) y **Calentamiento al ritmo** (repetir secuencias de movimientos). | Coordinación, ritmo, reacción, secuencias motrices |

**Guardián:** el jefe ataca con patrones propios (ráfagas de números, lluvia de letras, rocas de lava, avioncitos de papel, embestidas). Aparecen **orbes del saber**: al cogerlos hay que responder un reto; si aciertas, el orbe golpea al guardián.

## 5. Retos educativos (formatos)

Elección múltiple, verdadero/falso, completar (respuesta escrita o numérica), ordenar (oraciones o cronologías), colocar palabras en huecos, relacionar columnas, seleccionar sobre una imagen (mapa de Canarias, cuadrícula de coordenadas, gráfico de barras), interpretar visuales (barras, tablas, ángulos, fracciones), escuchar en inglés (síntesis de voz del navegador, con texto alternativo) y minijuegos.

Cada reto aparece **dentro del mundo** (puerta, cofre, orbe, personaje) con una presentación visual distinta por formato.

## 6. Progresión

- **Niveles:** 1 Explorador, 2 Aventurero, 3 Leyenda. Cambian la dificultad de las preguntas, el número de salas, enemigos (cantidad, velocidad, perseguidores), trampas, la vida del guardián y la mecánica exclusiva.
- **Adaptación dentro de la partida:** tras 3 aciertos seguidos el juego ofrece preguntas de un nivel superior; tras 2 fallos seguidos, baja un nivel.
- **Modo Historia:** cada isla tiene 3 fases (= los 3 niveles). Superar la fase 1 de una isla desbloquea la siguiente. Con las 5 islas en fase 3 se desbloquea el combate final contra el Borrón. El progreso se guarda solo.
- **Modo Rápido:** cualquier área y nivel, una partida de 5-10 minutos.
- **Desafío del Día:** fase mixta con retos de las cinco áreas, semilla basada en la fecha local. Recompensa una vez al día y racha de días seguidos.

## 7. Puntuación y recompensas

- Acierto: 100 × nivel de la pregunta (1 / 1,5 / 2) + bonus de rapidez opcional (+50 si < 10 s, +25 si < 20 s; nunca se resta por tardar).
- Multiplicador de racha: ×1,5 (3 aciertos), ×2 (5), ×3 (8). Mensajes especiales de racha.
- Moneda 10 · Borroncito explotado 50 · cofre 200 · zona secreta 300 · mecánica 400 · misión secundaria 500 · guardián 1000.
- Monedas para la **Taquilla** (accesorios), insignias, trofeos por isla, reliquias coleccionables, apariencias desbloqueables. Sin compras reales ni publicidad.
- **Vidas:** 5 por defecto (configurable 3/5/7). Restan: fallar en puertas y orbes, enemigos, trampas y caídas. Los cofres son opcionales: fallar no quita vidas.

## 8. Arquitectura técnica

HTML5 + CSS3 + JavaScript sin dependencias ni compilación. Scripts clásicos (no módulos) para que también funcione con doble clic. Las preguntas viven en `data/*.json`; `data/bundle.js` es una copia para abrir el juego sin servidor (se regenera con `tools/build-bundle.py`). PWA con `sw.js` para jugar sin conexión. Guardado en `localStorage`.

Ver `README.md` para la estructura de archivos.

## 9. Referencia curricular

Los contenidos se han seleccionado tomando como referencia los saberes básicos del tercer ciclo del **Real Decreto 157/2022, de 1 de marzo**, por el que se establecen la ordenación y las enseñanzas mínimas de la Educación Primaria, y los contenidos de Canarias (geografía, patrimonio y espacios naturales de las islas). Antes de usarlo en una programación didáctica, contrasta cada bloque con el decreto de currículo de Canarias vigente: este juego **no sustituye** a esa comprobación ni afirma correspondencias oficiales ítem por ítem.

## 10. Guía rápida para docentes

1. Abre el juego, pulsa **JUGAR** y personaliza el avatar.
2. Para practicar un área concreta usa **Modo Rápido**.
3. Tras cada partida, **Revisar errores** muestra la respuesta correcta y una explicación.
4. **Estadísticas** indica qué bloques domina el alumno y cuáles necesita practicar.
5. El progreso se guarda en *ese navegador y ese dispositivo*. En ordenadores compartidos, usa **Ajustes → Reiniciar progreso** entre alumnos.
6. Para añadir o corregir preguntas, edita los archivos de `data/` (ver README).
