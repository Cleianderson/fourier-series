cos = Math.cos
sin = Math.sin
abs = Math.abs
PI = Math.PI

const WIDTH = 600
const HEIGHT = 600

const RADIUS = 100
const NUM_CIRCLES = 3
const CENTER = { x: WIDTH / 2, y: HEIGHT / 2 }

let t = 0
let trace = []
let dragg = []
let Y = []
let fourierY
let N

let step
let stepLbl
let scale
let transX
let transY

function configure() {
    step = Number(sliderStep.value())
    scale = Number(sliderScale.value())
    transX = Number(sliderTransX.value())
    transY = Number(sliderTransY.value())


    sliderLbl.elt.textContent = `Step: ${step}`
    scaleLbl.elt.textContent = `Scale: ${scale}`
    transXLbl.elt.textContent = `Trans X: ${transX}`
    transYLbl.elt.textContent = `Trans Y: ${transY}`
    clear()

    fourierY = []
    trace = []
    Y = []
    t = 0
    for (let i = 0; i < path.length; i += step) {
        const _x = path[i].x ? path[i].x : path[i][0]
        const _y = path[i].y ? path[i].y : path[i][1]
        const [real, imag] = [_x / scale + transX, _y / scale + transY]

        const complex = new Complex({ real, imag })
        Y.push(complex)
    }
    fourierY = discreteFourierTransform(Y)
    fourierY.sort((a, b) => b.norm - a.norm)
    N = fourierY.length
}

function setup() {
    createCanvas(WIDTH, HEIGHT, P2D)

    sliderStep = createSlider(1, 10, 1)
    sliderStep.position(10, 40)
    sliderStep.input(configure)
    sliderLbl = createSpan("")
    sliderLbl.position(10, 20)

    sliderScale = createSlider(1, 5, 1.5, 0.5)
    sliderScale.position(10, 100)
    sliderScale.input(configure)
    scaleLbl = createSpan("")
    scaleLbl.position(10, 80)

    sliderTransX = createSlider(-WIDTH, WIDTH, -200)
    sliderTransX.position(10, 160)
    sliderTransX.input(configure)
    transXLbl = createSpan("")
    transXLbl.position(10, 140)

    sliderTransY = createSlider(-HEIGHT, HEIGHT, -150)
    sliderTransY.position(10, 220)
    sliderTransY.input(configure)
    transYLbl = createSpan("")
    transYLbl.position(10, 200)

    configure()
}

function draw() {
    background(200)

    let x = CENTER.x
    let y = CENTER.y
    for (let i = 0; i < fourierY.length; i++) {
        const { norm, angl, frequence } = fourierY[i]

        let dot_coord = Circle(x, y, norm, frequence, angl, i == N - 1)
        x = dot_coord[0]
        y = dot_coord[1]
    }
    trace.push([x, y])

    const traceN = trace.length
    // beginShape()
    strokeWeight(3)
    for (let i = 0; i < traceN; i++) {
        const alpha = (1.8 * i) / traceN
        stroke(`rgba(0, 0, 0, ${alpha})`)
        dot = trace[i]
        point(dot[0], dot[1])
    }
    stroke(0)
    strokeWeight(1)
    // endShape()
    // line(CENTER.x, trace[traceN - 1][1], x, y)

    while (trace.length > N) {
        trace.shift()
    }

    t -= (2 * PI / N)
}

function Circle(posX, posY, radius, freq, phase, isLast = false) {
    phi = t * freq + phase + PI
    dotX = posX + radius * cos(phi)
    dotY = posY + radius * sin(phi)

    if (isLast) {
        stroke(120)
    } else {
        stroke(175)
    }

    noFill()
    circle(posX, posY, 2 * radius)
    strokeWeight(5)
    point(dotX, dotY)
    strokeWeight(1)
    line(posX, posY, dotX, dotY)

    return [dotX, dotY]
}

