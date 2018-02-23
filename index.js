require('babel-polyfill');
const express = require('express');
const Screenshot = require('./screenshots');
const bodyParser = require('body-parser');
const cors = require('cors');
let port = 8081;

const app = express();
app.use(cors());
app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.post('/squasher', (req, res) => {
    console.log(req.body.serverUrl);
    let responseData = {
        status: 'ok',
        reportsLeft: 4,
        validTo: parseInt((Date.now() + 3600 * 1000 * 24 * 10) / 1000),
        code: '123456qewqew'
    }
    res.json(responseData);
});

app.post('/screenshot', function (req, res) {
    if(!req.body.html){
        res.json({
            status: 'error',
            message: 'Please provide required data. E.g Url, widht, height, scroll etc.' 
        });
    }else{
        let data = {
            url: req.body.url,
            width: req.body.width,
            height: req.body.height,
            top: req.body.top,
            left: req.body.left,
            viewPortWidth: req.body.viewPortWidth,
            viewPortHeight: req.body.viewPortHeight,
            html: req.body.html
        };
        const screenshot = new Screenshot(data);
        screenshot.take()
            .then((screenshotData) => {
                res.json(screenshotData);
            });
    }
})


app.listen(port, () => console.log(`App listening on port ${port}!`))