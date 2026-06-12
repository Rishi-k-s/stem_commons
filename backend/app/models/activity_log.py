from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB

from app.db.base_class import Base


class AdminActivityLog(Base):
    __tablename__ = "admin_activity_logs"

    id = Column(Integer, primary_key=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    admin_username = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False, index=True)
    target_type = Column(String(50))   # "user" | "resource" | None
    target_id = Column(Integer)
    details = Column(JSONB)
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)
