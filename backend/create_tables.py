from backend.database import engine, Base
from backend.models import Call, User


Base.metadata.create_all(bind=engine)

print("Tables created!")