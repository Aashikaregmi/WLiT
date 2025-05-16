const pi = 3.14;

// area of cylinder

const cylinder = {
    radius : 2,
    height : 5,
    area : function(){
        return 2 * pi * this.radius ** 2 * this.height;
    }
}

document.getElementById("cylinder").innerHTML = cylinder.area();


// Common area function
function area(length, breadth) {
    return length * breadth;
}

// Rectangle
const rectangle = {
    length: 2,
    breadth: 5,
    get rect() {
        return area(this.length, this.breadth);
    }
};
document.getElementById("rectangle").innerHTML = rectangle.rect;

// Square
const square = {
    length: 2,
    get sqr() {
        return area(this.length, this.length);
    }
};
document.getElementById("square").innerHTML = square.sqr;