const GOOGLE_SHEET_ID = "1uqoV8K2FPBis51tfvNIHp917s2QecEdb2yLeeCm4yGg";
const GOOGLE_SHEET_TAB = "";
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxGSFWtznXZytwO_ltEZh1Z78ag8uLqT7OGWglHWTlrX0zx5ECrmEHIwGO9FS8Z4r_A/exec";

const GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/d/e/1FAIpQLScntWPNVbd8ch5QPZvCoj8pVReXjId6caQDyIA_v91sUi9apw/formResponse";
const GOOGLE_FORM_FIELDS = {
    estrellas: "entry.1587233656",
    etiquetas: "entry.1096578899",
    comentario: "entry.1316740896",
    nombre: "entry.1347048923"
};

const GOOGLE_MAPS_REVIEW_URL = "https://www.google.com/maps/place/Club+Bochas+Barrio+Rivera/@-31.4455704,-60.9352463,19z/data=!4m8!3m7!1s0x95b5133d054ac1dd:0xa44781d89be03d78!8m2!3d-31.4451511!4d-60.9352919!9m1!1b1!16s%2Fg%2F1tf08vjj?authuser=0&entry=ttu";

const CATEGORY_METADATA = {
    "bebidas": {
        id: "bebidas",
        titulo: "BEBIDAS",
        tag: "Carta",
        subtitulo: "Variedades",
        fondo: "fondo.png"
    },
    "miercoles": {
        id: "miercoles",
        titulo: "MIÉRCOLES",
        tag: "Miércoles",
        subtitulo: "Menú variado de la casa",
        fondo: "fondo.png"
    },
    "pizzas": {
        id: "pizzas",
        titulo: "PIZZA LIBRE",
        tag: "Jue & Sáb",
        subtitulo: "Jueves y sábados con todas las variedades",
        fondo: "fondo.png"
    },
    "parrillada": {
        id: "parrillada",
        titulo: "PARRILLADA",
        tag: "Viernes",
        subtitulo: "Viernes de parrillada completa",
        fondo: "fondo.png"
    }
};

let CURRENT_WHATSAPP_NUMBER = "5493496000000";

function buildWhatsAppLink(categoryKey, reservationData = null) {
    let cleanPhone = CURRENT_WHATSAPP_NUMBER.replace(/[^0-9]/g, '');

    let motivo = "en Rivera Club";
    if (categoryKey === "pizzas") {
        motivo = "para Pizza Libre (Jueves y Sábados)";
    } else if (categoryKey === "parrillada" || categoryKey === "viernes") {
        motivo = "para la Parrillada (Viernes)";
    } else if (categoryKey === "miercoles") {
        motivo = "para el Menú de Miércoles";
    }

    const nombre = (reservationData && reservationData.nombre) ? reservationData.nombre.trim() : '';
    const personas = (reservationData && reservationData.personas) ? reservationData.personas.toString().trim() : '';
    const dia = (reservationData && reservationData.dia) ? reservationData.dia.trim() : '';

    const mensaje = `Hola! Quisiera reservar una mesa ${motivo}.\n\n• Nombre: ${nombre}\n• Cantidad de personas: ${personas}\n• Día y horario: ${dia}`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`;
}

// Clasificacion automatica de bebidas
function getDrinkSubtype(nombre, desc, subcatColValue, catRaw) {
    if (subcatColValue && subcatColValue.trim()) {
        const cleanSub = subcatColValue.trim();
        const lower = cleanSub.toLowerCase();
        if (lower.includes("cervez")) return { id: "cervezas", nombre: "Cervezas", icon: "", orden: 1 };
        if (lower.includes("gaseos") || lower.includes("saboriz")) return { id: "gaseosas", nombre: "Gaseosas y Saborizadas", icon: "", orden: 2 };
        if (lower.includes("agua") || lower.includes("soda")) return { id: "aguas", nombre: "Aguas y Sodas", icon: "", orden: 3 };
        if (lower.includes("trag") || lower.includes("coctel") || lower.includes("cóctel") || lower.includes("aperit") || lower.includes("bar")) return { id: "tragos", nombre: "Tragos", icon: "", orden: 4 };
        if (lower.includes("vino") || lower.includes("espumant") || lower.includes("champ")) return { id: "vinos", nombre: "Vinos", icon: "", orden: 5 };
        return { id: lower.replace(/[^a-z0-9]/g, '-'), nombre: cleanSub, icon: "", orden: 6 };
    }

    if (catRaw) {
        const lowerCat = catRaw.toLowerCase();
        if (lowerCat.includes("cervez")) return { id: "cervezas", nombre: "Cervezas", icon: "", orden: 1 };
        if (lowerCat.includes("gaseos")) return { id: "gaseosas", nombre: "Gaseosas y Saborizadas", icon: "", orden: 2 };
        if (lowerCat.includes("agua") || lowerCat.includes("soda")) return { id: "aguas", nombre: "Aguas y Sodas", icon: "", orden: 3 };
        if (lowerCat.includes("trag") || lowerCat.includes("coctel") || lowerCat.includes("cóctel") || lowerCat.includes("aperit")) return { id: "tragos", nombre: "Tragos", icon: "", orden: 4 };
        if (lowerCat.includes("vino") || lowerCat.includes("espumant")) return { id: "vinos", nombre: "Vinos", icon: "", orden: 5 };
    }

    const text = `${nombre || ''} ${desc || ''}`.toLowerCase();

    const tragoKeywords = [
        "fernet", "gin", "aperol", "campari", "vermut", "vermouth", "vodka", "daiquiri",
        "mojito", "ron", "whisky", "whiskey", "coctel", "cóctel", "cocteleria", "coctelería",
        "trago", "gancia", "cynar", "negroni", "branca", "jagermeister", "carpano", "cinzano",
        "martini", "licor", "caipiriña", "caipiroska"
    ];
    if (tragoKeywords.some(kw => text.includes(kw))) {
        return { id: "tragos", nombre: "Tragos", icon: "", orden: 4 };
    }

    const vinoKeywords = [
        "vino", "malbec", "cabernet", "tinto", "blanco", "rosado", "champagne", "espumante",
        "syrah", "merlot", "chardonnay", "sauvignon", "cosecha tardia", "cosecha tardía", "torrontes",
        "torrontés", "rutini", "luigi bosca", "alma mora", "dadá", "cordero con piel de lobo"
    ];
    if (vinoKeywords.some(kw => text.includes(kw))) {
        return { id: "vinos", nombre: "Vinos", icon: "", orden: 5 };
    }

    const cervezaKeywords = [
        "santa fe", "heineken", "cerveza", "corona", "stella", "imperial", "quilmes", "brahma",
        "schneider", "pilsen", "porron", "porrón", "chopp", "liso", "ipa", "stout", "golden",
        "lager", "bock", "andes", "patagonia", "amstel", "miller", "budweiser", "rubia", "negra", "roja"
    ];
    if (cervezaKeywords.some(kw => text.includes(kw))) {
        return { id: "cervezas", nombre: "Cervezas", icon: "", orden: 1 };
    }

    const aguaKeywords = ["agua", "soda", "mineral", "con gas", "sin gas", "aquafina", "kin", "villavicencio", "eco de los andes", "glaciar"];
    if (aguaKeywords.some(kw => text.includes(kw))) {
        return { id: "aguas", nombre: "Aguas y Sodas", icon: "", orden: 3 };
    }

    const gaseosaKeywords = [
        "coca", "coca-cola", "sprite", "fanta", "pepsi", "7up", "seven up", "paso de los toros",
        "gaseosa", "saborizada", "levite", "levité", "aquarius", "aquariux", "pomelo", "naranja",
        "manzana", "tonica", "tónica", "schweppes", "mirinda", "crush", "lata de"
    ];
    if (gaseosaKeywords.some(kw => text.includes(kw))) {
        return { id: "gaseosas", nombre: "Gaseosas y Saborizadas", icon: "", orden: 2 };
    }

    return { id: "otras", nombre: "Otras Bebidas", icon: "", orden: 6 };
}

// Desactivado: Sin memoria caché en localStorage para garantizar datos 100% en vivo desde Neon
function getCachedMenu() {
    return null;
}

// Fetch con tiempo límite configurable (4.5s por defecto)
async function fetchWithTimeout(url, timeoutMs = 4500) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        return response;
    } catch (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
            throw new Error(`Timeout de conexión con Google Sheets (${timeoutMs}ms)`);
        }
        throw err;
    }
}

// Carga directa y ultrarrápida desde la base de datos Neon Postgres (100% en vivo)
async function fetchMenuFromSheets() {
    if (typeof fetchMenuFromNeon === 'function') {
        return await fetchMenuFromNeon();
    }
    throw new Error("Conector de Neon no disponible");
}

// Parser simple de CSV
function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    const result = [];
    for (let line of lines) {
        if (!line.trim()) continue;
        const row = [];
        let insideQuote = false;
        let entry = '';
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                insideQuote = !insideQuote;
            } else if (char === ',' && !insideQuote) {
                row.push(entry.trim());
                entry = '';
            } else {
                entry += char;
            }
        }
        row.push(entry.trim());
        result.push(row);
    }
    return result;
}

// Carga directa via exportacion CSV de Google Sheets (No sufre de inactividad de GViz)
async function fetchMenuFromCSV() {
    const sheetParam = GOOGLE_SHEET_TAB ? `&sheet=${encodeURIComponent(GOOGLE_SHEET_TAB)}` : '';
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv${sheetParam}&t=${new Date().getTime()}`;

    const response = await fetchWithTimeout(url, 3500);
    if (!response.ok) throw new Error("No se pudo conectar con el export de CSV de Google Sheets");

    const text = await response.text();
    const rows = parseCSV(text);
    if (rows.length < 2) throw new Error("CSV sin suficientes filas");

    const headerRow = rows[0].map(c => c.toLowerCase().trim());
    let categoriaIdx = headerRow.findIndex(c => c.includes("cat"));
    let subcatIdx = headerRow.findIndex(c => c.includes("subcat") || c.includes("tipo") || c.includes("variedad"));
    let nombreIdx = headerRow.findIndex(c => c.includes("nomb") || c.includes("plato") || c.includes("producto") || c.includes("item"));
    let descIdx = headerRow.findIndex(c => c.includes("desc") || c.includes("ingred") || c.includes("detall"));
    let precioIdx = headerRow.findIndex(c => c.includes("prec") || c.includes("valor") || c.includes("costo"));
    let disponibleIdx = headerRow.findIndex(c => c.includes("disp") || c.includes("activo") || c.includes("habilit"));

    if (categoriaIdx === -1) categoriaIdx = 0;
    if (subcatIdx === -1) subcatIdx = 1;
    if (nombreIdx === -1) nombreIdx = 2;
    if (descIdx === -1) descIdx = 3;
    if (precioIdx === -1) precioIdx = 4;
    if (disponibleIdx === -1) disponibleIdx = 5;

    const menuOrganizado = {};

    for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r || r.length === 0) continue;

        const getVal = (idx) => (idx !== -1 && r[idx] !== undefined && r[idx] !== null ? String(r[idx]).trim() : "");

        const catRaw = getVal(categoriaIdx).toLowerCase().trim();
        const subcatRaw = getVal(subcatIdx);
        const nombre = getVal(nombreIdx);
        const desc = getVal(descIdx);
        const precioRaw = getVal(precioIdx);
        const disponible = getVal(disponibleIdx).toUpperCase();

        const lowerNom = nombre.toLowerCase();
        if (lowerNom === "nombre" || lowerNom === "plato" || lowerNom === "producto" || catRaw === "categoría" || catRaw === "categoria") {
            continue;
        }

        const rowText = `${catRaw} ${nombre} ${desc}`.toLowerCase();
        if (rowText.includes("wsp") || rowText.includes("whatsapp") || rowText.includes("telefono") || rowText.includes("reserva") || catRaw.includes("config")) {
            const phoneCandidate = (precioRaw || desc || nombre).replace(/[^0-9]/g, '');
            if (phoneCandidate.length >= 8) {
                CURRENT_WHATSAPP_NUMBER = phoneCandidate;
            }
            continue;
        }

        if (!nombre || disponible === "NO" || disponible === "0" || disponible === "FALSE") {
            continue;
        }

        let catKey = catRaw || "pizzas";
        if (
            catKey.includes("beb") || catKey.includes("trag") || catKey.includes("coctel") ||
            catKey.includes("cóctel") || catKey.includes("cervez") || catKey.includes("vino") ||
            catKey.includes("gaseos") || catKey.includes("aperit") || catKey.includes("bar") || catKey.includes("licor")
        ) {
            catKey = "bebidas";
        } else if (catKey.includes("mier") || catKey.includes("miér")) {
            catKey = "miercoles";
        } else if (catKey.includes("piz")) {
            catKey = "pizzas";
        } else if (catKey.includes("vier") || catKey.includes("parr") || catKey.includes("asad")) {
            catKey = "parrillada";
        }

        if (!menuOrganizado[catKey]) {
            const meta = CATEGORY_METADATA[catKey] || {
                id: catKey,
                titulo: (catRaw || catKey).toUpperCase(),
                tag: "Menú",
                subtitulo: "Variedades y precios actualizados",
                fondo: "fondo.png"
            };
            menuOrganizado[catKey] = {
                ...meta,
                items: []
            };
        }

        const itemObj = {
            nombre: nombre,
            desc: desc,
            precio: precioRaw
        };

        if (catKey === "bebidas") {
            const subtype = getDrinkSubtype(nombre, desc, subcatRaw, catRaw);
            itemObj.tipo = subtype.id;
            itemObj.tipoNombre = subtype.nombre;
            itemObj.tipoIcon = "";
            itemObj.tipoOrden = subtype.orden;
        }

        menuOrganizado[catKey].items.push(itemObj);
    }

    if (menuOrganizado.bebidas && menuOrganizado.bebidas.items.length > 0) {
        menuOrganizado.bebidas.items.sort((a, b) => (a.tipoOrden || 99) - (b.tipoOrden || 99));
    }

    menuOrganizado._whatsappNumber = CURRENT_WHATSAPP_NUMBER;

    if (Object.keys(menuOrganizado).filter(k => !k.startsWith('_')).length > 0) {
        try {
            localStorage.setItem('rivera_menu_cache', JSON.stringify(menuOrganizado));
        } catch (e) { }
        return menuOrganizado;
    }

    throw new Error("CSV sin productos válidos");
}

// Carga del menu desde Apps Script Web App
async function fetchMenuFromAppsScript() {
    if (!GOOGLE_APPS_SCRIPT_URL) return null;
    const url = `${GOOGLE_APPS_SCRIPT_URL}?t=${new Date().getTime()}`;
    const response = await fetchWithTimeout(url, 3500);
    if (!response.ok) throw new Error("No se pudo conectar con Apps Script Web App");
    const json = await response.json();
    if (json && json.status === "success" && Array.isArray(json.rows) && json.rows.length > 1) {
        return parseMatrixToMenu(json.rows);
    }
    throw new Error("Respuesta de Apps Script sin productos válidos");
}

// Parseador de matriz 2D de filas recibidas desde Apps Script
function parseMatrixToMenu(rows) {
    const headerRow = rows[0].map(c => String(c || "").toLowerCase().trim());
    let categoriaIdx = headerRow.findIndex(c => c.includes("cat"));
    let subcatIdx = headerRow.findIndex(c => c.includes("subcat") || c.includes("tipo") || c.includes("variedad"));
    let nombreIdx = headerRow.findIndex(c => c.includes("nomb") || c.includes("plato") || c.includes("producto") || c.includes("item"));
    let descIdx = headerRow.findIndex(c => c.includes("desc") || c.includes("ingred") || c.includes("detall"));
    let precioIdx = headerRow.findIndex(c => c.includes("prec") || c.includes("valor") || c.includes("costo"));
    let disponibleIdx = headerRow.findIndex(c => c.includes("disp") || c.includes("activo") || c.includes("habilit"));

    if (categoriaIdx === -1) categoriaIdx = 0;
    if (subcatIdx === -1) subcatIdx = 1;
    if (nombreIdx === -1) nombreIdx = 2;
    if (descIdx === -1) descIdx = 3;
    if (precioIdx === -1) precioIdx = 4;
    if (disponibleIdx === -1) disponibleIdx = 5;

    const menuOrganizado = {};

    for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r || r.length === 0) continue;

        const getVal = (idx) => (idx !== -1 && r[idx] !== undefined && r[idx] !== null ? String(r[idx]).trim() : "");

        const catRaw = getVal(categoriaIdx).toLowerCase().trim();
        const subcatRaw = getVal(subcatIdx);
        const nombre = getVal(nombreIdx);
        const desc = getVal(descIdx);
        const precioRaw = getVal(precioIdx);
        const disponible = getVal(disponibleIdx).toUpperCase();

        const lowerNom = nombre.toLowerCase();
        if (lowerNom === "nombre" || lowerNom === "plato" || lowerNom === "producto" || catRaw === "categoría" || catRaw === "categoria") {
            continue;
        }

        const rowText = `${catRaw} ${nombre} ${desc}`.toLowerCase();
        if (rowText.includes("wsp") || rowText.includes("whatsapp") || rowText.includes("telefono") || rowText.includes("reserva") || catRaw.includes("config")) {
            const phoneCandidate = (precioRaw || desc || nombre).replace(/[^0-9]/g, '');
            if (phoneCandidate.length >= 8) {
                CURRENT_WHATSAPP_NUMBER = phoneCandidate;
            }
            continue;
        }

        if (!nombre || disponible === "NO" || disponible === "0" || disponible === "FALSE") {
            continue;
        }

        let catKey = catRaw || "pizzas";
        if (
            catKey.includes("beb") || catKey.includes("trag") || catKey.includes("coctel") ||
            catKey.includes("cóctel") || catKey.includes("cervez") || catKey.includes("vino") ||
            catKey.includes("gaseos") || catKey.includes("aperit") || catKey.includes("bar") || catKey.includes("licor")
        ) {
            catKey = "bebidas";
        } else if (catKey.includes("mier") || catKey.includes("miér")) {
            catKey = "miercoles";
        } else if (catKey.includes("piz")) {
            catKey = "pizzas";
        } else if (catKey.includes("vier") || catKey.includes("parr") || catKey.includes("asad")) {
            catKey = "parrillada";
        }

        if (!menuOrganizado[catKey]) {
            const meta = CATEGORY_METADATA[catKey] || {
                id: catKey,
                titulo: (catRaw || catKey).toUpperCase(),
                tag: "Menú",
                subtitulo: "Variedades y precios actualizados",
                fondo: "fondo.png"
            };
            menuOrganizado[catKey] = {
                ...meta,
                items: []
            };
        }

        let precio = "";
        const num = Number(precioRaw.replace(/[^0-9.-]+/g, ''));
        if (!isNaN(num) && num > 0 && !precioRaw.includes("$")) {
            precio = "$" + num.toLocaleString("es-AR");
        } else {
            precio = precioRaw;
        }

        const itemObj = {
            nombre: nombre,
            desc: desc,
            precio: precio
        };

        if (catKey === "bebidas") {
            const subtype = getDrinkSubtype(nombre, desc, subcatRaw, catRaw);
            itemObj.tipo = subtype.id;
            itemObj.tipoNombre = subtype.nombre;
            itemObj.tipoIcon = "";
            itemObj.tipoOrden = subtype.orden;
        }

        menuOrganizado[catKey].items.push(itemObj);
    }

    if (menuOrganizado.bebidas && menuOrganizado.bebidas.items.length > 0) {
        menuOrganizado.bebidas.items.sort((a, b) => (a.tipoOrden || 99) - (b.tipoOrden || 99));
    }

    menuOrganizado._whatsappNumber = CURRENT_WHATSAPP_NUMBER;

    if (Object.keys(menuOrganizado).filter(k => !k.startsWith('_')).length > 0) {
        try {
            localStorage.setItem('rivera_menu_cache', JSON.stringify(menuOrganizado));
        } catch (e) { }
        return menuOrganizado;
    }

    throw new Error("Matrix sin productos válidos");
}

// Carga de respaldo local estatico (menu.json)
async function fetchFallbackMenuJson() {
    try {
        const resp = await fetch('menu.json?t=' + new Date().getTime());
        if (resp.ok) {
            const data = await resp.json();
            if (data && Object.keys(data).filter(k => !k.startsWith('_')).length > 0) {
                return data;
            }
        }
    } catch (e) {
        console.warn("No se pudo cargar el archivo estático local menu.json:", e);
    }
    return null;
}

// Carga 100% en vivo directamente desde la base de datos Neon Postgres
async function loadMenuWithStaleWhileRevalidate(onMenuData, onError) {
    try {
        const freshData = await fetchMenuFromSheets();
        if (freshData) {
            onMenuData(freshData, { isCache: false });
        }
    } catch (err) {
        console.error("Error al consultar la base de datos en vivo:", err);
        if (onError) {
            onError(err);
        } else {
            throw err;
        }
    }
}

// Envio de calificaciones
async function sendFeedbackReview(reviewData) {
    const now = new Date();
    const payload = {
        fecha: now.toLocaleDateString("es-AR"),
        hora: now.toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' }),
        estrellas: Number(reviewData.rating) || 5,
        valoracion: reviewData.ratingText || `${reviewData.rating} Estrellas`,
        etiquetas: Array.isArray(reviewData.tags) ? reviewData.tags.join(", ") : (reviewData.tags || ""),
        comentario: (reviewData.comment || "").trim(),
        autor: (reviewData.author || "Anónimo").trim() || "Anónimo",
        timestamp: now.toISOString()
    };

    try {
        const stored = JSON.parse(localStorage.getItem('rivera_reviews_backup') || '[]');
        stored.unshift(payload);
        localStorage.setItem('rivera_reviews_backup', JSON.stringify(stored.slice(0, 50)));
    } catch (e) {
        console.warn("No se pudo guardar copia local en localStorage:", e);
    }

    // 1. Enviar directamente a la Base de Datos Neon 
    try {
        const sql = `
            INSERT INTO reviews (fecha, hora, estrellas, valoracion, etiquetas, comentario, autor, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        const sqlParams = [
            payload.fecha,
            payload.hora,
            payload.estrellas,
            payload.valoracion,
            payload.etiquetas,
            payload.comentario,
            payload.autor,
            payload.timestamp
        ];

        if (typeof runNeonQuery === 'function') {
            await runNeonQuery(sql, sqlParams);
            console.log("Calificación enviada a Neon DB exitosamente:", payload);
        } else {
            await fetch('/api/neon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: sql, params: sqlParams })
            });
            console.log("Calificación enviada a Neon mediante fallback API exitosamente:", payload);
        }
    } catch (err) {
        console.error("No se pudo enviar a Neon Vercel API:", err);
    }

    return { success: true, payload };
}

// ==========================================
// MODAL DE RESERVA POR WHATSAPP Y VISIBILIDAD
// ==========================================

function getActiveCategoryKey() {
    if (typeof selectedCategory !== 'undefined' && selectedCategory) {
        return selectedCategory;
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('cat') || 'general';
}

function updateReservationButtonVisibility() {
    const catKey = getActiveCategoryKey();
    const btnMenu = document.getElementById('btn-reservar-menu');
    const isDrinks = (catKey === 'bebidas' || catKey.includes('coctel') || catKey.includes('trag'));

    if (btnMenu) {
        btnMenu.style.display = isDrinks ? 'none' : 'flex';
    }

    const wspBtn = document.getElementById('btn-wsp-flotante');
    if (wspBtn) {
        wspBtn.style.display = 'none';
    }
}

function initReservationModal() {
    // 1. Inyectar CSS si no existe
    if (!document.getElementById('reservation-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'reservation-modal-styles';
        style.textContent = `
            .reservation-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(12, 35, 64, 0.65);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.25s ease, visibility 0.25s ease;
            }
            .reservation-modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            .reservation-modal-card {
                background: #ffffff;
                border-radius: 20px;
                width: 100%;
                max-width: 440px;
                box-shadow: 0 20px 50px rgba(12, 35, 64, 0.25);
                border: 1px solid #b6dbf5;
                overflow: hidden;
                transform: scale(0.92) translateY(10px);
                transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                position: relative;
            }
            .reservation-modal-overlay.active .reservation-modal-card {
                transform: scale(1) translateY(0);
            }
            .reservation-modal-header {
                background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
                color: #ffffff;
                padding: 22px 24px 18px;
                position: relative;
            }
            .reservation-modal-title {
                font-family: 'Outfit', sans-serif;
                font-size: 1.35rem;
                font-weight: 800;
                margin-bottom: 4px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .reservation-modal-subtitle {
                font-size: 0.85rem;
                color: #93c5fd;
                font-weight: 500;
            }
            .reservation-modal-close {
                position: absolute;
                top: 16px;
                right: 16px;
                background: rgba(255, 255, 255, 0.12);
                border: none;
                color: #ffffff;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                cursor: pointer;
                transition: background 0.2s ease;
            }
            .reservation-modal-close:hover {
                background: rgba(255, 255, 255, 0.25);
            }
            .reservation-modal-body {
                padding: 24px;
            }
            .reservation-form-group {
                margin-bottom: 18px;
                text-align: left;
            }
            .reservation-form-group label {
                display: block;
                font-size: 0.82rem;
                font-weight: 700;
                color: #0369a1;
                margin-bottom: 6px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .reservation-form-group label span {
                color: #ef4444;
            }
            .reservation-input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
            }
            .reservation-input-icon {
                position: absolute;
                left: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
                user-select: none;
            }
            .reservation-input-wrapper input {
                width: 100%;
                padding: 12px 14px 12px 42px;
                font-size: 0.95rem;
                font-family: 'Plus Jakarta Sans', sans-serif;
                border: 1.5px solid #b6dbf5;
                border-radius: 12px;
                background: #f8fafc;
                color: #0369a1;
                outline: none;
                transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
            }
            .reservation-input-wrapper input:focus {
                border-color: #0284c7;
                background: #ffffff;
                box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.12);
            }
            .reservation-submit-btn {
                width: 100%;
                background: #25d366;
                color: #ffffff;
                border: none;
                border-radius: 12px;
                padding: 14px 20px;
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-size: 1rem;
                font-weight: 800;
                letter-spacing: 0.3px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                cursor: pointer;
                box-shadow: 0 6px 18px rgba(37, 211, 102, 0.35);
                transition: all 0.2s ease;
                margin-top: 22px;
            }
            .reservation-submit-btn:hover {
                background: #20ba5a;
                transform: translateY(-2px);
                box-shadow: 0 10px 24px rgba(37, 211, 102, 0.45);
            }
            .reservation-submit-btn svg {
                width: 22px;
                height: 22px;
                fill: currentColor;
            }
            .reservation-footer-note {
                font-size: 0.78rem;
                color: #64748b;
                text-align: center;
                margin-top: 12px;
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Inyectar HTML si no existe
    if (!document.getElementById('reservation-modal')) {
        const modalDiv = document.createElement('div');
        modalDiv.id = 'reservation-modal';
        modalDiv.className = 'reservation-modal-overlay';
        modalDiv.setAttribute('aria-hidden', 'true');
        modalDiv.innerHTML = `
            <div class="reservation-modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-res-title">
                <div class="reservation-modal-header">
                    <div class="reservation-modal-title" id="modal-res-title">
                        <span>Reservar Mesa</span>
                    </div>
                    <div class="reservation-modal-subtitle" id="modal-res-subtitle">Rivera Club</div>
                    <button type="button" class="reservation-modal-close" id="btn-close-reservation-modal" aria-label="Cerrar modal">&times;</button>
                </div>
                <form id="reservation-form" class="reservation-modal-body">
                    <div class="reservation-form-group">
                        <label for="res-nombre">Nombre y Apellido <span>*</span></label>
                        <div class="reservation-input-wrapper">
                            <span class="reservation-input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </span>
                            <input type="text" id="res-nombre" placeholder="Nombre y apellido" required autocomplete="name">
                        </div>
                    </div>
                    <div class="reservation-form-group">
                        <label for="res-personas">Cantidad de Personas <span>*</span></label>
                        <div class="reservation-input-wrapper">
                            <span class="reservation-input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-3-3.87"></path><path d="M9 21v-2a4 4 0 0 1 4-4h1"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </span>
                            <input type="number" id="res-personas" min="1" max="50" placeholder="Cantidad de personas" required>
                        </div>
                    </div>
                    <div class="reservation-form-group">
                        <label for="res-dia">Día y Horario <span>*</span></label>
                        <div class="reservation-input-wrapper">
                            <span class="reservation-input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            </span>
                            <input type="text" id="res-dia" placeholder="Día y horario" required>
                        </div>
                    </div>
                    <button type="submit" class="reservation-submit-btn">
                        <svg viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.159.57 4.184 1.564 5.939l-1.636 5.973 6.132-1.609c1.701.929 3.649 1.458 5.72 1.458 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
                        </svg>
                        <span>Enviar por WhatsApp</span>
                    </button>
                </form>
            </div>
        `;
        document.body.appendChild(modalDiv);

        // Bind form & close handlers
        const modal = document.getElementById('reservation-modal');
        const closeBtn = document.getElementById('btn-close-reservation-modal');
        const form = document.getElementById('reservation-form');

        const closeModal = () => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        };

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('res-nombre').value;
            const personas = document.getElementById('res-personas').value;
            const dia = document.getElementById('res-dia').value;

            const categoryKey = getActiveCategoryKey();
            const url = buildWhatsAppLink(categoryKey, { nombre, personas, dia });
            window.open(url, '_blank');
            closeModal();
            form.reset();
        });
    }

    // 3. Vincular todos los botones de reserva
    bindReservationEvents();

    // 4. Actualizar visibilidad según categoría actual
    updateReservationButtonVisibility();
}

function bindReservationEvents() {
    const openModal = (e) => {
        if (e) e.preventDefault();
        const modal = document.getElementById('reservation-modal');
        const categoryKey = getActiveCategoryKey();
        const subtitleEl = document.getElementById('modal-res-subtitle');

        if (subtitleEl) {
            if (categoryKey === "pizzas") {
                subtitleEl.textContent = "Reserva para Pizza Libre (Jueves y Sábados)";
            } else if (categoryKey === "parrillada" || categoryKey === "viernes") {
                subtitleEl.textContent = "Reserva para Parrillada (Viernes)";
            } else if (categoryKey === "miercoles") {
                subtitleEl.textContent = "Reserva para Menú de Miércoles";
            } else {
                subtitleEl.textContent = "Club Bochas Barrio Rivera";
            }
        }

        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            setTimeout(() => {
                const firstInput = document.getElementById('res-nombre');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    };

    const triggers = document.querySelectorAll('.btn-open-reserva, #btn-reservar-card, #btn-reservar-menu, #btn-wsp-flotante');
    triggers.forEach(el => {
        el.onclick = openModal;
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReservationModal);
} else {
    initReservationModal();
}

