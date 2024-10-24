from datetime import datetime
from typing import List
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends

from models import Post, ShowPost, User
from database import db
import oauth2



router=APIRouter(tags=['Posts'])



@router.post('/posts')
def create_post(post:Post,current_user: User = Depends(oauth2.get_current_user)):
    post_data=post.dict()
    post_data['user_id']=current_user['_id']
    db.posts.insert_one(post_data)

    notification_data = {
        'user_id': str(current_user['_id']), 
        'post_id': str(post_data['_id']), 
        'message': f'{current_user['email']} posted: {post.title}',  
        'created_at': datetime.utcnow().isoformat()  
    }
    db.notifications.insert_one(notification_data)

    return post




@router.get('/posts/{post_id}',response_model=ShowPost)
def get_single_post(post_id,current_user: User = Depends(oauth2.get_current_user)):
    if not ObjectId.is_valid(post_id):
        raise HTTPException(status_code=400, detail="Invalid blog id format")

    post = db.posts.find_one({'_id': ObjectId(post_id)})
    print(post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="post not found")
    
    post['id']=str(post['_id'])
    post['user_id']=str(post['user_id'])
    
    return post



@router.get('/posts',response_model=List[ShowPost])
def get_all_posts(current_user: User = Depends(oauth2.get_current_user)):
    posts = db.posts.find({"user_id": {"$ne": current_user["_id"]}})
    posts_list = []
    for post in posts:
        post["id"] = str(post["_id"])  
        post['user_id'] = str(post['user_id'])
        posts_list.append(post)

    return posts_list