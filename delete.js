var elasticsearch = require('elasticsearch');

var esindex = 'arxiv';

var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});

try {
    const response = client.indices.delete({
        index: esindex
    });
    console.log(response);
} catch (error) {
    console.trace(error.message);
}