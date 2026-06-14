# Regla de negocio: cuando una publicacion es visible.
# Vive aqui (servicio) y no en los routers, que solo exponen los endpoints.


def publicacion_visible(publicacion, usuario) -> bool:
    # oculta o inexistente: no visible
    if not publicacion or publicacion.estado != "activo":
        return False
    # privada: solo el dueno
    if not publicacion.es_publico:
        if not usuario or usuario["id"] != publicacion.usuario_id:
            return False
    return True