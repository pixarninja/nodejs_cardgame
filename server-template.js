const http = require('http');
const port = 9900;

const requestHandler = (request, response) => {
    let funcName = "requestHandler";
    if (request.method === 'GET' && request.url === '/' ){
        dumpMessage(funcName, "Request Method: GET - request URL: " + request.url);
        response.writeHead(200, {"Content-Type": "text/html"});
        response.end('Hello Node.js Server - at:  ' + getTime() + '!');
    }
};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
    let funcName = "server.listen";
    if (err) {
        return console.log(funcName, 'something bad happened: ' + err);
    }

  dumpMessage(funcName, 'server is listening on port: ' + port);
});

function dumpMessage(testName, mesg) {                                       
    console.log(getTime() + testName + ":: --> " + mesg);           
};
    
function getTime() {
    var ts = new Date();
    return ts.toLocaleTimeString()+ ":" + ts.getMilliseconds() + "  ";
};