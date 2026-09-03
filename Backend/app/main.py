from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import admin, auth, opportunities, applications

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(title="Oprella AI API", lifespan=lifespan)

# Define explicitly allowed origins
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://oprella-ai.netlify.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,  # Cache preflight response for 1 hour (3600 seconds)
)

# Routes
app.include_router(auth.router)
app.include_router(opportunities.router)
app.include_router(applications.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {"status": "online", "message": "Oprella AI FastAPI Engine Running"}