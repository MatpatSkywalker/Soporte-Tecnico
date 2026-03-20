import { Router, type IRouter } from "express";
import crypto from "crypto";

const router: IRouter = Router();

const ADMIN_USERNAME = "Matpat04";
const ADMIN_PASSWORD = "Optimise1128_!";

const validTokens = new Set<string>();

router.post("/auth/login", (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    res.status(400).json({ error: "Usuario y contraseña requeridos" });
    return;
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  validTokens.add(token);

  res.json({ token });
});

router.post("/auth/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) validTokens.delete(token);
  res.json({ success: true });
});

export { validTokens };
export default router;
