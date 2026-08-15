import { Router } from "express";
import {
  listDepartments,
  createDepartment,
  listEmployees,
  createEmployee,
  deleteEmployee,
  listCategories,
  createCategory,
} from "../controllers/directory.controller.js";

const router = Router();

router.get("/departments", listDepartments);
router.post("/departments", createDepartment);
router.get("/employees", listEmployees);
router.post("/employees", createEmployee);
router.delete("/employees/:id", deleteEmployee);
router.get("/categories", listCategories);
router.post("/categories", createCategory);

export default router;
