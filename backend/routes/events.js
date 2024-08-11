const express = require("express");
const router = express.Router();

events = [];

class Event {
    id;
    name;
    startDate;
    endDate;
    users;

    constructor(id, name, startDate, endDate) {
        this.id = id;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.users = new Map();
    }
}

function isValidInput(input) {
    return !input || input.length < 3;
}

router
    .route("/")
    .get((req, res) => {
        res.status(200).send(events);
    })
    .post((req, res) => {
        const name = req.body.name;
        if (isValidInput(name)) {
            res.status(400).send("Name is required and should be minimum of 3 characters");
            return;
        }
        let event = new Event(events.length + 1, name);
        events.push(event);
        res.status(200).send(event);
    });

router.route("/:id").get((req, res) => {
    res.send(`Get event with ID ${req.params.id}`);
});

router.route("/:id/users").post((req, res) => {
    let event = events.find((event) => event.id == req.params.id);
    if (!event) {
        res.status(400).send(`Invalid event ID ${req.params.id}`);
        return;
    }
    let name = req.body.name;
    if (isValidInput(name)) {
        res.status(400).send("Name is required and should be minimum of 3 characters");
        return;
    }
    if (event.users.has(name)) {
        res.status(400).send(`"${req.body.name}" name already exists`);
        return;
    }
    event.users.set(name, [1, 2, 3]);
    res.status(200).send({ name: name, dates: event.users.get(name) });
});

router.route("/:id/users/:uid").put((req, res) => {});

module.exports = router;
