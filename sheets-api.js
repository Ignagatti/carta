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

function buildWhatsAppLink(categoryKey) {
    let cleanPhone = CURRENT_WHATSAPP_NUMBER.replace(/[^0-9]/g, '');

    let motivo = "en Rivera Club";
    if (categoryKey === "pizzas") {
        motivo = "para Pizza Libre (Jueves y Sábados)";
    } else if (categoryKey === "parrillada" || categoryKey === "viernes") {
        motivo = "para la Parrillada (Viernes)";
    } else if (categoryKey === "miercoles") {
        motivo = "para el Menú de Miércoles";
    }

    const mensaje = `Hola! Quisiera reservar una mesa ${motivo}.\n\n• Nombre:\n• Cantidad de personas:\n• Día y horario:`;
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

// Obtener menu desde la memoria cache local (instantaneo)
function getCachedMenu() {
    try {
        const cached = localStorage.getItem('rivera_menu_cache');
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && Object.keys(parsed).filter(k => !k.startsWith('_')).length > 0) {
                return parsed;
            }
        }
    } catch (e) {}
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

// Carga y procesamiento del menu desde Google Sheets con fallback inteligente
async function fetchMenuFromSheets() {
    if (GOOGLE_APPS_SCRIPT_URL) {
        try {
            const scriptResult = await fetchMenuFromAppsScript();
            if (scriptResult) {
                console.log("Menú cargado exitosamente vía Apps Script Web App.");
                return scriptResult;
            }
        } catch (scriptErr) {
            console.warn("No se pudo cargar vía Apps Script Web App, intentando GViz y CSV:", scriptErr);
        }
    }

    if (!GOOGLE_SHEET_ID) {
        throw new Error("No se ha configurado el ID de Google Sheets");
    }

    try {
        const sheetParam = GOOGLE_SHEET_TAB ? `&sheet=${encodeURIComponent(GOOGLE_SHEET_TAB)}` : '';
        const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json${sheetParam}&t=${new Date().getTime()}`;

        const response = await fetchWithTimeout(url, 3500);
        if (!response.ok) throw new Error("No se pudo conectar con Google Sheets");

        const text = await response.text();
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}") + 1;
        if (jsonStart === -1 || jsonEnd === 0) throw new Error("Respuesta inválida de Google Sheets");
        const json = JSON.parse(text.substring(jsonStart, jsonEnd));

        const menuOrganizado = {};
        const rows = (json.table && json.table.rows) || [];

        if (rows.length === 0) {
            throw new Error("La planilla no contiene filas");
        }

        // 1. Detección por etiquetas en json.table.cols
        const cols = (json.table.cols || []).map(c => (c.label || c.id || "").trim().toLowerCase());

        let categoriaIdx = cols.findIndex(c => c.includes("cat"));
        let subcatIdx = cols.findIndex(c => c.includes("subcat") || c.includes("tipo") || c.includes("variedad"));
        let nombreIdx = cols.findIndex(c => c.includes("nomb") || c.includes("plato") || c.includes("producto") || c.includes("item"));
        let descIdx = cols.findIndex(c => c.includes("desc") || c.includes("ingred") || c.includes("detall"));
        let precioIdx = cols.findIndex(c => c.includes("prec") || c.includes("valor") || c.includes("costo"));
        let disponibleIdx = cols.findIndex(c => c.includes("disp") || c.includes("activo") || c.includes("habilit"));

        let startRowIndex = 0;

        // 2. Si Google Sheets no detectó encabezados en cols, buscar en la fila 0 de rows
        if (categoriaIdx === -1 || nombreIdx === -1) {
            const firstRow = rows[0];
            if (firstRow && firstRow.c) {
                const headerRowVals = firstRow.c.map(cell => (cell && cell.v !== null && cell.v !== undefined ? String(cell.v).toLowerCase().trim() : ""));
                
                const fCatIdx = headerRowVals.findIndex(v => v.includes("cat"));
                const fSubIdx = headerRowVals.findIndex(v => v.includes("subcat") || v.includes("tipo") || v.includes("variedad"));
                const fNomIdx = headerRowVals.findIndex(v => v.includes("nomb") || v.includes("plato") || v.includes("producto") || v.includes("item"));
                const fDescIdx = headerRowVals.findIndex(v => v.includes("desc") || v.includes("ingred") || v.includes("detall"));
                const fPrecIdx = headerRowVals.findIndex(v => v.includes("prec") || v.includes("valor"));
                const fDispIdx = headerRowVals.findIndex(v => v.includes("disp") || v.includes("activo"));

                if (fNomIdx !== -1 || fCatIdx !== -1) {
                    if (fCatIdx !== -1) categoriaIdx = fCatIdx;
                    if (fSubIdx !== -1) subcatIdx = fSubIdx;
                    if (fNomIdx !== -1) nombreIdx = fNomIdx;
                    if (fDescIdx !== -1) descIdx = fDescIdx;
                    if (fPrecIdx !== -1) precioIdx = fPrecIdx;
                    if (fDispIdx !== -1) disponibleIdx = fDispIdx;
                    startRowIndex = 1;
                }
            }
        }

        // 3. Fallback a posiciones estándar si aún no se encuentran: Col 0=Cat, Col 1=Subcat, Col 2=Nombre, Col 3=Desc, Col 4=Precio, Col 5=Disp
        if (categoriaIdx === -1) categoriaIdx = 0;
        if (subcatIdx === -1) subcatIdx = 1;
        if (nombreIdx === -1) nombreIdx = 2;
        if (descIdx === -1) descIdx = 3;
        if (precioIdx === -1) precioIdx = 4;
        if (disponibleIdx === -1) disponibleIdx = 5;

        for (let i = startRowIndex; i < rows.length; i++) {
            const r = rows[i];
            if (!r || !r.c) continue;

            const getVal = (idx) => (idx !== -1 && r.c[idx] && r.c[idx].v !== null && r.c[idx].v !== undefined ? String(r.c[idx].v).trim() : "");

            const catRaw = getVal(categoriaIdx).toLowerCase().trim();
            const subcatRaw = getVal(subcatIdx);
            const nombre = getVal(nombreIdx);
            const desc = getVal(descIdx);
            const precioRaw = getVal(precioIdx);
            const disponible = getVal(disponibleIdx).toUpperCase();

            // Saltear filas que repitan nombres de encabezado
            const lowerNom = nombre.toLowerCase();
            if (lowerNom === "nombre" || lowerNom === "plato" || lowerNom === "producto" || catRaw === "categoría" || catRaw === "categoria") {
                continue;
            }

            // Detección de configuración de teléfono / WhatsApp
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

            let precio = "";
            if (precioIdx !== -1 && r.c[precioIdx]) {
                const cell = r.c[precioIdx];
                if (cell.f) {
                    precio = cell.f.replace(/,/g, '.');
                } else if (cell.v !== null && cell.v !== undefined && cell.v !== "") {
                    const num = Number(cell.v);
                    if (!isNaN(num) && num > 0) {
                        precio = "$" + num.toLocaleString("es-AR");
                    } else {
                        precio = String(cell.v).trim();
                    }
                }
            }

            let catKey = catRaw || "pizzas";
            if (
                catKey.includes("beb") ||
                catKey.includes("trag") ||
                catKey.includes("coctel") ||
                catKey.includes("cóctel") ||
                catKey.includes("cervez") ||
                catKey.includes("vino") ||
                catKey.includes("gaseos") ||
                catKey.includes("aperit") ||
                catKey.includes("bar") ||
                catKey.includes("licor")
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

        // Guardar copia de respaldo en cache local
        if (Object.keys(menuOrganizado).filter(k => !k.startsWith('_')).length > 0) {
            try {
                localStorage.setItem('rivera_menu_cache', JSON.stringify(menuOrganizado));
            } catch (e) {}
            return menuOrganizado;
        }

        throw new Error("No se encontraron productos en Google Sheets");

    } catch (err) {
        console.warn("No se pudo cargar por GViz, intentando exportación CSV directa:", err);
        try {
            const csvMenu = await fetchMenuFromCSV();
            if (csvMenu) {
                console.log("Menú recuperado exitosamente desde exportación CSV de Google Sheets.");
                return csvMenu;
            }
        } catch (csvErr) {
            console.warn("No se pudo cargar desde exportación CSV:", csvErr);
        }

        console.warn("Buscando copia en caché local (localStorage)...");
        try {
            const cached = localStorage.getItem('rivera_menu_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && Object.keys(parsed).filter(k => !k.startsWith('_')).length > 0) {
                    console.log("Menú recuperado exitosamente desde caché local.");
                    return parsed;
                }
            }
        } catch (e) {}

        console.warn("Buscando respaldo estático local menu.json...");
        const fallbackJson = await fetchFallbackMenuJson();
        if (fallbackJson) {
            console.log("Menú recuperado desde menu.json estático local.");
            return fallbackJson;
        }

        throw err;
    }
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
        } catch (e) {}
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
        } catch (e) {}
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

// Estrategia Stale-While-Revalidate: Muestra caché en 0ms y actualiza en segundo plano desde Google Sheets
async function loadMenuWithStaleWhileRevalidate(onMenuData, onError) {
    let hasRenderedCache = false;
    const cached = getCachedMenu();

    if (cached) {
        hasRenderedCache = true;
        try {
            onMenuData(cached, { isCache: true });
        } catch (e) {
            console.error("Error al renderizar desde caché:", e);
        }
    }

    try {
        const freshData = await fetchMenuFromSheets();
        if (freshData) {
            onMenuData(freshData, { isCache: false });
        }
    } catch (err) {
        console.warn("No se pudo actualizar desde Google Sheets en vivo:", err);
        if (!hasRenderedCache) {
            const fallbackJson = await fetchFallbackMenuJson();
            if (fallbackJson) {
                onMenuData(fallbackJson, { isCache: false });
                return;
            }
            if (onError) {
                onError(err);
            } else {
                throw err;
            }
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

    // 1. Enviar directamente a la pestaña 'Opiniones' de tu Google Sheet mediante Apps Script Web App
    if (GOOGLE_APPS_SCRIPT_URL) {
        try {
            await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },
                body: JSON.stringify(payload)
            });
            console.log("Calificación enviada a la pestaña 'Opiniones' de Google Sheets exitosamente:", payload);
        } catch (err) {
            console.warn("No se pudo enviar a Apps Script Web App, intentando Google Form:", err);
        }
    }

    // 2. Enviar a Google Form (Respaldos)
    if (GOOGLE_FORM_ACTION_URL) {
        try {
            const formData = new URLSearchParams();
            formData.append(GOOGLE_FORM_FIELDS.estrellas, payload.valoracion);
            formData.append(GOOGLE_FORM_FIELDS.etiquetas, payload.etiquetas || "Ninguna");
            formData.append(GOOGLE_FORM_FIELDS.comentario, payload.comentario || "Sin comentario");
            formData.append(GOOGLE_FORM_FIELDS.nombre, payload.autor);

            await fetch(GOOGLE_FORM_ACTION_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            });
            console.log("Calificación enviada a Google Form de respaldo exitosamente.");
        } catch (err) {
            console.error("Error al enviar calificación a Google Form:", err);
        }
    }

    return { success: true, payload };
}
