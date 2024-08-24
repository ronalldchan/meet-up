import express, { Request, Response } from "express";
import { EventController } from "../controllers/eventController";
import { UserController } from "../controllers/userController";
import { AvailabilityController } from "../controllers/availabilityController";

const router = express.Router();

const eventController: EventController = new EventController();
const userController: UserController = new UserController();
const availabilityController: AvailabilityController = new AvailabilityController();

router.route("/").post(eventController.createEvent);

router.route("/:eventId").get(eventController.getEvent);

router.route("/:eventId/users").get(userController.getUsersFromEvent).post(userController.createUser);

router
    .route("/:eventId/users/:userId")
    .put(availabilityController.addAvailability)
    .delete(availabilityController.removeAvailability);

export default router;
