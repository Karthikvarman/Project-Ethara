import os
import sys

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

if __name__ == '__main__':
    os.chdir(os.path.join(os.path.dirname(__file__), 'backend'))
    from app.main import app
    import uvicorn
    
    port = int(os.getenv('PORT', 8000))
    uvicorn.run(
        app,
        host='0.0.0.0',
        port=port,
        log_level='info'
    )
