from typing import List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime

from common.database import db
from common.models import Notification, User
from common.auth.oauth2 import get_current_user


router = APIRouter(tags=["Notifications"])


@router.get("/notifications", response_model=List[Notification])
def get_notifications(current_user = Depends(get_current_user)):
    user_id_str = current_user["user_id"]

    notifications = db.notifications.find(
        {
            "user_id": {"$ne": user_id_str},
            "$or": [
                {"seen_id": {"$ne": user_id_str}},
                {"seen_id": user_id_str, "expired": False},
            ],
        }
    ).sort("created_at", -1)

    notification_list = []
    for notification in notifications:
        notification_list.append(notification)

    return notification_list


@router.post("/notifications/{post_id}")
async def create_notification(
    post_id: str, current_user = Depends(get_current_user)
):

    if not ObjectId.is_valid(post_id):
        raise HTTPException(status_code=400, detail="Invalid post ID format")

    # post = db.posts.find_one({"_id": ObjectId(post_id)})
    # if not post:
    #     raise HTTPException(status_code=404, detail="Post not found")

    notification_data = {
        "user_id": current_user["user_id"],
        "post_id": str(post_id),
        "message": f"{current_user['email']} posted",
        "created_at": datetime.utcnow().isoformat(),
        "seen_id": [],
        "expired": False,
    }
    notification_result = db.notifications.insert_one(notification_data)
    db.notifications.update_one(
        {"_id": notification_result.inserted_id},
        {"$set": {"id": str(notification_result.inserted_id)}},
    )

    return {"notification_id": str(notification_result.inserted_id)}


@router.put("/notifications/{notification_id}/mark-as-read")
def mark_as_read(notification_id, current_user = Depends(get_current_user)):
    user_id_str = current_user["user_id"]

    db.notifications.update_one(
        {"_id": ObjectId(notification_id)}, {"$addToSet": {"seen_id": user_id_str}}
    )

    return {"message": "Notification marked as read"}
