const urlInput = document.getElementById("url");
const checkBtn = document.getElementById("check");
const errorEl = document.getElementById("error");
const favToggleBtn = document.getElementById("fav-toggle");
const favoritesContainerEl = document.getElementById("favorites-container");
const favoritesEl = document.getElementById("favorites");

const fromCacheEl = document.getElementById("from-cache");
const resourceAgeEl = document.getElementById("resource-age");
const maxLifetimeEl = document.getElementById("max-lifetime");
const timeLeftEl = document.getElementById("time-left");

const FAVORITES_KEY = "cache-checker-favorites";

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === "string");
  } catch {
    return [];
  }
}

function saveFavorites(list) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

function renderFavorites() {
  const favorites = loadFavorites();
  favoritesEl.innerHTML = "";
  if (!favorites.length) {
    favoritesContainerEl.style.display = "none";
    return;
  }
  favoritesContainerEl.style.display = "block";

  favorites.forEach((url) => {
    const pill = document.createElement("div");
    pill.className = "favorite-pill";

    const starSpan = document.createElement("span");
    starSpan.className = "favorite-pill-icon";
    starSpan.textContent = "★";

    const mainBtn = document.createElement("button");
    mainBtn.type = "button";
    mainBtn.className = "favorite-pill-main";
    mainBtn.textContent = url;
    mainBtn.addEventListener("click", () => {
      urlInput.value = url;
      checkCache();
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "favorite-pill-remove";
    removeBtn.textContent = "×";
    removeBtn.title = "Ukloni iz favorita";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const list = loadFavorites();
      const idx = list.indexOf(url);
      if (idx !== -1) {
        list.splice(idx, 1);
        saveFavorites(list);
        renderFavorites();
        updateFavToggle();
      }
    });

    pill.appendChild(starSpan);
    pill.appendChild(mainBtn);
    pill.appendChild(removeBtn);
    favoritesEl.appendChild(pill);
  });
}

function updateFavToggle() {
  const url = normalizeUrl(urlInput.value);
  const favorites = loadFavorites();
  const isFav = url && favorites.includes(url);
  favToggleBtn.textContent = isFav ? "★" : "☆";
  favToggleBtn.title = isFav ? "Ukloni iz favorita" : "Dodaj u favorite";
}

function showError(msg) {
  if (!msg) {
    errorEl.style.display = "none";
    errorEl.textContent = "";
    return;
  }
  errorEl.style.display = "block";
  errorEl.textContent = msg;
}

function normalizeUrl(raw) {
  let value = (raw || "").trim();
  if (!value) return "";
  if (!/^https?:\/\//i.test(value)) {
    value = "https://" + value;
  }
  try {
    return new URL(value).toString();
  } catch {
    return "";
  }
}

function parseMaxAge(cacheControl) {
  if (!cacheControl) return null;
  const parts = cacheControl.split(",").map((p) => p.trim());
  for (const part of parts) {
    const [key, val] = part.split("=");
    if (key.toLowerCase() === "max-age" && val !== undefined) {
      const n = Number(val);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

function formatDuration(sec) {
  if (sec == null || !isFinite(sec)) return "";
  if (sec < 0) sec = 0;
  const s = Math.floor(sec);
  if (s === 0) return "0 s";
  const parts = [];
  const units = [
    [" d", 86400],
    [" h", 3600],
    [" min", 60],
    [" s", 1],
  ];
  let remaining = s;
  for (const [label, size] of units) {
    if (remaining >= size) {
      const value = Math.floor(remaining / size);
      remaining %= size;
      parts.push(value + label);
    }
  }
  return parts.join(" ");
}

function resetResults() {
  fromCacheEl.textContent = "–";
  resourceAgeEl.textContent = "–";
  maxLifetimeEl.textContent = "–";
  timeLeftEl.textContent = "–";
}

async function checkCache() {
  showError("");

  const url = normalizeUrl(urlInput.value);
  if (!url) {
    showError("Unesi valjani URL (npr. https://example.com).");
    return;
  }

  // sinkroniziraj zvjezdicu s normaliziranim URL-om
  updateFavToggle();

  resetResults();

  checkBtn.disabled = true;

  try {
    const res = await fetch(url, {
      method: "HEAD",
    });

    if (!res.ok) {
      showError(
        `Server je vratio status ${res.status} (${
          res.statusText || "Nepoznat razlog"
        }) pri čitanju zaglavlja.`
      );
      return;
    }

    const cacheControl = res.headers.get("cache-control");
    const expires = res.headers.get("expires");
    const ageHeader = res.headers.get("age");
    const dateHeader = res.headers.get("date");

    const now = new Date();

    let ageSeconds = null;
    if (ageHeader != null) {
      const num = Number(ageHeader);
      if (Number.isFinite(num) && num >= 0) ageSeconds = num;
    } else if (dateHeader) {
      const d = new Date(dateHeader);
      if (!isNaN(d.getTime())) {
        ageSeconds = (now.getTime() - d.getTime()) / 1000;
      }
    }

    if (ageSeconds != null && ageSeconds > 0.5) {
      fromCacheEl.textContent =
        "Da – vrlo vjerojatno iz cachea (procijenjena starost oko " +
        formatDuration(ageSeconds) +
        ").";
    } else if (ageSeconds !== null) {
      fromCacheEl.textContent =
        "Vjerojatno svježe sa servera (bez vidljivo veće starosti u cacheu).";
    } else {
      fromCacheEl.textContent =
        "Ne znamo – server nije poslao informacije o starosti (Age/Date header).";
    }

    if (ageSeconds != null) {
      resourceAgeEl.textContent =
        "Oko " +
        formatDuration(ageSeconds) +
        " od trenutka kada je server pripremio ovaj odgovor.";
    } else {
      resourceAgeEl.textContent =
        "Nije moguće izračunati – nema pouzdanih podataka o starosti.";
    }

    let maxAge = parseMaxAge(cacheControl);

    let dateForLifetime = null;
    if (dateHeader) {
      const d = new Date(dateHeader);
      if (!isNaN(d.getTime())) {
        dateForLifetime = d;
      }
    }

    let expiresDate = null;
    if (expires) {
      const d = new Date(expires);
      if (!isNaN(d.getTime())) {
        expiresDate = d;
      }
    }

    let maxLifetimeSeconds = null;
    if (maxAge != null) {
      maxLifetimeSeconds = maxAge;
      maxLifetimeEl.textContent =
        "Najviše oko " +
        formatDuration(maxLifetimeSeconds) +
        " (" +
        maxLifetimeSeconds +
        " s) od trenutka odgovora.";
    } else if (expiresDate && dateForLifetime) {
      maxLifetimeSeconds =
        (expiresDate.getTime() - dateForLifetime.getTime()) / 1000;
      maxLifetimeEl.textContent =
        "Procijenjeno: od odgovora do " +
        expiresDate.toLocaleString() +
        " (" +
        formatDuration(maxLifetimeSeconds) +
        ").";
    } else {
      maxLifetimeEl.textContent =
        "Ne znamo – server nije jasno rekao koliko dugo resurs smije biti u cacheu.";
    }

    let timeLeftSeconds = null;
    if (maxLifetimeSeconds != null && ageSeconds != null) {
      timeLeftSeconds = maxLifetimeSeconds - ageSeconds;
    } else if (expiresDate) {
      timeLeftSeconds = (expiresDate.getTime() - now.getTime()) / 1000;
    }

    if (timeLeftSeconds != null && isFinite(timeLeftSeconds)) {
      if (timeLeftSeconds > 0) {
        timeLeftEl.textContent =
          "Još otprilike " +
          formatDuration(timeLeftSeconds) +
          " prije nego što izađe iz cachea (postane zastario).";
      } else {
        timeLeftEl.textContent =
          "Resurs je vjerojatno već istekao – prošlo je oko " +
          formatDuration(Math.abs(timeLeftSeconds)) +
          " od isteka.";
      }
    } else {
      timeLeftEl.textContent =
        "Nije moguće procijeniti – nema dovoljno podataka o trajanju i starosti.";
    }
  } catch (err) {
    console.error(err);
    showError(
      "Ne mogu pročitati zaglavlja. Mogući razlozi: CORS blokada, HTTPS greška ili nedostupan server."
    );
  } finally {
    checkBtn.disabled = false;
  }
}

checkBtn.addEventListener("click", checkCache);
urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    checkCache();
  }
});

favToggleBtn.addEventListener("click", () => {
  const url = normalizeUrl(urlInput.value);
  if (!url) {
    showError("Ne možeš dodati prazan ili nevažeći URL u favorite.");
    return;
  }

  const favorites = loadFavorites();
  const index = favorites.indexOf(url);

  if (index === -1) {
    favorites.push(url);
  } else {
    favorites.splice(index, 1);
  }

  saveFavorites(favorites);
  renderFavorites();
  updateFavToggle();
});

urlInput.addEventListener("input", () => {
  updateFavToggle();
});

// inicijalno učitaj favorite i stanje zvjezdice
renderFavorites();
updateFavToggle();
