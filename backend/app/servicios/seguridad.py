import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi import Header, HTTPException, status, Depends

SECRETO = "clave_secreta_de_desarrollo_cambiar_luego"
ALGORITMO = "HS256"
HORAS_VALIDEZ = 2


def hashear_clave(clave: str) -> str:
    return bcrypt.hashpw(clave.encode(), bcrypt.gensalt()).decode()


def verificar_clave(clave: str, clave_hash: str) -> bool:
    return bcrypt.checkpw(clave.encode(), clave_hash.encode())


def crear_token(usuario_id: int, nombre_usuario: str) -> str:
    payload = {
        "id": usuario_id,
        "nombre_usuario": nombre_usuario,
        "exp": datetime.now(timezone.utc) + timedelta(hours=HORAS_VALIDEZ),
    }
    return jwt.encode(payload, SECRETO, algorithm=ALGORITMO)


def leer_token(token: str) -> dict:
    return jwt.decode(token, SECRETO, algorithms=[ALGORITMO])


def usuario_actual(authorization: str | None = Header(default=None)) -> dict:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falta el token de sesion",
        )
    partes = authorization.split(" ")
    if len(partes) == 2:
        token = partes[1]
    else:
        token = partes[0]
    try:
        return leer_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido o expirado",
        )


def usuario_actual_opcional(authorization: str | None = Header(default=None)) -> dict | None:
    if not authorization:
        return None
    partes = authorization.split(" ")
    if len(partes) == 2:
        token = partes[1]
    else:
        token = partes[0]
    try:
        return leer_token(token)
    except Exception:
        return None


UsuarioActual = Annotated[dict, Depends(usuario_actual)]
UsuarioOpcional = Annotated[dict | None, Depends(usuario_actual_opcional)]