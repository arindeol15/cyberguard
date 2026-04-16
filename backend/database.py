from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cyberguard.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    score = Column(Integer, default=0)
    total_scenarios = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    responses = relationship("Response", back_populates="user")


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    sender_email = Column(String, nullable=False)
    sender_name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(String, nullable=False)
    correct_action = Column(String, nullable=False)
    red_flags = Column(String, nullable=False)  # stored as JSON string
    options = Column(String, nullable=True)  # stored as JSON string (for AI scenarios with custom options)
    is_ai_generated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    responses = relationship("Response", back_populates="scenario")


class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"), nullable=False)
    action = Column(String, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    points_earned = Column(Integer, default=0)
    time_taken = Column(Float, nullable=True)  # seconds
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="responses")
    scenario = relationship("Scenario", back_populates="responses")


def init_db():
    Base.metadata.create_all(bind=engine)
    # Simple migration: add options column if it doesn't exist (for existing databases)
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    if "scenarios" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("scenarios")]
        if "options" not in columns:
            try:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE scenarios ADD COLUMN options TEXT"))
                print("Added 'options' column to scenarios table")
            except Exception as e:
                print(f"Migration note: {e}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
