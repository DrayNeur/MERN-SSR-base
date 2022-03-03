const path = require('path');


const express = require('express');
const fs = require('fs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { matchPath } = require('react-router-dom');
const { StaticRouter } = require('react-router-dom/server');
const app = express();

const { App } = require('./src/js/App');

const routes = require('./routes');

app.use(express.static(path.resolve(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('x-powered-by', false)
app.disable('x-powered-by');
app.use(function (req, res, next) {
    res.removeHeader("X-Powered-By");
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'deny');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('X-DNS-Prefetch-Control', 'on');
    res.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.header('Referrer-Policy', 'no-referrer');
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Upgrade-Insecure-Requests');
    res.header('Access-Control-Allow-Age', '63072000');
    res.header('Access-Control-Request-Method', 'POST, GET');
    res.header('Cross-Origin-Embedder-Policy', 'require-corp');
    res.header('Cross-Origin-Opener-Policy', 'same-origin');
    res.header('Upgrade-Insecure-Requests', '1');
    res.header('Transfer-Encoding', 'gzip, chunked');
    res.header('TE', 'trailers, deflate;q=1');
    next();
});

app.get('/*', async (req, res) => {

    const matchRoute = routes.find(route => matchPath(route, req.originalUrl))

    if (!matchRoute) {
        res.status(404);
        return res.send(fs.readFileSync(path.resolve(__dirname, 'src', '404.html')).toString());
    }

    let componentData = null;
    if (typeof matchRoute.component.fetchData === 'function') {
        componentData = await matchRoute.component.fetchData();
    }

    let indexHTML = fs.readFileSync(path.resolve(__dirname,'public', 'index.dat'), {
        encoding: 'utf8',
    });

    let appHTML = ReactDOMServer.renderToString(
        <StaticRouter location={req.originalUrl} context={componentData}>
            <App />
        </StaticRouter>
    );
    
    indexHTML = indexHTML.replace('<div id="root"></div>', `<div id="root">${appHTML}</div>`);

    indexHTML = indexHTML.replace(
        'var initial_state = null;',
        `var initial_state = ${JSON.stringify(componentData)};`
    );

    res.contentType('text/html');
    res.status(200);

    return res.send(indexHTML);
});

app.post('/api/:endpoint', (req, res) => {
    switch(req.params['endpoint']) {
        case 'test':
            res.send("omg")
    }
})

app.listen('3000', () => {
    console.log('Express server started at http://localhost:3000');
});