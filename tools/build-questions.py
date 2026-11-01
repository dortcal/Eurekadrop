#!/usr/bin/env python3
"""Eureka Drop · Regenera los bancos por cursos (data/*-cursos.json) desde tools/content/*.py
y después el paquete data/bundle.js.

    python3 tools/build-questions.py
"""
import os, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__))
for m in ('mat', 'lengua', 'medio', 'ingles', 'ef'):
    subprocess.check_call([sys.executable, os.path.join(here, 'content', m + '.py')])
subprocess.check_call([sys.executable, os.path.join(here, 'build-bundle.py')])
subprocess.check_call([sys.executable, os.path.join(here, 'check-questions.py')])
