export default async function handler(req, res) {
  // Allow all origins (your Vercel dashboard)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Build the Foodics URL from the incoming path + query
  // e.g. /api/foodics/branches?per_page=50 → https://api-beta.foodics.com/v5/branches?per_page=50
  const path = req.query.path || "";
  const params = { ...req.query };
  delete params.path;

  const qs = new URLSearchParams(params).toString();
  const foodicsUrl = `https://api-beta.foodics.com/v5/${path}${qs ? "?" + qs : ""}`;

  try {
    const foodicsRes = await fetch(foodicsUrl, {
      headers: {
        Authorization: req.headers.authorization || "",
        Accept: "application/json",
      },
    });

    const data = await foodicsRes.json();
    return res.status(foodicsRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

