var elasticsearch = require('elasticsearch');
var BB = require('bluebird');
var fs = BB.promisifyAll(require('fs'));

var esindex = 'arxiv';

var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});

try {
    console.log("Parsed analyzer setup.");
    client.update({
        id: "gr-qc0008046",
        index: esindex,
        //type: "_doc",
        body: {
            doc: {
                database: "deluxe"
            }
        }
    }, (err,msg) => {
        if (err){
            console.error("Something went wrong during setup the analyzer. Stop here");
            console.error(err);
            process.exit();
        } else {
            console.log("Done setup analyzer.");
            // startProcessing(); // trigger once the setup is ready
        }
    });
} catch (error) {
    console.error(error.message);
}