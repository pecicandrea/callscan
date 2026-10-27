from app.db.base import Base
from app.db.database import engine
from app.models import Call, User


Base.metadata.create_all(bind=engine)

print("Tables created!")