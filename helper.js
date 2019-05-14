var csv_data = '../arxiv/collections';
//var data = 'data';

// parse csv data
fs.readdirAsync(csv_data)
    .filter(function (name){
        var path = csv_data + '/' + name;
        return fs.statSync(path).isFile() && name.endsWith(".csv");
    })
    .map(function (name){
        var lib = {};
        console.log("Parsing CSV " + name);
        var csvF = csv_data + '/' + name;
        var rl = readline.createInterface({
            input: fs.createReadStream(csvF)
        });

        rl.on('line', function(line){
            var lineData = line.split(", ");
            lib[lineData[0]] = lineData[1];
        });

        rl.on('close', function(line){
            return lib;
        });
    })
    .then(function (libs) {
            console.log(libs[0]["1703.00003"]);
        }
    );

var parseCSV = function(fname) {
    var lib = {};
    console.log("Parsing CSV " + name);
    var csvF = csv_data + '/' + name;
    var rl = readline.createInterface({
        input: fs.createReadStream(csvF)
    });

    rl.on('line', function(line){
        var lineData = line.split(", ");
        lib[lineData[0]] = lineData[1];
    });

    rl.on('close', function(line){
        return lib;
    });
};
