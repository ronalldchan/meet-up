import dotenv from "dotenv";
import express from "express";
import path from "path";
const app = express();
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const port = process.env.PORT;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Test something");
});

const eventsRouter = require("./routes/events");

app.use("/events", eventsRouter);

app.listen(port, () => console.log(`App open on http://localhost:${port}`));
