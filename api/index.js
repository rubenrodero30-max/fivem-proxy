export const config = {
  runtime: "nodejs18.x"
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
    let ping = null;
    try {
      const start = Date.now();
      await fetch(`${serverURL}/info.json`);
      ping = Date.now() - start;
    } catch {
      ping = null;
    }

    const response = await fetch(`${serverURL}/${file}`);
    const buffer = await response.arrayBuffer();

    const decoder = new TextDecoder("utf-8");
    let text = decoder.decode(buffer);

    if (!text.trim().startsWith("{")) {
      res.status(200).send(text);
      return;
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      res.status(500).json({ error: "Invalid JSON after UTF-8 decode" });
      return;
    }

    data.ping = ping;

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
}
