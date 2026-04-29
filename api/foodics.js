import https from "https";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const path = (req.query.path || "").replace(/^\//, "");
  const params = { ...req.query };
  delete params.path;

  const qs = new URLSearchParams(params).toString();
  const authHeader = req.headers.authorization || "";

  try {
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: "api-beta.foodics.com",
        path: `/v5/${path}${qs ? "?" + qs : ""}`,
        method: "GET",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
          "User-Agent": "caf-dashboard/1.0",
        },
      };

      const request = https.request(options, (response) => {
        let body = "";
        response.on("data", (chunk) => { body += chunk; });
        response.on("end", () => {
          try {
            resolve({ status: response.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: response.statusCode, data: { error: body.slice(0, 200) } });
          }
        });
      });

      request.on("error", (err) => reject(err));
      request.setTimeout(25000, () => { request.destroy(); reject(new Error("Timeout")); });
      request.end();
    });

    return res.status(result.status).json(result.data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
