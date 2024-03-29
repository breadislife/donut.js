const theta_spacing = 0.07;
const phi_spacing = 0.02;

const R1 = 1;
const R2 = 2;
const K2 = 25;

const K1 = 150;

const screen_width = 100;
const screen_height = 45;

let output = new Array(screen_width * screen_height).fill(' ');

const renderFrame = (A, B) => {
    const cosA = Math.cos(A);
    const sinA = Math.sin(A);
    const cosB = Math.cos(B);
    const sinB = Math.sin(B);

    let zbuffer = new Array(screen_width * screen_height).fill(0);
    

    //theta goes around the cross-sectional circle of a torus
    for (let theta = 0; theta < 2 * Math.PI; theta += theta_spacing) {
        const costheta = Math.cos(theta);
        const sintheta = Math.sin(theta);

        // phi goes around the center of revolution of a torus
        for (let phi = 0; phi < 2 * Math.PI; phi += phi_spacing) {
            const cosphi = Math.cos(phi);
            const sinphi = Math.sin(phi);

            // the xy coords of the circle before revolutions
            const circlex = R2 + R1 * costheta;
            const circley = R1 * sintheta;

            //final 3D coords after rotations
            const x = circlex * (cosB * cosphi + sinA * sinB * sinphi) - circley * cosA * sinB; 
            //console.log(x);

            const y = circlex * (sinB * cosphi - sinA * cosB * sinphi) + circley * cosA * cosB;
            //console.log(y);

            const z = K2 + cosA * circlex * sinphi + circley * sinA;
            //console.log(z);

            const ooz = 1 / z; //one over z
            //console.log(ooz);

            //x & y projection 
            let xp = Math.floor(screen_width / 2 + K1 * ooz * x);
            let yp = Math.floor(screen_height / 2 - K1 * ooz * y);
            //console.log(xp);
            //console.log(yp);

            //calc luminance
            let L = cosphi * costheta * sinB - cosA * costheta * sinphi - sinA * sintheta + cosB * (cosA * sintheta - costheta * sinA * sinphi);
            // L ranges from -sqrt(2) to +sqrt(2).  If it's < 0, the surface
            // is pointing away from us, so we won't bother trying to plot it.
            if (L > 0) {
                //test against zbuffer
                if (ooz > zbuffer[xp + yp * screen_width]) {
                    zbuffer[xp + yp * screen_width] = ooz; 
                    const luminance_index = Math.floor(L * 8);
                    //console.log(luminance_index);
                    // luminance_index is now in the range 0..11 (8*sqrt(2) = 11.3)
                    // now we lookup the character corresponding to the
                    // luminance and plot it in our output:
                    output[xp + yp * screen_width] = ".,-~:;=!*#$@"[luminance_index];
                }
            }
        }
    }

    let result = '';
    for (let i = 0; i < screen_height; i++){
        for (let j = 0; j < screen_width; j++){
            result += output[j + i * screen_width];
        }
        result += '\n';
    }
    console.log('\x1b[H' + result);
}

const animate = () => {
    let frame = 0;
    const maxFrames = 200; //frame amount -> how long animation goes for
    const frameDelay = 50; //delay in ms -> speed

    const renderNF = () => {
        const A = frame * 0.1;
        const B = frame * 0.05;

        renderFrame(A, B);

        frame++;
        if(frame < maxFrames) {
            setTimeout(renderNF, frameDelay);
        }
    };

    renderNF();
}

animate();