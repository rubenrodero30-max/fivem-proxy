export default async function handler(req, res) {

  // CORS para permitir que WordPress lea la API sin bloquearla
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { endpoint } = req.query;

  // Endpoints válidos de FiveM
  const validEndpoints = {
    info: "info.json",
    players: "players.json",
    dynamic: "dynamic.json"
  };

  // Si no se envía endpoint, usar dynamic.json por defecto
  const file = validEndpoints[endpoint] || "dynamic.json";

  try {
    const serverURL = "http://134.255.233.8:30142";

    // ============================
    // 1. MEDIR PING REAL
    // ============================
    let ping = null;
    try {
      const start = Date.now();
      await fetch(`${serverURL}/info.json`);
      ping = Date.now() - start;
    } catch {
      ping = null; // Si falla, no rompe nada
    }

    // ============================
    // 2. OBTENER EL ENDPOINT REAL
    // ============================
    const response = await fetch(`${serverURL}/${file}`);

    // Leer como texto para evitar errores con emojis
    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: "Invalid JSON from FiveM server" });
    }

    // ============================
    // 3. AÑADIR PING AL JSON
    // ============================
    data.ping = ping;

    // ============================
    // 4. RESPUESTA FINAL
    // ============================
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
}
