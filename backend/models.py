from typing import Optional
from bson import ObjectId
from pydantic import BaseModel



class Post(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    code_snippet: Optional[str] = None
    language: Optional[str] = None 
    user_id: str
    code_snippet_url: Optional[str] = None


class ShowPost(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    code_snippet: Optional[str] = None
    language: Optional[str] = None 
    user_id: str
    code_snippet_url: Optional[str] = None



class User(BaseModel):
    email: str
    password: str


class ShowUser(BaseModel):
    email: str
    password: str


class Notification(BaseModel):
    id: str
    message: str
    post_id: str
    user_id: str
    created_at: str


class ShowNotification(BaseModel):
    id: str
    message: str
    post_id: str
    user_id: str
    created_at: str


class Login(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None