//Geometria, konwersja (u,v) <=> (x,y) i trochę ogólnej matmy
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

function arcDot(centerU,centerV, radius, angle) {
    u = Math.cos(angle) * radius + centerU
    v = -1*Math.sin(angle) * radius + centerV
    let dot = new Dot(u,v)
    return dot
}


function roundTo(number,precision) {
    //czy nie lepiej to przenieść do innego pliku?
    if (Math.abs(number) > 297485479973096 ) {
        number = Infinity
    }
    return Math.round(number*(10**precision))/(10**precision)
}
function rad2degrees(radians) {
    return radians * 180/Math.PI
}
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

function circleIntersections(u1, v1, r1, u2, v2, r2) {
    //funkcja znajdująca punkt przecięcia dwóch okręgów
    //źródło: chatgpt
    //Przypadek poziomej linii y = 0 zamiast okręgu
    //działa tylko dla PIERWSZEGO okręgu

    if (v2===-Infinity) {//okrąg o nieskończenie wysokim środku i promieniu ma taki sam skutek
        v2 = Infinity
    }
    if (v1 === Infinity && r1 === Infinity) {
        if (v2 === Infinity && r2 === Infinity) return [];//sus
        const h = Math.sqrt(Math.max(0, r2 * r2 - v2 * v2));
        if (Math.abs(v2) > r2) return [];
        if (h === 0) return [{ u: u2, v: 0 }];
        return [{ u: u2 - h, v: 0 }, { u: u2 + h, v: 0 }];
    }

    if (v2 === Infinity && r2 === Infinity) {
        return circleIntersections(u2, v2, r2, u1, v1, r1);
    }

    const du = u2 - u1;
    const dv = v2 - v1;
    const d = Math.sqrt(du * du + dv * dv);

    if (d > r1 + r2 || d < Math.abs(r1 - r2) || d === 0) {
        return [];
    }

    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));

    const u0 = u1 + a * du / d;
    const v0 = v1 + a * dv / d;

    const p1 = { u: u0 - h * dv / d, v: v0 + h * du / d };
    const p2 = { u: u0 + h * dv / d, v: v0 - h * du / d };

    if (h === 0) return [p1];

    return [p1, p2];
}
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

