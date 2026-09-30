from database import engine, Base
from models import Call, User


Base.metadata.create_all(bind=engine)

print("Tables created!")