from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from .deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
def get_dashboard_data(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Calculate simple mocks for the KPIs for now to make the dashboard work
    # In a real app this would query the transactions and aggregate
    
    return {
        "kpis": {
            "saldoTotal": 142000.50,
            "saldoTotalChange": 4.5,
            "receitaMensal": 45000.00,
            "receitaMensalChange": 12.0,
            "despesaMensal": 22000.00,
            "despesaMensalChange": -2.3,
            "lucroMensal": 23000.00,
            "lucroMensalChange": 8.0,
            "receitasPendentes": 15000.00,
            "despesasPendentes": 5000.00,
            "maiorReceita": 12000.00,
            "maiorDespesa": 8000.00,
            "metasProgresso": 75.5
        },
        "performance": [
            { "month": "Jan", "receitas": 30000, "despesas": 20000, "saldo": 10000 },
            { "month": "Fev", "receitas": 35000, "despesas": 22000, "saldo": 13000 },
            { "month": "Mar", "receitas": 40000, "despesas": 21000, "saldo": 19000 },
            { "month": "Abr", "receitas": 38000, "despesas": 23000, "saldo": 15000 },
            { "month": "Mai", "receitas": 45000, "despesas": 20000, "saldo": 25000 },
            { "month": "Jun", "receitas": 50000, "despesas": 22000, "saldo": 28000 }
        ]
    }
