export default async function handler(req, res) {
  // Nur POST erlauben
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "No message provided" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY fehlt");
      return res.status(500).json({ error: "API key not configured" });
    }

    // Aufruf der OpenAI-API per fetch (ohne extra Bibliothek)
    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini", // kleines, günstiges Modell
        messages: [
          {
            role: "system",
            content:
              "Du bist ein freundlicher, leicht magischer Assistent in einem alten Buch. Antworte kurz, klar und auf Deutsch.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error("Fehler von OpenAI:", apiRes.status, errorText);
      return res.status(500).json({
        reply:
          "Die Seiten flackern – die KI hat leider einen Fehler zurückgegeben.",
      });
    }

    const data = await apiRes.json();
    const reply =
      data.choices?.[0]?.message?.content ??
      "Die Seiten bleiben stumm – keine Antwort erhalten.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Serverfehler:", err);
    return res.status(500).json({
      reply:
        "Das Buch knistert: Es ist ein unerwarteter Fehler im Zauber aufgetreten.",
    });
  }
}
