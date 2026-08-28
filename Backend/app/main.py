from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import opportunities

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await connect_to_mongo()
    yield
    # Shutdown: Disconnect from MongoDB
    await close_mongo_connection()

app = FastAPI(title="Oprella AI API", lifespan=lifespan)

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(opportunities.router)

@app.get("/")
async def root():
    return {"status": "online", "message": "Oprella AI FastAPI Engine Running"}