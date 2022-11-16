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
                n, -n, n,
                -n, -n, -n,
                n, n, -n,

                -n, -n, -n,
                -n, n, n,
                n, n, -n,

                n, -n, n,
                n, n, -n,
                -n, n, n,

                n, -n, n,
                -n, n, n,
                -n, -n, -n
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
                -n, n, n,
                -n, -n, n,
                n,  -n, n,
                n,  n, n,
                // 後
                n, n, -n,
                n, -n, -n,
                -n, -n, -n,
                -n, n, -n,
                // 上
                n, n, -n,
                -n, n, -n,
                -n, n, n,
                n, n, n,
                // 下
                -n, -n, -n,
                n, -n, -n,
                n, -n, n,
                -n, -n, n,
                // 左
                -n, n, -n,
                -n, -n, -n,
                -n, -n, n,
                -n, n, n,
                // 右
                n, n, n,
                n, -n, n,
                n, -n, -n,
                n, n, -n
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
                0, t, -n,
                -t, n, 0,
                0, t, n,

                0, t, -n,
                0, t, n,
                t, n, 0,

                0, t, -n,
                t, n, 0,
                n, 0, -t,

                0, t, -n,
                n, 0, -t,
                -n, 0, -t, 

                0, t, -n,
                -n, 0, -t,
                -t, n, 0, 

                -t, n, 0,
                -n, 0, t,
                0, t, n,

                0, t, n,
                n, 0, t,
                t, n, 0,

                t, n, 0,
                t, -n, 0,
                n, 0, -t,

                n, 0, -t,
                0, -t, -n,
                -n, 0, -t,

                -n, 0, -t,
                -t, -n, 0,
                -t, n, 0,

                -n, 0, t,
                n, 0, t,
                0, t, n,

                n, 0, t,
                t, -n, 0,
                t, n, 0,

                t, -n, 0,
                0, -t, -n,
                n, 0, -t,

                0, -t, -n,
                -t, -n, 0,
                -n, 0, -t,

                -t, -n, 0,
                -n, 0, t,
                -t, n, 0,

                0, -t, n,
                n, 0, t,
                -n, 0, t,

                0, -t, n,
                t, -n, 0,
                n, 0, t,

                0, -t, n,
                0, -t, -n,
                t, -n, 0,

                0, -t, n,
                -t, -n, 0,
                0, -t, -n,

                0, -t, n,
                -n, 0, t,
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
    constructor(geometry, material, position = [0, 0, 0]) {
        this.geometry = geometry;
        this.material = material;
        this.mPosition = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            position[0], position[1], position[2], 1
        ];
        this.mTransformation = mat4.create();
    }

    numberOfvertices() {
        return this.geometry.numberOfvertices();        
    }

    setPosition(x, y, z) {
        this.mPosition[12] = x;
        this.mPosition[13] = y;
        this.mPosition[14] = z;
    }

    getPosition() {
        return this.mPosition.slice(12, 15);
    }

    reset() {
        this.setPosition(0, 0, 0);
        this.mTransformation = mat4.create();        
    }

    getTransformation() {
        return mat4.multiply(this.mPosition, this.mTransformation);
    }    

    translate(tx, ty, tz) {
        this.setPosition(
            this.mPosition[12] + tx, 
            this.mPosition[13] + ty, 
            this.mPosition[14] + tz
        );
    }

    xRotate(radians) {
        this.mTransformation = mat4.xRotate(this.mTransformation, radians);
    }

    yRotate(radians) {
        this.mTransformation = mat4.yRotate(this.mTransformation, radians);
    }
    
    zRotate(radians) {
        this.mTransformation = mat4.zRotate(this.mTransformation, radians);
    }

    quatRotate(axis, rad) {
        this.mTransformation = mat4.quatRotate(this.mTransformation, axis, rad);
    }    

    scale(sx, sy, sz) {
        this.mTransformation = mat4.scale(this.mTransformation, sx, sy, sz);
    }    
}

class Camera {
    constructor(center, position = [0, 0, 0], up = [0, 1, 0]) {
        this.position = position;
        this.center = center;
        this.up = up;
        this.look = mat4.lookAt(this.position, this.center, this.up);
    }

    lookAt(x, y, z) {
        this.center = [x, y, z];
        this.look = mat4.lookAt(this.position, this.center, this.up);
    }

    setPosition(x, y, z) {
        this.position = [x, y, z];
        this.look = mat4.lookAt(this.position, this.center, this.up);
    }    

    setUp(x, y, z) {
        this.up = [x, y, z];
        this.look = mat4.lookAt(this.position, this.center, this.up);
    }    

    viewingWindow() {
        return mat4.multiply(this.projection, this.look);
    }
}

class OrthographicCamera extends Camera {
    constructor(left, right, top, bottom, near, far) {
        super([0, 0, -far]);
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
        this.near = near;
        this.far = far;
        this.projection = mat4.ortho(left, right, top, bottom, near, far);
    }
}

class PerspectiveCamera extends Camera {
    constructor(fovy, aspect, near, far) {
        super([0, 0, -far]);
        this.fovy = fovy;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.projection = mat4.perspective(fovy, aspect, near, far);
    }
}

class Scene {
    constructor(camera) {
        this.camera = camera;
        this.meshes = new Set();
    }

    addMesh(mesh) {
        this.meshes.add(mesh);
    }

    removeMesh(mesh) {
        this.meshes.delete(mesh);
    }
}

class BasicPainter {
    constructor(canvas = document.createElement('canvas')) {
        this.canvas = canvas;
        this.renderer = new Renderer(
            // vertex shader
            `
            uniform mat4 viewingWindow;
            uniform mat4 transformation;

            attribute vec3 position;
            attribute vec4 color;

            varying vec4 fColor;

            void main(void) {
                gl_Position = viewingWindow * transformation * vec4(position.x, position.y, position.z, 1.0);
                fColor = color;
            }
            `, 
            // fragment shader
            `
            precision mediump float;
            varying vec4 fColor;

            void main(void) {
                gl_FragColor = fColor;
            }
            `,
            this.canvas);
    }

    setBackgroundColor(red, green, blue, alpha) {
        this.renderer.setClearColor(red / 255, green / 255, blue / 255, alpha);
    }

    paint(scene) {
        const renderer = this.renderer;
        renderer.clear();
        renderer.uniformMatrix4fv('viewingWindow', scene.camera.viewingWindow());
        
        scene.meshes.forEach(mesh => {
            renderer.uniformMatrix4fv('transformation', mesh.getTransformation());
            
            const geometry = mesh.geometry;
            const material = mesh.material;
            renderer.buffer(GL.ELEMENT_ARRAY_BUFFER, geometry.indexes, GL.DYNAMIC_DRAW);

            const colorBuffer = renderer.buffer(GL.ARRAY_BUFFER, material.vertexColors(), GL.DYNAMIC_DRAW);
            renderer.enableVertexAttribArray(colorBuffer, 'color', 4);
            
            const vertBuffer = renderer.buffer(GL.ARRAY_BUFFER, geometry.verteices, GL.DYNAMIC_DRAW);
            renderer.enableVertexAttribArray(vertBuffer, 'position', 3);
            
            renderer.bindBuffer(GL.ARRAY_BUFFER, vertBuffer);
            renderer.bufferSubData(GL.ARRAY_BUFFER, 0, geometry.verteices);
            renderer.render(mesh);
        });
    }
}

const GL = WebGLRenderingContext;

const mat4 = {
    create() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },

    translation(tx, ty, tz) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1
        ];
    },

    scaling(sx, sy, sz) {
        return [
            sx, 0,  0,  0,
            0, sy,  0,  0,
            0,  0, sz,  0,
            0,  0,  0,  1,
        ];
    },
    
    xRotation(radians) {
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    },

    yRotation(radians) {
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    },

    zRotation(radians) {
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },

    multiply(a, b) {
        const a00 = a[0 * 4 + 0];
        const a01 = a[0 * 4 + 1];
        const a02 = a[0 * 4 + 2];
        const a03 = a[0 * 4 + 3];
        const a10 = a[1 * 4 + 0];
        const a11 = a[1 * 4 + 1];
        const a12 = a[1 * 4 + 2];
        const a13 = a[1 * 4 + 3];
        const a20 = a[2 * 4 + 0];
        const a21 = a[2 * 4 + 1];
        const a22 = a[2 * 4 + 2];
        const a23 = a[2 * 4 + 3];
        const a30 = a[3 * 4 + 0];
        const a31 = a[3 * 4 + 1];
        const a32 = a[3 * 4 + 2];
        const a33 = a[3 * 4 + 3];
        const b00 = b[0 * 4 + 0];
        const b01 = b[0 * 4 + 1];
        const b02 = b[0 * 4 + 2];
        const b03 = b[0 * 4 + 3];
        const b10 = b[1 * 4 + 0];
        const b11 = b[1 * 4 + 1];
        const b12 = b[1 * 4 + 2];
        const b13 = b[1 * 4 + 3];
        const b20 = b[2 * 4 + 0];
        const b21 = b[2 * 4 + 1];
        const b22 = b[2 * 4 + 2];
        const b23 = b[2 * 4 + 3];
        const b30 = b[3 * 4 + 0];
        const b31 = b[3 * 4 + 1];
        const b32 = b[3 * 4 + 2];
        const b33 = b[3 * 4 + 3];
        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
        ];
    },

    translate(m, tx, ty, tz) {
        return this.multiply(m, this.translation(tx, ty, tz));
    },

    scale(m, sx, sy, sz) {
        return this.multiply(m, this.scaling(sx, sy, sz));
    },

    xRotate(m, radians) {
        return this.multiply(m, this.xRotation(radians));
    },

    yRotate(m, radians) {
        return this.multiply(m, this.yRotation(radians));
    },

    zRotate: function(m, radians) {
        return this.multiply(m, this.zRotation(radians));
    },
    
    normalize(v) {
        const len = Math.hypot(v[0], v[1], v[2]);
        if (!len) {
            return [0, 0, 0];
        }
        return [v[0] / len, v[1] / len, v[2] / len];
    },

    quatRotation(axis, rad) {
        const s = Math.sin(rad / 2);
        // q = xi + yj + zk + w
        const x = s * axis[0];
        const y = s * axis[1];
        const z = s * axis[2];
        const w = Math.cos(rad / 2);

        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;

        const xx = x * x2;
        const yx = y * x2;
        const yy = y * y2;
        const zx = z * x2;
        const zy = z * y2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        return [
            1 - yy - zz, yx + wz, zx - wy, 0,
            yx - wz, 1 - xx - zz, zy + wx, 0,
            zx + wy, zy - wx, 1 - xx - yy, 0,
            0, 0, 0, 1
        ];
    },

    quatRotate(m, axis, rad) {
        return this.multiply(m, this.quatRotation(axis, rad));
    },
    
    lookAt(eye, center, up) {
        const [eyex, eyey, eyez] = eye;
        const [upx, upy, upz] = up;
        const [centerx, centery, centerz] = center;

        const [z0, z1, z2] = this.normalize([
            eyex - centerx, 
            eyey - centery, 
            eyez - centerz
        ]);
        const [x0, x1, x2] = this.normalize([
            upy * z2 - upz * z1,
            upz * z0 - upx * z2,
            upx * z1 - upy * z0
        ]);
        const [y0, y1, y2] = this.normalize([
            z1 * x2 - z2 * x1,
            z2 * x0 - z0 * x2,
            z0 * x1 - z1 * x0
        ]);                    
        
        return [
            x0, y0, z0, 0,
            x1, y1, z1, 0,
            x2, y2, z2, 0,
            -(x0 * eyex + x1 * eyey + x2 * eyez), -(y0 * eyex + y1 * eyey + y2 * eyez), -(z0 * eyex + z1 * eyey + z2 * eyez), 1
        ];
    },                

    ortho(left, right, top, bottom, near, far) {
        const lr = 1 / (left - right);
        const bt = 1 / (bottom - top);
        const nf = 1 / (near - far);
        return [
            -2 * lr, 0, 0, 0,
            0, -2 * bt, 0, 0,
            0, 0, 2 * nf, 0,
            (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1
        ];
    },

    perspective(fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        const nf = 1 / (near - far);
        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * nf, -1,
            0, 0, 2 * far * near * nf, 0
        ];
    }
};

export {GL, downloadImage, shaderSourceById, Renderer, 
        TetrahedronGeometry, CubeGeometry, IcosahedronGeometry, 
        BasicMaterial, TextureAtlasMaterial, CubeMapMaterial, Mesh, 
        mat4, OrthographicCamera, PerspectiveCamera, Scene, BasicPainter
       };