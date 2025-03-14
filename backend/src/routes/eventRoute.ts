import express from "express";
import { EventController } from "../controllers/eventController";
import { UserController } from "../controllers/userController";
import { AvailabilityController } from "../controllers/availabilityController";
import { isValidIdString } from "../utils";
import { BadRequestError } from "../errors/customErrors";

const router = express.Router();

const eventController: EventController = new EventController();
const userController: UserController = new UserController();
const availabilityController: AvailabilityController = new AvailabilityController();

router.param("eventId", (req, res, next, eventId) => {
    if (!isValidIdString(eventId)) {
        return res.status(400).json({ error: BadRequestError.name, message: "Event ID is not proper format" });
    }
    next();
});

router.param("userId", (req, res, next, userId) => {
    if (!isValidIdString(userId)) {
        return res.status(400).json({ error: BadRequestError.name, message: "User ID is not proper format" });
    }
    next();
});

router.route("/").post(eventController.createEvent);

router.route("/:eventId").get(eventController.getEvent);

router.route("/:eventId/users").post(userController.createUser).get(userController.getUsersFromEvent);

router
    .route("/:eventId/users/:userId")
    .put(availabilityController.addAvailability)
    .delete(availabilityController.removeAvailability)
    .patch(availabilityController.updateAvailability);

router.route("/:eventId/users/availability").get(availabilityController.getAvailabilities);

export default router;
