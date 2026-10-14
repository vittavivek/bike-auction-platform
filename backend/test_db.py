
from sqlalchemy import text
from backend.database import engine


try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1")).scalar_one()

        if result == 1:
            print("Database connection successful!")

except Exception as error:
    print(f"Database connection failed: {type(error).__name__}")
    raise
