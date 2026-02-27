import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Priority for Supabase: allow either a full connection URL or
# individual SUPABASE_* environment variables.
SUPABASE_URL = os.environ.get("SUPABASE_DATABASE_URL")
if SUPABASE_URL:
    # SQLAlchemy expects the driver spec; convert postgres:// to postgresql+psycopg2://
    if SUPABASE_URL.startswith("postgres://"):
        DATABASE_URL = SUPABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
    else:
        DATABASE_URL = SUPABASE_URL
else:
    # allow building from components
    sb_host = os.environ.get("SUPABASE_DB_HOST")
    sb_port = os.environ.get("SUPABASE_DB_PORT")
    sb_name = os.environ.get("SUPABASE_DB_NAME")
    sb_user = os.environ.get("SUPABASE_DB_USER")
    sb_pass = os.environ.get("SUPABASE_DB_PASSWORD")

    if sb_host and sb_name and sb_user and sb_pass:
        # quote the password/user to be safe
        user = urllib.parse.quote_plus(sb_user)
        pwd = urllib.parse.quote_plus(sb_pass)
        port = sb_port or "5432"
        DATABASE_URL = f"postgresql+psycopg2://{user}:{pwd}@{sb_host}:{port}/{sb_name}"
    else:
        # fall back to legacy DATABASE_URL (may be MySQL) or default local MySQL
        DATABASE_URL = os.environ.get(
            "DATABASE_URL",
            "mysql+pymysql://tradevision:password@localhost/tradevision",
        )


# Create engine; if the configured DB is unreachable, fall back to a local SQLite file
try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    # test connection immediately
    conn = engine.connect()
    conn.close()
except Exception:
    sqlite_path = os.path.join(os.path.dirname(__file__), "../tradevision.db")
    DATABASE_URL = f"sqlite:///{sqlite_path}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
