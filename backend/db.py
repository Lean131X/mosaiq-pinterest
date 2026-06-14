from typing import Annotated

from fastapi import Depends, FastAPI
from sqlmodel import SQLModel, Session, create_engine

sqlite_name = "mosaiq.sqlite3"
sqlite_url = f"sqlite:///{sqlite_name}"

engine = create_engine(sqlite_url)


def create_all_table(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
