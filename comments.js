// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Store comments
const commentsByPostId = {};

// Handle incoming events from event bus
app.post('/events', async (req, res) => {
    const { type, data } = req.body;

    if (type === 'CommentCreated') {
        const { id, content, postId, status } = data;

        // Get comments for post id
        const comments = commentsByPostId[postId] || [];

        // Add new comment to comments
        comments.push({ id, content, status });

        // Store comments
        commentsByPostId[postId] = comments;

        // Send event to event bus
        await axios.post('http://localhost:4005/events', {
            type: 'CommentModerated',
            data: {
                id,
                content,
                postId,
                status
            }
        });
    }

    // Send response to event bus
    res.send({});
});

// Get comments by post id
app.get('/posts/:id/comments', (req, res) => {
    const { id } = req.params;

    // Get comments for post id
    const comments = commentsByPostId[id] || [];

    // Send response
    res.send(comments);
});

// Listen for incoming requests
app.listen(4001, () => {
    console.log('Listening on 4001');
});