export default async function handler(req, res) {
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
    const response = await fetch(`http://134.255.233.8:30142/${file}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
}
