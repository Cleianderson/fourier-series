class Complex {
    constructor({ real = 0, imag = 0, frequence = 1 }) {
        this.real = real
        this.imag = imag
        this.norm = Math.sqrt(real ** 2 + imag ** 2)
        this.angl = Math.atan2(imag, real)
        this.frequence = frequence
    }

    times(complex) {
        const real = this.real * complex.real - this.imag * complex.imag
        const imag = this.imag * complex.real + this.real * complex.imag

        return new Complex({ real, imag })
    }
}

function discreteFourierTransform(arrX) {
    let X = []
    let N = arrX.length


    for (let k = 0; k < N; k++) {
        let real = 0
        let imag = 0

        for (let n = 0; n < N; n++) {
            let phi = 2 * PI * k * n / N
            const [re, im] = [Math.cos(phi), Math.sin(phi)]
            const xn = arrX[n]

            real += xn.real * re - xn.imag * im
            imag -= xn.imag * re + xn.real * im
        }
        real = real / N
        imag = imag / N

        const S = new Complex({ real, imag, frequence: k })
        X.push(S)
    }

    return X
}