const express = require('express');
const axios = require('axios');
const url = require('url');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/*', async (req, res) => {
    // Reconstruct the full target URL
    const targetUrl = `${req.params[0]}${req.url.replace(`/${req.params[0]}`, '')}`;

    if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
        return res.status(400).send({ error: 'Invalid or missing target URL in the path' });
    }

    try {
        // Make the proxy request to the target URL
        const response = await axios.get(targetUrl);


        // Forward the response back to the client
        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});