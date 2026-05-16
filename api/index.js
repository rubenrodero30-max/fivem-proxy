export const config = {
  runtime: "nodejs18.x"
};

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Leer endpoint
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const endpoint = searchParams.get("endpoint");

  // Endpoints válidos
  const validEndpoints = {
    info: "info.json",
    players: "players.json",
    dynamic: "dynamic.json"
  };

  const file = validEndpoints[endpoint] || "dynamic.json";
  const serverURL = "http://134.255.233.8:30142";

  try {
    // ============================
    // 1. MEDIR PING REAL
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
    // 2. OBTENER RESPUESTA RAW
    // ============================
    const response = await fetch(`${serverURL}/${file}`);
    const buffer = await response.arrayBuffer();

    // ============================
    // 3. DECODIFICAR UTF‑8
    // ============================
    const decoder = new TextDecoder("utf-8");
    let text = decoder.decode(buffer);

    // Si el servidor devuelve texto que NO es JSON, mostrarlo tal cual
    if (!text.trim().startsWith("{")) {
      res.status(200).send(text);
      return;
    }

    // ============================
    // 4. PARSEAR JSON
    // ============================
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      res.status(500).json({ error: "Invalid JSON after UTF-8 decode" });
      return;
    }

    // ============================
    // 5. AÑADIR PING
    // ============================
    data.ping = ping;

    // ============================
    // 6. RESPUESTA FINAL
    // ============================
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
}
