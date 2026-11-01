#!/usr/bin/env python3
"""Eureka Drop · Genera data/bundle.js a partir de los JSON de data/.

El juego carga los JSON con fetch (GitHub Pages o cualquier servidor).
Si alguien abre index.html con doble clic (file://), el navegador bloquea
fetch y el juego usa esta copia. Ejecútalo tras editar las preguntas:

    python3 tools/build-bundle.py
"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
FILES = ['matematicas', 'lengua', 'conocimiento-medio', 'ingles', 'educacion-fisica']
out = {}
for f in FILES:
    with open(os.path.join(ROOT, 'data', f + '.json'), encoding='utf-8') as fh:
        out[f] = json.load(fh)
js = ('/* Archivo generado por tools/build-bundle.py. NO lo edites a mano: edita los .json */\n'
      'window.EZ_BUNDLE = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
with open(os.path.join(ROOT, 'data', 'bundle.js'), 'w', encoding='utf-8') as fh:
    fh.write(js)
print('data/bundle.js actualizado:', {k: len(v['preguntas']) for k, v in out.items()})
