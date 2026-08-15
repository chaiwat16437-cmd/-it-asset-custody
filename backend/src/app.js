import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import assetsRoutes from "./routes/assets.routes.js";
import custodyRoutes from "./routes/custody.routes.js";
import directoryRoutes from "./routes/directory.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/assets", assetsRoutes);
app.use("/api/custody", custodyRoutes);
app.use("/api", directoryRoutes); // /api/departments, /api/employees, /api/categories

app.use((req, res) => res.status(404).json({ error: "ไม่พบ endpoint นี้" }));
app.use(errorHandler);

export default app;
