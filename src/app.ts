import express from "express";
import router from "./routes/index.js";

const app = express();

app.use("/api", router);

export default app;
