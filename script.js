//git commit -am "commit test 2"
const canvas = document.getElementById("myCanvas");
const przyciskIzorezystancji = document.getElementById("Izorezystancja");
const przyciskIzoreaktancji = document.getElementById("Izoreaktancja");
const przyciskWydluzenia = document.getElementById("Wydłużenie");
const ctx = canvas.getContext("2d");
canvas.addEventListener("mousemove",mouseMoveHandler);
canvas.addEventListener("mousedown", mouseDownHandler);
var canvasWidth = canvas.getAttribute("width");
var canvasHeight = canvas.getAttribute("height");
ctx.fillStyle = "white";
ctx.strokeStyle = "green";
var mx = 0;
var my = 0;
const CHOOSING_R = "choosing r";
const CHOOSING_BEGINNING = "choosing beginning";
const CHOOSING_DIRECTION = "choosing direction";
const CHOOSING_END = "choosing end";
var drawing_state = CHOOSING_R ;//"choosing beginning", "choosing end";
var chosen_r = 0.5;
var r = 0.5; //wartość zmieniena przy ruchu myszą
var chosen_beginning = 0;
var chosen_end = 0;
var ending = 0.5;
var beginning = 0;
var clockwise = false; //or counterclockwise
var lastEnding = 0;
//wartości izorezystancji i izoreaktancji - tą listę wzięłam z wykresu wykorzystywanego na zajęciach
var wartosciSiatki = [50,20,10,5,4,3,2,1.8,1.6,1.4,1.2,1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0];
drawSmithChart();
rysujOsie();


class Arc {
    //complex arc class
    //todo: add information about meaning
    constructor(centerU,centerV,radius,start_angle,end_angle,isClockwise) {
        this.centerU = centerU;
        this.centerV = centerV;
        this.radius = radius;
        this.start_angle = start_angle;
        this.end_angle = end_angle;
        this.isClockwise = isClockwise;
    }
}
function drawArc(a) {
    //draws and arc given in u and v coordinates
    let relativeX = (a.centerU+1)*canvasHeight/2
    let relativeY = (a.centerV+1)*canvasHeight/2
    let relativeRadius = a.radius*canvasHeight/2
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(relativeX, relativeY, relativeRadius,
        a.start_angle,a.end_angle, a.isClockwise);
    ctx.stroke();
    ctx.closePath();
    ctx.lineWidth = 1;
    //todo: somehow indicate beginning and end of the angle
}
var mouseArc = new Arc(0,0,0.5,Math.PI*2,0,true);//temporary arc that changes on every mouse move
//when only the first point is chosen, start angle will be equal to end angle;
var arrayOfArcs = [];
//analitycal geometry functions
function distance(x1,y1,x2,y2) {
    return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
}
function angle(x1,y1,x2,y2) {
    return Math.atan2(y1-y2,x2-x1);
}
//Functions for scaling coordinates
function UfromX(x) {
    return 2*(x-canvasHeight/2)/canvasHeight;
}
function VfromY(y) {
    return  2*(canvasHeight/2-y)/canvasHeight;
}
function XfromU(u) {
    return (u+1)*canvasHeight/2;
}
function YfromV(v) {
    return ((1-v)*canvasHeight/2);
}

function drawLittleSquare(x, y, color) {
    ctx.strokeStyle =color;
    ctx.beginPath();
    ctx.rect(x,y,10,10);
    ctx.closePath();
    ctx.stroke();
}
function drawCoords(u,v) {
    //draws a little rectangle labeling specific coords on screem
    let x = XfromU(u);
    let y = YfromV(v);
    let dx = 100;
    let dy = 20;
    ctx.clearRect(x-dx,y-dy,dx,dy);
    ctx.fillStyle = "black";
    ctx.fillText("u: " + u.toFixed(3) + " v: " + v.toFixed(3) ,x-dx+5,y-dy+10);
    ctx.fillStyle = "white";
}
function angleWrap() {
    if (lastEnding-ending>2*Math.PI) {//jeśli przyrost kąta jest większy niż 360 stopni
        lastEnding -= 2*Math.PI;
    }
    if (ending-lastEnding<(-1*2*Math.PI)) {//jeśli przyrost kąta jest mniejszy niż -360 stopni
        lastEnding += 2*Math.PI;
    }
}

function drawCurrentMouseArc(u,v) {
    angleWrap();
    if (drawing_state == CHOOSING_R) {
        r = znajdzIzorezystancje(u,v);
    } else {
        r = chosen_r
    }
    if (drawing_state == CHOOSING_END) {
        ending = angle(r/(r+1),0,u,v);
        lastEnding = ending;
    } else {
        ending = chosen_end;
    }
    if (drawing_state == CHOOSING_BEGINNING) {
        beginning = angle(r/(r+1),0,u,v);
        ending = beginning;
        clockwise = false;
    } else {
        beginning = chosen_beginning;
    }
    if (drawing_state == CHOOSING_DIRECTION) {
        ending = angle(r/(r+1),0,u,v);
        if (angle(r/(r+1),0,u,v)  < beginning) {
            clockwise = true;
        } else {
            clockwise = false;
        }
    }

    //let mouseAngle =angle(r/(r+1),0,u,v);
    let centerU = r/(r+1);
    let centerV = 0;
    let centerX = XfromU(centerU);
    let centerY = YfromV(centerV);
    drawCircle(centerU,centerV,1/(r+1));//isoresistance-circle
    mouseArc = new Arc(centerU,centerV,1/(r+1),beginning, ending,clockwise);
    ctx.strokeStyle = "red";
    if (drawing_state != "choosing r") {
        drawArc(mouseArc);
    }

    //an angle indicator to help with debugging:
    drawLittleSquare(centerX,centerY, "red")
    ctx.beginPath();
    ctx.moveTo(centerX,centerY);
    ctx.lineTo(mx,my);
    ctx.closePath();
    ctx.stroke();
}
function mouseMoveHandler(e) {
    uiText.innerText = drawing_state;
    //clear canvas
    ctx.beginPath()
    ctx.rect(0,0,canvasWidth,canvasHeight);
    ctx.closePath();
    ctx.fill();
    rysujOsie();
    drawSmithChart();
    //user input
    mx = e.clientX - canvas.offsetLeft;
    my = e.clientY - canvas.offsetTop;
    //coordinates scaling and rescaling test
    var u = UfromX(mx)
    var v = VfromY(my)
    var x = XfromU(u);
    var y = YfromV(v);
    //TODO: skalowanie wskaźnika myszy dla większego canvas - ale jak?
    drawLittleSquare(x,y,"blue")    //show rescaled mouse position
    drawLittleSquare(mx,my,"red")      //show original mouse position

    drawCoords(u,v);
    debugInfo.innerText = "clockwise: " + mouseArc.isClockwise + "beginning: " +Math.floor(mouseArc.start_angle*180/Math.PI) + "end: " + Math.floor(mouseArc.end_angle*180/Math.PI);
    drawCurrentMouseArc(u,v);
    for (let i=0; i<arrayOfArcs.length; i++) {
        drawArc(arrayOfArcs[i]);
    }
}
function mouseDownHandler(e) {
    if(drawing_state == CHOOSING_R){
        chosen_r = r;
        drawing_state = CHOOSING_BEGINNING
    } else if (drawing_state == CHOOSING_DIRECTION){
        drawing_state = CHOOSING_END
    } else if (drawing_state == CHOOSING_BEGINNING){
        chosen_beginning = beginning ;
        drawing_state = CHOOSING_DIRECTION

    } else if (drawing_state == CHOOSING_END){
        arrayOfArcs.push(mouseArc);
        chosen_r = 0;
        chosen_beginning = 0;
        chosen_end = 0;
        drawing_state = CHOOSING_R
    }
    //debugInfo.innerHTML = ` u:${u} v:${v} \n x:${x} y:${y}`;
}


function drawSmithChart() {
    ctx.strokeStyle = "green";
    for (let i=0; i<wartosciSiatki.length; i++) {
        var r = wartosciSiatki[i];
        rysujIzorezystancje(r);
    }
    for (let i=0; i<wartosciSiatki.length; i++) {
        var x = wartosciSiatki[i];
        rysujIzoreaktancje(x)
    }
}
function rysujOsie() {
    //osie pomocnicze, do sprawdzenia czy wykres jest wycentrowany
    //oś pozioma
    ctx.strokeStyle = "green";
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight/2);
    ctx.lineTo(canvasWidth,canvasHeight/2);
    ctx.closePath();
    ctx.stroke();

    //oś pionowa
    ctx.beginPath();
    ctx.moveTo(canvasWidth/2, 0);
    ctx.lineTo(canvasWidth/2,canvasHeight);
    ctx.closePath();
    ctx.stroke();
}
function znajdzIzorezystancje(u,v) {
    let ans = -(u**2+v**2-1)/(u**2-2*u+v**2+1)//chyba działa
    return ans;
}
function znajdzIzoreaktancje(u,v) {
    return (2*v)/((1-u)**2+v^2);
}
function rysujIzorezystancje(r) {//rysuje jedną izorezystancję
    var u = r/(r+1)
    var v = 0
    var radius = 1/(r+1)
    drawCircle(u,v,radius)
}
function rysujIzoreaktancje(x) {
    var u = 1;
    var v = 1/x;
    var radius = 1/x;
    drawCircle(u,v,radius);
    v = -1/x;
    drawCircle(u,v,radius);
}
function drawCircle(u,v,radius) {//rysuje podany okrąg z płaszczyzny zespolonej na elemencie canvas
    let relativeX = (u+1)*canvasHeight/2
    let relativeY = (v+1)*canvasHeight/2
    let relativeRadius = radius*canvasHeight/2
    ctx.beginPath();
    ctx.arc(relativeX, relativeY, relativeRadius,0,Math.PI*2)
    ctx.stroke();
    ctx.closePath();
}