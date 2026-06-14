const params = new URLSearchParams(window.location.search);
const categoriaUrl = params.get("categoria");
const buscarUrl = params.get("buscar");

function crearTarjeta(pub) {
  const autorNombre = pub.usuario ? pub.usuario.nombre_usuario : "";

  // clono el molde del HTML y solo relleno por selectores (sin crear etiquetas a mano)
  const $tarjeta = $("#molde-publicacion").clone();
  $tarjeta.removeAttr("id").removeAttr("hidden");

  $tarjeta.find(".publicacion__enlace").attr("href", "detalle.html?id=" + pub.id);
  $tarjeta.find(".publicacion__imagen").attr("src", pub.imagen_url).attr("alt", pub.titulo);
  $tarjeta.find(".publicacion__titulo").text(pub.titulo);
  $tarjeta.find(".publicacion__autor").text("por " + autorNombre);

  return $tarjeta;
}

async function cargarFeed(filtros = {}) {
  try {
    const publicaciones = await obtenerPublicaciones(filtros);
    $(".mosaico").empty();
    for (let i = 0; i < publicaciones.length; i++) {
      $(".mosaico").append(crearTarjeta(publicaciones[i]));
    }
  } catch (e) {
    alert(e.message);
  }
}

function crearBotonCategoria(nombre, id) {
  const boton = $("<button>").addClass("categorias__boton").text(nombre);
  if (id) {
    boton.attr("data-id", id);
  }
  boton.on("click", function () {
    $(".categorias__boton").removeClass("categorias__boton--activa");
    boton.addClass("categorias__boton--activa");
    if (id) {
      cargarFeed({ categoria: id });
      history.replaceState(null, "", "index.html?categoria=" + id);
    } else {
      cargarFeed({});
      history.replaceState(null, "", "index.html");
    }
  });
  return boton;
}

async function cargarCategorias() {
  try {
    const categorias = await obtenerCategorias();
    $(".categorias").empty();

    const todas = crearBotonCategoria("Todas", null);
    if (!categoriaUrl) {
      todas.addClass("categorias__boton--activa");
    }
    $(".categorias").append(todas);

    for (let i = 0; i < categorias.length; i++) {
      const boton = crearBotonCategoria(categorias[i].nombre, categorias[i].id);
      if (categoriaUrl && String(categorias[i].id) === String(categoriaUrl)) {
        boton.addClass("categorias__boton--activa");
      }
      $(".categorias").append(boton);
    }
  } catch (e) {
    console.error(e);
  }
}

$(".busqueda__campo").on("keydown", function (e) {
  if (e.key === "Enter") {
    const texto = $(this).val().trim();
    if (texto) {
      cargarFeed({ buscar: texto });
    } else {
      cargarFeed({});
    }
  }
});

cargarCategorias();
if (buscarUrl) {
  $(".busqueda__campo").val(buscarUrl);
  cargarFeed({ buscar: buscarUrl });
} else if (categoriaUrl) {
  cargarFeed({ categoria: categoriaUrl });
} else {
  cargarFeed();
}

pintarHeader();