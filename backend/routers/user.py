from bson import ObjectId
from fastapi import APIRouter, HTTPException

from hashing import Hash
from models import User, ShowUser
from database import db


router=APIRouter(tags=['Users'])



@router.post('/users', response_model=ShowUser)
def signup(user:User):
    if db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="User already exists")
    
    user.password=Hash.bcrypt(user.password)
    db.users.insert_one(user.dict())

    return user



@router.get('/users/{user_id}', response_model=ShowUser)
def get_user(user_id):
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user['id'] = str(user['_id'])
    return user