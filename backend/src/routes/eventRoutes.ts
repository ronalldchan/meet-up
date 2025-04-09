import express from "express";
import { EventController } from "../controllers/eventController";
import { UserController } from "../controllers/userController";
import { AvailabilityController } from "../controllers/availabilityController";
import { validateEventId, validateUserId } from "../middleware/validateParams";

const router = express.Router();

const eventController: EventController = new EventController();
const userController: UserController = new UserController();
const availabilityController: AvailabilityController = new AvailabilityController();

router.param("eventId", validateEventId);
router.param("userId", validateUserId);

router.route("/").post(eventController.createEvent);
router.route("/:eventId").get(eventController.getEvent);

router.post("/:eventId/users", userController.createUser);
router.get("/:eventId/users", userController.getUsersFromEvent);

router.patch("/:eventId/users/:userId", availabilityController.updateAvailability);
router.get("/:eventId/users/availability", availabilityController.getAvailabilities);
// .put(availabilityController.addAvailability)
// .delete(availabilityController.removeAvailability)

export default router;
