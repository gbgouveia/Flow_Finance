from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, categories, accounts, transactions, goals, dashboard, reports
from .core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API para o sistema Flow Finance",
    version="1.0.0",
)

# Configuração de CORS para o frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Na produção, limite isso para o domínio do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(accounts.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(goals.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(reports.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "Flow Finance API rodando 🚀"}
