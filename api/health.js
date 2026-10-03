import { ready } from "../lib/core.js";
export default (req, res) => res.status(200).json({ ai: ready() });
