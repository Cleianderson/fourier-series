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

var chunks = [];
var canvas_stream;


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
    path.sort((a, b) => (b.y - a.y))

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

    sliderStep = createSlider(1, path.length, 1)
    sliderStep.position(10, 40)
    sliderStep.input(configure)
    sliderLbl = createSpan("")
    sliderLbl.position(10, 20)

    sliderScale = createSlider(1, 5, 1.5, 0.5)
    sliderScale.position(10, 100)
    sliderScale.input(configure)
    scaleLbl = createSpan("")
    scaleLbl.position(10, 80)

    sliderTransX = createSlider(-WIDTH, WIDTH, -224)
    sliderTransX.position(10, 160)
    sliderTransX.input(configure)
    transXLbl = createSpan("")
    transXLbl.position(10, 140)

    sliderTransY = createSlider(-HEIGHT, HEIGHT, -224)
    sliderTransY.position(10, 220)
    sliderTransY.input(configure)
    transYLbl = createSpan("")
    transYLbl.position(10, 200)


    var canvas_stream = canvas.captureStream(60); // fps
// Create media recorder from canvas stream
    this.media_recorder = new MediaRecorder(canvas_stream, { mimeType: "video/webm; codecs=vp9" });
    // Record data in chunks array when data is available
    this.media_recorder.ondataavailable = (evt) => { chunks.push(evt.data); };
    // Provide recorded data when recording stops
    this.media_recorder.onstop = () => { this.on_media_recorder_stop(chunks); }

    btnRecord = createButton("►")
    btnRecord.position(10, 260)
    // Start recording using a 1s timeslice [ie data is made available every 1s)
    btnRecord.mousePressed(() => this.media_recorder.start(1000))

    btnStop = createButton("▣")
    btnStop.position(30, 260)
    btnStop.mousePressed(() => this.media_recorder.stop())
    
    pressDownload = () => {
        var blob = new Blob(chunks, { type: "video/webm" });
        const recording_url = URL.createObjectURL(blob);
        // Gather chunks of video data into a blob and create an object URL
        // Attach the object URL to an <a> element, setting the download file name
        const a = document.createElement('a');
        a.style = "display: none;";
        a.href = recording_url;
        a.download = "video.webm";
        document.body.appendChild(a);
        // Trigger the file download
        a.click();
        setTimeout(() => {
            // Clean up - see https://stackoverflow.com/a/48968694 for why it is in a timeout
            URL.revokeObjectURL(recording_url);
            document.body.removeChild(a);
        }, 0);
    }
    btnDownload = createButton("▼")
    btnDownload.position(50, 260)
    btnDownload.mousePressed(pressDownload)

    configure()
}

function draw() {
    background('#F9F9F9')

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
    stroke(80)
    // strokeWeight(10)
    beginShape()
    for (let i = 0; i < traceN; i++) {
        // const alpha = (1.8 * i) / traceN
        // stroke(`rgba(249, 249, 249, ${alpha})`)
        dot = trace[i]
        if (i > 0 && ((dot[0] - trace[i - 1][0]) ** 2 + (dot[1] - trace[i - 1][1]) ** 2) ** (1 / 2) > 5 * step) {
            strokeWeight(1)
            endShape()
            beginShape()
        }
        vertex(dot[0], dot[1])
    }
    strokeWeight(1)
    // stroke(0)
    endShape()
    // line(CENTER.x, trace[traceN - 1][1], x, y)

    while (trace.length > N) {
        trace.shift()
        if (step > 1) {
            fourierY = []
            trace = []
            Y = []
            t = 0

            sliderStep.value = () => step - 1

            step = Number(sliderStep.value())
            sliderLbl.elt.textContent = `Step: ${step}`

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
    }

    t += (2 * PI / N)
}

function Circle(posX, posY, radius, freq, phase, isLast = false) {
    phi = t * freq + phase + PI
    dotX = posX + radius * cos(phi)
    dotY = posY + radius * sin(phi)

    if (isLast) {
        stroke(230)
    } else {
        stroke(230)
    }

    noFill()
    strokeWeight(1)
    circle(posX, posY, 2 * radius)
    // strokeWeight(4)
    // point(dotX, dotY)
    if (isLast) {
        strokeWeight(4)
        stroke(30)
        point(dotX, dotY)
    } else {
        stroke(35)
    }
    strokeWeight(0.25)
    line(posX, posY, dotX, dotY)

    return [dotX, dotY]
}

