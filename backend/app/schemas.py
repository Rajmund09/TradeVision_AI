from pydantic import BaseModel, constr, validator


class UserCreate(BaseModel):
    # username must be alphanumeric and reasonably sized
    username: constr(strip_whitespace=True, min_length=3, max_length=50)
    # passwords should be at least 8 characters; further strength checks
    # can be added in service layer
    password: constr(min_length=8)

    @validator("username")
    def username_alphanumeric(cls, v):
        if not v.isalnum():
            raise ValueError("Username must be alphanumeric")
        return v


class UserOut(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True
