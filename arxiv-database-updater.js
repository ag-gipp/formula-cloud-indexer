// ES node
const { Client } = require('@elastic/elasticsearch');

// file system manipulations
var BB = require('bluebird');
var fs = BB.promisifyAll(require('fs'));
const path = require('path');

var data = '/home/andreg-p/Projects/19CicmFormulaCloud/processing/data';
var esindex = 'arxiv';
var fileEnding = "txt";

var concurrencyLevel = 8;

for (let j = 0; j < process.argv.length; j++) {
    if (process.argv[j] === "-in") {
        j++;
        data = process.argv[j];
    } else if (process.argv[j] === "-index") {
        j++;
        esindex = process.argv[j];
    } else if (process.argv[j] === "-parallel") {
        j++;
        concurrencyLevel = Number(process.argv[j]);
    } else if (process.argv[j] === "-fileEnding") {
        j++;
        fileEnding = process.argv[j];
    }
}

fileEnding = "." + fileEnding;

var client = new Client({
    node: 'http://localhost:9200',
    log: 'info'
});

// parallel working
var PQueue = require('p-queue');
const queue = new PQueue({
    concurrency: concurrencyLevel
});

var processed = 0;
var missedDocs = [];

fs.readdirAsync(data)
    .map(function (name) {
        var innerPath = path.join(data, name);
        const stats = fs.statSync(innerPath);

        if ( stats.isDirectory() ){
            return {
                database: name,
                path: innerPath
            };
        }
    })
    .map(function (info) {
        return fs.readdirAsync(info.path)
            .filter(function (file) {
                var filePath = path.join(info.path, file);
                const stats = fs.statSync(filePath);
                return stats.isFile() && path.extname(file) === fileEnding;
            })
            .map(function (file){
                queue.add(
                    () => {
                        var docName = file.replace(/(\.)(?:[^\.]+)$/g, '');
                        var oldArxivMatcher = /([A-Za-z\\-]+)(\d+)/g.exec(docName);
                        var newArxivMatcher = /[\d.]+/g.exec(docName);

                        var link = "https://arxiv.org/abs/";
                        if (oldArxivMatcher){
                            link += matches[1] + "/" + matches[2];
                        } else if (newArxivMatcher) {
                            link += docName
                        } else {
                            link = "unknown"
                        }

                        return new Promise((resolve) => {
                            console.log("Processing file: " + file);
                            client.update({
                                index: esindex,
                                id: docName,
                                body: {
                                    doc: {
                                        database: info.database,
                                        arxiv: link
                                    }
                                }
                            }, (err, msg) => {
                                if (err) {
                                    // something went wrong
                                    if (err.body.error.type === "document_missing_exception"){
                                        missedDocs.push(docName);
                                        console.log("[WARN] Missing document: " + docName);
                                    }
                                } else {
                                    processed++;
                                    console.log("Updated " + file + " [total: " + processed + "]");
                                }
                                resolve();
                            })
                        });
                    }
                )
            });
    })
    .then(() => {
        queue.onIdle().then(()=>{
            console.log("Done... missed documents " + missedDocs.length);
            console.log(missedDocs);
        });
});
