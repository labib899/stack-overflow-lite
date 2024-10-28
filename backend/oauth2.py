from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

import _token
from database import db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="signin")


def get_current_user(token=Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_data = _token.verify_token(token, credentials_exception)
    user = db.users.find_one({"email": token_data.email})  
    if user is None:
        raise credentials_exception  

    return user
    