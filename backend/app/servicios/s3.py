# subir archivos a s3 y devolver la url publica (cloud)
import os
import uuid
import boto3

REGION = os.getenv("AWS_REGION", "us-east-1")
BUCKET = os.getenv("AWS_BUCKET")
CARPETA = "imagenes/"


def get_cliente():
    # boto3 toma las credenciales desde las variables de entorno (.env)
    return boto3.client("s3", region_name=REGION)


def subir_imagen(contenido: bytes, tipo_contenido: str) -> str:
    # guarda el archivo en el bucket y devuelve su url publica
    extension = tipo_contenido.split("/")[-1]  # ej. image/jpeg -> jpeg
    clave = CARPETA + str(uuid.uuid4()) + "." + extension
    cliente = get_cliente()
    cliente.put_object(
        Bucket=BUCKET,
        Key=clave,
        Body=contenido,
        ContentType=tipo_contenido,
    )
    return f"https://{BUCKET}.s3.{REGION}.amazonaws.com/{clave}"

def eliminar_imagen(url: str) -> None:
    # borra el archivo del bucket a partir de su url publica (derecho al olvido)
    if not url or ".amazonaws.com/" not in url:
        return
    clave = url.split(".amazonaws.com/", 1)[1]  # ej. imagenes/uuid.jpeg
    cliente = get_cliente()
    cliente.delete_object(Bucket=BUCKET, Key=clave)