import express from "express";
import {
  createString,
  getString,
  deleteString,
  getAllStrings,
  filterByNaturalLanguage
} from "../controllers/stringController.js";

const router = express.Router();

router.post("/", createString);
router.get("/", getAllStrings);
router.get("/filter-by-natural-language", filterByNaturalLanguage);
router.get("/:value", getString);
router.delete("/:value", deleteString);

export default router;