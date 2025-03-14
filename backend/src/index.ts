import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import express from "express";
import cors from "cors";
import router from "./routes";
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

app.use("/api", router);

app.listen(port, () => console.log(`App open on http://localhost:${port}`));
