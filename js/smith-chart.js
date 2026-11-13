




//todo: przetestuj dla różnych punktów czy te funkcje zawsze dają dobre odpowiedzi

function znajdzIzorezystancje(u,v) {
    let ans = -(u**2+v**2-1)/(u**2-2*u+v**2+1)//chyba działa
    return ans;
}
function znajdzIzoreaktancje(u,v) {
    //(1-u)**2 = 1-2u + u**2
    return (2*v)/((u-1)**2+v**2);
}
function znajdzIzosusceptancje(u,v) {
    let susceptance = znajdzIzoreaktancje(-1*u,-1*v)
    return susceptance
}
function znajdzIzokonduktancje(u,v) {
    let g = znajdzIzorezystancje(-1*u,v)//dla elegancji dać -1v
    return g;
}
function okragIzorezystancji(r) {//rysuje jedną izorezystancję
    var u = r/(r+1)
    var v = 0
    var radius = 1/(r+1)
    return {u:u, v:v, radius:radius}
}
function okragIzoreaktancji(x) {
    var u = 1;
    var v = 1/x;
    var radius = 1/Math.abs(x);
    return {u:u, v:v, radius:radius}
}
function okragIzokonduktancji(g) {
    let ok = okragIzorezystancji(g)
    //v zawsze jest równe 0... Ale żeby wzór był analogiczny do izosusceptanji, może lepiej pomnożyć v * -1 ?
    return {u:-1*ok.u, v:ok.v, radius:ok.radius}
}

function okragIzosusceptancji(b) {
    let ok = okragIzoreaktancji(b)
    return {u:-1*ok.u, v:-1*ok.v, radius:ok.radius}
}
function findClosestListValue(value, list) {
    let min_error = 99999999999
    let answer = null
    for (let i=0; i< list.length;i++) {
        error = Math.abs(list[i] - value)
        if (error < min_error ) {
            min_error = error
            answer = list[i]
        }
    }
    return answer
}

function snapUVToGrid(u,v) {
    let r = znajdzIzorezystancje(u,v)
    let x = znajdzIzoreaktancje(u,v)
    
    let snapped_r = findClosestListValue(r,wartosciSiatki)
    let snapped_x
    if (x >= 0) {
        snapped_x = findClosestListValue(x,wartosciSiatki)
    } else {
        snapped_x = -1*findClosestListValue(-1*x,wartosciSiatki)
    }
    let r_circle = okragIzorezystancji(snapped_r)
    let x_circle = okragIzoreaktancji(snapped_x)
    intersections = circleIntersections(r_circle.u, r_circle.v, r_circle.radius, x_circle.u, x_circle.v,x_circle.radius)
    
    if (dist(intersections[0].u, intersections[0].v,u,v) < dist(intersections[1].u, intersections[1].v,u,v) ) {
        return intersections[0]
    } else {
        return intersections[1]
    }
}