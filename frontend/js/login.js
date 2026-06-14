$("#btnEntrar").on("click", async function () {
  const correo = $("#correo").val().trim();
  const clave = $("#clave").val();

  if (!correo || !clave) {
    alert("Completa todos los campos");
    return;
  }

  try {
    const data = await iniciarSesion(correo, clave);
    guardarSesion(data.token, data.usuario);
    window.location.href = "index.html";
  } catch (e) {
    alert(e.message);
  }
});