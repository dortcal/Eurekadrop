# Relación del juego con el currículo de Primaria de Canarias

> **Estado de este documento:** revisión parcial. Se ha comprobado la existencia y la estructura general del Decreto 211/2022, **pero no se ha podido leer el texto de sus anexos** (competencias específicas, criterios de evaluación y saberes básicos de cada área). Por eso **no se cita ningún código de criterio ni de saber básico**. Antes de usar este juego en una programación o en un documento de centro, hay que contrastar los temas con el Anexo II del Decreto.

Consulta realizada el **01/11/2026**.

## 1. Hechos comprobados en fuente

| Dato | Fuente | Estado |
|---|---|---|
| El currículo de Primaria en Canarias lo establece el **Decreto 211/2022, de 10 de noviembre**, publicado en el **BOC n.º 231, de 23 de noviembre de 2022** (anuncio 3533). | Página del BOC: <https://www.gobiernodecanarias.org/boc/2022/231/001.html> | Verificada en fuente (01/11/2026) |
| Las áreas que se imparten en todos los cursos son: Conocimiento del Medio Natural, Social y Cultural, Educación Artística, Educación Física, Lengua Castellana y Literatura, Lengua Extranjera y Matemáticas. | Reproducción del texto del Decreto (INAP, <https://laadministracionaldia.inap.es/noticia.asp?id=1228007>) | Verificada en fuente (01/11/2026) |
| El Decreto se aplica a **sexto curso desde el curso 2023-2024** (disposición final segunda) y entra en vigor al día siguiente de su publicación. | Página del BOC (lectura del texto) | Verificada en fuente (01/11/2026) |
| El currículo se organiza en competencias específicas, criterios de evaluación y saberes básicos por ciclo. En Matemáticas, el propio decreto indica ocho competencias específicas concretadas en catorce criterios de evaluación. | Página del BOC (preámbulo) | Verificada en fuente (01/11/2026) |
| Los ciclos: 1.º y 2.º (primer ciclo), 3.º y 4.º (segundo ciclo), 5.º y 6.º (tercer ciclo). | Estructura general de la etapa | Conocimiento general |

## 2. Lo que NO se ha podido comprobar

- El texto de los **Anexos** del Decreto (el PDF oficial del BOC no es accesible desde el entorno de trabajo y la versión web solo ofrece el preámbulo y el articulado).
- La redacción literal y los códigos de las competencias específicas, los criterios y los saberes básicos de cada área y ciclo.
- Si el Decreto 211/2022 tiene **modificaciones posteriores** (consultar Juriscan: <https://www3.gobiernodecanarias.org/juriscan/>).

Para completar la verificación: abrir el PDF del BOC (<https://sede.gobiernodecanarias.org/boc/boc-a-2022-231-3533.pdf>), localizar el Anexo II de cada área y comparar con `docs/cobertura-preguntas.md`.

## 3. Cómo se ha adaptado el juego a cada curso (diseño del juego)

El alumnado elige su curso (1.º a 6.º) en la pantalla inicial o en *Ajustes*. El curso cambia lo siguiente:

| Aspecto | 1.º-2.º | 3.º | 4.º-5.º | 6.º |
|---|---|---|---|---|
| Preguntas | Solo de su curso (más repaso de cursos anteriores si hacen falta) | Igual | Igual | Banco completo de 6.º |
| Vidas de apoyo | +2 | +2 | +1 | 0 |
| Pistas | Gratis | Gratis | Con coste | Con coste |
| Enemigos y jefes | Mucho más lentos y jefes con menos vida | Más lentos | Algo más lentos | Original |
| Eventos con prisa | Solo lluvia de monedas | Lluvia de monedas y tormenta | Todos | Todos |
| Mecánicas de isla | Siempre nivel 1 y con números/palabras sencillas | Hasta nivel 2 | Hasta nivel 2 (4.º) / 3 (5.º) | Hasta nivel 3 |
| Lectura en voz alta | Activada por defecto | Botón «Leer» | Botón «Leer» | Botón «Leer» |
| Cálculo mental generado | Sí (de su curso) | Sí | Sí | No |

En todos los cursos: los retos no tienen límite de tiempo, hay retroalimentación con pista y explicación, y nunca se piden contenidos de cursos superiores (solo repaso de cursos anteriores).

## 4. Temas que trabaja el juego (interpretación pedagógica)

> Esta tabla resume los temas del banco de preguntas. **No es una vinculación oficial** con criterios de evaluación: es una guía para el profesorado, pendiente de contrastar con el Anexo II.

| Área | Temas incluidos |
|---|---|
| Matemáticas | Numeración y cálculo (suma, resta, tablas, división, decimales, fracciones, porcentajes, enteros, potencias), medida (longitud, masa, capacidad, tiempo, volumen), geometría (figuras, ángulos, simetría y movimientos, coordenadas), estadística y probabilidad, patrones y ecuaciones sencillas, pensamiento computacional (algoritmos, bucles, condiciones, depuración) y educación financiera (con el IGIC canario). |
| Lengua | Letras y sílabas, ortografía, acentuación, clases de palabras, verbos, la oración, vocabulario (sinónimos, antónimos, familias), puntuación, tipos de texto y géneros literarios, comprensión lectora y oral, variedades del español y diversidad lingüística, y alfabetización mediática (bulos y fuentes fiables). |
| Conocimiento del Medio | Cuerpo humano y salud, seres vivos y ecosistemas, materia y energía, electricidad y fuerzas, método científico, geografía e historia, organización política, sostenibilidad y seguridad digital. Con contenidos propios de Canarias: parques nacionales, endemismos, clima, historia y Día de Canarias. |
| Inglés | Vocabulario básico y temático, gramática (presente, pasado, futuro con *going to*, comparativos, cuantificadores), lectura y comprensión oral con voz del navegador, y cultura básica. |
| Educación Física | Cuerpo y movimiento, capacidades físicas, calentamiento, salud e higiene, deportes y reglas, juego limpio, primeros auxilios, seguridad (banderas de playa) y juegos y deportes tradicionales canarios. |

**Áreas del currículo que el juego no cubre:** Educación Artística (y Religión o Valores, según la elección del centro).

## 5. Mejoras añadidas en esta revisión (hechos del proyecto)

- Banco de preguntas ampliado de 360 a más de 900, con etiqueta de curso (`"cursos": [mínimo, máximo]`).
- Cálculo mental generado de forma automática para 1.º-5.º (comprobado con 4 500 operaciones: 0 errores).
- Temas nuevos de 6.º: patrones y ecuaciones sencillas, pensamiento computacional, educación financiera, volumen, simetría, alfabetización mediática, seguridad digital, método científico y más contenido canario.
- Minijuego nuevo: **Memoria Eureka** (parejas con contenido del curso).

## 6. Limitaciones

- Las preguntas las ha redactado un asistente de IA. **Deben ser revisadas por un docente** antes de su uso evaluable.
- El juego es un recurso de refuerzo y repaso; no sustituye la evaluación del profesorado.
- El progreso se guarda solo en el navegador del dispositivo, sin datos personales.
