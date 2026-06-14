from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models  # para que se creen las tablas
from db import create_all_table
from app.routers import auth, publicaciones, categorias, comentarios

app = FastAPI(lifespan=create_all_table)

# Solo se aceptan peticiones desde estos origenes (no desde "todos lados").
# En desarrollo: el Live Server local. En produccion: la URL del sitio en S3.
# Se define en el .env como ORIGENES_PERMITIDOS (separados por coma).
origenes_permitidos = os.getenv(
    "ORIGENES_PERMITIDOS",
    "http://127.0.0.1:5500,http://localhost:5500",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes_permitidos,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(publicaciones.router)
app.include_router(categorias.router)
app.include_router(comentarios.router)


@app.get("/")
def root():
    return {"mensaje": "API de Mosaiq funcionando"}