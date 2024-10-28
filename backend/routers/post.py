import io
from datetime import datetime
from typing import List
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
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
def create_post(post: Post, current_user: User = Depends(oauth2.get_current_user)):
    post_data = post.dict(exclude={'code_snippet'})
    post_data['user_id'] = current_user['_id']
    # post_data['created_at'] = datetime.utcnow().isoformat()
    result = db.posts.insert_one(post_data)
    post_id = result.inserted_id

    extension = language_extension_map.get(post.language, "txt")
    if post.code_snippet:
        snippet_data = post.code_snippet.encode('utf-8')
        snippet_filename = f"snippets/{post_id}.{extension}"
        
        minio_client.put_object(
            BUCKET_NAME, 
            snippet_filename, 
            io.BytesIO(snippet_data), 
            length=len(snippet_data), 
            content_type="text/plain"
        )

        minio_url = f"http://localhost:9000/{BUCKET_NAME}/{snippet_filename}"
        post.code_snippet_url=minio_url
        db.posts.update_one({'_id': post_id}, {'$set': {'code_snippet_url': minio_url}})

    notification_data = {
        'user_id': str(current_user['_id']),
        'post_id': str(post_id),
        'message': f"{current_user['email']} posted: {post.title}",
        'created_at': datetime.utcnow().isoformat(),
        'seen_id': [],
        'expired': False
    }
    result = db.notifications.insert_one(notification_data)
    db.notifications.update_one(
        {'_id': result.inserted_id},  
        {'$set': {'id': str(result.inserted_id)}} 
    )

    return post



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

