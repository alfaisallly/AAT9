from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, SessionLocal, engine
from app.routers import auth, books, brands, dashboard, devices, export, provinces, users
from app.seed import seed_database

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="نظام إدارة أجهزة الاتصالات - مديرية المرور",
    description="نظام إدارة الأجهزة السلكية وأرشيف الكتب الرسمية للاستلام والتسليم",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(provinces.router, prefix="/api")
app.include_router(brands.router, prefix="/api")
app.include_router(devices.router, prefix="/api")
app.include_router(books.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(export.router, prefix="/api")


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "message": "نظام إدارة أجهزة الاتصالات - مديرية المرور",
        "docs": "/docs",
    }
