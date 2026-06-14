const usuario = obtenerUsuario();

if (!usuario) {
  window.location.href = "login.html";
}

function cargarPerfil() {
  $("#perfil-avatar").text(usuario.nombre_usuario[0].toUpperCase());
  $("#perfil-nombre").text(usuario.nombre_usuario);
  $("#perfil-usuario").text("@" + usuario.nombre_usuario);
  $("#perfil-datos").text("");
}

cargarPerfil();

function crearTarjeta(pub) {
  const categoriaNombre = pub.categoria ? pub.categoria.nombre : "";

  // clono el molde del HTML y relleno por selectores
  const $tarjeta = $("#molde-publicacion").clone();
  $tarjeta.removeAttr("id").removeAttr("hidden");

  $tarjeta.find(".publicacion__enlace").attr("href", "detalle.html?id=" + pub.id);
  $tarjeta.find(".publicacion__imagen").attr("src", pub.imagen_url).attr("alt", pub.titulo);
  $tarjeta.find(".publicacion__titulo").text(pub.titulo);
  $tarjeta.find(".publicacion__autor").text(categoriaNombre);
  // boton eliminar: en el perfil todos los pines son tuyos
  $tarjeta.find(".publicacion__accion--eliminar").on("click", async function () {
    if (!confirm("Eliminar este pin? No se podra deshacer.")) return;
    try {
      await eliminarPublicacion(pub.id);
      cargarPublicaciones();
    } catch (e) {
      alert(e.message);
    }
  });
  // boton editar: pre-llena el modal con los datos de este pin
  $tarjeta.find(".publicacion__accion--editar").on("click", function () {
    $("#editarId").val(pub.id);
    $("#editarTitulo").val(pub.titulo);
    $("#editarDescripcion").val(pub.descripcion);
    $("#editarTags").val(pub.etiquetas);
    $("#editarCategoria").val(String(pub.categoria_id));
  });
  return $tarjeta;
}

async function cargarPublicaciones() {
  try {
    const publicaciones = await obtenerPublicaciones({ usuario: usuario.id });
    $("#mosaico-usuario").empty();
    for (let i = 0; i < publicaciones.length; i++) {
      $("#mosaico-usuario").append(crearTarjeta(publicaciones[i]));
    }
    $("#perfil-datos").text(publicaciones.length + " publicaciones");
  } catch (e) {
    console.error(e);
  }
}

cargarPublicaciones();

async function cargarCategoriasModal() {
  try {
    const categorias = await obtenerCategorias();
    $("#categoriaImg").empty();
    $("#editarCategoria").empty();
    for (let i = 0; i < categorias.length; i++) {
      $("#categoriaImg").append($("<option>").val(categorias[i].id).text(categorias[i].nombre));
      $("#editarCategoria").append($("<option>").val(categorias[i].id).text(categorias[i].nombre));
    }
  } catch (e) {
    console.error(e);
  }
}

$("#btnPublicar").on("click", async function () {
  const archivo = $("#imagenImg")[0].files[0];
  const titulo = $("#tituloImg").val().trim();
  const descripcion = $("#descripcionImg").val().trim();
  const etiquetas = $("#tagsImg").val().trim();
  const categoria = $("#categoriaImg").val();

  if (!titulo || !archivo) {
    alert("Pon al menos un titulo y elige una imagen");
    return;
  }

  const formData = new FormData();
  formData.append("titulo", titulo);
  formData.append("descripcion", descripcion);
  formData.append("etiquetas", etiquetas);
  formData.append("categoria_id", categoria);
  formData.append("es_publico", true);
  formData.append("imagen", archivo);

  try {
    await crearPublicacion(formData);
    alert("Publicacion creada");
    window.location.href = "usuario.html";
  } catch (e) {
    alert(e.message);
  }
});
$("#btnGuardarEdicion").on("click", async function () {
  const id = $("#editarId").val();
  const titulo = $("#editarTitulo").val().trim();
  const descripcion = $("#editarDescripcion").val().trim();
  const etiquetas = $("#editarTags").val().trim();
  const categoria = $("#editarCategoria").val();

  if (!titulo) {
    alert("El titulo no puede estar vacio");
    return;
  }

  try {
    await editarPublicacion(id, {
      titulo: titulo,
      descripcion: descripcion,
      etiquetas: etiquetas,
      categoria_id: categoria ? Number(categoria) : null,
    });
    alert("Pin actualizado");
    window.location.href = "usuario.html";
  } catch (e) {
    alert(e.message);
  }
});
cargarCategoriasModal();

// en el perfil la busqueda lleva al feed con el termino ya aplicado
$(".busqueda__campo").on("keydown", function (e) {
  if (e.key === "Enter") {
    const texto = $(this).val().trim();
    if (texto) {
      window.location.href = "index.html?buscar=" + encodeURIComponent(texto);
    }
  }
});

pintarHeader();