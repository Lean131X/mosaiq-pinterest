const API = "http://54.210.67.108:8000";

// guarda/lee el token de sesion en el navegador
function guardarSesion(token, usuario) {
  localStorage.setItem("token", token);
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

function obtenerToken() {
  return localStorage.getItem("token");
}

function obtenerUsuario() {
  const u = localStorage.getItem("usuario");
  return u ? JSON.parse(u) : null;
}

function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

// registro
async function registrar(datos) {
  const res = await fetch(API + "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Error al registrar");
  return data;
}

// login
async function iniciarSesion(correo, clave) {
  const res = await fetch(API + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, clave }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Error al iniciar sesion");
  return data;
}

// feed de publicaciones
async function obtenerPublicaciones(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(API + "/publicaciones/" + (query ? "?" + query : ""));
  const data = await res.json();
  if (!res.ok) throw new Error("error al cargar publicaciones");
  return data;
}

// categorias
async function obtenerCategorias() {
  const res = await fetch(API + "/categorias/");
  const data = await res.json();
  if (!res.ok) throw new Error("error al cargar categorias");
  return data;
}

// una sola publicacion por id (manda token si hay, para las privadas)
async function obtenerPublicacion(id) {
  const headers = {};
  const token = obtenerToken();
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(API + "/publicaciones/" + id, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "error al cargar la publicacion");
  return data;
}

// comentarios de una publicacion
async function obtenerComentarios(id) {
  const res = await fetch(API + "/comentarios/?publicacion=" + id);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "error al cargar comentarios");
  return data;
}

// crear comentario (requiere sesion)
async function crearComentario(id, texto) {
  const res = await fetch(API + "/comentarios/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + obtenerToken(),
    },
    body: JSON.stringify({ texto, publicacion_id: id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "error al comentar");
  return data;
}

// crear publicacion con imagen (requiere sesion)
async function crearPublicacion(formData) {
  const res = await fetch(API + "/publicaciones/", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + obtenerToken(),
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "error al publicar");
  return data;
}

// editar una publicacion (requiere sesion, solo el dueño)
async function editarPublicacion(id, datos) {
  const res = await fetch(API + "/publicaciones/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + obtenerToken(),
    },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "error al editar");
  return data;
}

// eliminar (ocultar) una publicacion (requiere sesion, solo el dueño)
async function eliminarPublicacion(id) {
  const res = await fetch(API + "/publicaciones/" + id, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + obtenerToken(),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "error al eliminar");
  return data;
}