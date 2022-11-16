function shaderSourceById(id) {
    return document.getElementById(id).textContent;
}

function downloadImage(src) {
    const image = new Image();
    return new Promise(resolve => {
        image.addEventListener('load', () => { 
            resolve(image);
        });
        image.src = src;
    });
}

function shader(glContext, type, source) {
    const shader = glContext.createShader(type);
    glContext.shaderSource(shader, source);
    glContext.compileShader(shader);

    if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
        throw '編譯著色器時發生錯誤：' + glContext.getShaderInfoLog(shader);
    }

    return shader;
}

function installProgram(glContext, vertexSource, fragSource) {
    const vertexShader = shader(glContext, glContext.VERTEX_SHADER, vertexSource);
    const fragShader = shader(glContext, glContext.FRAGMENT_SHADER, fragSource);            

    const prog = glContext.createProgram();
    glContext.attachShader(prog, vertexShader);
    glContext.attachShader(prog, fragShader);
    glContext.linkProgram(prog);

    if (!glContext.getProgramParameter(prog, glContext.LINK_STATUS)) {
        throw '編譯著色器時發生錯誤：' + glContext.getProgramInfoLog(prog);
    }

    glContext.useProgram(prog);
    return prog;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

class Renderer {
    constructor(vertexShaderSource, fragmentShaderSource, canvas = document.createElement('canvas')) {
        this.canvas = canvas;
        this.setSize(canvas.clientWidth, canvas.clientHeight);
        this.gl = this.canvas.getContext('webgl');
        if (!this.gl) {
            throw '無法初始化 WebGL，瀏覽器不支援';
        }
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.program = installProgram(this.gl, vertexShaderSource, fragmentShaderSource);
    }

    setSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    setClearColor(r, g, b, a) {
        this.gl.clearColor(r / 255, g / 255, b / 254, a);
    }

    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    buffer(target, srcData, usage) {
        const gl = this.gl;
        const buffer = gl.createBuffer();
        gl.bindBuffer(target, buffer);
        gl.bufferData(target, srcData, usage);
        return buffer;
    }

    bindBuffer(target, buffer) {
        this.gl.bindBuffer(target, buffer);
    }

    bufferSubData(target, dstByteOffset, srcData) {
        const gl = this.gl;
        gl.bufferSubData(target, dstByteOffset, srcData);
    }

    getAttribLocation(name) {
        return this.gl.getAttribLocation(this.program, name);
    }

    getUniformLocation(name) {
        return this.gl.getUniformLocation(this.program, name);
    }

    enableVertexAttribArray(buffer, name, size) {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        const position = this.getAttribLocation(name);
        gl.vertexAttribPointer(position, size, gl.FLOAT, false, 0 , 0);
        gl.enableVertexAttribArray(position);
    }

    uniform1f(name, value) {
        this.gl.uniform1f(
            this.getUniformLocation(name),
            value
        );    
    }

    uniform1i(name, value) {
        this.gl.uniform1i(
            this.getUniformLocation(name),
            value
        );    
    }

    uniformMatrix4fv(name, value) {
        this.gl.uniformMatrix4fv(
            this.getUniformLocation(name),
            false,
            value
        );    
    }

    texture2D(image) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // 寬高都是 2 次方，產生 MINMAP
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // 寬或高不是 2 次方，只能用 gl.CLAMP_TO_EDGE
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            // 因為無法產生 MINMAP，必須是 gl.LINEAR 或 gl.NEAREST
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

        return texture;
    }

    textureCubeMap(images) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images.posz);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images.negz);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images.posy);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images.negy);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images.posx);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images.negx);

        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

        return texture;
    }

    bindTexture(target, texture) {
        this.gl.bindTexture(target, texture);
    }

    activeTexture(texture) {
        this.gl.activeTexture(texture);   
    }

    render(mesh) {
        const gl = this.gl;
        gl.drawElements(gl.TRIANGLES, mesh.numberOfvertices(), gl.UNSIGNED_SHORT, 0);
        
    }
}

class Geometry {
    constructor(verteices, indexes) {
        this.verteices = verteices;
        this.indexes = indexes;
    }

    numberOfvertices() {
        return this.indexes.length;
    }
}

class TetrahedronGeometry extends Geometry {
    constructor(size) {
        const n = size / 2;
        super(
            new Float32Array([
                n, -n, -n,
                -n, -n, n,
                n, n, n,

                -n, -n, n,
                -n, n, -n,
                n, n, n,

                n, -n, -n,
                n, n, n,
                -n, n, -n,

                n, -n, -n,
                -n, n, -n,
                -n, -n, n
            ]), 
            new Uint16Array(range(0, 12))
        );
    }
}

class CubeGeometry extends Geometry {
    constructor(size) {
        const n = size / 2;
        super(
            new Float32Array([
                // 前
                -n, n,  -n,
                -n, -n,  -n,
                n,  -n, -n,
                n,  n, -n,
                // 後
                n, n, n,
                n, -n, n,
                -n, -n, n,
                -n, n, n,
                // 上
                n, n, n,
                -n, n, n,
                -n, n,  -n,
                n, n, -n,
                // 下
                -n, -n, n,
                n, -n, n,
                n, -n, -n,
                -n, -n, -n,
                // 左
                -n, n, n,
                -n, -n, n,
                -n, -n, -n,
                -n, n, -n,
                // 右
                n, n, -n,
                n, -n, -n,
                n, -n, n,
                n, n, n
            ]), 
            new Uint16Array([
                0,  1,  2,      0,  2,  3,    // 前
                4,  5,  6,      4,  6,  7,    // 後
                8,  9,  10,     8,  10, 11,   // 上
                12, 13, 14,     12, 14, 15,   // 下
                16, 17, 18,     16, 18, 19,   // 右
                20, 21, 22,     20, 22, 23,   // 左
            ])
        );
    }
}

class IcosahedronGeometry extends Geometry {
    constructor(size) {
        const n = size / 2;
        const t = n * (1.0 + Math.sqrt(5.0)) / 2.0;
        super(
            new Float32Array([
                0, t, n,
                -t, n, 0,
                0, t, -n,

                0, t, n,
                0, t, -n,
                t, n, 0,

                0, t, n,
                t, n, 0,
                n, 0, t,

                0, t, n,
                n, 0, t,
                -n, 0, t, 

                0, t, n,
                -n, 0, t,
                -t, n, 0, 

                -t, n, 0,
                -n, 0, -t,
                0, t, -n,

                0, t, -n,
                n, 0, -t,
                t, n, 0,

                t, n, 0,
                t, -n, 0,
                n, 0, t,

                n, 0, t,
                0, -t, n,
                -n, 0, t,

                -n, 0, t,
                -t, -n, 0,
                -t, n, 0,

                -n, 0, -t,
                n, 0, -t,
                0, t, -n,

                n, 0, -t,
                t, -n, 0,
                t, n, 0,

                t, -n, 0,
                0, -t, n,
                n, 0, t,

                0, -t, n,
                -t, -n, 0,
                -n, 0, t,

                -t, -n, 0,
                -n, 0, -t,
                -t, n, 0,

                0, -t, -n,
                n, 0, -t,
                -n, 0, -t,

                0, -t, -n,
                t, -n, 0,
                n, 0, -t,

                0, -t, -n,
                0, -t, n,
                t, -n, 0,

                0, -t, -n,
                -t, -n, 0,
                0, -t, n,

                0, -t, -n,
                -n, 0, -t,
                -t, -n, 0
            ]), 
            new Uint16Array(range(0, 60))
        );        
    }
}

function range(begin, end) {
    const r = [];
    for(let i = begin; i < end; i++) {
        r.push(i);
    }
    return r;
}

class BasicMaterial {
    constructor(faceVertexNumber, faceColors) {
        this.faceVertexNumber = faceVertexNumber;        
        this.faceColors = faceColors;
    }

    vertexColors() {
        return generateVertexColors(this.faceVertexNumber, this.faceColors);
    }
}

function generateVertexColors(faceVertexNumber, faceColors) {
    const colors = [];
    for(let j = 0; j < faceColors.length; ++j) {
        Array.prototype.push.apply(colors, repeat(faceColors[j], faceVertexNumber));
    }
    return new Float32Array(colors);
}

function repeat(array, n) {
    let arr = [];   
    for(let i = 0; i < n; i++) {
        Array.prototype.push.apply(arr, array);
    }
    return arr;
}

class TextureAtlasMaterial {
    constructor(image, textureCords, repeatTimes = 1) {
        this.image = image;
        this.textureCords = new Float32Array(repeat(textureCords, repeatTimes));
    }
}

class CubeMapMaterial {
    constructor(images) {
        this.images = images;
    }
}

TextureAtlasMaterial.DEFAULT_CUBEMAP_TEXTURE_CORDS = [
    // 前
    1/2, 1/3,
    1/2, 2/3,
    3/4, 2/3,
    3/4, 1/3,
    // 後
    0, 1/3,
    0, 2/3,
    1/4, 2/3,
    1/4, 1/3,
    // 上
    1/4, 0,
    1/4, 1/3,
    1/2, 1/3,
    1/2, 0,
    // 下
    1/4, 2/3,
    1/4, 1,
    1/2, 1,
    1/2, 2/3,
    // 左
    1/4, 1/3,
    1/4, 2/3,
    1/2, 2/3,
    1/2, 1/3,
    // 右
    3/4, 1/3,
    3/4, 2/3,
    1, 2/3,
    1, 1/3
];

class Mesh {
    constructor(geometry, material) {
        this.geometry = geometry;
        this.material = material;
    }

    numberOfvertices() {
        return this.geometry.numberOfvertices();        
    }
}

const GL = WebGLRenderingContext;

export {GL, downloadImage, shaderSourceById, Renderer, TetrahedronGeometry, CubeGeometry, IcosahedronGeometry, BasicMaterial, TextureAtlasMaterial, CubeMapMaterial, Mesh};