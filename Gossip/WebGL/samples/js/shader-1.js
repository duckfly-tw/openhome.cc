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

const gl = getGLContext(document.getElementById('glCanvas'));

installProgram(gl, 
    shaderSourceById('vertex-shader'), 
    shaderSourceById('fragment-shader')
);

gl.drawArrays(gl.POINTS, 0, 1);