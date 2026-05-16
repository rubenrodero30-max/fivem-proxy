export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

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
    // Medir ping
    let ping = null;
    try {
      const start = Date.now();
      await fetch(`${serverURL}/info.json`);
      ping = Date.now() - start;
    } catch {
      ping = null;
    }

    // Obtener RAW
    const response = await fetch(`${serverURL}/${file}`);
    const buffer = await response.arrayBuffer();

    // Decodificar eliminando BOM
    const decoder = new TextDecoder("utf-8");
    let text = decoder.decode(buffer).replace(/^\uFEFF/, "").trim();

    let data;

    // Intentar parsear SIEMPRE (OBJETO o ARRAY)
    try {
      data = JSON.parse(text);
    } catch {
      res.status(200).send(text);
      return;
    }

    // Añadir ping solo si es objeto
    if (typeof data === "object" && !Array.isArray(data)) {
      data.ping = ping;
      data.timestamp = new Date().toISOString();
    }

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({
      error: "Error al obtener datos del servidor",
      details: error.message
    });
  }
}
