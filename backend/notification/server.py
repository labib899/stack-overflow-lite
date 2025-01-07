from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

import notification
from notification_scheduler import scheduler


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


app.include_router(notification.router, prefix="/api")


@app.on_event("startup")
def start_scheduler():
    scheduler.start()


@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8003, reload=True)
