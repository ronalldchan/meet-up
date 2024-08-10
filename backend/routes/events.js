const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Sending list of all events");
});

router
    .route("/:id")
    .post((req, res) => {
        res.send("Creating new event");
    })
    .get((req, res) => {
        res.send(`Get event with ID ${req.params.id}`);
    });

router.route("/:id/:user").post((req, res) => {
    res.send("Creating new user");
});

module.exports = router;
