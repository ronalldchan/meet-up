const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Test something");
});

const eventsRouter = require("./routes/events");

app.use("/events", eventsRouter);

app.listen(port, () => console.log(`App open on http://localhost:${port}`));
