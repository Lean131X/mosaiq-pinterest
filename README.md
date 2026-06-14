# Mosaiq — Proyecto Integrador 4to Nivel

Aplicación web de contenido multimedia tipo Pinterest.

## Estructura

```
mosaiq/
├── frontend/   interfaz (HTML, CSS, JS)
└── backend/    API (FastAPI + SQLModel) y base de datos (SQLite)
```

## Correr el backend

Dentro de la carpeta `backend/`:

```bash
python -m venv venv

# Activar el entorno virtual:
#   Windows:   venv\Scripts\activate
#   Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
fastapi dev main.py
```

La API queda en `http://127.0.0.1:8000`
La documentación automática en `http://127.0.0.1:8000/docs`

## Correr el frontend

Abrir `frontend/index.html` con **Live Server** (extensión de VS Code).

## Estado actual

Esqueleto del proyecto. El frontend tiene las páginas y estilos del Avance 1.
El backend está armado pero los modelos y endpoints aún no se implementan
(ese es el siguiente paso: el modelo de datos).
