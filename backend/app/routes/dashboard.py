from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, allow_authenticated
from app.models import User
from app.schemas import DashboardStats
from app.services.dashboard_service import get_dashboard_statistics

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_authenticated)
):
    stats = get_dashboard_statistics(db)
    return stats

