from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from db import SessionDep
from models import Comentario, ComentarioCreate, ComentarioPublic, Publicacion
from app.servicios.seguridad import UsuarioActual, UsuarioOpcional
from app.servicios.visibilidad import publicacion_visible

router = APIRouter(prefix="/comentarios", tags=["comentarios"])


@router.get("/", response_model=list[ComentarioPublic])
def get_comentarios(publicacion: int, session: SessionDep, usuario: UsuarioOpcional):
    pub = session.get(Publicacion, publicacion)
    if not publicacion_visible(pub, usuario):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publicacion no encontrada",
        )
    query = (
        select(Comentario)
        .where(Comentario.publicacion_id == publicacion)
        .order_by(Comentario.fecha)
    )
    return session.exec(query).all()


@router.post("/", response_model=ComentarioPublic)
def crear_comentario(
    data: ComentarioCreate,
    session: SessionDep,
    usuario: UsuarioActual,
):
    pub = session.get(Publicacion, data.publicacion_id)
    if not publicacion_visible(pub, usuario):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publicacion no encontrada",
        )
    if not data.texto.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El comentario no puede estar vacio",
        )

    comentario = Comentario(
        texto=data.texto.strip(),
        publicacion_id=data.publicacion_id,
        usuario_id=usuario["id"],
    )
    session.add(comentario)
    session.commit()
    session.refresh(comentario)
    return comentario