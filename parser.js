/*
In this assignment you have to transform data available from the Chicago city's Department of Statistics and show visualisations using graphs. The focus of this assignment is to be able to work with large data sets using Async programming in JavaScript, extract data while using mapping files, transform the data into a JSON format suitable for rendering.

Data Source: ChicagoCrimes.csv

Step 1: Munge the data and create the JSON. Here the focus is on working with files, async reading, object manipulation and JSON creation.

Step 2: Use the generated data to render a JavaScript UI with D3.js visualisation library. Here the focus is on Ajax, working with a server side JSON, manipulating data on the client side for rendering, setting up configuration etc.

Make a stacked bar chart filtering on the following criteria and aggregated over the given time frame (2001 - 2018) :-

THEFT OVER $500
THEFT $500 AND UNDER
Make a multi series line chart of all Assault cases over the given time frame aggregated on whether the crime resulted in an arrest or not.
*/
// const fs = require('fs');
// const data = fs.createReadStream('')
// fs.readFile('data/Crimes_-_2001_to_present.csv', 'utf-8', (err, data) => {
// 	if(err) console.log("ERR: ", err);
// 	console.log(data);
// })
// const readline = require('readline');
// const fs = require('fs');

// const rl = readline.createInterface({
//   input: fs.createReadStream('data/Crimes_-_2001_to_present.csv')
// });

// rl.on('line', (line) => {
//   console.log(`Line from file: ${line}`);
// });

// const csv = require('csvtojson');
// const writeStream=request.put('crimesobj.json');

// rl.pipe(csv()).pipe(writeStream);

const fs = require('fs');
const lr = require('readline');


const fstream = fs.createReadStream('data/Crimes_-_2001_to_present.csv', 'UTF-8');

const freadLine = lr.createInterface({
  input: fstream,
});


const ftstream = fs.createWriteStream('data/crimesdata-theft.json', {
  flags: 'a',
});

const fastream = fs.createWriteStream('data/crimesdata-assault.json', {
  flags: 'a',
});

let i = 0;
let j = 0;

let headers = []; 
const theftAggrData = {}; 
const assaultAggrData = {}; 

const yearRange = {
  start: 2001,
  end: 2018,
};


function processAssault(data) {
  j += 1;
  if (j % 100000 === 0) {
    process.stdout.write('assault');
  }
  const yr = data.Year;
  if (yr >= yearRange.start && yr <= yearRange.end) {
    if (!assaultAggrData[yr]) {
      assaultAggrData[yr] = {
        arrestCount: 0,
        nonArrestCount: 0,
        year: yr,
      };
    }

    if (data.Arrest === 'false') {
      assaultAggrData[yr].nonArrestCount += 1;
    } else {
      assaultAggrData[yr].arrestCount += 1;
    }
  }
}


function processTheft(data) {
  i += 1;
  if (i % 100000 === 0) {
    process.stdout.write('theft');
  }
  const yr = data.Year;
  if (yr >= yearRange.start && yr <= yearRange.end) {
    if (!theftAggrData[yr]) {
      theftAggrData[yr] = {
        over500: 0,
        under500: 0,
        year: yr,
      };
    }

    if (data.Description == '$500 AND UNDER') {
      theftAggrData[yr].under500 += 1;
    } else if (data.Description == 'OVER $500') {
      theftAggrData[yr].over500 += 1;
    }
  }
}

freadLine.on('line', (input) => {
  i += 1;
  if (i === 1) {
    headers = input.split(',');
  } else {
    freadLine.pause();
    const dobj = {};
    const dataEl = input.split(',');
    for (let j = 0; j < headers.length; j += 1) {
      dobj[headers[j]] = dataEl[j];
    }

    if (dobj['Primary Type'] === 'THEFT') {
      processTheft(dobj);
    }

    if (dobj['Primary Type'] === 'ASSAULT') {
      processAssault(dobj);
    }
    freadLine.resume();
  }
});


freadLine.on('close', () => {
  ftstream.on('finish', () => {
    ftstream.close();
  });
  ftstream.write(JSON.stringify(theftAggrData));

  fastream.on('finish', () => {
    fastream.close();
  });
  fastream.write(JSON.stringify(assaultAggrData));
});
