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

    // 2. Obtener respuesta como binario
    const response = await fetch(`${serverURL}/${file}`);
    const buffer = await response.arrayBuffer();

    // 3. Decodificar UTF‑8 correctamente
    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(buffer);

    // 4. Parsear JSON reparado
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON after UTF-8 decode" }),
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
