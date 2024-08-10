const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

calendarEvents = [
    { id: 1, name: "event1" },
    { id: 2, name: "event2" },
];

app.get("/", (req, res) => {
    res.send("Test something");
});

app.get("/events", (req, res) => {
    res.send(calendarEvents);
});

app.post("/events", (req, res) => {
    if (!req.body.name || req.body.name.length < 3) {
        res.status(400).send(`Name is required and should be minimum of 3 characters`);
        return;
    }

    const event = {
        id: calendarEvents.length + 1,
        name: req.body.name,
    };
    calendarEvents.push(event);
    res.send(event);
});

app.get("/event/:id", (req, res) => {
    const event = calendarEvents.find((e) => e.id == parseInt(req.params.id));
    if (!event) res.status(404).send(`No event with ID of ${req.params.id} found`);
    res.send(event);
});

app.listen(port, () => console.log(`App open on http://localhost:${port}`));
