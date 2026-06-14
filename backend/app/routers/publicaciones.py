from fastapi import APIRouter, HTTPException, status, Form, File, UploadFile
from app.servicios import s3
from sqlmodel import select

from db import SessionDep
from models import Publicacion, PublicacionPublic, PublicacionUpdate
from app.servicios.seguridad import UsuarioActual, UsuarioOpcional
from app.servicios.visibilidad import publicacion_visible
import random

router = APIRouter(prefix="/publicaciones", tags=["publicaciones"])


@router.get("/", response_model=list[PublicacionPublic])
def get_publicaciones(
    session: SessionDep,
    buscar: str | None = None,
    categoria: int | None = None,
    usuario: int | None = None,
):
    query = select(Publicacion).where(
        Publicacion.estado == "activo",
        Publicacion.es_publico == True,
    )

    if categoria:
        query = query.where(Publicacion.categoria_id == categoria)
    if usuario:
        query = query.where(Publicacion.usuario_id == usuario)
    if buscar:
        termino = f"%{buscar}%"
        query = query.where(
            Publicacion.titulo.like(termino)
            | Publicacion.descripcion.like(termino)
            | Publicacion.etiquetas.like(termino)
        )

    publicaciones = list(session.exec(query).all())

    # sin filtros el feed es aleatorio (lo pide el doc); con filtros se respeta el orden
    if not buscar and not categoria and not usuario:
        random.shuffle(publicaciones)

    return publicaciones


@router.get("/{id}", response_model=PublicacionPublic)
def get_publicacion(id: int, session: SessionDep, usuario: UsuarioOpcional):
    publicacion = session.get(Publicacion, id)
    if not publicacion_visible(publicacion, usuario):
        # inexistente, oculta o privada (de otro): mismo 404, no revela nada
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publicacion no encontrada",
        )
    return publicacion


@router.post("/")
async def crear_publicacion(
    session: SessionDep,
    usuario: UsuarioActual,
    titulo: str = Form(...),
    descripcion: str = Form(""),
    etiquetas: str = Form(""),
    categoria_id: int | None = Form(None),
    es_publico: bool = Form(True),
    imagen: UploadFile = File(...),
):
    contenido = await imagen.read()
    imagen_url = s3.subir_imagen(contenido, imagen.content_type)

    publicacion = Publicacion(
        titulo=titulo,
        descripcion=descripcion,
        etiquetas=etiquetas,
        imagen_url=imagen_url,
        categoria_id=categoria_id,
        es_publico=es_publico,
        usuario_id=usuario["id"],
    )
    session.add(publicacion)
    session.commit()
    session.refresh(publicacion)
    return {"id": publicacion.id}


@router.put("/{id}", response_model=PublicacionPublic)
def actualizar_publicacion(
    id: int,
    data: PublicacionUpdate,
    session: SessionDep,
    usuario: UsuarioActual,
):
    publicacion = session.get(Publicacion, id)
    if not publicacion or publicacion.estado != "activo":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publicacion no encontrada",
        )
    if publicacion.usuario_id != usuario["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes modificar contenido de otro usuario",
        )
    if not data.titulo.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El titulo no puede estar vacio",
        )

    publicacion.titulo = data.titulo.strip()
    publicacion.descripcion = data.descripcion
    publicacion.etiquetas = data.etiquetas
    publicacion.categoria_id = data.categoria_id
    session.add(publicacion)
    session.commit()
    session.refresh(publicacion)
    return publicacion

@router.delete("/{id}")
def ocultar_publicacion(id: int, session: SessionDep, usuario: UsuarioActual):
    publicacion = session.get(Publicacion, id)
    if not publicacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publicacion no encontrada",
        )
    if publicacion.usuario_id != usuario["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes modificar contenido de otro usuario",
        )

    # borra el archivo de S3 para cumplir el derecho al olvido;
    # si S3 fallara, igual ocultamos el pin (no bloqueamos al usuario)
    try:
        s3.eliminar_imagen(publicacion.imagen_url)
    except Exception as e:
        print("no se pudo borrar la imagen de S3:", e)

    publicacion.estado = "oculto"
    session.add(publicacion)
    session.commit()
    return {"mensaje": "Publicacion ocultada"}