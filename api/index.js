export default async function handler(req, res) {
  const { endpoint } = req.query;

  try {
    const response = await fetch(`http://51.178.152.18:30120/${endpoint}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
}
