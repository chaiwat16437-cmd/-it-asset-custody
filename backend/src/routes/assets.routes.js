import { Router } from "express";
import {
  listAssets,
  assetsSummaryByCategory,
  getAsset,
  getCurrentCustody,
  getAssetHistory,
  createAsset,
  updateAsset,
  deleteAsset,
} from "../controllers/assets.controller.js";

const router = Router();

router.get("/summary", assetsSummaryByCategory);
router.get("/", listAssets);
router.post("/", createAsset);
router.get("/:id", getAsset);
router.put("/:id", updateAsset);
router.delete("/:id", deleteAsset);
router.get("/:id/custody/current", getCurrentCustody);
router.get("/:id/history", getAssetHistory);

export default router;
