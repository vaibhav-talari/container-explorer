from fastapi import FastAPI,HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager
import csv
import os


class User(BaseModel):
    name: str
    role: str

DATA_FILE = "users.csv"

def init_file():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, mode="w", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(["id", "name", "role"])

def read_users():
    users = []
    if not os.path.exists(DATA_FILE):
        return users
    with open(DATA_FILE, mode="r", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            users.append(row)
    return users

def write_user(user: User):
    """Append a new user to the CSV file"""
    users = read_users()
    new_id = len(users) + 1
    with open(DATA_FILE, mode="a", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([new_id, user.name, user.role])
    return {"id": new_id, **user.model_dump()}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # create csv
    init_file()
    yield
    # cleanup on shutdown
    print("clean done")

#passing lifespan argument to create csv file
app = FastAPI(lifespan=lifespan)

@app.post("/user")
async def create_user(user: User):
    saved_user = write_user(user)
    return saved_user


@app.get("/user/{uid}")
def read_item(uid: int):
    users = read_users()
    print(users)
    for u in users:
        if int(u["id"]) == uid:
            return u
    raise HTTPException(status_code=404, detail="User not found")