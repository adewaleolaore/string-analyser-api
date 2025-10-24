import { stringDB } from "../db.js";
import { analyzeString } from "../utils/analyzer.js";

export const createString = (req, res) => {
  const { value } = req.body;

  if (typeof value !== "string") {
    return res.status(422).json({ error: "Value must be a string" });
  }

  const props = analyzeString(value);
  if (stringDB.has(props.sha256_hash)) {
    return res.status(409).json({ error: "String already exists" });
  }

  const record = {
    id: props.sha256_hash,
    value,
    properties: props,
    created_at: new Date().toISOString(),
  };

  stringDB.set(props.sha256_hash, record);
  res.status(201).json(record);
};

export const getString = (req, res) => {
  const value = decodeURIComponent(req.params.value);
  const hash = [...stringDB.values()].find((r) => r.value === value);

  if (!hash) return res.status(404).json({ error: "String not found" });
  res.json(hash);
};

export const deleteString = (req, res) => {
  const value = decodeURIComponent(req.params.value);
  const found = [...stringDB.values()].find((r) => r.value === value);
  if (!found) return res.status(404).json({ error: "String not found" });

  stringDB.delete(found.id);
  res.status(204).send();
};