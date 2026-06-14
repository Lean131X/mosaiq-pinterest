from fastapi import APIRouter, HTTPException, status
from sqlmodel import SQLModel, select

from db import SessionDep
from models import Usuario, UsuarioCreate
from app.servicios.seguridad import hashear_clave, verificar_clave, crear_token

router = APIRouter(prefix="/auth", tags=["auth"])


class UsuarioLogin(SQLModel):
    correo: str
    clave: str


@router.post("/register")
def register(data: UsuarioCreate, session: SessionDep):
    if not data.acepto_terminos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes aceptar los terminos de uso",
        )

    if len(data.clave) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La clave debe tener al menos 8 caracteres",
        )

    existe = session.exec(
        select(Usuario).where(
            (Usuario.correo == data.correo)
            | (Usuario.nombre_usuario == data.nombre_usuario)
        )
    ).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El correo o el usuario ya esta registrado",
        )

    usuario = Usuario(
        nombre_usuario=data.nombre_usuario,
        correo=data.correo,
        clave_hash=hashear_clave(data.clave),
        acepto_terminos=True,
    )
    session.add(usuario)
    session.commit()
    session.refresh(usuario)

    return {
        "id": usuario.id,
        "nombre_usuario": usuario.nombre_usuario,
        "correo": usuario.correo,
    }


@router.post("/login")
def login(data: UsuarioLogin, session: SessionDep):
    usuario = session.exec(
        select(Usuario).where(Usuario.correo == data.correo)
    ).first()

    if not usuario or not verificar_clave(data.clave, usuario.clave_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )

    token = crear_token(usuario.id, usuario.nombre_usuario)
    return {
        "token": token,
        "usuario": {
            "id": usuario.id,
            "nombre_usuario": usuario.nombre_usuario,
            "correo": usuario.correo,
        },
    }
