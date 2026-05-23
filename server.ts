import express from "express";
import path from "path";
import app from "./api/index.js";

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  (async () => {
    const { createServer: createDynamicViteServer } = await import("vite");
    const vite = await createDynamicViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  })();
} else if (!process.env.VERCEL) {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

if (!process.env.VERCEL) {
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
