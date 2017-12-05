'use strict';

const minimist = require('minimist');
const ch = require('chalk');
const request = require('request');
const baseUrl = 'http://localhost:8080/messages/';

function printMessage(message, isVerbose) {
    let result = [];
    if (isVerbose) {
        result.push(`${ch.hex('#ff0')('ID')}: ${message.id}`);
    }
    if (message.from) {
        result.push(`${ch.hex('#f00')('FROM')}: ${message.from}`);
    }
    if (message.to) {
        result.push(`${ch.hex('#f00')('TO')}: ${message.to}`);
    }
    let edited = message.edited ? ch.hex('#777')('(edited)') : '';
    result.push(`${ch.hex('#0f0')('TEXT')}: ${message.text}${edited}`);

    return result.join('\n');
}


function execute() {
    // Внутри этой функции нужно получить и обработать аргументы командной строки
    let args = minimist(process.argv.slice(2), { 
        string: ['from', 'to', 'text', 'id'],
        boolean: ['v']
    });
    let { _: [command], from, to, text, id, v } = args;

    function requestPromise({ url = '/', qs = {}, method = 'GET', json = true }) {
        return new Promise((resolve, reject) => {
            request({ baseUrl, url, qs, method, json },
                (err, response, body) => err ? reject(err) : resolve(body));
        });
    }

    switch (command) {
        case 'list':
            return requestPromise({ qs: { from, to } })
                .then(messages => messages.map(x => printMessage(x, v)))
                .then(messages => messages.join('\n\n'));
        case 'send':
            return requestPromise({ qs: { from, to }, method: 'POST', json: { text } })
                .then(x => printMessage(x, v));
        case 'delete':
            return requestPromise({ url: id, method: 'DELETE' })
                .then(() => 'DELETED');
        case 'edit':
            return requestPromise({ url: id, method: 'PATCH', json: { text } })
                .then(x => printMessage(x, v));
        default:
            return Promise.reject();
    }
}

module.exports = { execute, isStar: true };
