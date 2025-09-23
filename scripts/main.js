const STORAGE_KEY = "mod-gallery-state-v1";
const navButtons = document.querySelectorAll(".nav-btn");
const views = document.querySelectorAll(".view");
const galleryGrid = document.getElementById("galleryGrid");
const galleryEmpty = document.getElementById("galleryEmpty");
const categoryFilters = document.getElementById("categoryFilters");
const categoryList = document.getElementById("categoryList");
const photoCategorySelect = document.getElementById("photoCategorySelect");
const searchInput = document.getElementById("searchInput");
const statPhotos = document.getElementById("statPhotos");
const statCategories = document.getElementById("statCategories");
const resizeWidthInput = document.getElementById("resizeWidth");
const resizeWidthValue = document.getElementById("resizeWidthValue");
const fileDropZone = document.getElementById("fileDropZone");
const fileInput = document.getElementById("photoFile");
const photoPreview = document.getElementById("photoPreview");
const photoForm = document.getElementById("photoForm");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const newCategoryName = document.getElementById("newCategoryName");
const newCategoryColor = document.getElementById("newCategoryColor");
const modal = document.getElementById("photoModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalImage = document.getElementById("modalImage");
const modalCategory = document.getElementById("modalCategory");
const modalDate = document.getElementById("modalDate");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const commentsList = document.getElementById("commentsList");
const commentForm = document.getElementById("commentForm");
const commentAuthor = document.getElementById("commentAuthor");
const commentText = document.getElementById("commentText");

let activeCategoryId = "all";
let searchTerm = "";
let openedPhotoId = null;
let selectedImageOriginal = null;
let selectedImagePreview = null;

const createId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
};

const state = loadState();

function generateGradientImage(title, fromColor, toColor) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'>
      <defs>
        <linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stop-color='${fromColor}' />
          <stop offset='100%' stop-color='${toColor}' />
        </linearGradient>
      </defs>
      <rect width='1200' height='800' fill='url(#g)' rx='64'/>
      <g fill='rgba(15,23,42,0.35)'>
        <circle cx='200' cy='200' r='160'/>
        <circle cx='950' cy='160' r='120'/>
        <circle cx='1020' cy='620' r='140'/>
        <circle cx='320' cy='620' r='180'/>
      </g>
      <text x='50%' y='60%' text-anchor='middle' fill='rgba(255,255,255,0.82)'
        font-family='Manrope, sans-serif' font-size='92' font-weight='700' letter-spacing='8'>${title}</text>
    </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function defaultState() {
  const categories = [
    { id: "city", name: "Город", color: "#6366f1" },
    { id: "nature", name: "Природа", color: "#22c55e" },
    { id: "people", name: "Люди", color: "#f97316" },
  ];

  const photos = [
    {
      id: createId(),
      title: "Сумерки над мегаполисом",
      description:
        "Закат отражается в фасадах небоскрёбов, а город только начинает засыпать огнями.",
      categoryId: "city",
      imageData: generateGradientImage("CITY", "#6366f1", "#0ea5e9"),
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      comments: [
        {
          id: createId(),
          author: "Мария",
          text: "Очень атмосферно! Будто я снова на крыше любимого дома.",
          createdAt: Date.now() - 1000 * 60 * 90,
        },
      ],
    },
    {
      id: createId(),
      title: "Северное сияние",
      description:
        "Редкий кадр: насыщённые зелёные всполохи засыпают ночное небо над лесом.",
      categoryId: "nature",
      imageData: generateGradientImage("AURORA", "#22c55e", "#38bdf8"),
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
      comments: [
        {
          id: createId(),
          author: "Игорь",
          text: "Мечтаю когда-нибудь увидеть это своими глазами!",
          createdAt: Date.now() - 1000 * 60 * 60 * 14,
        },
        {
          id: createId(),
          author: "София",
          text: "Какие мягкие оттенки, потрясающий градиент!",
          createdAt: Date.now() - 1000 * 60 * 60 * 6,
        },
      ],
    },
    {
      id: createId(),
      title: "Фестиваль красок",
      description:
        "Мгновение чистой радости: друзья в облаке ярких пигментов во время фестиваля.",
      categoryId: "people",
      imageData: generateGradientImage("FEST", "#f97316", "#ec4899"),
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
      comments: [],
    },
  ];

  return { categories, photos };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return defaultState();
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed?.categories) || !Array.isArray(parsed?.photos)) {
      return defaultState();
    }
    return parsed;
  } catch (error) {
    console.warn("Не удалось загрузить данные, используется состояние по умолчанию", error);
    return defaultState();
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateStats() {
  statPhotos.textContent = state.photos.length.toString();
  statCategories.textContent = state.categories.length.toString();
}

function renderCategoryFilters() {
  categoryFilters.innerHTML = "";
  const allBtn = document.createElement("button");
  allBtn.className = `filter-chip ${activeCategoryId === "all" ? "active" : ""}`;
  allBtn.textContent = "Все";
  allBtn.addEventListener("click", () => {
    activeCategoryId = "all";
    renderCategoryFilters();
    renderGallery();
  });
  categoryFilters.appendChild(allBtn);

  state.categories.forEach((category) => {
    const btn = document.createElement("button");
    btn.className = `filter-chip ${activeCategoryId === category.id ? "active" : ""}`;
    btn.innerHTML = `<span class="category-dot" style="background:${category.color}"></span>${category.name}`;
    btn.addEventListener("click", () => {
      activeCategoryId = category.id;
      renderCategoryFilters();
      renderGallery();
    });
    categoryFilters.appendChild(btn);
  });
}

function renderGallery() {
  galleryGrid.innerHTML = "";
  const filtered = state.photos
    .filter((photo) => (activeCategoryId === "all" ? true : photo.categoryId === activeCategoryId))
    .filter((photo) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.trim().toLowerCase();
      return (
        photo.title.toLowerCase().includes(term) ||
        photo.description.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  if (!filtered.length) {
    galleryEmpty.classList.remove("hidden");
    return;
  }

  galleryEmpty.classList.add("hidden");

  filtered.forEach((photo) => {
    const card = document.createElement("article");
    card.className = "photo-card";
    card.innerHTML = `
      <img src="${photo.imageData}" alt="${photo.title}" loading="lazy" />
      <div class="card-body">
        <div class="category-pill">
          <span class="category-dot" style="background:${getCategoryColor(photo.categoryId)}"></span>
          ${getCategoryName(photo.categoryId)}
        </div>
        <h3>${photo.title}</h3>
        <p>${photo.description}</p>
        <div class="card-meta">
          <span>${formatDate(photo.createdAt)}</span>
          <span>💬 ${photo.comments.length}</span>
        </div>
      </div>
    `;
    card.addEventListener("click", () => openModal(photo.id));
    galleryGrid.appendChild(card);
  });
}

function renderCategoryList() {
  categoryList.innerHTML = "";
  state.categories.forEach((category) => {
    const count = state.photos.filter((photo) => photo.categoryId === category.id).length;
    const item = document.createElement("div");
    item.className = "category-item";
    item.innerHTML = `
      <strong><span class="category-dot" style="background:${category.color}"></span>${category.name}</strong>
      <span>${count} шт.</span>
    `;
    categoryList.appendChild(item);
  });
}

function populateCategorySelect() {
  photoCategorySelect.innerHTML = "";
  state.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    photoCategorySelect.appendChild(option);
  });
}

function getCategoryName(categoryId) {
  return state.categories.find((category) => category.id === categoryId)?.name ?? "Без категории";
}

function getCategoryColor(categoryId) {
  return state.categories.find((category) => category.id === categoryId)?.color ?? "#94a3b8";
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
  }).format(new Date(timestamp));
}

function formatDateTime(timestamp) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function openModal(photoId) {
  const photo = state.photos.find((item) => item.id === photoId);
  if (!photo) return;
  openedPhotoId = photoId;
  modalImage.src = photo.imageData;
  modalImage.alt = photo.title;
  modalCategory.textContent = getCategoryName(photo.categoryId);
  modalCategory.style.color = getCategoryColor(photo.categoryId);
  modalDate.textContent = formatDateTime(photo.createdAt);
  modalTitle.textContent = photo.title;
  modalDescription.textContent = photo.description;
  renderComments(photo);
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  openedPhotoId = null;
}

function renderComments(photo) {
  commentsList.innerHTML = "";
  if (!photo.comments.length) {
    const empty = document.createElement("p");
    empty.textContent = "Пока нет комментариев. Будьте первым!";
    empty.className = "comment-empty";
    commentsList.appendChild(empty);
    return;
  }

  photo.comments
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((comment) => {
      const card = document.createElement("div");
      card.className = "comment-card";
      card.innerHTML = `
        <span class="comment-author">${comment.author || "Гость"}</span>
        <span class="comment-date">${formatDateTime(comment.createdAt)}</span>
        <p>${comment.text}</p>
      `;
      commentsList.appendChild(card);
    });
}

function addComment(event) {
  event.preventDefault();
  if (!openedPhotoId) return;
  const text = commentText.value.trim();
  if (!text) return;
  const photo = state.photos.find((item) => item.id === openedPhotoId);
  if (!photo) return;
  photo.comments.push({
    id: createId(),
    author: commentAuthor.value.trim() || "Гость",
    text,
    createdAt: Date.now(),
  });
  persistState();
  commentForm.reset();
  renderComments(photo);
  renderGallery();
}

function handleSearch(event) {
  searchTerm = event.target.value;
  renderGallery();
}

function handleAddCategory() {
  const name = newCategoryName.value.trim();
  if (!name) {
    alert("Введите название категории");
    return;
  }
  const color = newCategoryColor.value || "#7c3aed";
  const id = name
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/(^-|-$)/g, "");
  if (state.categories.some((category) => category.id === id)) {
    alert("Такая категория уже существует");
    return;
  }
  const category = { id: id || createId(), name, color };
  state.categories.push(category);
  persistState();
  newCategoryName.value = "";
  renderCategoryFilters();
  renderCategoryList();
  populateCategorySelect();
  photoCategorySelect.value = category.id;
  updateStats();
}

function handleResizeWidthChange(event) {
  const value = Number(event.target.value);
  resizeWidthValue.textContent = `${value} px`;
  if (selectedImageOriginal) {
    updatePreview(value);
  }
}

function handleFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert("Можно загружать только изображения");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    alert("Файл слишком большой. Максимум 10 Мб.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      selectedImageOriginal = {
        dataUrl: event.target.result,
        width: img.width,
        height: img.height,
      };
      updatePreview(Number(resizeWidthInput.value));
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function updatePreview(maxWidth) {
  if (!selectedImageOriginal) return;
  const { dataUrl, width, height } = selectedImageOriginal;
  const scale = Math.min(1, maxWidth / width);
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    selectedImagePreview = canvas.toDataURL("image/jpeg", 0.92);
    renderPreview(selectedImagePreview, targetWidth, targetHeight);
  };
  img.src = dataUrl;
}

function renderPreview(src, width, height) {
  photoPreview.innerHTML = "";
  const img = document.createElement("img");
  img.src = src;
  img.alt = "Предпросмотр";
  img.width = width;
  img.height = height;
  photoPreview.appendChild(img);
  const meta = document.createElement("small");
  meta.style.color = "var(--text-muted)";
  meta.textContent = `Размер: ${width}×${height}`;
  photoPreview.appendChild(meta);
}

function resetPreview() {
  selectedImageOriginal = null;
  selectedImagePreview = null;
  photoPreview.textContent = "Предпросмотр появится после выбора изображения.";
}

function handlePhotoForm(event) {
  event.preventDefault();
  const formData = new FormData(photoForm);
  const title = (formData.get("title") || "").toString().trim();
  const description = (formData.get("description") || "").toString().trim();
  let categoryId = (formData.get("category") || "").toString();

  if (!title) {
    alert("Введите название");
    return;
  }
  if (!categoryId && !newCategoryName.value.trim()) {
    alert("Выберите или создайте категорию");
    return;
  }
  if (!selectedImagePreview) {
    alert("Добавьте изображение");
    return;
  }

  if (!categoryId) {
    const name = newCategoryName.value.trim();
    if (name) {
      const color = newCategoryColor.value || "#7c3aed";
      categoryId =
        name
          .toLowerCase()
          .replace(/[^a-zа-я0-9]+/gi, "-")
          .replace(/(^-|-$)/g, "") || createId();
      state.categories.push({ id: categoryId, name, color });
      newCategoryName.value = "";
      persistState();
      renderCategoryFilters();
      renderCategoryList();
      populateCategorySelect();
    }
  }

  const photo = {
    id: createId(),
    title,
    description,
    categoryId,
    imageData: selectedImagePreview,
    createdAt: Date.now(),
    comments: [],
  };

  state.photos.push(photo);
  persistState();
  photoForm.reset();
  resizeWidthInput.value = "1280";
  resizeWidthValue.textContent = "1280 px";
  resetPreview();
  renderGallery();
  renderCategoryList();
  updateStats();
  alert("Фотография добавлена в галерею");
}

function setupNav() {
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.target;
      if (!target) return;
      navButtons.forEach((btn) => btn.classList.toggle("is-active", btn === button));
      views.forEach((view) => {
        view.classList.toggle("is-active", view.dataset.view === target);
      });
      if (target === "gallery") {
        renderGallery();
      }
    });
  });

  document.querySelectorAll("[data-target]").forEach((trigger) => {
    if (trigger.classList.contains("nav-btn")) return;
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const target = trigger.dataset.target;
      const button = Array.from(navButtons).find((btn) => btn.dataset.target === target);
      if (button && button !== trigger) {
        button.click();
      }
    });
  });
}

function setupFileDrop() {
  fileDropZone.addEventListener("click", () => fileInput.click());
  fileDropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    fileDropZone.classList.add("dragover");
  });
  ["dragleave", "drop"].forEach((eventName) => {
    fileDropZone.addEventListener(eventName, () => fileDropZone.classList.remove("dragover"));
  });
  fileDropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  });
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  });
}

function setupModal() {
  modalCloseBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.classList.contains("modal-backdrop")) {
      closeModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

function init() {
  setupNav();
  setupModal();
  setupFileDrop();
  resetPreview();
  updateStats();
  renderCategoryFilters();
  renderGallery();
  renderCategoryList();
  populateCategorySelect();
  searchInput.addEventListener("input", handleSearch);
  commentForm.addEventListener("submit", addComment);
  addCategoryBtn.addEventListener("click", handleAddCategory);
  resizeWidthInput.addEventListener("input", handleResizeWidthChange);
  photoForm.addEventListener("submit", handlePhotoForm);
}

init();
