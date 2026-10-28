

//git commit -am "commit test 2"
const canvas = document.getElementById("myCanvas");
const przyciskIzorezystancji = document.getElementById("Izorezystancja");
const przyciskIzoreaktancji = document.getElementById("Izoreaktancja");
const przyciskWydluzenia = document.getElementById("Wydłużenie");
const przyciskOdczyt = document.getElementById("Odczyt");
const ctx = canvas.getContext("2d");
canvas.addEventListener("mousemove",mouseMoveHandler);
canvas.addEventListener("mousedown", mouseDownHandler);
var canvasWidth = canvas.getAttribute("width");
var canvasHeight = canvas.getAttribute("height");
ctx.fillStyle = "white";
ctx.strokeStyle = "green";
var mx = 0;
var my = 0;

const EDYCJA_IZOREZYSTANCJI = "edycja izorezystancji";
const EDYCJA_IZOREAKTANCJI = "edycja izoreaktancji";
const EDYCJA_IZOKONDUKTANCJI = "edycja izokonduktancji";
const EDYCJA_IZOSUSCEPTANCJI = "edycja izosusceptancji";
const EDYCJA_WYDLUZANIA = "edycja wydłużania";
const ODCZYT = "odczyt";
var narzedzie_edycji = ODCZYT;

const CHOOSING_R = "choosing r";
const CHOOSING_X = "choosing x"
const CHOOSING_G = "choosing g"
const CHOOSING_B = "choosing b"
const CHOOSING_BEGINNING = "choosing beginning";
const CHOOSING_DIRECTION = "choosing direction";
const CHOOSING_END = "choosing end";
const CHOOSING_RADIUS = "choosing radius" //chodzi o promień okręgu dla wydłużenia
var drawing_state = CHOOSING_R ;//"choosing beginning", "choosing end";

var r = 0.5; //wartość zmieniena przy ruchu myszą
var reactance = 0.5; //wartość zmieniana podczas ruchu myszą
var g = 0.5;
var b = 0.5;
var ending = 0.5;
var beginning = 0;
var clockwise = false; //or counterclockwise
var lastEnding = 0;
var mouseDown = false;
//wartości izorezystancji i izoreaktancji - tą listę wzięłam z wykresu wykorzystywanego na zajęciach
var wartosciSiatki = [50,20,10,5,4,3,2,1.8,1.6,1.4,1.2,1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0];
drawSmithChart();
rysujOsie();
console.log("to dobra wersja")
function ustawNarzedzieEdycji(narzedzie) {
    //FIXME: duża część tej funkcji jest niepotrzebna
    //Przypisania beginning, ending powinny być w innym miejscu
    narzedzie_edycji = narzedzie;
    mouseMoveHandler({clientX:mx+canvas.offsetLeft, clientY:my+canvas.offsetTop});//to naprawiło błąd. Nie wiem czemu.
    if (narzedzie == EDYCJA_IZOREZYSTANCJI) {
        r = 0.5;
        beginning = 0;
        ending = 0;
        drawing_state = CHOOSING_R
        clockwise = false;
        mouesedown = false;
    }
    if (narzedzie == EDYCJA_IZOREAKTANCJI) {
        x = 0.1;
        beginning = 0.05;
        ending = 0;
        drawing_state = CHOOSING_X
    }
    if (narzedzie == EDYCJA_IZOSUSCEPTANCJI) {
        drawing_state = CHOOSING_B        
    }
    if (narzedzie == EDYCJA_IZOKONDUKTANCJI) {
        g = 0.1;
        beginning = 0.05;
        ending = 0;
        drawing_state = CHOOSING_G        
    }
    

}
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
function drawArc(a, lineWidth=3) {
    //draws and arc given in u and v coordinates
    let relativeX = (a.centerU+1)*canvasHeight/2
    let relativeY = (-1*a.centerV+1)*canvasHeight/2    //Chyba odbija Y lustrzanie
    let relativeRadius = a.radius*canvasHeight/2
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(relativeX, relativeY, relativeRadius,
        a.start_angle,a.end_angle, !a.isClockwise);
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
function degrees(angle) {
    angle = angle * 180/Math.PI
    angle_from_0_to_360 = (angle+360)%360
    return angle_from_0_to_360
}
function getAngleDirection(alpha_radians, beta_radians) {
    alpha = degrees(alpha_radians)
    beta = degrees(beta_radians)
    // z jakiegoś powodu pierwszy kąt jest ujemny???
    if ((alpha - beta) < (360 - (alpha-beta))) {
        console.log("clockwise is " + (beta > alpha) +" " +alpha + " " +beta)
        return (beta > alpha)
    } else {
        console.log("clockwise is " + (alpha > beta)+ " " +alpha + " " +beta)
        return  (alpha > beta)
    }
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

function get_angle(mu,mv,narzedzie_edycji){
    if (narzedzie_edycji==EDYCJA_IZOREAKTANCJI) {
        return angle(1, 1/reactance,mu,mv)
    } else if (narzedzie_edycji==EDYCJA_IZOREZYSTANCJI) {
        return angle(r/(r+1),0,mu,mv)
    } else if (narzedzie_edycji == EDYCJA_IZOKONDUKTANCJI) {
        let r =1/g
        return angle(-r/(r+1),0,mu,mv)
    } else if (narzedzie_edycji == EDYCJA_IZOSUSCEPTANCJI) {
        let reactance = 1/b
        return angle(-1, 1/reactance,mu,mv)
    } else if (narzedzie_edycji == EDYCJA_WYDLUZANIA) {
        return angle(0,0,mu,mv)
    }
}
function handleArcDrawingUI(mu, mv) {
    if (narzedzie_edycji==ODCZYT) {
        drawing_state = ""
        return 0;
    }
    if (drawing_state == CHOOSING_RADIUS) {
        radius = Math.sqrt(mu**2 + mv**2)
    }
    if (drawing_state == CHOOSING_R) {
        r = znajdzIzorezystancje(mu,mv);
        if (mouseDown) {
            drawing_state = CHOOSING_BEGINNING
            mouseDown = false;
        }
    }
    if (drawing_state == CHOOSING_X) {
        reactance = znajdzIzoreaktancje(mu,mv);
        beginning = 1;
        ending = 0.999;
        clockwise = true;
        if (mouseDown) {
            drawing_state = CHOOSING_BEGINNING
            mouseDown = false;
        }
    }
    if (drawing_state == CHOOSING_G) {
        g = znajdzIzokonduktancje(mu,mv)
        if (mouseDown) {
            drawing_state = CHOOSING_BEGINNING
            mouseDown = false;
        }
    }
    if (drawing_state == CHOOSING_B) {
        //FIXME
        beginning = Math.PI
        ending = Math.PI - 0.001
        clockwise = true
        b = znajdzIzosusceptancje(mu,mv)
        if (mouseDown) {
            drawing_state = CHOOSING_BEGINNING
            mouseDown = false;
        }
    }
    if (drawing_state == CHOOSING_BEGINNING) {
        beginning = get_angle(mu,mv,narzedzie_edycji)
        
        
        if (mouseDown) {
            if (narzedzie_edycji==EDYCJA_IZOREAKTANCJI || narzedzie_edycji==EDYCJA_IZOSUSCEPTANCJI){
                drawing_state = CHOOSING_END
            } else {
                drawing_state = CHOOSING_DIRECTION
            }
            
            mouseDown = false;
        }
    }
    if (drawing_state == CHOOSING_DIRECTION) {
        ending = get_angle(mu,mv,narzedzie_edycji)
        if (narzedzie_edycji == EDYCJA_IZOREZYSTANCJI) {
        clockwise = getAngleDirection(beginning, ending)
        } else if (narzedzie_edycji == EDYCJA_IZOKONDUKTANCJI) {
            clockwise = getAngleDirection(beginning+Math.PI, ending+Math.PI)
        }
        if (mouseDown) {
            drawing_state = CHOOSING_END;
            mouseDown = false;
        }
    }
    if (drawing_state == CHOOSING_END) {
        //UWAGA, dla izoREAktancji nie ma etapu wybierania kierunku
        ending = get_angle(mu,mv, narzedzie_edycji);
        if (narzedzie_edycji==EDYCJA_IZOREAKTANCJI) {
            clockwise = getAngleDirection(beginning,ending)
        } else if (narzedzie_edycji == EDYCJA_IZOSUSCEPTANCJI) {
            clockwise = getAngleDirection(beginning+Math.PI,ending+Math.PI)
        }
        if (mouseDown) {
            arrayOfArcs.push(mouseArc);
            r = 0;
            reactance = 0;
            g = 0;
            b = 0;
            beginning = Math.PI*2;
            ending = 0;
            if (narzedzie_edycji==EDYCJA_IZOREZYSTANCJI) {
                drawing_state = CHOOSING_R
            } else if (narzedzie_edycji==EDYCJA_IZOREAKTANCJI) {
                drawing_state = CHOOSING_X
            }else if (narzedzie_edycji==EDYCJA_IZOKONDUKTANCJI) {
                drawing_state = CHOOSING_G
            }else if (narzedzie_edycji==EDYCJA_IZOSUSCEPTANCJI) {
                drawing_state = CHOOSING_B
            }
            mouseDown = false;
        }
    }
}

function angleIndicator(x,y) {
    //an angle indicator to help with debugging:

    drawLittleSquare(x,y, "red")
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(mx,my);
    ctx.closePath();
    ctx.stroke();
}
function drawCurrentMouseArc(mu,mv) {
    //rysuje właśnie edytowaną krzywą na podstawie dostępnych danych
    //let mouseAngle =angle(r/(r+1),0,u,v);

    //todo: wymyśl, czy nie dałoby się skrócić tej funkcji
    ctx.strokeStyle = "red";
    if (narzedzie_edycji==ODCZYT) {
        return;
    } else if (narzedzie_edycji==EDYCJA_IZOREZYSTANCJI ) {
        let centerU = r/(r+1);
        let centerV = 0;
        drawCircle(centerU,centerV,1/(r+1));//isoresistance-circle //
        mouseArc = new Arc(centerU,centerV,1/(r+1),beginning, ending,clockwise);

        if (drawing_state==CHOOSING_DIRECTION || drawing_state==CHOOSING_END) {
            drawArc(mouseArc);
        }
        angleIndicator(XfromU(centerU),YfromV(centerV))
        // arcDot(centerU,centerV,1/(r+1),angle(centerU,centerV,u,v))
        mouseArcDot(mu,mv)
    } else if (narzedzie_edycji==EDYCJA_IZOREAKTANCJI) {
        mouseArc = new Arc(1,1/reactance,1/Math.abs(reactance),beginning, ending,clockwise);
        guideArc = new Arc(1,1/reactance,1/Math.abs(reactance),0.05, 0,true);
        drawArc(guideArc,1)
        if (drawing_state!= CHOOSING_BEGINNING) {
          drawArc(mouseArc)
        }
        mouseArcDot(mu,mv)
        //todo: arcdot
    } else if (narzedzie_edycji==EDYCJA_IZOKONDUKTANCJI) {
        let r = 1/g
        let u = -r/(r+1)
        let v = 0
        let radius = 1/(r+1)
        drawCircle(u,v,radius)
        mouseArc = new Arc(u,v,radius,beginning,ending,clockwise)
        drawArc(mouseArc)
        mouseArcDot(mu,mv)
    } else if (narzedzie_edycji==EDYCJA_IZOSUSCEPTANCJI) {
        //może nie działać???
        // rysujIzosusceptancje(b)
        mouseArc = new Arc(-1,b,Math.abs(b),beginning,ending,clockwise)
        drawArc(mouseArc)
        //mouseArcDot(mu,mv)
    }

}
function isMouseOutsideCanvas() {
    let isX = (mx < 0 || mx > canvasWidth);
    let isY = (my < 0 || my > canvasHeight);
    return isX || isY;
}
function mouseMoveHandler(e) {
    uiText2.innerText = narzedzie_edycji;
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
    uiText.innerText = drawing_state;
    handleArcDrawingUI(u,v);
    drawCurrentMouseArc(u,v);

    for (let i=0; i<arrayOfArcs.length; i++) {
        drawArc(arrayOfArcs[i]);
    }
    debugInfo.innerText = "clockwise: " + mouseArc.isClockwise + "beginning: " +Math.floor(mouseArc.start_angle*180/Math.PI) + "end: " + Math.floor(mouseArc.end_angle*180/Math.PI);
}
function mouseDownHandler(e) {
    if (canvas.matches(':hover')) {
        mouseDown = true;
    }
    //debugInfo.innerHTML = ` u:${u} v:${v} \n x:${x} y:${y}`;
}


function drawSmithChart() {
    ctx.strokeStyle = "green";
    for (let i=0; i<wartosciSiatki.length; i++) {
        let r = wartosciSiatki[i];
        rysujIzorezystancje(r);
    }
    for (let i=0; i<wartosciSiatki.length; i++) {
        var x = wartosciSiatki[i];
        rysujIzoreaktancje(x)
        rysujIzoreaktancje(-1*x)
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
    //(1-u)**2 = 1-2u + u**2
    return (2*v)/((u-1)**2+v**2);
}
function znajdzIzosusceptancje(u,v) {
    x = znajdzIzoreaktancje(-1*u,-1*v)
    return -1/x
}
function znajdzIzokonduktancje(u,v) {
    let r = znajdzIzorezystancje(-1*u,v)
    return 1/r;
}
function rysujIzorezystancje(r) {//rysuje jedną izorezystancję
    var u = r/(r+1)
    var v = 0
    var radius = 1/(r+1)
    drawCircle(u,v,radius)
}
function rysujIzokonduktancje(g) {
    let r = 1/g
    var u = -r/(r+1)
    var v = 0
    var radius = 1/(r+1)
    drawCircle(u,v,radius)
}

function rysujIzosusceptancje(b) {
    //znak dobry
    var u = -1;
    var v = b;
    var radius = Math.abs(b);
    drawCircle(u,v,radius);

}

function rysujIzoreaktancje(x) {
    var u = 1;
    var v = 1/x;
    var radius = 1/Math.abs(x);
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
function arcDot(centerU,centerV, radius, angle) {
    let previous_fillstyle = ctx.fillStyle
    center_y = YfromV(centerV)
    center_x = XfromU(centerU)
    radius = radius * (canvasHeight/2)
    y = Math.sin(angle) * radius + center_y
    x = Math.cos(angle) * radius + center_x
    ctx.beginPath();
    ctx.arc(x,y,4,0,2*Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = previous_fillstyle
}
function rad2degrees(radians) {
    return radians * 180/Math.PI
}
function mouseArcDot(mu,mv) {
    // drawMouseDot(mu,mv)
    // //FIXME
    //alpha = angle(mouseArc.centerU,mouseArc.centerV,mu,mv)
    alpha = get_angle(mu,mv,narzedzie_edycji)
    console.log(rad2degrees(alpha))
    // //arcDot(centerU,centerV,1/(r+1),angle(centerU,centerV,u,v))
    // // drawCircle(mouseArc.centerU,mouseArc.centerV,mouseArc.radius)
    arcDot(mouseArc.centerU,mouseArc.centerV,mouseArc.radius,alpha)
}
