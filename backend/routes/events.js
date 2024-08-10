const express = require("express");
const router = express.Router();

events = [];

class Event {
    id;
    name;
    users;

    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.users = new Map();
    }
}

router
    .route("/")
    .get((req, res) => {
        res.status(200).send(events);
    })
    .post((req, res) => {
        const name = req.body.name;
        if (!name || name.length < 3) {
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

router.route("/:id/:user").post((req, res) => {
    res.send("Creating new user");
});

module.exports = router;
