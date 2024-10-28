import io
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Form, HTTPException, Depends, UploadFile
from models import Post, ShowPost, User, Notification
from database import db
import oauth2
from _minio import minio_client, BUCKET_NAME


router = APIRouter(tags=['Posts'])




language_extension_map = {
    "Python": "py",
    "Javascript": "js",
    "C++": "cpp",
    "C": "c",
    "Java": "java",
}



@router.post('/posts')
async def create_post(
    title: str = Form(...),
    content: str = Form(...),
    language: Optional[str] = Form(None),
    code_snippet: Optional[str] = Form(None),
    file: Optional[UploadFile] = None,
    current_user: User = Depends(oauth2.get_current_user)
):
    post_data = {"title": title, "content": content}
    post_data['user_id'] = current_user['_id']
    if language:
        post_data['language'] = language
    result = db.posts.insert_one(post_data)
    post_id = result.inserted_id

    # Set the extension for the file based on the programming language or uploaded file
    extension = language_extension_map.get(language, "txt")
    snippet_filename = f"snippets/{post_id}.{extension}"


    # Code snippet upload
    if code_snippet:
        snippet_data = code_snippet.encode('utf-8')
        minio_client.put_object(
            BUCKET_NAME, 
            snippet_filename, 
            io.BytesIO(snippet_data), 
            length=len(snippet_data), 
            content_type="text/plain"
        )
        minio_url = f"http://localhost:9000/{BUCKET_NAME}/{snippet_filename}"
        db.posts.update_one({'_id': post_id}, {'$set': {'code_snippet_url': minio_url}})



    # File upload if provided
    if file:
        # Read file content
        file_content = await file.read()
        file_filename = f"snippets/{post_id}.{file.filename.split('.')[-1]}"  # Change as needed for file naming

        # Upload to MinIO
        minio_client.put_object(
            BUCKET_NAME,
            file_filename,
            io.BytesIO(file_content),
            length=len(file_content),
            content_type=file.content_type or "text/plain"  # Default to text/plain
        )

        # Create the MinIO URL for the uploaded file
        minio_url = f"http://localhost:9000/{BUCKET_NAME}/{file_filename}"

        # Update the post in the database with the MinIO URL
        db.posts.update_one({'_id': post_id}, {'$set': {'code_snippet_url': minio_url}})



    # Create a notification after post creation
    notification_data = {
        'user_id': str(current_user['_id']),
        'post_id': str(post_id),
        'message': f"{current_user['email']} posted: {title}",
        'created_at': datetime.utcnow().isoformat(),
        'seen_id': [],
        'expired': False
    }
    notification_result = db.notifications.insert_one(notification_data)
    db.notifications.update_one({'_id': notification_result.inserted_id}, {'$set': {'id': str(notification_result.inserted_id)}})

    return {"post_id": str(post_id)}






@router.get('/posts/{post_id}',response_model=ShowPost)
def get_single_post(post_id,current_user: User = Depends(oauth2.get_current_user)):
    if not ObjectId.is_valid(post_id):
        raise HTTPException(status_code=400, detail="Invalid blog id format")

    post = db.posts.find_one({'_id': ObjectId(post_id)})
    if post is None:
        raise HTTPException(status_code=404, detail="post not found")
    
    post['id']=str(post['_id'])
    post['user_id']=str(post['user_id'])
    
    return post





@router.get('/posts', response_model=List[ShowPost])
def get_all_posts(current_user: User = Depends(oauth2.get_current_user)):
    posts = db.posts.find({"user_id": {"$ne": current_user["_id"]}}).sort("_id", -1)
    
    posts_list = []
    for post in posts:
        post['id'] = str(post['_id'])
        post['user_id'] = str(post['user_id'])
        posts_list.append(post)

    return posts_list

