//git commit -am "commit test 2"
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const debugInfo = document.getElementById("debugInfo");
canvas.addEventListener("mousemove",mouseMoveHandler);
canvas.addEventListener("mousedown", mouseDownHandler);
var mx = 0;
var my = 0;
//
var canvasWidth = parseInt(canvas.getAttribute("width"));
var canvasHeight = parseInt(canvas.getAttribute("height"));
ctx.fillStyle = "white";
ctx.strokeStyle = "red";
var point1 = [0,0];
var point2 = [0,0];


class Arc {//arc on a complex plane
    constructor(center, beginning, end) {
        this.center = center;
        this.beginning = beginning;
        this.end = end;
        this.draw = function() {
            //draw

            let radius = (canvasHeight/2)*distance(center.u,center.v,beginning.u,beginning.v);
            //not sure if this is a good place for Math.PI. 
            let beginAngle = Math.PI + angle(beginning.u,beginning.v,center.u,center.v);
            let endAngle = Math.PI + angle(center.u,center.v,end.u,end.v);
            if (endAngle < beginAngle) {
                [beginAngle,endAngle] = [endAngle,beginAngle];
            }
            ctx.strokeStyle = "red";
            ctx.beginPath()
            ctx.arc(XfromU(center.u),YfromV(center.v),radius,beginAngle,endAngle);
            ctx.stroke();
            ctx.closePath();

        }
    }

}
var testArc1 = new Arc({u:0,v:0},{u:-0.58,v:0.3}, {u:0.4,v:0.2});
var testArc2 = new Arc({u:-0.1,v:0},{u:0.4,v:0.2}, {u:0.9,v:0.1});
var arrayOfArcs = [testArc1, testArc2];
function distance(x1,y1,x2,y2) {
    return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
}
function angle(x1,y1,x2,y2) {
    //kąt lini z punktu 1 do punktu 2 względem 90 stopni
    let angle = Math.atan((y2-y1)/(x2-x1));
    if ((x2-y1)<0) {
        angle += Math.PI
    }
    return angle;

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

//A <<DRAW>> function
function mouseMoveHandler(e) {
    mx = e.clientX - canvas.offsetLeft;
    my = e.clientY - canvas.offsetTop;
    //clear canvas
    ctx.beginPath()
    ctx.rect(0,0,canvasWidth,canvasHeight);
    ctx.closePath();
    ctx.fill();

    drawSmithChart();

    //arc class test
    //myArc = new Arc({u:0,v:0},{u:-0.1,v:0.9}, {u:0.1,v:0.9});
    arrayOfArcs.forEach((element) => {
        element.draw();
    })

    //debugInfo.innerHTML = `mpos :${mx + " " + my}`;

    //small square on mouse position
    ctx.beginPath()
    ctx.rect(mx,my,10,10);
    ctx.closePath();
    ctx.stroke();

    //draw an arc from the mouse position
    
    let radius = distance(mx,my,canvasHeight/2,canvasHeight/2);
    let mouseAngle =angle(canvasHeight/2,canvasHeight/2,mx,my);
    ctx.beginPath()
    ctx.arc(canvasHeight/2,canvasHeight/2,radius,Math.PI*2,mouseAngle);
    ctx.stroke();
    ctx.closePath();
}

function mouseDownHandler(e) {
    mx = e.clientX - canvas.offsetLeft;
    my = e.clientY - canvas.offsetTop;
    let u = UfromX(mx);
    let v = VfromY(my);
    let x = XfromU(u);
    let y = YfromV(v);
    debugInfo.innerHTML = ` click :${arrayOfArcs.length}\n`;
    //TODO: ADD ADDING NEW ARCS TO ARRAY OF ARCS
    let beginning = arrayOfArcs[arrayOfArcs.length-1].end;
    let newArc = new Arc({u: 0, v: 0}, {u: u, v: v}, beginning);
    arrayOfArcs.push(newArc);
}

//wartości izorezystancji i izoreaktancji - tą listę wzięłam z wykresu wykorzystywanego na zajęciach
var wartosciSiatki = [50,20,10,5,4,3,2,1.8,1.6,1.4,1.2,1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0]

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
drawSmithChart();
rysujOsie()

function rysujOsie() {//osie pomocnicze, do sprawdzenia czy wykres jest wycentrowany
    //oś pozioma
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
function rysujIzorezystancje(r) {//rysuje jedną izorezystancję
    var u = r/(r+1)
    var v = 0
    var radius = 1/(r+1)
    drawComplexCircle(u,v,radius)
}
function rysujIzoreaktancje(x) {
    var u = 1;
    var v = 1/x;
    var radius = 1/x;
    drawComplexCircle(u,v,radius);
    var v = -1/x;
    drawComplexCircle(u,v,radius);
}
function drawComplexCircle(u,v,radius) {//rysuje podany okrąg z płaszczyzny zespolonej na elemencie canvas
    let relativeX = (u+1)*canvasHeight/2
    let relativeY = (v+1)*canvasHeight/2
    let relativeRadius = radius*canvasHeight/2
    ctx.beginPath();
    ctx.arc(relativeX, relativeY, relativeRadius,0,Math.PI*2)
    ctx.stroke();
    ctx.closePath();
}

