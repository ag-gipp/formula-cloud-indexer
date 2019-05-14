// ES node
const {Client} = require('@elastic/elasticsearch');

var esindex = 'arxiv';
var searchQuery = "";

for (let j = 2; j < process.argv.length; j++) {
    if (process.argv[j] === "-index") {
        j++;
        esindex = process.argv[j];
    } else {
        searchQuery += " " + process.argv[j];
    }
}

searchQuery = searchQuery.substr(1, searchQuery.length);

var client = new Client({
    node: 'http://localhost:9200',
    log: 'info'
});

console.log("Searching for '" + searchQuery + "'");
client.search({
    index: esindex,
    pretty: true,
    body: {
        query: {
            bool: {
                must: [
                    {
                        match: {
                            "content": {
                                query: searchQuery,
                                minimum_should_match: "50%"
                            }
                        }
                    },
                    {
                        exists: {
                            field: "database"
                        }
                    }
                ],
                should: {
                    match_phrase: {
                        "content": {
                            query: searchQuery,
                            slop: 10
                        }
                    }
                }
                // must_not: {
                //     exists: {
                //         field: "database"
                //     }
                // }
            }
        },
        _source: ["title", "database", "arxiv", "content"],
        suggest: {
            "my-suggestions": {
                text: searchQuery,
                phrase: {field: "content"}
            }
        }
    }
}, (err, msg) => {
    if (err) {
        console.error(err);
    } else {
        console.log(JSON.stringify(msg.body, null, 4));
    }
});
