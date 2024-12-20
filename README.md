# shopify-proxy
Simple Shopify proxy using Node.js

## Installation

- Install dependencies using Node.js v20 (npm install).
- Deploy to a web server.

## Usage

### Install the app from Shopify Partners
- Create a new app
- Configure URLS
    - Under `Build` > `Configuration`
        - App URL
            Add the URL of your app previously deployed on a web server, and append `/install?api_key=<YOUR CLIENT ID>`
            By replacing `YOUR CLIENT ID` with the one from the `Overview` menu of your app.
        - Allowed redirection URL(s)
            Add the following URLs, replacing the hostname by your application server
            - `httsp://YOUR-APP-SERVER.DOMAIN`
            - `https://YOUR-APP-SERVER.DOMAIN/install`
            - `https://YOUR-APP-SERVER.DOMAIN/install/callback`
            - `http://YOUR-APP-SERVER.DOMAIN/install/callback`
        - App proxy
            Configure the proxy subpath with whatever you want, and URL with either your app domain
                `https://YOUR-APP-SERVER.DOMAIN/`

### Proxification
You can now call this proxy from Shopify calling the proxy's subpath, and appending the URL you would like to fetch.
Example
```javascript
fetch('apps/my-proxy/https://github.com');
```