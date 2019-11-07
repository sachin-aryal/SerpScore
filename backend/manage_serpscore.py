#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import subprocess


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQL_CONF_FILE = os.path.join(BASE_DIR, "api", "sql.cnf")
BACKGROUND_TASK = os.path.join(BASE_DIR, "Job", "serpscore_background_task.py")

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
    try:
        pro = subprocess.Popen([sys.executable, BACKGROUND_TASK, SQL_CONF_FILE])
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
    try:
        pro.kill()
    except:
        pass


if __name__ == '__main__':
    main()
