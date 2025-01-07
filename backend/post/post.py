import io
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Form, HTTPException, Depends, UploadFile

from common.models import User, Post
from common.database import db
from common.auth.oauth2 import get_current_user
from minio_storage import minio_client, BUCKET_NAME


minio_URL = "http://localhost:9000"
language_extension_map = {
    "Python": "py",
    "Javascript": "js",
    "C++": "cpp",
    "C": "c",
    "Java": "java",
}


router = APIRouter(tags=["Posts"])


@router.get("/posts", response_model=List[Post])
def get_all_posts(current_user = Depends(get_current_user)):
    posts = db.posts.find({"user_id": {"$ne": current_user["user_id"]}}).sort("_id", -1)

    posts_list = []
    for post in posts:
        post["id"] = str(post["_id"])
        post["user_id"] = str(post["user_id"])
        posts_list.append(post)

    return posts_list


@router.get("/posts/{post_id}", response_model=Post)
def get_single_post(post_id, current_user = Depends(get_current_user)):
    if not ObjectId.is_valid(post_id):
        raise HTTPException(status_code=400, detail="Invalid blog id format")

    post = db.posts.find_one({"_id": ObjectId(post_id)})
    if post is None:
        raise HTTPException(status_code=404, detail="post not found")

    post["id"] = str(post["_id"])
    post["user_id"] = str(post["user_id"])

    return post


@router.post("/posts")
async def create_post(
    title: str = Form(...),
    content: str = Form(...),
    language: Optional[str] = Form(None),
    code_snippet: Optional[str] = Form(None),
    file: Optional[UploadFile] = None,
    current_user = Depends(get_current_user),
):

    post_data = {"title": title, "content": content}
    post_data["user_id"] = current_user["user_id"]
    if language:
        post_data["language"] = language

    result = db.posts.insert_one(post_data)
    post_id = result.inserted_id
    db.posts.update_one({"_id": post_id}, {"$set": {"id": str(post_id)}})

    extension = language_extension_map.get(language, "txt")
    snippet_filename = f"snippets/{post_id}.{extension}"
    if code_snippet:
        snippet_data = code_snippet.encode("utf-8")

        minio_client.put_object(
            BUCKET_NAME,
            snippet_filename,
            io.BytesIO(snippet_data),
            length=len(snippet_data),
            content_type="text/plain",
        )

        minio_url = f"{minio_URL}/{BUCKET_NAME}/{snippet_filename}"
        db.posts.update_one({"_id": post_id}, {"$set": {"code_snippet_url": minio_url}})

    if file:
        file_content = await file.read()
        file_filename = f"snippets/{post_id}.{file.filename.split('.')[-1]}"

        minio_client.put_object(
            BUCKET_NAME,
            file_filename,
            io.BytesIO(file_content),
            length=len(file_content),
            content_type=file.content_type or "text/plain",
        )

        minio_url = f"{minio_URL}/{BUCKET_NAME}/{file_filename}"
        result = db.posts.update_one(
            {"_id": post_id}, {"$set": {"code_snippet_url": minio_url}}
        )

    return {"post_id": str(post_id)}
