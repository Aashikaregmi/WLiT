// const math_library = require("./mathModule.js");

const readline = require('readline');
const NPR_to_EURO = require("./converter.js");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("enter amount in NRS:", (input)=>{
    const nrs = parseFloat(input);
    if (isNaN(nrs)) {
        console.log("Please enter a valid number.");
    } else {
        const euro = NPR_to_EURO.converter(nrs);
        console.log(`€${euro} EUR`);
    }
    rl.close();
})

// const data = math_library.summer(2, 3);
// console.log(data);

// const data1 = math_library.subtractor(3,2);
// console.log(data1);

// const pi = math_library.pi;
// console.log(pi);


// const cb = (data) =>{
//     console.log(data)
// }

// const main = (a,b, cb)=>{
//     const sum = a+b;
//     cb(sum)
// }

// main(2,3,cb);

