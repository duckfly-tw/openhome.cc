function shaderSourceById(id) {
    return document.getElementById(id).textContent;
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

function getGLContext(glCanvas) {
    glCanvas.width = glCanvas.clientWidth;
    glCanvas.height = glCanvas.clientHeight;

    const gl = glCanvas.getContext('webgl');
    if (!gl) {
        throw '無法初始化 WebGL，您的瀏覽器不支援';
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return gl;
}

// 從二維繪圖座標轉為三維裁剪空間座標
function toClipSpaceCord(canvas, cord) {
    const half_width = canvas.width / 2;
    const half_height = canvas.height / 2;
    const x = cord.x / half_width - 1;
    const y = -cord.y / half_height + 1;
    return {x, y, z : 0}
}

const gl = getGLContext(document.getElementById('glCanvas'));
const prog = installProgram(gl, 
    shaderSourceById('vertex-shader'), 
    shaderSourceById('fragment-shader')
);

const attr_position = gl.getAttribLocation(prog, 'position');
const attr_size = gl.getAttribLocation(prog, "size");

// 初始畫面
gl.vertexAttrib3f(attr_position, 0.0, 0.0, 0.0);
gl.vertexAttrib1f(attr_size, 5.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);

// 跟隨滑鼠
gl.canvas.addEventListener('mousemove', evt => {
    // 轉換座標
    const cord = toClipSpaceCord(glCanvas, evt);
    gl.vertexAttrib3f(attr_position, cord.x, cord.y, cord.z);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);
});

// 不顯示快顯功能表
gl.canvas.addEventListener('contextmenu', evt => {
    evt.preventDefault();
});

// 縮小、放大
let size = 5.0;
gl.canvas.addEventListener('mousedown', evt => {
    size = evt.button === 0 ? // 左鍵
              size * 0.75 : 
              size * 1.25;
    gl.vertexAttrib1f(attr_size, size);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);
});