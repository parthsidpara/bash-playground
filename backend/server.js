import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 3000;

// 🔐 Allow all origins during development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Optional: explicitly respond to OPTIONS preflight
app.options('*', cors());

app.use(express.json());

app.post("/run", async (req, res) => {
  const code = req.body.code;
  if (!code || code.length > 1000) {
    return res.status(400).json({ error: "Invalid or too long script." });
  }

  try {
    const createRes = await fetch("https://api.paiza.io/runners/create", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        source_code: code,
        language: "bash",
        api_key: "guest"
      })
    });

    const { id } = await createRes.json();

    // Small delay before checking output
    await new Promise(r => setTimeout(r, 2000));

    const resultRes = await fetch(`https://api.paiza.io/runners/get_details?id=${id}&api_key=guest`);
    const result = await resultRes.json();

    res.json({
      output: result.stdout || result.stderr || "No output"
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong.", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Bash proxy server running at http://localhost:${PORT}`);
});
