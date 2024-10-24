from pymongo import MongoClient
from datetime import datetime, timedelta

from database import db

def delete_old_seen_notifications():
    threshold_date = datetime.utcnow() - timedelta(minutes=1)
    
    result = db.notifications.delete_many({
        "created_at": {"$lt": threshold_date.isoformat()}
    })
    
    print(f"Deleted {result.deleted_count} old seen notifications.")




if __name__ == "__main__":
    delete_old_seen_notifications()
