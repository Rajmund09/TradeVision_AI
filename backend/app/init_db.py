from .database import engine, Base
from . import models

print("Creating database tables (if not exist)...")
Base.metadata.create_all(bind=engine)
print("Done.")
