# Install
```bash
npm install
```

## Indexing Basex
```bash
./basex/master.sh <main dir of harvest files>
```

## Indexing Text Files via ElasticSearch
1) Start elasticsearch server
2) Start indexing text files: `node arxiv-processor.js -in <dir of text files> -index <choose index name>`
3) Update indices with basex database names: `node arxiv-database-updater.js -in <main dir of harvest files> -index <the index from 2)> -fileEnding xml|txt`

## Extras
Search elasticsearch for documents:
```bash
node searcher.js -index <index> <search query>
```

See overview of elasticsearch indices:
```bash
curl -X GET "localhost:9200/_cat/indices?v"
```

Delete index from elastic search:
```bash
curl -X DELETE "localhost:9200/<name of index>?pretty"
```