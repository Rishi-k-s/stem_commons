from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id", ondelete="CASCADE"), nullable=False, index=True)
    reporter_name = Column(String(255))
    reporter_email = Column(String(255))
    issue_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    screenshot_url = Column(String(500))
    status = Column(String(50), default="Open", nullable=False, index=True)  # Open / In Progress / Resolved / Invalid
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    resolved_at = Column(DateTime)
    resolved_by = Column(Integer, ForeignKey("users.id"))

    resource = relationship("Resource", back_populates="reports")
