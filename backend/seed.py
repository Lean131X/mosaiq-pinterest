# Carga las categorias fijas del sistema (las necesita la app; no son datos de prueba).
# Correr una vez:             python seed.py
# Para AGREGAR una categoria: suma su nombre a la lista de abajo y corre de nuevo.
#                             (solo agrega las que falten; no duplica).
from sqlmodel import SQLModel, Session, select
from db import engine
import models

CATEGORIAS = ["Naturaleza", "Arte", "Tecnologia", "Comida", "Viajes", "Animales", "Deporte"]

# crea las tablas si la base aun no existe (por si es la primera vez)
SQLModel.metadata.create_all(engine)

with Session(engine) as session:
    existentes = session.exec(select(models.Categoria.nombre)).all()
    nuevas = 0
    for nombre in CATEGORIAS:
        if nombre not in existentes:
            session.add(models.Categoria(nombre=nombre))
            nuevas += 1
    session.commit()
    print(f"Categorias listas: {nuevas} nuevas, {len(CATEGORIAS)} en total")