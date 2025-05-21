let converterValue = 0.0072;

function converter(value){
    return (value * converterValue).toFixed(2);
}

module.exports = {converter}