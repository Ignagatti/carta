// =========================================================================
// CONEXIÓN EN TIEMPO REAL CON GOOGLE SHEETS - RIVERA CLUB
// =========================================================================

const GOOGLE_SHEET_ID = "1uqoV8K2FPBis51tfvNIHp917s2QecEdb2yLeeCm4yGg";
const GOOGLE_SHEET_TAB = ""; // Lee automáticamente la primera pestaña

// Categorías base del club
function getBaseCategories() {
    return {
        "bebidas": {
            id: "bebidas",
            titulo: "BEBIDAS",
            icon: "",
            tag: "Carta",
            subtitulo: "Tragos, cervezas, vinos y gaseosas",
            fondo: "fondo.png",
            items: []
        },
        "miercoles": {
            id: "miercoles",
            titulo: "MIÉRCOLES",
            icon: "",
            tag: "Miércoles",
            subtitulo: "Menú variado de la casa",
            fondo: "fondo.png",
            items: []
        },
        "pizzas": {
            id: "pizzas",
            titulo: "PIZZA LIBRE",
            icon: "",
            tag: "Jue & Sáb",
            subtitulo: "Jueves y sábados con todas las variedades",
            fondo: "fondo.png",
            items: []
        },
        "parrillada": {
            id: "parrillada",
            titulo: "PARRILLADA",
            icon: "",
            tag: "Viernes",
            subtitulo: "Viernes de cortes premium a las brasas",
            fondo: "fondo.png",
            items: []
        }
    };
}

let CURRENT_WHATSAPP_NUMBER = "5493496000000"; // Número por defecto si no está en el Excel

/**
 * Genera el enlace de WhatsApp con mensaje personalizado según la sección
 */
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

/**
 * Obtiene y organiza los datos 100% en tiempo real desde Google Sheets
 */
async function fetchMenuFromSheets() {
    const menuOrganizado = getBaseCategories();

    if (!GOOGLE_SHEET_ID) {
        return menuOrganizado;
    }

    try {
        const sheetParam = GOOGLE_SHEET_TAB ? `&sheet=${encodeURIComponent(GOOGLE_SHEET_TAB)}` : '';
        const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json${sheetParam}&t=${new Date().getTime()}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("No se pudo conectar con Google Sheets");

        const text = await response.text();
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}") + 1;
        const json = JSON.parse(text.substring(jsonStart, jsonEnd));

        const cols = json.table.cols.map(c => (c.label || c.id || "").trim().toLowerCase());
        const rows = json.table.rows;

        const categoriaIdx = cols.findIndex(c => c.includes("cat"));
        const nombreIdx = cols.findIndex(c => c.includes("nomb") || c.includes("plato"));
        const descIdx = cols.findIndex(c => c.includes("desc") || c.includes("ingred") || c.includes("detall"));
        const precioIdx = cols.findIndex(c => c.includes("prec") || c.includes("telefono") || c.includes("wsp"));
        const disponibleIdx = cols.findIndex(c => c.includes("disp"));

        rows.forEach(r => {
            if (!r || !r.c) return;

            const getVal = (idx) => (idx !== -1 && r.c[idx] && r.c[idx].v !== null && r.c[idx].v !== undefined ? String(r.c[idx].v).trim() : "");

            const catRaw = getVal(categoriaIdx).toLowerCase().trim();
            const nombre = getVal(nombreIdx);
            const desc = getVal(descIdx);
            const precioRaw = getVal(precioIdx);
            const disponible = getVal(disponibleIdx).toUpperCase();

            // Detectar si esta fila es para configurar el número de WhatsApp
            const rowText = `${catRaw} ${nombre} ${desc}`.toLowerCase();
            if (rowText.includes("wsp") || rowText.includes("whatsapp") || rowText.includes("telefono") || rowText.includes("reserva") || catRaw.includes("config")) {
                const phoneCandidate = (precioRaw || desc || nombre).replace(/[^0-9]/g, '');
                if (phoneCandidate.length >= 8) {
                    CURRENT_WHATSAPP_NUMBER = phoneCandidate;
                }
                return;
            }

            // Omitir si no hay nombre o si está marcado como NO disponible
            if (!nombre || disponible === "NO" || disponible === "0" || disponible === "FALSE") {
                return;
            }

            // Formatear precio
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

            // Normalizar clave de categoría
            let catKey = catRaw || "pizzas";
            if (catKey.includes("beb") || catKey.includes("trag")) catKey = "bebidas";
            else if (catKey.includes("mier") || catKey.includes("miér")) catKey = "miercoles";
            else if (catKey.includes("piz")) catKey = "pizzas";
            else if (catKey.includes("vier") || catKey.includes("parr") || catKey.includes("asad")) catKey = "parrillada";

            // Si es una categoría nueva agregada en Google Sheets
            if (!menuOrganizado[catKey]) {
                menuOrganizado[catKey] = {
                    id: catKey,
                    titulo: catRaw.toUpperCase(),
                    icon: "",
                    tag: "Menú",
                    subtitulo: "Variedades y precios actualizados",
                    fondo: "fondo.png",
                    items: []
                };
            }

            // Agregar el plato
            menuOrganizado[catKey].items.push({
                nombre: nombre,
                desc: desc,
                precio: precio
            });
        });

        menuOrganizado._whatsappNumber = CURRENT_WHATSAPP_NUMBER;
        return menuOrganizado;
    } catch (err) {
        console.warn("Error al consultar Google Sheets, usando configuración base:", err);
        return menuOrganizado;
    }
}
