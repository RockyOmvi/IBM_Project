from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(String, unique=True, index=True, nullable=True)
    username = Column(String, nullable=True)
    access_token = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Session(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True, index=True)  # uuid
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("sessions.id"))
    role = Column(String)  # 'user'|'bot'|'system'
    text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class QueryLog(Base):
    __tablename__ = "queries"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=True)
    query_text = Column(Text)
    source = Column(String)  # deepseek|fallback
    result_count = Column(Integer, default=0)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)