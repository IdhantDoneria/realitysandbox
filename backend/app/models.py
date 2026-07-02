from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from .database import Base

class ObjectMemory(Base):
    __tablename__ = "object_memory"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)
    last_position_x = Column(Float)
    last_position_y = Column(Float)
    last_position_z = Column(Float)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )
