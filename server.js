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

app.get('/*', async (req, res) => {
    // Reconstruct the full target URL
    let targetUrl = req.params[0];

    // Ensure the URL starts with `https://` by adding the missing slash
    if (targetUrl.startsWith('https:/') && !targetUrl.startsWith('https://')) {
        targetUrl = targetUrl.replace('https:/', 'https://');
    } else if (targetUrl.startsWith('http:/') && !targetUrl.startsWith('http://')) {
        targetUrl = targetUrl.replace('http:/', 'http://');
    }

    if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
        return res.status(400).send({ error: 'Invalid or missing target URL in the path' });
    }

    try {
        // Append query parameters from the original request
        const queryParams = req.url.replace(`/${req.params[0]}`, '');
        const fullUrl = `${targetUrl}${queryParams}`;
        // Make the proxy request to the target URL
        const response = await axios.get(parseURL(fullUrl).href);

        // Forward the response back to the client
        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(500).send({ error: error.message, query: targetUrl });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});