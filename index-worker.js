// ES node
const { Client } = require('@elastic/elasticsearch');

// file system manipulations
var BB = require('bluebird');
var fs = BB.promisifyAll(require('fs'));

var client = new Client({
    node: 'http://localhost:9200',
    log: 'info'
});

const log = function(msg) {
    console.log("[pid:"+process.pid+"] " + msg);
};

var indexingDocument = async function (docID, content, esindex) {
    client.create({
        index: esindex,
        id: docID,
        body: {
            "title": docID,
            "content": content
        }
    }, (err, result) => {
        if (err) {
            err.content = "...";
            log("something went wrong: " + err);
            process.send({status: "[ERROR]"});
        } else {
            log("successfully indexed " + docID);
            process.send({status: "[DONE]"});
        }
    });
};

process.on('message', (msg) => {
    process.send({status: "[RUN]"});
    log("processing file " + msg.filePath);
    fs.readFileAsync(msg.filePath, 'utf8')
        .then(function (content) {
            var filteredContent = content.replace(/math-.*?[\s]/g, '');
            var rawName = msg.fileName.replace(/(\.)(?:[^\.]+)$/g, '');
            indexingDocument(rawName, filteredContent, msg.index);
        })
});
