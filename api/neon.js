export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let rawConnString = process.env.NEON_CONN_STRING;

    if (!rawConnString) {
        return res.status(500).json({ error: 'Falta la variable de entorno NEON_CONN_STRING' });
    }

    // Limpiar automáticamente la cadena de conexión si incluye -pooler o channel_binding (no aplicables para la API HTTP /sql)
    const cleanConnString = rawConnString
        .replace('-pooler.', '.')
        .replace(/&?channel_binding=[^&]*/g, '');

    // Determinar el endpoint /sql basado en el host de la cadena de conexión limpiada
    let endpoint = process.env.NEON_SQL_ENDPOINT;
    if (!endpoint) {
        const hostMatch = cleanConnString.match(/@([^/:]+)/);
        if (hostMatch && hostMatch[1]) {
            endpoint = `https://${hostMatch[1]}/sql`;
        } else {
            endpoint = "https://ep-lively-feather-axicyk0b.c-4.us-east-2.aws.neon.tech/sql";
        }
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Neon-Connection-String': cleanConnString,
                'Neon-Raw-Text-Output': 'true'
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).json({ error: errText });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
