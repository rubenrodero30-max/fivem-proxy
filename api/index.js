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
    dynamic: "dynamic.json",
    all: "all" // nuevo endpoint
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

    // 🔥 NUEVO BLOQUE: endpoint "all"
    if (endpoint === "all") {
      const [dynamicRes, playersRes] = await Promise.all([
        fetch(`${serverURL}/dynamic.json`),
        fetch(`${serverURL}/players.json`)
      ]);

      const dynamicBuffer = await dynamicRes.arrayBuffer();
      const playersBuffer = await playersRes.arrayBuffer();

      const decoder = new TextDecoder("utf-8");
      const dynamicText = decoder.decode(dynamicBuffer).replace(/^\uFEFF/, "").trim();
      const playersText = decoder.decode(playersBuffer).replace(/^\uFEFF/, "").trim();

      const dynamic = JSON.parse(dynamicText);
      const players = JSON.parse(playersText);

      // Añadir ping y timestamp al objeto dinámico
      dynamic.ping = ping;
      dynamic.timestamp = new Date().toISOString();

      return res.status(200).json({ dynamic, players });
    }

    // 🔹 Endpoint normal (info, players, dynamic)
    const response = await fetch(`${serverURL}/${file}`);
    const buffer = await response.arrayBuffer();

    const decoder = new TextDecoder("utf-8");
    let text = decoder.decode(buffer).replace(/^\uFEFF/, "").trim();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      res.status(200).send(text);
      return;
    }

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
