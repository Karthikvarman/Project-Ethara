import os
import sys
import subprocess

# Set environment for backend
os.environ['PYTHONPATH'] = os.path.join(os.path.dirname(__file__), 'backend')

# Run uvicorn with backend module
port = os.getenv('PORT', 8000)
subprocess.run([
    sys.executable, '-m', 'uvicorn',
    'app.main:app',
    '--host', '0.0.0.0',
    '--port', str(port)
], cwd=os.path.join(os.path.dirname(__file__), 'backend'))

