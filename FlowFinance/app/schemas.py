from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from .models import TransactionType

# Users
class UserBase(BaseModel):
    username: str
    email: EmailStr
    telefone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Accounts
class AccountBase(BaseModel):
    name: str
    balance: float = 0.0
    type: str = "Checking"
    color: str = "#3B82F6"

class AccountCreate(AccountBase):
    pass

class AccountResponse(AccountBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Categories
class CategoryBase(BaseModel):
    name: str
    color: Optional[str] = None
    icon: Optional[str] = None
    type: TransactionType
    limit: Optional[float] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Transactions
class TransactionBase(BaseModel):
    description: str
    amount: float
    date: date
    type: TransactionType
    status: str = "paid"
    account_id: int
    category_id: int

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    account: Optional[AccountResponse] = None
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True

# Goals
class GoalBase(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    deadline: Optional[date] = None
    category: str = "Crescimento"
    status: str = "active"

class GoalCreate(GoalBase):
    pass

class GoalResponse(GoalBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Auth (Tokens)
class Token(BaseModel):
    access: str
    refresh: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
