export const config = {
  runtime: "edge",
  regions: ["fra1"] // Frankfurt (Europa)
};

export default async function handler(req) {

  // CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // Leer parámetros de la URL (Edge Runtime no usa req.query)
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get("endpoint");

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
      ping = null;
    }

    // ============================
    // 2. OBTENER EL ENDPOINT REAL
    // ============================
    const response = await fetch(`${serverURL}/${file}`);
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON from FiveM server" }),
        { status: 500, headers }
      );
    }

    // ============================
    // 3. AÑADIR PING AL JSON
    // ============================
    data.ping = ping;

    // ============================
    // 4. RESPUESTA FINAL
    // ============================
    return new Response(JSON.stringify(data), {
      status: 200,
      headers
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error fetching data" }),
      { status: 500, headers }
    );
  }
}
