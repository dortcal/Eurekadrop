#!/usr/bin/env python3
"""Eureka Drop · Informe de cobertura: preguntas por materia, curso y bloque temático.

    python3 tools/coverage-report.py > docs/cobertura-preguntas.md

Sirve al profesorado para ver qué temas trabaja cada curso. No es una vinculación
oficial con criterios de evaluación: ver docs/curriculo-canarias.md.
"""
import json, os, collections
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
AREAS = [('matematicas', 'Matemáticas'), ('lengua', 'Lengua'), ('conocimiento-medio', 'Conocimiento del Medio'),
         ('ingles', 'Inglés'), ('educacion-fisica', 'Educación Física')]
print('# Cobertura de preguntas por curso\n')
print('Generado con `tools/coverage-report.py`. Las preguntas del banco original sin etiqueta de curso se cuentan como 5.º-6.º (nivel 1-2) o 6.º (nivel 3).')
print('Además, en Matemáticas de 1.º a 5.º el juego genera operaciones de cálculo mental al vuelo (no se cuentan aquí).\n')
for f, name in AREAS:
    qs = json.load(open(os.path.join(ROOT, 'data', f + '.json'), encoding='utf-8'))['preguntas']
    x = os.path.join(ROOT, 'data', f + '-cursos.json')
    if os.path.exists(x): qs += json.load(open(x, encoding='utf-8'))['preguntas']
    per = collections.defaultdict(lambda: [0] * 6)
    tot = [0] * 6
    for q in qs:
        c = q.get('cursos') or ([6, 6] if q['nivel'] >= 3 else [5, 6])
        for k in range(c[0], c[1] + 1):
            per[q['bloque']][k - 1] += 1; tot[k - 1] += 1
    print(f'## {name}\n')
    print('| Bloque | 1.º | 2.º | 3.º | 4.º | 5.º | 6.º |\n|---|---|---|---|---|---|---|')
    for b in sorted(per): print('| ' + b + ' | ' + ' | '.join(str(n) if n else '·' for n in per[b]) + ' |')
    print('| **Total** | ' + ' | '.join(f'**{n}**' for n in tot) + ' |\n')
