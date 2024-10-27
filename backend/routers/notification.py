from typing import List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime

from database import db
from models import Notification, ShowNotification, User
import oauth2


router=APIRouter(tags=['Notifications'])



@router.post("/notifications")
def create_notification(notification: Notification,current_user: User = Depends(oauth2.get_current_user)):
    notification_data = {
        "user_id": notification.user_id,
        "message": notification.message,
        "post_id": notification.post_id,
        "created_at": datetime.utcnow().isoformat()  
    }
    result = db.notifications.insert_one(notification_data)

    return {"message": "Notification created successfully", "id": str(result.inserted_id)}
   





@router.get('/notifications', response_model=List[ShowNotification])
def get_notifications(current_user: User = Depends(oauth2.get_current_user)):
    user_id_str = str(current_user["_id"])
    
    notifications = db.notifications.find({
        'user_id': {'$ne': user_id_str},
        '$or': [
            {'seen_id': {'$ne': user_id_str}},  # Not seen by user
            {'seen_id': user_id_str, 'expired': False},  # Seen but not expired
            {'seen_id': user_id_str, 'expired': True}  # Seen, expired, but show only once
        ]
    })
    
    notification_list = []
    for notification in notifications:
        notification_list.append(notification)
        
    return notification_list




@router.put('/notifications/{notification_id}/mark-as-read')
def mark_as_read(notification_id, current_user: User = Depends(oauth2.get_current_user)):
    user_id_str = str(current_user["_id"])

    db.notifications.update_one(
        {'_id': ObjectId(notification_id)},
        {'$addToSet': {'seen_id': user_id_str}}
    )

    return {"message": "Notification marked as read"}
