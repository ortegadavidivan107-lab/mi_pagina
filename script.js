"use strict";
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ===== Menú de navegación ===== */
const menu = $("#menu"), btnMenu = $("#btnMenu");
btnMenu.addEventListener("click", () => {
  const abierto = menu.classList.toggle("abierto");
  btnMenu.setAttribute("aria-expanded", abierto);
});
$$("#menu a").forEach(a => a.addEventListener("click", () => {
  menu.classList.remove("abierto");
  btnMenu.setAttribute("aria-expanded", "false");
}));

// Resalta el enlace de la sección visible
const enlaces = $$("#menu a");
const observador = new IntersectionObserver(entradas => {
  entradas.forEach(e => {
    if (e.isIntersecting) {
      enlaces.forEach(a => a.classList.toggle("activo", a.getAttribute("href") === "#" + e.target.id));
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });
$$("main section").forEach(s => observador.observe(s));

/* ===== Botones que llevan a una sección ===== */
$$("[data-ir]").forEach(b => b.addEventListener("click", () => {
  document.getElementById(b.dataset.ir).scrollIntoView({ behavior: "smooth" });
}));

/* ===== Filtro de razas ===== */
function filtrarRazas(tipo) {
  let visibles = 0;
  $$(".raza").forEach(r => {
    const mostrar = tipo === "todas" || r.dataset.tipo === tipo;
    r.classList.toggle("oculta", !mostrar);
    if (mostrar) visibles++;
  });
  $("#sinRazas").hidden = visibles > 0;
}
$$(".filtro").forEach(b => b.addEventListener("click", () => {
  $$(".filtro").forEach(x => x.classList.remove("activo"));
  b.classList.add("activo");
  filtrarRazas(b.dataset.filtro);
}));

/* ===== Ver más / ver menos ===== */
$$(".btn-mas").forEach(b => b.addEventListener("click", () => {
  const detalle = b.previousElementSibling;
  detalle.hidden = !detalle.hidden;
  b.textContent = detalle.hidden ? "Ver más" : "Ver menos";
  b.setAttribute("aria-expanded", !detalle.hidden);
}));

/* ===== Botón volver arriba ===== */
const btnArriba = $("#btnArriba");
window.addEventListener("scroll", () => { btnArriba.hidden = window.scrollY < 400; });
btnArriba.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ===== Formulario ===== */
const form = $("#formOpinion"), respuesta = $("#respuesta");
const comentario = $("#comentario"), contador = $("#contador");
const CLAVE = "pasionEquinaOpiniones";

comentario.addEventListener("input", () => { contador.textContent = comentario.value.length + "/200"; });

function mostrarError(id, mensaje) {
  $("#e-" + id).textContent = mensaje;
  const campo = document.getElementById(id);
  if (campo) campo.classList.toggle("invalido", mensaje !== "");
  return mensaje === "";
}

function validar() {
  const nombre = $("#nombre").value.trim();
  const correo = $("#correo").value.trim();
  const edad = $("#edad").value;
  let ok = true;
  ok = mostrarError("nombre", nombre.length < 3 ? "Escribe tu nombre completo (mínimo 3 letras)." : "") && ok;
  ok = mostrarError("correo", !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo) ? "Escribe un correo válido, por ejemplo nombre@correo.com." : "") && ok;
  ok = mostrarError("edad", (edad === "" || edad < 1 || edad > 120) ? "Escribe una edad entre 1 y 120." : "") && ok;
  ok = mostrarError("raza", $("#raza").value === "" ? "Selecciona tu raza favorita." : "") && ok;
  ok = mostrarError("monta", !form.monta.value ? "Indica si has montado a caballo." : "") && ok;
  ok = mostrarError("comentario", comentario.value.trim().length < 10 ? "Cuéntanos al menos 10 caracteres." : "") && ok;
  ok = mostrarError("acepto", !$("#acepto").checked ? "Debes aceptar para continuar." : "") && ok;
  return ok;
}

function leerOpiniones() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { return []; }
}

function pintarOpiniones() {
  const lista = $("#listaOpiniones");
  lista.innerHTML = "";
  const datos = leerOpiniones();
  if (datos.length === 0) {
    const li = document.createElement("li");
    li.className = "vacio";
    li.textContent = "Aún no hay opiniones. ¡Escribe la primera!";
    lista.appendChild(li);
    return;
  }
  datos.slice().reverse().forEach(o => {
    const li = document.createElement("li");
    const autor = document.createElement("strong");
    autor.textContent = o.nombre;
    const texto = document.createElement("p");
    texto.textContent = o.comentario + " (Favorita: " + o.raza + ")";
    li.append(autor, texto);
    lista.appendChild(li);
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();
  if (!validar()) {
    respuesta.className = "mal";
    respuesta.textContent = "Revisa los campos marcados e inténtalo de nuevo.";
    return;
  }
  const datos = leerOpiniones();
  datos.push({ nombre: $("#nombre").value.trim(), raza: $("#raza").value, comentario: comentario.value.trim() });
  try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch { /* sin almacenamiento */ }
  const primerNombre = $("#nombre").value.trim().split(" ")[0];
  form.reset();
  contador.textContent = "0/200";
  respuesta.className = "ok";
  respuesta.textContent = "¡Gracias, " + primerNombre + "! Tu opinión fue enviada.";
  pintarOpiniones();
});

form.addEventListener("reset", () => {
  ["nombre", "correo", "edad", "raza", "monta", "comentario", "acepto"].forEach(id => mostrarError(id, ""));
  respuesta.textContent = "";
  contador.textContent = "0/200";
});

$("#btnBorrar").addEventListener("click", () => {
  if (confirm("¿Borrar todas las opiniones guardadas?")) {
    try { localStorage.removeItem(CLAVE); } catch { /* nada */ }
    pintarOpiniones();
  }
});

$("#anio").textContent = new Date().getFullYear();
pintarOpiniones();
