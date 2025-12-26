const flashBtn = document.getElementById("flashBtn");
const modal = document.getElementById("flashModal");
const cancelBtn = document.getElementById("cancelFlash");
const saveBtn = document.getElementById("saveBtn");
const itemInput = document.getElementById("flashItem");
const locationInput = document.getElementById("flashLocation");
const modalTitle = document.getElementById("modalTitle");
const categoryInput = document.getElementById("flashCategory");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("categorySelect");
const listEl = document.getElementById("list");
searchInput.addEventListener("input", renderList);

categorySelect.addEventListener("change", () => {
  activeCategory = categorySelect.value;
  renderList();
});
const CATEGORIES = [
  "Todas",
  "Documentos",
  "Trabajo",
  "Tecnología",
  "Herramientas",
  "Cables",
  "Deportes",
  "Varios"
];


let activeCategory = "Todas";

 let activeDeleteBtn = null;
   
let selectedItemId = null;

// Estado en memoria (por ahora)
let items = [];
const storedItems = localStorage.getItem("wipi_items");

if (storedItems) {
  items = JSON.parse(storedItems);
}
let lang = "es"; // idioma por defecto

// 🌍 Idiomas
const i18n = {
  es: {
    searchPlaceholder: "¿Qué estás buscando?",
    flashTitle: "⚡ Modo Flash",
    editTitle: "✏️ Editar Objeto",
    save: "Guardar ⚡",
    update: "Actualizar ✏️",
    cancel: "Cancelar",
    lastSeen: "Visto por última vez:",
    noItems: "Aún no hay objetos.",
    hint: "Toca ⚡ cuando encuentres algo que creías perdido.",
    deleted: "Objeto eliminado",
    updated: "Actualizado ✓",
    saved: "Guardado ✓"
  },
  en: {
    searchPlaceholder: "What are you looking for?",
    flashTitle: "⚡ Flash Mode",
    editTitle: "✏️ Edit item",
    save: "Save ⚡",
    update: "Update ✏️",
    cancel: "Cancel",
    lastSeen: "Last seen:",
    noItems: "No items yet.",
    hint: "Tap ⚡ when you find something you thought was lost.",
    deleted: "Item deleted",
    updated: "Updated ✓",
    saved: "Saved ✓"
  }
};


// función traductora
function t(key) {
  return i18n[lang][key] || key;
}

searchInput.placeholder = "¿Qué estás buscando?";


function openModal() {
  modal.classList.remove("hidden");

 // ✏️ EDIT MODE
  if (selectedItemId) {
  modalTitle.textContent = "✏️ Editar objeto";
  saveBtn.textContent = "Actualizar ✏️";

    modal.classList.add("edit-mode");
    modal.classList.remove("flash-mode");
  } else {
    // ⚡ FLASH MODE
    modalTitle.textContent = "⚡ Modo Flash";
  saveBtn.textContent = "Guardar ⚡";


    modal.classList.add("flash-mode");
    modal.classList.remove("edit-mode");
  }

  itemInput.focus();
}

function closeModal() {
  modal.classList.add("hidden");
  itemInput.value = "";
  locationInput.value = "";
document.querySelectorAll(".item.selected")
  .forEach(el => el.classList.remove("selected"));
document
  .querySelectorAll(".delete-btn.active")
  .forEach(btn => btn.classList.remove("active"));

selectedItemId = null;
}

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Justo ahora";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function renderList() {

  // 1️⃣ Vacío total
  if (items.length === 0) {
    listEl.innerHTML = `
      <div class="item">
        <strong>Aún no hay objetos.</strong>
        <div style="opacity:.7; margin-top:6px;">
          Toca ⚡ cuando encuentres algo que creías perdido.
        </div>
      </div>
    `;
    return;
  }

  const query = searchInput.value.toLowerCase();

  // 2️⃣ FILTRO COMBINADO (categoría + búsqueda)
  const filtered = items.filter(it => {
    const matchCategory =
      activeCategory === "Todas" || it.category === activeCategory;

    const matchSearch =
      it.name.toLowerCase().includes(query) ||
      it.location.toLowerCase().includes(query);

    return matchCategory && matchSearch;
  });

  // 3️⃣ Orden
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.lastSeen) - new Date(a.lastSeen)
  );

  // 4️⃣ Render
  listEl.innerHTML = sorted.map(it => `
    <div class="item" data-id="${it.id}">
      <div class="item-content">
        <div class="item-main">
          <div class="item-title">${escapeHtml(it.name)}</div>

          <div class="item-location">
            <span>Visto por última vez:</span>
            <span>${escapeHtml(it.location)}</span>
          </div>

          <div class="item-meta">
            ${timeAgo(it.lastSeen)} • ${it.category}
          </div>
        </div>

        <button class="delete-btn" title="Delete">🗑️</button>
      </div>
    </div>
  `).join("");
}

function showToast(text = "Saved ✓") {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 250);
  }, 1200);
}

function showToast(text) {
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");

  toastText.textContent = text;
  toast.classList.remove("hidden");

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 250);
  }, 1500);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
listEl.addEventListener("click", (e) => {

  // 🗑️ SI SE HIZO CLICK EN DELETE → NO ABRIR MODAL
  const deleteBtn = e.target.closest('.delete-btn');
if (deleteBtn) {
  e.stopPropagation();

  if (!confirm("¿Seguro que deseas eliminar este ítem?")) return;

  const itemEl = deleteBtn.closest('.item');
  if (!itemEl) return;

  const id = itemEl.dataset.id;
  items = items.filter(it => String(it.id) !== String(id));
  localStorage.setItem("wipi_items", JSON.stringify(items));
  renderList();
  return;
}


  // ✏️ CLICK NORMAL EN ITEM → EDITAR
  const itemEl = e.target.closest(".item");
  if (!itemEl) return;

  selectedItemId = itemEl.dataset.id;

  const item = items.find(it => String(it.id) === String(selectedItemId));
  if (!item) return;

  itemInput.value = item.name;
  locationInput.value = item.location;
  categoryInput.value = item.category;

  document.querySelectorAll(".item.selected")
    .forEach(el => el.classList.remove("selected"));

  itemEl.classList.add("selected");

  openModal();
});



// ---------- Events ----------
flashBtn.addEventListener("click", openModal);
cancelBtn.addEventListener("click", closeModal);

saveBtn.addEventListener("click", () => {
  const name = itemInput.value.trim();
  const location = locationInput.value.trim();

  if (!name || !location) {
    alert("Please fill both fields.");
    return;
  }

  // ✏️ EDIT MODE
if (selectedItemId) {
  const idx = items.findIndex(
    it => String(it.id) === String(selectedItemId)
  );

  if (idx === -1) return;

  items[idx].name = name;
  items[idx].location = location;
  items[idx].category = categoryInput.value;
  items[idx].lastSeen = new Date().toISOString();

  localStorage.setItem("wipi_items", JSON.stringify(items));
renderList();
showToast("Actualizado ✓");
closeModal();
return;
}


  // ➕ NEW ITEM
  const newItem = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name,
    location,
    category: categoryInput.value,
    lastSeen: new Date().toISOString()
  };

  items.push(newItem);
  localStorage.setItem("wipi_items", JSON.stringify(items));
renderList();
showToast("Guardado ✓");
closeModal();
});

// Primera pintura
renderList();
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
  }, 3000);
});

