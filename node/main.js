const fs = require("fs");

console.log("Background-1");
const data = fs.readFileSync('file.txt', 'utf-8')
console.log(data)
console.log('Background-2')

console.log("Background-1");
fs.readFile('file.txt', 'utf-8', (err,data)=>{
    if (err){
        console.log(err);
    }
    console.log(data);
});
console.log("background2");

try {
 console.log("Background-1");
  fs.writeFileSync('file.txt', 'This is a synchronous write!');
  console.log('Background-2')
  console.log('File written successfully (sync).');
} catch (err) {
  console.error('Error writing file (sync):', err);
}

console.log("Background-1");
fs.writeFile('file.txt', 'This is an asynchronous write!', (err) => {
console.log('Background-2')
  if (err) {
    console.error('Error writing file (async):', err);
  } else {
    console.log('File written successfully (async).');
  }
});