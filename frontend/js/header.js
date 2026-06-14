function pintarHeader() {
  const usuario = obtenerUsuario();
  const encabezado = $(".encabezado");

  if (!usuario) return;

  // hay sesion: cambiamos los botones por el nombre y salir
  encabezado.find(".boton--secundario").remove();
  encabezado.find(".boton--primario").remove();

  const perfil = $("<a>")
    .attr("href", "usuario.html")
    .addClass("encabezado__usuario")
    .text(usuario.nombre_usuario);

  const salir = $("<button>")
    .addClass("boton boton--secundario")
    .text("Salir")
    .on("click", function () {
      cerrarSesion();
      window.location.href = "index.html";
    });

  encabezado.append(perfil);
  encabezado.append(salir);
}