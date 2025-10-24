import express from "express";
import { createString, getString, deleteString } from "../controllers/stringController.js";
import { stringDB } from "../db.js";

const router = express.Router();

router.post("/", createString);
router.get("/", (req, res) => {
  const all = [...stringDB.values()];
  res.json({ data: all, count: all.length });
});
router.get("/:value", getString);
router.delete("/:value", deleteString);

export default router;