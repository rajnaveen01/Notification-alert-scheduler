from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from bson import ObjectId
from pydantic import EmailStr, ValidationError
from notification_model import NotificationModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.notification_scheduler
notifications_collection = db.notifications

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{user_email}")
async def websocket_endpoint(websocket: WebSocket, user_email: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"You wrote: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/notifications/", response_model=NotificationModel)
async def create_notification(notification: NotificationModel):
    print(notification)
    notification_dict = notification.dict()
    result = await notifications_collection.insert_one(notification_dict)
    if result.inserted_id:
        return notification
    raise HTTPException(status_code=500, detail="Notification could not be created.")

from pydantic import EmailStr, ValidationError
from datetime import datetime

@app.get("/notifications/", response_model=List[NotificationModel])
async def get_notifications():
    notifications = await notifications_collection.find().to_list(1000)
    # Convert MongoDB documents to NotificationModel
    valid_notifications = []
    for notification in notifications:
        try:
            # Attempt to create a NotificationModel instance with validation
            valid_notification = NotificationModel(
                id=str(notification["_id"]),  # Convert ObjectId to string
                type=notification.get("type", ""),  # Use get to avoid missing field errors
                message=notification.get("message", ""),  # Handle missing 'message' field
                scheduled_time=notification.get("scheduled_time", datetime.utcnow()),  # Provide a default datetime
                recipient_email=notification.get("recipient_email", "default@example.com")  # Assign email directly
            )
            valid_notifications.append(valid_notification)
        except ValidationError as e:
            print(f"Validation error for notification {notification['_id']}: {e}")
            # Optionally log the error or handle it as needed
    return valid_notifications

@app.get("/user-notifications/{email}", response_model=List[NotificationModel])
async def get_user_notifications(email: str):
    notifications = await notifications_collection.find({"recipient_email": email}).to_list(1000)
    # Convert MongoDB documents to NotificationModel
    valid_notifications = []
    for notification in notifications:
        try:
            # Attempt to create a NotificationModel instance with validation
            valid_notification = NotificationModel(
                id=str(notification["_id"]),  # Convert ObjectId to string
                type=notification.get("type", ""),  # Use get to avoid missing field errors
                message=notification.get("message", ""),  # Handle missing 'message' field
                scheduled_time=notification.get("scheduled_time", datetime.utcnow()),  # Provide a default datetime
                recipient_email=EmailStr(notification.get("recipient_email", "default@example.com"))  # Provide a default email
            )
            valid_notifications.append(valid_notification)
        except ValidationError as e:
            print(f"Validation error for notification {notification['_id']}: {e}")
            # Optionally log the error or handle it as needed
    return valid_notifications

async def notification_scheduler():
    while True:
        now = datetime.utcnow()
        notifications = await notifications_collection.find({"scheduled_time": {"$lte": now}}).to_list(1000)
        for notification in notifications:
            await manager.broadcast(notification['message'])
            await notifications_collection.delete_one({"_id": notification["_id"]})
        await asyncio.sleep(60)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(notification_scheduler())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
