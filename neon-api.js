/**
 * Conector de Neon Postgres 100% EN VIVO para la Carta Digital (Rivera Club)
 * Conexión ultrarrápida vía HTTP SQL API con respaldo local para protocolo file:// o sin red.
 */

// La autenticación con Neon se realiza de forma segura en el servidor mediante /api/neon (Vercel Serverless Function)

// Ejecutar consulta SQL vía HTTP en Neon con reintento automático
async function runNeonQuery(sql, params = [], retries = 1) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000); // 12s timeout limit

        try {
            const response = await fetch('/api/neon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: sql, params }),
                signal: controller.signal
            });
            clearTimeout(timer);

            if (!response.ok) {
                throw new Error(`Error en Neon API: status ${response.status}`);
            }

            const data = await response.json();
            if (Array.isArray(data)) return data;
            if (data && Array.isArray(data.rows)) return data.rows;
            if (data && data.result && Array.isArray(data.result.rows)) return data.result.rows;
            return [];
        } catch (err) {
            clearTimeout(timer);
            if (attempt === retries) throw err;
            await new Promise(res => setTimeout(res, 300));
        }
    }
}

// Cargar menú completo directamente desde la base de datos Neon (100% en vivo con respaldo fluido)
async function fetchMenuFromNeon() {
    try {
        const [catsRows, prodsRows, configRows] = await Promise.all([
            runNeonQuery("SELECT * FROM categorias WHERE disponible = true ORDER BY orden ASC"),
            runNeonQuery("SELECT * FROM productos WHERE disponible = true ORDER BY orden ASC"),
            runNeonQuery("SELECT * FROM configuracion")
        ]);

        if (!catsRows || catsRows.length === 0) {
            throw new Error("No se encontraron categorías en la base de datos");
        }

        const menuOrganizado = {};

        catsRows.forEach(cat => {
            menuOrganizado[cat.id] = {
                id: cat.id,
                titulo: cat.titulo,
                subtitulo: cat.subtitulo || "",
                tag: cat.tag || "",
                fondo: cat.fondo || "fondo.png",
                items: []
            };
        });

        prodsRows.forEach(prod => {
            const catKey = prod.categoria_id;
            if (menuOrganizado[catKey]) {
                const itemData = {
                    id: prod.id,
                    nombre: prod.nombre,
                    desc: prod.descripcion || "",
                    precio: prod.precio,
                    disponible: prod.disponible
                };

                if (prod.subtipo) {
                    itemData.tipo = prod.subtipo;
                    itemData.tipoNombre = prod.subtipo_nombre || prod.subtipo;
                    itemData.tipoOrden = prod.subtipo_orden || 1;
                }

                menuOrganizado[catKey].items.push(itemData);
            }
        });

        if (configRows && configRows.length > 0) {
            const wspItem = configRows.find(c => c.clave === 'whatsapp_number');
            if (wspItem && wspItem.valor) {
                menuOrganizado._whatsappNumber = wspItem.valor.trim();
                if (typeof CURRENT_WHATSAPP_NUMBER !== 'undefined') {
                    CURRENT_WHATSAPP_NUMBER = wspItem.valor.trim();
                }
            }
        }

        return menuOrganizado;
    } catch (err) {
        console.error("⚠️ Error conectando con Neon Postgres:", err);
        throw err;
    }
}

// Sincronización en tiempo real continua (Polling cada 3s y al volver a la pestaña)
function startLiveMenuSync(onUpdateCallback, intervalMs = 3000) {
    let lastJsonString = "";

    const checkLiveChanges = async () => {
        try {
            const freshData = await fetchMenuFromNeon();
            const jsonStr = JSON.stringify(freshData);
            if (lastJsonString && jsonStr !== lastJsonString) {
                console.log("⚡ Cambio detectado en la base de datos. Actualizando precios en pantalla...");
                if (typeof onUpdateCallback === 'function') {
                    onUpdateCallback(freshData);
                }
            }
            lastJsonString = jsonStr;
        } catch (e) { }
    };

    checkLiveChanges();
    const timer = setInterval(checkLiveChanges, intervalMs);

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            checkLiveChanges();
        }
    });

    return () => clearInterval(timer);
}
