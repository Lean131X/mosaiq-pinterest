from fastapi import APIRouter
from sqlmodel import select

from db import SessionDep
from models import Categoria

router = APIRouter(prefix="/categorias", tags=["categorias"])


@router.get("/")
def get_categorias(session: SessionDep):
    return session.exec(select(Categoria).order_by(Categoria.nombre)).all()
