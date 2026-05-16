export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  // ============================
  // 1️⃣ CORS universal
  // ============================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // ============================
  // 2️⃣ Leer endpoint
  // ============================
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const endpoint = searchParams.get("endpoint");

  const validEndpoints = {
    info: "info.json",
    players: "players.json",
    dynamic: "dynamic.json"
  };

  const file = validEndpoints[endpoint] || "dynamic.json";
  const serverURL = "http://134.255.233.8:30142";

  try {
    // ============================
    // 3️⃣ Medir ping real
    // ============================
    let ping = null;
    try {
      const start = Date.now();
      await fetch(`${serverURL}/info.json`);
      ping = Date.now() - start;
    } catch {
      ping = null;
    }

    // ============================
    // 4️⃣ Obtener respuesta RAW
    // ============================
    const response = await fetch(`${serverURL}/${file}`);
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(buffer).trim();

    // ============================
    // 5️⃣ Detectar tipo de contenido
    // ============================
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // Si no es JSON, devolver texto plano
      res.status(200).send(text);
      return;
    }

    // ============================
    // 6️⃣ Añadir ping y timestamp
    // ============================
    if (typeof data === "object" && !Array.isArray(data)) {
      data.ping = ping;
      data.timestamp = new Date().toISOString();
    }

    // ============================
    // 7️⃣ Respuesta final
    // ============================
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Error al obtener datos del servidor", details: error.message });
  }
}
