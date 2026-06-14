from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre_usuario: str = Field(unique=True)
    correo: str = Field(unique=True)
    clave_hash: str
    acepto_terminos: bool = False
    fecha_registro: datetime = Field(default_factory=datetime.now)

    publicaciones: list["Publicacion"] = Relationship(back_populates="usuario")
    comentarios: list["Comentario"] = Relationship(back_populates="usuario")


class UsuarioCreate(SQLModel):
    nombre_usuario: str
    correo: str
    clave: str
    acepto_terminos: bool = False


class Categoria(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True)

    publicaciones: list["Publicacion"] = Relationship(back_populates="categoria")


class Publicacion(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    titulo: str
    descripcion: str = ""
    etiquetas: str = ""
    imagen_url: str = ""
    es_publico: bool = True
    estado: str = "activo"
    fecha_publicacion: datetime = Field(default_factory=datetime.now)

    categoria_id: int | None = Field(default=None, foreign_key="categoria.id")
    usuario_id: int = Field(foreign_key="usuario.id")

    usuario: Usuario | None = Relationship(back_populates="publicaciones")
    categoria: Categoria | None = Relationship(back_populates="publicaciones")
    comentarios: list["Comentario"] = Relationship(back_populates="publicacion")


class PublicacionCreate(SQLModel):
    titulo: str
    descripcion: str = ""
    etiquetas: str = ""
    imagen_url: str = ""
    categoria_id: int | None = None
    es_publico: bool = True

class PublicacionUpdate(SQLModel):
    titulo: str
    descripcion: str = ""
    etiquetas: str = ""
    categoria_id: int | None = None
    

class Comentario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    texto: str
    fecha: datetime = Field(default_factory=datetime.now)

    publicacion_id: int = Field(foreign_key="publicacion.id")
    usuario_id: int = Field(foreign_key="usuario.id")

    publicacion: Publicacion | None = Relationship(back_populates="comentarios")
    usuario: Usuario | None = Relationship(back_populates="comentarios")


class ComentarioCreate(SQLModel):
    texto: str
    publicacion_id: int


class UsuarioPublic(SQLModel):
    id: int
    nombre_usuario: str


class CategoriaPublic(SQLModel):
    id: int
    nombre: str


class PublicacionPublic(SQLModel):
    id: int
    titulo: str
    descripcion: str
    etiquetas: str
    imagen_url: str
    es_publico: bool
    fecha_publicacion: datetime
    categoria_id: int | None
    usuario: UsuarioPublic | None = None
    categoria: CategoriaPublic | None = None


class ComentarioPublic(SQLModel):
    id: int
    texto: str
    fecha: datetime
    usuario: UsuarioPublic | None = None