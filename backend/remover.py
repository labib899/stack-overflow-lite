from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from bson import ObjectId
from pymongo import MongoClient


from database import db


router = APIRouter()


scheduler = BackgroundScheduler()
EXPIRATION_TIME = timedelta(days=7)

def expire_notifications():
    now = datetime.utcnow()
    expired_notifications = db.notifications.find({"expired": False})

    for notification in expired_notifications:
        created_at = datetime.fromisoformat(notification['created_at'])
        if now - created_at >= EXPIRATION_TIME:
            db.notifications.update_one(
                {'_id': notification['_id']},
                {'$set': {'expired': True}}
            )



@scheduler.scheduled_job('interval', seconds=60) 
def scheduled_task():
    expire_notifications()


