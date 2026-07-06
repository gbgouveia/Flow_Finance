from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from .. import models, schemas
from .deps import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transações"])

@router.get("/", response_model=List[schemas.TransactionResponse])
def get_transactions(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).all()

@router.post("/", response_model=schemas.TransactionResponse)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Validate account and category
    account = db.query(models.Account).filter(models.Account.id == transaction.account_id, models.Account.user_id == current_user.id).first()
    category = db.query(models.Category).filter(models.Category.id == transaction.category_id, models.Category.user_id == current_user.id).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")

    db_transaction = models.Transaction(**transaction.model_dump(), user_id=current_user.id)
    db.add(db_transaction)
    
    # Update account balance
    if transaction.type == models.TransactionType.INCOME:
        account.balance += transaction.amount
    else:
        account.balance -= transaction.amount
        
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id, models.Transaction.user_id == current_user.id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
        
    # Revert account balance
    account = db.query(models.Account).filter(models.Account.id == db_transaction.account_id).first()
    if account:
        if db_transaction.type == models.TransactionType.INCOME:
            account.balance -= db_transaction.amount
        else:
            account.balance += db_transaction.amount
            
    db.delete(db_transaction)
    db.commit()
    return None

from pydantic import BaseModel
class TransactionUpdateStatus(BaseModel):
    status: str

@router.patch("/{transaction_id}", response_model=schemas.TransactionResponse)
def update_transaction_status(transaction_id: int, status_update: TransactionUpdateStatus, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id, models.Transaction.user_id == current_user.id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
        
    db_transaction.status = status_update.status
    db.commit()
    db.refresh(db_transaction)
    return db_transaction
