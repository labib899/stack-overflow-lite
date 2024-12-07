from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm

from hashing import Hash
from models import User
from database import db
from token_handler import create_access_token


router = APIRouter(tags=["Users"])


@router.post("/users/signin")
def signin(request: OAuth2PasswordRequestForm = Depends()):
    user = db.users.find_one({"email": request.username})
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not Hash.verify(user["password"], request.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user["email"]})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user["_id"]),
    }


@router.post("/users/signup")
def signup(user: User):
    if db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="User already exists")

    user.password = Hash.bcrypt(user.password)
    inserted_user = db.users.insert_one(user.dict())

    access_token = create_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(inserted_user.inserted_id),
    }


@router.get("/users/{user_id}", response_model=User)
def get_user(user_id):
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user["id"] = str(user["_id"])
    return user
