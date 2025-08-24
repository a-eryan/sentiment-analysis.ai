// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const allowedOrigins = ['https://sentiment-analysis.ai', 'http://localhost:3000'];
  const origin = req.headers.origin;

  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.status(200).json({ name: "John Doe" });
}
