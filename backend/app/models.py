from typing import List, Optional
from pydantic import BaseModel


class User(BaseModel):
    email: str
    password: str


class Post(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    language: Optional[str] = None
    code_snippet: Optional[str] = None
    code_snippet_url: Optional[str] = None
    user_id: str


class Notification(BaseModel):
    id: Optional[str] = None
    message: str
    created_at: str
    post_id: str
    user_id: str
    seen_id: List[str] = []
    expired: bool = False