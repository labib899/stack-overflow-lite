from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from routers import post, user, notification, auth
from remover import scheduler


app = FastAPI()


@app.get("/")
def check():
    return {"message": "it is okay"}


origins = [
    "http://localhost:5173",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(post.router, prefix="/api")
app.include_router(notification.router, prefix="/api")


@app.on_event("startup")
def start_scheduler():
    scheduler.start()


@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", reload=True)