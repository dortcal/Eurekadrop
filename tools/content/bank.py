"""Ayudas para escribir preguntas de Eureka Drop por curso.
Cada módulo (mat.py, len.py…) crea un Bank y añade preguntas con mc/tf/inp/order/match/place.
La respuesta correcta de mc se escribe SIEMPRE la primera; el banco la reparte entre posiciones
(el juego además baraja las opciones al mostrarlas)."""
import json, os

class Bank:
    def __init__(self, prefix, area, nombre):
        self.prefix, self.area, self.nombre, self.items, self.n = prefix, area, nombre, [], 0

    def _id(self):
        self.n += 1
        return f"{self.prefix}-c{self.n:03d}"

    @staticmethod
    def _c(c):
        return [c, c] if isinstance(c, int) else list(c)

    def _base(self, bloque, nivel, cursos, tipo, enun, pista, expl):
        return {"id": self._id(), "bloque": bloque, "nivel": nivel, "cursos": self._c(cursos),
                "tipo": tipo, "enunciado": enun, "pista": pista, "explicacion": expl}

    def mc(self, bloque, nivel, cursos, enun, right, wrong, pista, expl, **extra):
        assert len(wrong) >= 2 and right not in wrong, (enun, wrong)
        q = self._base(bloque, nivel, cursos, "mc", enun, pista, expl)
        pos = len(self.items) % len(wrong + [right])
        opts = list(wrong)
        opts.insert(pos, right)
        q["opciones"], q["correcta"] = opts, pos
        q.update(extra)
        self.items.append(q)

    def tf(self, bloque, nivel, cursos, enun, val, pista, expl):
        q = self._base(bloque, nivel, cursos, "tf", enun, pista, expl)
        q["correcta"] = bool(val)
        self.items.append(q)

    def inp(self, bloque, nivel, cursos, enun, answers, pista, expl, **extra):
        q = self._base(bloque, nivel, cursos, "input", enun, pista, expl)
        q["respuestas"] = [answers] if isinstance(answers, str) else list(answers)
        q.update(extra)
        self.items.append(q)

    def order(self, bloque, nivel, cursos, enun, elems, sep, pista, expl):
        q = self._base(bloque, nivel, cursos, "order", enun, pista, expl)
        q["elementos"], q["separador"] = list(elems), sep
        self.items.append(q)

    def match(self, bloque, nivel, cursos, enun, pairs, pista, expl):
        q = self._base(bloque, nivel, cursos, "match", enun, pista, expl)
        q["pares"] = [list(p) for p in pairs]
        self.items.append(q)

    def listen(self, bloque, nivel, cursos, enun, audio, right, wrong, pista, expl, idioma="en-GB"):
        q = self._base(bloque, nivel, cursos, "listen", enun, pista, expl)
        pos = len(self.items) % (len(wrong) + 1)
        opts = list(wrong); opts.insert(pos, right)
        q["audio"], q["opciones"], q["correcta"], q["idioma"] = audio, opts, pos, idioma
        self.items.append(q)

    def save(self, root, fname):
        path = os.path.join(root, "data", fname + "-cursos.json")
        with open(path, "w", encoding="utf-8") as fh:
            json.dump({"area": self.area, "nombre": self.nombre, "version": 1,
                       "nota": "Banco ampliado por cursos (1.º-6.º). Campo 'cursos': [mínimo, máximo].",
                       "preguntas": self.items}, fh, ensure_ascii=False, indent=1)
        return len(self.items)
