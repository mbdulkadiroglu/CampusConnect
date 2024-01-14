const Feedback = require('../models/feedbackModel');

const createFeedback = async (req, res) => {
    const { content, email, type } = req.body;
    const { _id } = req.user._id;

    try {
        const feedback = await Feedback.create({
            user: _id,
            content,
            email,
            type,
        });

        res.status(201).json({ feedback });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const resolveFeedback = async (req, res) => {
    const { _id } = req.params;
    const { isResolved } = req.body;

    try {
        const feedback = await Feedback.findByIdAndUpdate(
            _id,
            { isResolved: isResolved },
            { new: true }
        );
        res.status(200).json({ success: true, feedback });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Inside feedbackController.js
const addCommentToFeedback = async (req, res) => {
    const { _id } = req.params;
    const { text } = req.body; // Assume the body contains the comment text

    try {
        const feedback = await Feedback.findByIdAndUpdate(
            _id,
            { $push: { comments: { user: req.user._id, text: text } } },
            { new: true }
        ).populate('comments.user', 'name'); // Populate to get the user name
        res.status(200).json(feedback);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find();
        res.status(200).json({ feedbacks });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getFeedbackByType = async (req, res) => {
    const { type } = req.params;
    try {
        const feedbacks = await Feedback.find({ type });
        res.status(200).json({ feedbacks });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}



const deleteFeedback = async (req, res) => {
    const { _id } = req.params;
    try {
        const feedback = await Feedback.findByIdAndDelete(_id);
        res.status(200).json({ feedback });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    createFeedback,
    getAllFeedbacks,
    getFeedbackByType,
    deleteFeedback,
    addCommentToFeedback,
    resolveFeedback
}
