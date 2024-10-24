from typing import Optional
from pydantic import BaseModel



class Post(BaseModel):
    title: str
    content: str
    user_id: str

class ShowPost(BaseModel):
    title: str
    content: str
    # user_id: str


class User(BaseModel):
    email: str
    password: str


class ShowUser(BaseModel):
    email: str
    password: str


class Notification(BaseModel):
    message: str
    post_id: str
    user_id: str
    created_at: str


class ShowNotification(BaseModel):
    message: str
    # post_id: str
    # user_id: str
    created_at: str


class Login(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None