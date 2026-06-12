from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id", ondelete="CASCADE"), nullable=False, index=True)
    claimer_name = Column(String(255), nullable=False)
    claimer_email = Column(String(255), nullable=False)
    claimer_phone = Column(String(20))
    role = Column(String(50))  # Owner / Administrator / Staff
    proof_document_url = Column(String(500))
    message = Column(Text)
    status = Column(String(50), default="Pending", nullable=False, index=True)  # Pending / Approved / Rejected
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    reviewed_at = Column(DateTime)
    reviewed_by = Column(Integer, ForeignKey("users.id"))

    resource = relationship("Resource", back_populates="claims")
