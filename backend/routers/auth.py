from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from _token import create_access_token
from hashing import Hash
from models import Token
from database import db


router=APIRouter(tags=['Authentication'])


@router.post('/api/signin')
def signin(request:OAuth2PasswordRequestForm=Depends()):
    user=db.users.find_one({"email": request.username})
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not Hash.verify(user['password'], request.password):  
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user['email']})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user['_id']) 
    }