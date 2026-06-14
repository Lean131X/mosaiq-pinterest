const params = new URLSearchParams(window.location.search);
const idPublicacion = params.get("id");

function formatearFecha(iso) {
  const f = new Date(iso);
  return "Publicado el " + f.toLocaleDateString("es-EC", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function crearTarjetaRelacionada(pub) {
  const autorNombre = pub.usuario ? pub.usuario.nombre_usuario : "";

  const $tarjeta = $("#molde-publicacion").clone();
  $tarjeta.removeAttr("id").removeAttr("hidden");

  $tarjeta.find(".publicacion__enlace").attr("href", "detalle.html?id=" + pub.id);
  $tarjeta.find(".publicacion__imagen").attr("src", pub.imagen_url).attr("alt", pub.titulo);
  $tarjeta.find(".publicacion__titulo").text(pub.titulo);
  $tarjeta.find(".publicacion__autor").text("por " + autorNombre);

  return $tarjeta;
}

async function cargarRelacionadas(categoriaId) {
  if (!categoriaId) return;
  try {
    const publicaciones = await obtenerPublicaciones({ categoria: categoriaId });
    const otras = publicaciones
      .filter((p) => String(p.id) !== String(idPublicacion))
      .slice(0, 4);
    $("#relacionadas").empty();
    for (let i = 0; i < otras.length; i++) {
      $("#relacionadas").append(crearTarjetaRelacionada(otras[i]));
    }
  } catch (e) {
    console.error(e);
  }
}

async function cargarPublicacion() {
  try {
    const pub = await obtenerPublicacion(idPublicacion);
    const autorNombre = pub.usuario ? pub.usuario.nombre_usuario : "";

    $("#detalle-titulo").text(pub.titulo);
    $("#detalle-descripcion").text(pub.descripcion);
    $("#autor-nombre").text(autorNombre);
    $("#autor-avatar").text(autorNombre ? autorNombre[0].toUpperCase() : "?");
    $("#autor-fecha").text(formatearFecha(pub.fecha_publicacion));

    if (pub.imagen_url) {
      $("#detalle-imagen").attr("src", pub.imagen_url).attr("alt", pub.titulo);
    }

    $("#detalle-tags").empty();
    if (pub.etiquetas) {
      const tags = pub.etiquetas.split(",");
      for (let i = 0; i < tags.length; i++) {
        const etiqueta = $("<span>").addClass("etiqueta").text("#" + tags[i].trim());
        $("#detalle-tags").append(etiqueta);
      }
    }
    
    cargarRelacionadas(pub.categoria_id);
  } catch (e) {
    $("#detalle-titulo").text(e.message);
  }
}




function crearComentarioElemento(c) {
  const autorNombre = c.usuario ? c.usuario.nombre_usuario : "";

  const $comentario = $("#molde-comentario").clone();
  $comentario.removeAttr("id").removeAttr("hidden");

  $comentario.find(".comentario__avatar").text(autorNombre ? autorNombre[0].toUpperCase() : "?");
  $comentario.find(".comentario__autor").text(autorNombre);
  $comentario.find(".comentario__texto").text(c.texto);

  return $comentario;
}

async function cargarComentarios() {
  try {
    const comentarios = await obtenerComentarios(idPublicacion);
    $("#lista-comentarios").empty();
    for (let i = 0; i < comentarios.length; i++) {
      $("#lista-comentarios").append(crearComentarioElemento(comentarios[i]));
    }
  } catch (e) {
    console.error(e);
  }
}

function montarCajaComentario() {
  const usuario = obtenerUsuario();
  $("#nuevo-comentario").empty();

  if (!usuario) {
    const aviso = $("<p>").addClass("comentarios__aviso").text("inicia sesion para comentar");
    $("#nuevo-comentario").append(aviso);
    return;
  }

  const input = $("<input>")
    .attr("type", "text")
    .addClass("comentarios__campo")
    .attr("placeholder", "Escribe un comentario...");

  const boton = $("<button>")
    .attr("type", "button")
    .addClass("boton boton--primario")
    .text("Enviar");

  boton.on("click", async function () {
    const texto = input.val().trim();
    if (!texto) return;
    try {
      await crearComentario(idPublicacion, texto);
      input.val("");
      cargarComentarios();
    } catch (e) {
      alert(e.message);
    }
  });

  $("#nuevo-comentario").append(input).append(boton);
}

if (!idPublicacion) {
  $("#detalle-titulo").text("publicacion no especificada");
} else {
  cargarPublicacion();
  cargarComentarios();
  montarCajaComentario();
}

// desde el detalle la busqueda tambien lleva al feed con el termino
$(".busqueda__campo").on("keydown", function (e) {
  if (e.key === "Enter") {
    const texto = $(this).val().trim();
    if (texto) {
      window.location.href = "index.html?buscar=" + encodeURIComponent(texto);
    }
  }
});

pintarHeader();