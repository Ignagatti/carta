const GOOGLE_SHEET_ID = "1uqoV8K2FPBis51tfvNIHp917s2QecEdb2yLeeCm4yGg";
const GOOGLE_SHEET_TAB = "";

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
        if (lower.includes("trag") || lower.includes("coctel") || lower.includes("aperit") || lower.includes("bar")) return { id: "tragos", nombre: "Tragos y Coctelería", icon: "", orden: 4 };
        if (lower.includes("vino") || lower.includes("espumant") || lower.includes("champ")) return { id: "vinos", nombre: "Vinos", icon: "", orden: 5 };
        return { id: lower.replace(/[^a-z0-9]/g, '-'), nombre: cleanSub, icon: "", orden: 6 };
    }

    if (catRaw) {
        const lowerCat = catRaw.toLowerCase();
        if (lowerCat.includes("cervez")) return { id: "cervezas", nombre: "Cervezas", icon: "", orden: 1 };
        if (lowerCat.includes("gaseos")) return { id: "gaseosas", nombre: "Gaseosas y Saborizadas", icon: "", orden: 2 };
        if (lowerCat.includes("agua") || lowerCat.includes("soda")) return { id: "aguas", nombre: "Aguas y Sodas", icon: "", orden: 3 };
        if (lowerCat.includes("trag") || lowerCat.includes("coctel") || lowerCat.includes("aperit")) return { id: "tragos", nombre: "Tragos y Coctelería", icon: "", orden: 4 };
        if (lowerCat.includes("vino") || lowerCat.includes("espumant")) return { id: "vinos", nombre: "Vinos", icon: "", orden: 5 };
    }

    const text = `${nombre || ''} ${desc || ''}`.toLowerCase();

    const tragoKeywords = [
        "fernet", "gin", "aperol", "campari", "vermut", "vermouth", "vodka", "daiquiri",
        "mojito", "ron", "whisky", "whiskey", "coctel", "cóctel", "trago", "gancia", "cynar",
        "negroni", "branca", "jagermeister", "carpano", "cinzano", "martini", "licor", "caipiriña", "caipiroska"
    ];
    if (tragoKeywords.some(kw => text.includes(kw))) {
        return { id: "tragos", nombre: "Tragos y Coctelería", icon: "", orden: 4 };
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

// Carga y procesamiento del menu desde Google Sheets
async function fetchMenuFromSheets() {
    if (!GOOGLE_SHEET_ID) {
        throw new Error("No se ha configurado el ID de Google Sheets");
    }

    const sheetParam = GOOGLE_SHEET_TAB ? `&sheet=${encodeURIComponent(GOOGLE_SHEET_TAB)}` : '';
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json${sheetParam}&t=${new Date().getTime()}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("No se pudo conectar con Google Sheets");

    const text = await response.text();
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;
    if (jsonStart === -1 || jsonEnd === 0) throw new Error("Respuesta inválida de Google Sheets");
    const json = JSON.parse(text.substring(jsonStart, jsonEnd));

    const menuOrganizado = {};

    const cols = json.table.cols.map(c => (c.label || c.id || "").trim().toLowerCase());
    const rows = json.table.rows;

    const categoriaIdx = cols.findIndex(c => c.includes("cat"));
    const subcatIdx = cols.findIndex(c => c.includes("subcat") || c.includes("tipo") || c.includes("variedad"));
    const nombreIdx = cols.findIndex(c => c.includes("nomb") || c.includes("plato") || c.includes("producto"));
    const descIdx = cols.findIndex(c => c.includes("desc") || c.includes("ingred") || c.includes("detall"));
    const precioIdx = cols.findIndex(c => c.includes("prec") || c.includes("telefono") || c.includes("wsp"));
    const disponibleIdx = cols.findIndex(c => c.includes("disp"));

    rows.forEach(r => {
        if (!r || !r.c) return;

        const getVal = (idx) => (idx !== -1 && r.c[idx] && r.c[idx].v !== null && r.c[idx].v !== undefined ? String(r.c[idx].v).trim() : "");

        const catRaw = getVal(categoriaIdx).toLowerCase().trim();
        const subcatRaw = getVal(subcatIdx);
        const nombre = getVal(nombreIdx);
        const desc = getVal(descIdx);
        const precioRaw = getVal(precioIdx);
        const disponible = getVal(disponibleIdx).toUpperCase();

        const rowText = `${catRaw} ${nombre} ${desc}`.toLowerCase();
        if (rowText.includes("wsp") || rowText.includes("whatsapp") || rowText.includes("telefono") || rowText.includes("reserva") || catRaw.includes("config")) {
            const phoneCandidate = (precioRaw || desc || nombre).replace(/[^0-9]/g, '');
            if (phoneCandidate.length >= 8) {
                CURRENT_WHATSAPP_NUMBER = phoneCandidate;
            }
            return;
        }

        if (!nombre || disponible === "NO" || disponible === "0" || disponible === "FALSE") {
            return;
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
        if (catKey.includes("beb") || catKey.includes("trag") || catKey.includes("cervez") || catKey.includes("vino") || catKey.includes("gaseos")) catKey = "bebidas";
        else if (catKey.includes("mier") || catKey.includes("miér")) catKey = "miercoles";
        else if (catKey.includes("piz")) catKey = "pizzas";
        else if (catKey.includes("vier") || catKey.includes("parr") || catKey.includes("asad")) catKey = "parrillada";

        if (!menuOrganizado[catKey]) {
            const meta = CATEGORY_METADATA[catKey] || {
                id: catKey,
                titulo: catRaw.toUpperCase(),
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
    });

    if (menuOrganizado.bebidas && menuOrganizado.bebidas.items.length > 0) {
        menuOrganizado.bebidas.items.sort((a, b) => (a.tipoOrden || 99) - (b.tipoOrden || 99));
    }

    menuOrganizado._whatsappNumber = CURRENT_WHATSAPP_NUMBER;
    return menuOrganizado;
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
            console.log("Calificación enviada a Google Sheets exitosamente:", payload);
        } catch (err) {
            console.error("Error al enviar calificación a Google Sheets:", err);
        }
    }

    return { success: true, payload };
}
