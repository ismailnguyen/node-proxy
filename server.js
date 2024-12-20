const express = require('express');
const axios = require('axios');
const url = require('url');
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * @param req_url {string} The requested URL (scheme is optional).
 * @return {object} URL parsed using url.parse
 */
function parseURL(req_url) {
    var match = req_url.match(/^(?:(https?:)?\/\/)?(([^\/?]+?)(?::(\d{0,5})(?=[\/?]|$))?)([\/?][\S\s]*|$)/i);
    //                              ^^^^^^^          ^^^^^^^^      ^^^^^^^                ^^^^^^^^^^^^
    //                            1:protocol       3:hostname     4:port                 5:path + query string
    //                                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //                                            2:host
    if (!match) {
      return null;
    }
    if (!match[1]) {
      if (/^https?:/i.test(req_url)) {
        // The pattern at top could mistakenly parse "http:///" as host="http:" and path=///.
        return null;
      }
      // Scheme is omitted.
      if (req_url.lastIndexOf('//', 0) === -1) {
        // "//" is omitted.
        req_url = '//' + req_url;
      }
      req_url = (match[4] === '443' ? 'https:' : 'http:') + req_url;
    }
    var parsed = url.parse(req_url);
    if (!parsed.hostname) {
      // "http://:1/" and "http:/notenoughslashes" could end up here.
      return null;
    }
    return parsed;
  }

// The proxy server will make a request to the given URL and return the response back to the client
app.get('*', async (req, res) => {
    var targetUrl = parseURL(req.url.slice(1));
    try {
        // Make a request to the target URL
        const response = await axios.get(targetUrl.href);

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