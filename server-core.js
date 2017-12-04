'use strict';
const app = require('express')();
const uuidv4 = require('uuid/v4');

const messages = {};
app.use(require('body-parser').json());

app.get('/messages', (req, res) => {
    let {from, to} = req.query;
    let result = Object.values(messages).filter(x => (!from || x.from === from) && (!to || x.to === to));
    res.json(result);
});

app.post('/messages', (req, res) => {
    let {from, to} = req.query;
    let {text} = req.body;
    let message = Object.assign({id: uuidv4(), text}, {from, to});
    messages[message.id] = message;
    res.json(message);
});

app.delete('/messages/:id', (req, res) => {
    delete messages[req.params.id];
    res.json({ status: 'ok' });
});

app.patch('/messages/:id', (req, res) => {
    let message = messages[req.params.id];
    message.text = req.body.text;
    message.edited = true;
    res.json(message);
});

module.exports = app;
