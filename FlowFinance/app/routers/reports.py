from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from .deps import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/")
def get_reports_data(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Returns dummy data that Relatorios.jsx expects
    return {
        "scatterData": [
            [2000, 100], [4000, 200], [5000, 150], [8000, 300], [10000, 400], [15000, 350]
        ],
        "candlestickData": [
            ["2023-10", 20, 34, 10, 38],
            ["2023-11", 40, 35, 30, 50],
            ["2023-12", 31, 38, 33, 44],
            ["2024-01", 38, 15, 5, 42]
        ]
    }
