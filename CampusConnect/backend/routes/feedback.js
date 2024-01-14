const express = require("express");

// controller functions
const {
    createFeedback,
    getAllFeedbacks,
    getFeedbackByType,
    addCommentToFeedback,
    deleteFeedback,
    resolveFeedback
    } = require("../controllers/feedbackController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.post("/", createFeedback);

router.get("/", getAllFeedbacks);

router.get("/:type", getFeedbackByType);

router.patch("/:_id", resolveFeedback);
//get Comments by feedback id we wont have a update feedback





router.patch("/addComment/:_id", addCommentToFeedback);

router.delete("/:_id", deleteFeedback);

module.exports = router;
