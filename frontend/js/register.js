$("#btnRegistrar").on("click", async function () {
  const nombre = $("#nombre").val().trim();
  const correo = $("#correo").val().trim();
  const clave = $("#clave").val();
  const clave2 = $("#clave2").val();
  const terminos = $("#terminos").prop("checked");

  if (!nombre || !correo || !clave) {
    alert("Completa todos los campos");
    return;
  }
  if (clave !== clave2) {
    alert("Las contrasenas no coinciden");
    return;
  }

  try {
    await registrar({
      nombre_usuario: nombre,
      correo: correo,
      clave: clave,
      acepto_terminos: terminos,
    });
    alert("Cuenta creada, ahora inicia sesion");
    window.location.href = "login.html";
  } catch (e) {
    alert(e.message);
  }
});