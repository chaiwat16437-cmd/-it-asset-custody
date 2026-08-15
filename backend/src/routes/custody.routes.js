import { Router } from "express";
import {
  listCustody,
  custodyByDepartment,
  checkoutAsset,
  checkinAsset,
} from "../controllers/custody.controller.js";

const router = Router();

router.get("/by-department", custodyByDepartment);
router.get("/", listCustody);
router.post("/checkout", checkoutAsset);
router.post("/:id/checkin", checkinAsset);

export default router;
