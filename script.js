

//git commit -am "commit test 2"
const canvas = document.getElementById("myCanvas");
const przyciskIzorezystancji = document.getElementById("Izorezystancja");
const przyciskIzoreaktancji = document.getElementById("Izoreaktancja");
const przyciskWydluzenia = document.getElementById("Wydłużenie");
const przyciskOdczyt = document.getElementById("Odczyt");
const ctx = canvas.getContext("2d");
canvas.addEventListener("mousemove",mouseMoveHandler);
canvas.addEventListener("mousedown", mouseDownHandler);
document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        arrayOfArcs.pop()
        mouseMoveHandler({clientX:mx+canvas.offsetLeft, clientY:my+canvas.offsetTop})
    }
});
var canvasWidth = canvas.getAttribute("width");
var canvasHeight = canvas.getAttribute("height");
ctx.fillStyle = "white";
ctx.strokeStyle = "green";
var mx = 0;
var my = 0;

var chosen_point_u = 0
var chosen_point_v = 0

const DODAWANIE_PUNKTU = "punkt"
const EDYCJA_IZOREZYSTANCJI = "edycja izorezystancji";
const EDYCJA_IZOREAKTANCJI = "edycja izoreaktancji";
const EDYCJA_IZOKONDUKTANCJI = "edycja izokonduktancji";
const EDYCJA_IZOSUSCEPTANCJI = "edycja izosusceptancji";
const EDYCJA_WYDLUZANIA = "edycja wydluzania";
const ODCZYT = "odczyt";
const ODBICIE = "odbicie"
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
var radius = 0.5;
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
    if (narzedzie == DODAWANIE_PUNKTU) {
      //chyba nic nie trzeba  
    }
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
    if (narzedzie == EDYCJA_WYDLUZANIA) {
        drawing_state= CHOOSING_RADIUS
        console.log("radius")
    }
    

}
class Shape {
    constructor(centerU,centerV) {
        this.centerU = centerU
        this.centerV = centerV
    }
}
class Arc extends Shape{
    //complex arc class
    //todo: add information about meaning
    constructor(centerU,centerV,radius,start_angle,end_angle,isClockwise) {
        super(centerU,centerV)
        this.radius = radius;
        this.start_angle = start_angle;
        this.end_angle = end_angle;
        this.isClockwise = isClockwise;
    }
    draw(lineWidth=3) {
        drawArc(this,lineWidth)
    }
}
class Dot extends Shape {
    constructor(u,v) {
        super(u,v)
    }
    draw() {
        let r = 4
        if (this.centerU == chosen_point_u && this.centerV == chosen_point_v) {
            r = 10
        }
        draw_dot(this.centerU,this.centerV, r)
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
//TODO: przydałaby się zmienna circleGuide klasy arc, żeby co chwile tego nie definiować i rysować.
//when only the first point is chosen, start angle will be equal to end angle;
var arrayOfArcs = [];
//analitycal geometry functions
function dist(x1,y1,x2,y2) {
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
function dotIsSelected() {
    return (chosen_point_u!==null && chosen_point_v!==null)
}
function handleArcDrawingUI(mu, mv) {

    if (narzedzie_edycji==ODCZYT) {
        drawing_state = ""
        return 0;
    }
    if (narzedzie_edycji==DODAWANIE_PUNKTU) {
        drawing_state = ""
        if (mouseDown) {
            arrayOfArcs.push(new Dot(mu,mv))
            mouseDown = false
        }
    }
    //wybieranie punktu - możliwe gdy nie wybieramy czegoś innego
    if (mouseDown && drawing_state!=CHOOSING_DIRECTION && drawing_state != CHOOSING_END ) {
        let dot_was_selected = selectDot(mu,mv)
        if (dot_was_selected) {
            mouseDown = false
        }
        //po wybraniu punktu automatycznie dobierany jest początek i promień łuku, zależnie od wybranego narzędzia edycji
        let u,v
        if (dotIsSelected()) {
            u = chosen_point_u
            v = chosen_point_v
        } else {
            u = mu
            v = mv
        }
        radius = Math.sqrt(u**2 + v**2)
        r = znajdzIzorezystancje(u,v)
        reactance = znajdzIzoreaktancje(u,v);
        g = znajdzIzokonduktancje(u,v)
        b = znajdzIzosusceptancje(u,v)
        beginning = get_angle(u,v,narzedzie_edycji)
        if (dotIsSelected()) {
            if (narzedzie_edycji==EDYCJA_IZOREAKTANCJI || narzedzie_edycji==EDYCJA_IZOSUSCEPTANCJI){
                    drawing_state = CHOOSING_END
                } else {
                    drawing_state = CHOOSING_DIRECTION
            }
        }

        mouseMoveHandler(mu,mv)
    }

    if (drawing_state == CHOOSING_DIRECTION) {
        ending = get_angle(mu,mv,narzedzie_edycji)
        //fixme: zawijanie inne dla każdego
        //ups - jednak każdy ma słaby punkt zawijania...
        //na pewno działa beginning=0, ending=0, getAngleDirection(beginning,ending)
        if (narzedzie_edycji == EDYCJA_IZOREZYSTANCJI ) {
            clockwise = getAngleDirection(beginning, ending)
        } else if (narzedzie_edycji == EDYCJA_IZOKONDUKTANCJI || narzedzie_edycji == EDYCJA_WYDLUZANIA) {
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
            } else if (narzedzie_edycji==EDYCJA_WYDLUZANIA) {
                drawing_state = CHOOSING_RADIUS
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
function DrawGuideArc(arc) {
    guideArc = new Arc(mouseArc.centerU,mouseArc.centerV,mouseArc.radius,0, 2 * Math.PI,false);//rózni się tylko początkiem i końcem
    drawArc(guideArc, 0.5)
}
function drawCurrentMouseArc(mu,mv) {
    //rysuje właśnie edytowaną krzywą na podstawie dostępnych danych
    ctx.strokeStyle = "red";
    if (narzedzie_edycji==ODCZYT || narzedzie_edycji==DODAWANIE_PUNKTU) {
        return;
    }
    if (narzedzie_edycji==ODBICIE) {
        draw_dot(mu,mv)
        draw_dot(-mu,-mv)
        return
    }
    else if (narzedzie_edycji==EDYCJA_IZOREZYSTANCJI ) {

        mouseArc = new Arc(r/(r+1),0,1/(r+1),beginning, ending,clockwise);

    } else if (narzedzie_edycji==EDYCJA_IZOREAKTANCJI) {

        mouseArc = new Arc(1,1/reactance,1/Math.abs(reactance),beginning, ending,clockwise);

    } else if (narzedzie_edycji==EDYCJA_IZOKONDUKTANCJI) {

        let r = 1/g
        mouseArc = new Arc(-r/(r+1),0,1/(r+1),beginning,ending,clockwise)

    } else if (narzedzie_edycji==EDYCJA_IZOSUSCEPTANCJI) {

        mouseArc = new Arc(-1,b,Math.abs(b),beginning,ending,clockwise)
    } else if (narzedzie_edycji==EDYCJA_WYDLUZANIA) {
        mouseArc = new Arc(0,0,radius,beginning,ending,clockwise)
    }
    DrawGuideArc(mouseArc)
    mouseArcDot(mu,mv)
    if (drawing_state != CHOOSING_BEGINNING) {
        drawArc(mouseArc)
        
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
        
        arrayOfArcs[i].draw();
    }
    debugInfo.innerText = "clockwise: " + mouseArc.isClockwise + "beginning: " +Math.floor(mouseArc.start_angle*180/Math.PI) + "end: " + Math.floor(mouseArc.end_angle*180/Math.PI);
}
function selectDot(mu,mv) {

    let smallest_distance = 99
    let u = null
    let v = null
    let SELECTION_DISTANCE = 0.06
    for (let shape of arrayOfArcs) {
        let distance = dist(shape.centerU, shape.centerV, mu, mv)
        if (shape instanceof Dot &&  distance<= SELECTION_DISTANCE && distance < smallest_distance) {
            u = shape.centerU //HINT: - może być to równe null!
            v = shape.centerV
        }
    }
    if (u !== null && v!==null) {
        chosen_point_u = u
        chosen_point_v = v
        return true
    } else {
        return false
    }
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
function draw_dot(u,v,r=4) {
    let previous_fillstyle = ctx.fillStyle
    ctx.beginPath();
    ctx.arc(XfromU(u),YfromV(v),r,0,2*Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = previous_fillstyle
}
function arcDot(centerU,centerV, radius, angle) {
    u = Math.cos(angle) * radius + centerU
    v = -1*Math.sin(angle) * radius + centerV
    draw_dot(u,v)
}
function rad2degrees(radians) {
    return radians * 180/Math.PI
}
function mouseArcDot(mu,mv) {
    alpha = get_angle(mu,mv,narzedzie_edycji)
    arcDot(mouseArc.centerU,mouseArc.centerV,mouseArc.radius,alpha)
}
