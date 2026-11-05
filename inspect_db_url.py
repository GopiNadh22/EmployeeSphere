import os, sys
# Add backend directory to path
backend_path = os.path.abspath('backend')
sys.path.insert(0, backend_path)
from app.core.config import settings
from sqlalchemy.engine.url import make_url
url = make_url(settings.DATABASE_URL)
print('Driver:', url.drivername)
print('Username:', url.username)
print('Host:', url.host)
print('Port:', url.port)
print('Database:', url.database)
print('Password contains unencoded @:', '@' in (url.password or ''))

