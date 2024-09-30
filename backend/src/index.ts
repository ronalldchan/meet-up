import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import express from "express";
import eventsRouter from "./routes/eventRoute";
import cors from "cors";
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Route return");
});

app.use("/api/events", eventsRouter);

app.listen(port, () => console.log(`App open on http://localhost:${port}`));
