#!/usr/bin/env python3
"""Eureka Drop · Revisa la estructura de los bancos de preguntas.

    python3 tools/check-questions.py

Detecta ids repetidos, campos que faltan, respuestas fuera de rango,
huecos que no cuadran y opciones duplicadas. No comprueba que el
contenido sea correcto: eso lo debe revisar un docente.
"""
import json, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
FILES = ['matematicas', 'lengua', 'conocimiento-medio', 'ingles', 'educacion-fisica']
TYPES = {'mc', 'tf', 'input', 'order', 'place', 'match', 'hotspot', 'listen'}
errors, ids = [], set()
for f in FILES:
    data = json.load(open(os.path.join(ROOT, 'data', f + '.json'), encoding='utf-8'))
    for q in data['preguntas']:
        qid = q.get('id', '?')
        def err(m): errors.append(f'{f}: {qid}: {m}')
        if qid in ids: err('id repetido')
        ids.add(qid)
        for k in ('bloque', 'nivel', 'tipo', 'enunciado'):
            if k not in q: err('falta ' + k)
        t = q.get('tipo')
        if t not in TYPES: err('tipo desconocido ' + str(t)); continue
        if q.get('nivel') not in (1, 2, 3): err('nivel debe ser 1, 2 o 3')
        if t in ('mc', 'listen'):
            o = q.get('opciones', [])
            if len(o) < 2: err('pocas opciones')
            if len(set(o)) != len(o): err('opciones repetidas')
            if not isinstance(q.get('correcta'), int) or not 0 <= q['correcta'] < len(o): err('correcta fuera de rango')
            if t == 'listen' and not q.get('audio'): err('falta audio')
        if t == 'tf' and not isinstance(q.get('correcta'), bool): err('correcta debe ser true/false')
        if t == 'input' and not q.get('respuestas'): err('faltan respuestas')
        if t == 'order' and len(q.get('elementos', [])) < 2: err('faltan elementos')
        if t == 'place' and q.get('texto', '').count('___') != len(q.get('huecos', [])): err('número de ___ distinto de huecos')
        if t == 'match':
            p = q.get('pares', [])
            if len(p) < 2 or len({a for a, _ in p}) != len(p) or len({b for _, b in p}) != len(p): err('pares incorrectos o repetidos')
        if t == 'hotspot' and ('visual' not in q or 'correcta' not in q): err('falta visual o correcta')
    print(f'{f}: {len(data["preguntas"])} preguntas')
print('\n'.join(errors) if errors else 'Sin errores de estructura.')
sys.exit(1 if errors else 0)
