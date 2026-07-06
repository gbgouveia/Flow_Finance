import sys
import logging
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models
from app.core.security import get_password_hash
from datetime import date

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    admin = db.query(models.User).filter(models.User.email == "admin@flowfinance.com").first()
    if not admin:
        logger.info("Criando usuário administrador...")
        admin = models.User(
            username="Admin",
            email="admin@flowfinance.com",
            hashed_password=get_password_hash("admin123"),
            is_active=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        logger.info("Criando categorias padrão...")
        categories = [
            models.Category(name="Salário", type=models.TransactionType.INCOME, color="#10B981", icon="💰", limit=0, user_id=admin.id),
            models.Category(name="Consultoria", type=models.TransactionType.INCOME, color="#3B82F6", icon="💼", limit=0, user_id=admin.id),
            models.Category(name="Alimentação", type=models.TransactionType.EXPENSE, color="#EF4444", icon="🍔", limit=1000, user_id=admin.id),
            models.Category(name="Infra/Cloud", type=models.TransactionType.EXPENSE, color="#F59E0B", icon="☁️", limit=2500, user_id=admin.id),
            models.Category(name="Transporte", type=models.TransactionType.EXPENSE, color="#8B5CF6", icon="🚗", limit=500, user_id=admin.id)
        ]
        db.add_all(categories)
        db.commit()

        logger.info("Criando contas...")
        accounts = [
            models.Account(name="Conta Digital", balance=25000.0, type="Checking", color="#8B5CF6", user_id=admin.id),
            models.Account(name="Investimentos", balance=150000.0, type="Investment", color="#10B981", user_id=admin.id)
        ]
        db.add_all(accounts)
        db.commit()

        logger.info("Criando transações (Receitas e Despesas)...")
        cat_sal = db.query(models.Category).filter(models.Category.name == "Salário", models.Category.user_id == admin.id).first()
        cat_infra = db.query(models.Category).filter(models.Category.name == "Infra/Cloud", models.Category.user_id == admin.id).first()
        acc = db.query(models.Account).filter(models.Account.name == "Conta Digital", models.Account.user_id == admin.id).first()
        
        transactions = [
            models.Transaction(description="Salário Mensal", amount=15000.0, date=date.today(), type=models.TransactionType.INCOME, status="paid", user_id=admin.id, account_id=acc.id, category_id=cat_sal.id),
            models.Transaction(description="Fatura AWS", amount=2500.0, date=date.today(), type=models.TransactionType.EXPENSE, status="pending", user_id=admin.id, account_id=acc.id, category_id=cat_infra.id)
        ]
        db.add_all(transactions)
        db.commit()

        logger.info("Criando metas...")
        goal = models.Goal(name="Reserva de Emergência", target_amount=100000.0, current_amount=45000.0, deadline=date.today(), category="Segurança", status="active", user_id=admin.id)
        db.add(goal)
        db.commit()

        logger.info("Seed inicial concluído com sucesso!")
    else:
        logger.info("Banco de dados já possui dados iniciais.")

def main() -> None:
    logger.info("Iniciando seed do banco de dados")
    try:
        db = SessionLocal()
        init_db(db)
    except Exception as e:
        logger.error(e)
        raise e

if __name__ == "__main__":
    main()
