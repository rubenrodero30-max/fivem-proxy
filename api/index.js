export const config = {
  runtime: "edge",
  regions: ["fra1"]
};

export default async function handler(req) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get("endpoint");

  const validEndpoints = {
    info: "info.json",
    players: "players.json",
    dynamic: "dynamic.json"
  };

  const file = validEndpoints[endpoint] || "dynamic.json";

  try {
    const serverURL = "http://134.255.233.8:30142";

    // 1. Medir ping real
    let ping = null;
    try {
      const start = Date.now();
      await fetch(`${serverURL}/info.json`);
      ping = Date.now() - start;
    } catch {
      ping = null;
    }

    // 2. Obtener respuesta cruda (sin decodificar)
    const response = await fetch(`${serverURL}/${file}`);
    const text = await response.text();

    // 3. Mostrar contenido si no empieza con "{"
    if (!text.trim().startsWith("{")) {
      return new Response(text, { status: 200, headers });
    }

    // 4. Intentar parsear JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON structure" }),
        { status: 500, headers }
      );
    }

    // 5. Añadir ping
    data.ping = ping;

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
