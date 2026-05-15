export default async function handler(req, res) {

  // CORS para permitir que WordPress lea la API
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
    // IP REAL DE TU SERVIDOR
    const response = await fetch(`http://134.255.233.8:30142/${file}`);

    // Si el servidor no responde JSON válido, evitamos que explote
    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: "Invalid JSON from FiveM server" });
    }

    // Respuesta correcta
    res.status(200).json(data);

  } catch (error) {
    // Si falla, devolvemos error
    res.status(500).json({ error: "Error fetching data" });
  }
}
