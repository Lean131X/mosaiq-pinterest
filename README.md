# Mosaiq

Aplicación web de contenido multimedia inspirada en Pinterest. Permite a las personas
usuarias registrarse, iniciar sesión, publicar imágenes y organizarlas en un feed tipo
mosaico, con búsqueda, categorías y comentarios. El almacenamiento de las imágenes se
realiza en la nube mediante Amazon S3.

Proyecto Integrador – Cuarto Nivel, Ingeniería en Sistemas de Información.

## Aplicación desplegada

- **Aplicación web:** http://mosaiq-web-2026.s3-website-us-east-1.amazonaws.com
- **API (documentación):** http://54.210.67.108:8000/docs

> El acceso es por HTTP (sin HTTPS) por tratarse de un despliegue académico.

## Tecnologías

**Frontend**
- HTML5 semántico
- CSS3 (modelo de caja, variables globales, diseño responsivo *mobile-first*, layout en mosaico fluido)
- JavaScript con jQuery (manipulación del DOM y manejo de eventos)

**Backend**
- Python con FastAPI
- SQLModel sobre SQLite
- Autenticación con tokens JWT y contraseñas cifradas con bcrypt
- boto3 para la integración con Amazon S3

**Nube (AWS)**
- Amazon S3 para almacenamiento de imágenes
- Amazon S3 para alojamiento del sitio web estático (frontend)
- Amazon EC2 para ejecutar la API
- IAM para la gestión de accesos bajo el principio de mínimo privilegio

## Estructura del proyecto

```text
mosaiq/
├── backend/                  API en FastAPI
│   ├── main.py               Punto de entrada; configura CORS y registra los routers
│   ├── db.py                 Conexión y sesión de la base de datos
│   ├── models.py             Modelos de datos (Usuario, Publicacion, Categoria, Comentario)
│   ├── seed.py               Carga inicial de las categorías del sistema
│   ├── requirements.txt      Dependencias del backend
│   ├── .env.example          Plantilla de variables de entorno (el .env real no se versiona)
│   └── app/
│       ├── routers/          Endpoints por recurso
│       │   ├── auth.py            Registro e inicio de sesión
│       │   ├── publicaciones.py   CRUD de publicaciones
│       │   ├── categorias.py      Listado de categorías
│       │   └── comentarios.py     Comentarios de las publicaciones
│       └── servicios/        Lógica de apoyo
│           ├── seguridad.py       Tokens, cifrado y verificación de usuario
│           ├── s3.py              Subir y eliminar imágenes en Amazon S3
│           └── visibilidad.py     Regla de negocio de visibilidad de publicaciones
│
└── frontend/                 Interfaz web
    ├── index.html            Feed principal
    ├── login.html            Inicio de sesión
    ├── register.html         Registro
    ├── usuario.html          Perfil con las publicaciones propias
    ├── detalle.html          Detalle de una publicación y comentarios
    ├── terminos.html         Términos de uso
    ├── css/                  Estilos por página + estilos globales
    └── js/
        ├── api.js                Funciones que consumen la API
        ├── header.js             Encabezado según la sesión
        ├── index.js              Lógica del feed y categorías
        ├── usuario.js            Perfil, subir, editar y eliminar pines
        ├── detalle.js            Detalle y comentarios
        ├── login.js              Inicio de sesión
        └── register.js           Registro
```

## Funcionalidades

- Registro e inicio de sesión con aceptación de términos de uso.
- Publicación de imágenes con título, descripción, categoría y etiquetas.
- Feed tipo mosaico; sin filtros muestra contenido aleatorio.
- Búsqueda por título, descripción o etiquetas desde cualquier página.
- Filtrado por categorías.
- Edición y eliminación de las publicaciones propias desde el perfil.
- Al eliminar una publicación, la imagen también se borra de Amazon S3 (derecho al olvido).
- Comentarios en las publicaciones.

## Cómo ejecutar el proyecto en local

### Requisitos
- Python 3.10 o superior
- Un editor con servidor estático (por ejemplo, la extensión Live Server de VS Code)
- Credenciales de AWS con acceso al bucket de S3

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

En Windows, la activación del entorno es `venv\Scripts\activate`.

Crea un archivo `.env` dentro de `backend/` tomando como guía `.env.example`, y complétalo
con tus valores (región, bucket y credenciales de AWS). Luego:

```bash
python seed.py
uvicorn main:app --reload
```

La documentación interactiva queda disponible en `http://127.0.0.1:8000/docs`.

### Frontend

Abre la carpeta `frontend/` con Live Server (o cualquier servidor estático). Asegúrate de
que la constante `API` en `js/api.js` apunte a la dirección de tu backend.

## Variables de entorno

El backend se configura mediante un archivo `.env` (no incluido en el repositorio por
seguridad). Las variables utilizadas son:

| Variable | Descripción |
| --- | --- |
| `ORIGENES_PERMITIDOS` | Orígenes autorizados para CORS, separados por coma |
| `AWS_REGION` | Región de AWS (por ejemplo, us-east-1) |
| `AWS_BUCKET` | Nombre del bucket de S3 para las imágenes |
| `AWS_ACCESS_KEY_ID` | Clave de acceso del usuario IAM |
| `AWS_SECRET_ACCESS_KEY` | Clave secreta del usuario IAM |

## Seguridad

- Las contraseñas se almacenan cifradas con bcrypt, nunca en texto plano.
- La sesión se maneja con un token JWT que expira.
- El acceso a S3 se realiza con un usuario IAM con permisos mínimos.
- El contenido de las personas usuarias se inserta en el DOM como texto, evitando la
  ejecución de scripts inyectados.
- El archivo `.env` con las credenciales no se versiona.

## Autores

- Leandro Jaramillo
- Matías Morán
- Jimmy Herrera
