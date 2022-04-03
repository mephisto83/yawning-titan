const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
var express = require("express");
var fs = require('fs');
var path = require('path');
var cors = require('cors');
const component_folder = `c:/dev/component-folder`
const bodyParser = require('body-parser')
var app = express();
app.use(bodyParser.json({ limit: '150mb' }));
app.use(bodyParser.urlencoded({ limit: '150mb', extended: true }));
app.use(express.json())    // <==== parse request body as JSON
app.use(cors());

app.listen(16552, () => {
    console.log("Server running on port http://localhost:16552");
});
app.get("/", (req, res, next) => {
    res.json(["ok"]);
});
app.post('/', async (req, res, next) => {
    try {
        console.log(req.body)
        console.log('received request: ' + req.body.url)
        let data = await fetch(req.body.url).catch((e) => {
            console.log(e);
            return 'fail';
        });
        let cssText = (await data.text());
        res.json({ ok: true, data: cssText });
    } catch (e) {
        console.log(e);
        res.json({ ok: false, e });
    }
})

app.post('/component', async (req, res, next) => {
    try {
        let data = req.body.data;
        let result = JSON.parse(data);
        fs.writeFileSync(path.join(component_folder, `${result.fileName}.tsx`), result.react, 'utf-8')
        fs.writeFileSync(path.join(component_folder, `${result.fileName}.scss`), result.css, 'utf-8')
        res.json({ ok: true });
    } catch (e) {
        console.log(e);
        res.json({ ok: false, e });
    }
});