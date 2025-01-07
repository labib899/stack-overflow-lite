import json
from minio import Minio
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

MINIO_URL = os.getenv("MINIO_URL")
MINIO_ROOT_USER = os.getenv("MINIO_ROOT_USER")
MINIO_ROOT_PASSWORD = os.getenv("MINIO_ROOT_PASSWORD")
BUCKET_NAME = os.getenv("BUCKET_NAME")


minio_client = Minio(
    MINIO_URL, access_key=MINIO_ROOT_USER, secret_key=MINIO_ROOT_PASSWORD, secure=False
)


if not minio_client.bucket_exists(BUCKET_NAME):
    minio_client.make_bucket(BUCKET_NAME)

    public_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"AWS": ["*"]},
                "Action": ["s3:GetObject"],
                "Resource": [f"arn:aws:s3:::{BUCKET_NAME}/*"],
            }
        ],
    }

    minio_client.set_bucket_policy(BUCKET_NAME, json.dumps(public_policy))
