'use strict';

const minimist = require('minimist');
const ch = require('chalk');
const request = require('request');
const baseUrl = 'http://localhost:8080/';

function printMessage(message, isVerbose) {
    let result = [];
    if (isVerbose)
        result.push(ch.hex('#ff0')('ID')+`: ${message.id}`);
    if (message.from)
        result.push(ch.hex('#f00')('FROM')+`: ${message.from}`);
    if (message.to)
        result.push(ch.hex('#f00')('TO')+`: ${message.to}`);
    let edited = message.edited ? ch.hex('#777')('(edited)'): '';
    result.push(ch.hex('#0f0')('TEXT')+`: ${message.text}${edited}`);
    return result.join('\n');
}


function execute() {
    // Внутри этой функции нужно получить и обработать аргументы командной строки
    let args = minimist(process.argv.slice(2));
    let {_: [command], from, to, text, id, v} = args;
    let json = true;
    switch (command) {
        case 'list':
            return new Promise(resolve => {
                request({baseUrl, url: '/messages', qs: {from, to}, json}, function (error, response, body) {
                    let result = body.map(x => printMessage(x, v));
                    resolve(result.join('\n\n'));
                });
            });
        case 'send':
            return new Promise(resolve => {
                request({baseUrl, url: '/messages', qs: {from, to}, method: 'POST', json: {text}}, 
                    function (error, response, body) {
                    resolve(printMessage(body));
                });
            });
        case 'delete':
            return new Promise(resolve => {
                request({baseUrl, url: '/messages/'+id, method: 'DELETE'}, 
                function (error, response, body) {
                    resolve('DELETED');
                });
            });
        case 'edit':
            return new Promise(resolve => {
                request({baseUrl, url: '/messages/'+id, method: 'PATCH', json: {text}}, 
                    function (error, response, body) {
                    resolve(printMessage(body));
                });
            });
    }
    return Promise.reject();
}

module.exports = {execute, isStar: true};