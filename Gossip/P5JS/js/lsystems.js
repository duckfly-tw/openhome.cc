function setup() {
    createCanvas(400, 400).parent('lsystems');
    angleMode(DEGREES);
    frameRate(1);
}

const lsystems = [
    tree1,
    tree2,
    koch_curve,
    koch_curve_3,
    koch_snowflake,
    koch_quadratic,
    koch_quadratic_type1,
    koch_quadratic_type2,
    koch_star,
    dragon_curve,
    twin_dragon_curve,
    hilbert_curve,
    moore_curve,
    peano_curve,
    gosper_curve,
    gosper_star,
    levy_c_curve,
    island_curve,
    sierpinski_triangle,
    sierpinski_arrowhead,
    sierpinski_square,
    sierpinski_carpet,
    terdragon,
    pentadendrite,
    icy,
    round_star,
    penrose_tiling,
    penrose_snowflake,
    bush,
    pentigree,
    weed
];

let i = 0;
function draw() {
    background(220);
    lsystems[i]();
    i = (i + 1) % lsystems.length;
}

function tree1() {
    translate(width / 2, height);
    rotate(-90);

    const length = 5;
    const angle = 30;
    const n = 6;
    const lines = lsystemTurtle(
        'X', 
        {
          'X': 'F[+X][-X]',
          'F': 'FF'
        }, 
        length, angle, n, 'X'
    );
    
    drawLines(lines);   
}

function tree2() {
    translate(width / 2, height);
    rotate(-90);

    const length = 10;
    const angle = 25;
    const n = 4;
    const lines = lsystemTurtle(
        'X', 
        {
          'X': 'F+[[X]-X]-F[-FX]+X',
          'F': 'FF'
        }, 
        length, angle, n, 'X'
    );
    
    drawLines(lines);
}

function koch_curve() {
    translate(0, height * 0.65);
    rotate(-30);

    const length = 2;
    const angle = 60;
    const n = 5;
    const lines = lsystemTurtle(
        'F', 
        {
          'F': 'F-F++F-F',
        }, 
        length, angle, n
    );
    
    drawLines(lines);
}

function koch_curve_3() {
    translate(width * 0.8, height * 0.6);

    const length = 15;
    const angle = 90;
    const n = 3;
    const lines = lsystemTurtle(
        'F-F-F-F', 
        {
          'F': 'FF-F+F-F-FF',
        }, 
        length, angle, n
    );
    
    drawLines(lines);
}

function koch_snowflake() {
    translate(width * 0.2, height * 0.65);

    const length = 3;
    const angle = 60;
    const n = 4;
    const lines = lsystemTurtle(
        'F++F++F', 
        {
          'F': 'F-F++F-F',
        }, 
        length, angle, n
    );
    
    drawLines(lines);
}

function koch_quadratic() {
    translate(width * 0.55, height * 0.15);

    const length = 6;
    const angle = 90;
    const n = 3;
    const lines = lsystemTurtle(
        'F-F-F-F', 
        {
          'F': 'FF-F-F-F-F-F+F',
        }, 
        length, angle, n
    );
    
    drawLines(lines);
}

function koch_quadratic_type1() {
    translate(width * 0.175, height * 0.35);

    const length = 10;
    const angle = 90;
    const n = 3;
    const lines = lsystemTurtle(
        'F', 
        {
          'F': 'F-F+F+F-F',
        }, 
        length, angle, n
    );
    
    drawLines(lines);
}

function koch_quadratic_type2() {
    translate(width * 0.15, height * 0.45);

    const length = 5;
    const angle = 90;
    const n = 3;
    const lines = lsystemTurtle(
        'F', 
        {
          'F': 'F-F+F+FF-F-F+F',
        }, 
        length, angle, n
    );
    
    drawLines(lines);
}

function koch_star() {
    translate(width * 0.1, height * 0.8);

    const length = 4;
    const angle = 60;
    const n = 4;
    const lines = lsystemTurtle(
        'F++F++F', 
        {
          'F': 'F+F--F+F',
        }, 
        length, angle, n
    );
    
    drawLines(lines);
}

function dragon_curve() {
    translate(width * 0.4, height * 0.7);

    const length = 6;
    const angle = 90;
    const n = 10;
    const lines = lsystemTurtle(
        'FX', 
        {
          'X': 'X+YF+',
          'Y': '-FX-Y'
        }, 
        length, angle, n
    );
    
    drawLines(lines);
}

function twin_dragon_curve() {
    translate(width * 0.4, height * 0.5);

    const length = 8;
    const angle = 90;
    const n = 8;
    const lines = lsystemTurtle(
        'FX+FX', 
        {
          'X': 'X+YF',
          'Y': 'FX-Y'
        }, 
        length, angle, n
    );
    
    drawLines(lines);
}

function hilbert_curve() {
    translate(width * 0.2, height * 0.2);

    const length = 8;
    const angle = 90;
    const n = 5;
    const lines = lsystemTurtle(
        'A', 
        {
          'A': '-BF+AFA+FB-',
          'B': '+AF-BFB-FA+'
        }, 
        length, angle, n
    );
    
    drawLines(lines);
}

function moore_curve() {
    translate(width * 0.2, height * 0.5);

    const length = 8;
    const angle = 90;
    const n = 4;
    const lines = lsystemTurtle(
        'LFL+F+LFL', 
        {
          'L': '-RF+LFL+FR-',
          'R': '+LF-RFR-FL+'
        }, 
        length, angle, n
    );
    
    drawLines(lines);
}

function peano_curve() {
    translate(width * 0.25, height * 0.25);

    const length = 8;
    const angle = 90;
    const n = 3;
    const lines = lsystemTurtle(
        'L', 
        {
          'L': 'LFRFL-F-RFLFR+F+LFRFL',
          'R': 'RFLFR+F+LFRFL-F-RFLFR'
        }, 
        length, angle, n
    );
    
    drawLines(lines);
}

function gosper_curve() {
    translate(width * 0.625, height * 0.1);

    const length = 6;
    const angle = 60;
    const n = 4;
    const lines = lsystemTurtle(
        'A', 
        {
          'A': 'A-B--B+A++AA+B-',
          'B': '+A-BB--B-A++A+B'
        }, 
        length, angle, n, 'AB'
    );
    
    drawLines(lines);
}

function gosper_star() {
    translate(width * 0.35, height * 0.4);

    const length = 8;
    const angle = 60;
    const n = 2;
    const lines = lsystemTurtle(
        'X-X-X-X-X-X', 
        {
          'X': 'FX+YF++YF-FX--FXFX-YF+',
          'Y': '-FX+YFYF++YF+FX--FX-FY'
        }, 
        length, angle, n
    );
    
    drawLines(lines);   
}

function gosper_star() {
    translate(width * 0.35, height * 0.4);

    const length = 8;
    const angle = 60;
    const n = 2;
    const lines = lsystemTurtle(
        'X-X-X-X-X-X', 
        {
          'X': 'FX+YF++YF-FX--FXFX-YF+',
          'Y': '-FX+YFYF++YF+FX--FX-FY'
        }, 
        length, angle, n
    );
    
    drawLines(lines);   
}

function levy_c_curve() {
    translate(width * 0.35, height * 0.6);

    const length = 8;
    const angle = 45;
    const n = 8;
    const lines = lsystemTurtle(
        'F', 
        {
          'F': '+F--F+',
        }, 
        length, angle, n
    );
    
    drawLines(lines);   
}

function island_curve() {
    translate(width * 0.225, height * 0.225);

    const length = 6;
    const angle = 90;
    const n = 2;
    const lines = lsystemTurtle(
        'F-F-F-F', 
        {
          'F': 'F-f+FF-F-FF-Ff-FF+f-FF+F+FF+Ff+FFF',
          'f': 'ffffff'
        }, 
        length, angle, n
    );
    
    drawLines(lines);   
}

function sierpinski_triangle() {
    translate(width * 0.2, height * 0.25);

    const length = 8;
    const angle = 120;
    const n = 5;
    const lines = lsystemTurtle(
        'F-G-G', 
        {
          'F': 'F-G+F+G-F',
          'G': 'GG'
        }, 
        length, angle, n, 'G'
    );
    
    drawLines(lines);   
}

function sierpinski_arrowhead() {
    translate(width * 0.1, height * 0.2);

    const length = 5;
    const angle = 60;
    const n = 6;
    const lines = lsystemTurtle(
        'XF', 
        {
          'X': 'YF+XF+Y',
          'Y': 'XF-YF-X'
        }, 
        length, angle, n
    );
    
    drawLines(lines);   
}

function sierpinski_square() {
    translate(width * 0.15, height * 0.475);

    const length = 8;
    const angle = 45;
    const n = 8;
    const lines = lsystemTurtle(
        'L--F--L--F', 
        {
          'L': '+R-F-R+',
          'R': '-L+F+L-'
        }, 
        length, angle, n
    );
    
    drawLines(lines);   
}

function sierpinski_carpet() {
    translate(width * 0.1, height * 0.5);

    const length = 4;
    const angle = 90;
    const n = 4;
    const lines = lsystemTurtle(
        'F', 
        {
          'F': 'F+F-F-F-G+F+F+F-F',
          'G': 'GGG'
        }, 
        length, angle, n, 'G'
    );
    
    drawLines(lines);   
}

function terdragon() {
    translate(width * 0.85, height * 0.5);

    const length = 10;
    const angle = 120;
    const n = 6;
    const lines = lsystemTurtle(
        'F', 
        {
          'F': 'F+F-F',
        }, 
        length, angle, n
    );
    
    drawLines(lines);   
}

function pentadendrite() {
    translate(width * 0.45, height * 0.25);

    const length = 15;
    const angle = 72;
    const n = 2;
    const lines = lsystemTurtle(
        'F-F-F-F-F', 
        {
          'F': 'F-F-F++F+F-F',
        }, 
        length, angle, n
    );
    
    drawLines(lines);   
}

function icy() {
    translate(width * 0.175, height * 0.85);

    const length = 10;
    const angle = 90;
    const n = 3;
    const lines = lsystemTurtle(
        'F+F+F+F', 
        {
          'F': 'FF+F++F+F',
        }, 
        length, angle, n
    );
    
    drawLines(lines);   
}

function round_star() {
    translate(width * 0.25, height * 0.6);

    const length = 200;
    const angle = 77;
    const n = 6;
    const lines = lsystemTurtle(
        'F', 
        {
          'F': 'F++F',
        }, 
        length, angle, n
    );
    
    drawLines(lines);   
}

function penrose_tiling() {
    translate(width * 0.5, height * 0.5);

    const length = 15;
    const angle = 36;
    const n = 4;
    const lines = lsystemTurtle(
        '[7]++[7]++[7]++[7]++[7]', 
        {
          '6': '81++91----71[-81----61]++',
          '7': '+81--91[---61--71]+',
          '8': '-61++71[+++81++91]-',
          '9': '--81++++61[+91++++71]--71'
        }, 
        length, angle, n, '6789'
    );
    
    drawLines(lines);   
}

function penrose_snowflake() {
    translate(width * 0.3, height * 0.2);

    const length = 10;
    const angle = 18;
    const n = 3;
    const lines = lsystemTurtle(
        'F----F----F----F----F', 
        {
          'F': 'F----F----F----------F++F----F',
        }, 
        length, angle, n, '6789'
    );
    
    drawLines(lines);   
}

function bush() {
    translate(width * 0.75, height * 0.75);

    const length = 12;
    const angle = 36;
    const n = 3;
    const lines = lsystemTurtle(
        '++++F', 
        {
          'F': 'FF-[-F+F+F]+[+F-F-F]',
        }, 
        length, angle, n
    );
    
    drawLines(lines);   
}

function pentigree() {
    translate(width * 0.3, height * 0.8);

    const length = 10;
    const angle = 72;
    const n = 3;
    const lines = lsystemTurtle(
        'F-F-F-F-F', 
        {
          'F': 'F-F++F+F-F-F',
        }, 
        length, angle, n
    );
    
    drawLines(lines);   
}

function weed() {
    translate(width * 0.5, height);
    rotate(-90);

    const length = 3;
    const angle = 22.5;
    const n = 6;
    const lines = lsystemTurtle(
        'F', 
        {
          'F': 'FF-[XY]+[XY]',
          'X': '+FY',
          'Y': '-FX',
        }, 
        length, angle, n
    );
    
    drawLines(lines);   
}

function drawLines(lines) {
    for(let i = 0; i < lines.length; i++) {
        const {from, to} = lines[i];
        line(from.x, from.y, to.x, to.y);
    }
}

// length 是每次前進的長度
// angle 是每次轉的角度
// forwardSymbols 指定了也用來代表 F 的符號
function lsystemTurtle(axiom, rules, length, angle, n, forwardSymbols = '') {
    let symbols = Array.from(lsystem(axiom, rules, n));
    if(forwardSymbols.length > 0) {
        symbols = symbols.map(symbol => forwardSymbols.includes(symbol) ? 'F' : symbol);
    }
    
    const t = new Turtle();
    const lines = [];
    for(let i = 0; i < symbols.length; i++) {
        switch(symbols[i]) {
            case 'F': //  前進並畫線
                lines.push(t.forward(length)); break;
            case 'f': //  前進不畫線
                t.forward(length); break;
            case '+': //  左轉
                t.turn(-angle); break;
            case '-': //  右轉
                t.turn(angle); break;
            case '|': //  轉向
                t.reverse(); break;
            case '[': // 將目前狀態置入堆疊
                t.push(); break;
            case ']': // 取出堆疊頂的狀態
                t.pop(); break;
        }
    }
    
    return lines;
}

function lsystem(axiom, rules, n) {
    // 若變數符合規則，進行生成，否則直接傳回變數
    function produceOne(variable, rules) {
        if(rules[variable]) {
            return Array.from(rules[variable]);
        }
        return [variable];
    }

    // 依指定次數生成
    function produceAll(axiom, rules, n) {
        let symbols = Array.from(axiom); // 為了利用 Array 的 flatMap 方法
        for(let i = 0; i < n; i++) {
            symbols = symbols.flatMap(symbol => produceOne(symbol, rules));
        }
        return symbols;
    }

    return produceAll(axiom, rules, n).join('');
}

class Turtle {
    // 起始位置 (x, y) 與頭面向的角度
    constructor(x = 0, y = 0, angle = 0) {
        this.coordinateVector = createVector(x, y);
        this.headingVector = createVector(1, 0).rotate(angle);
        this.state = [];
    }

    // 傳回座標
    coordinate() {
        return {
            x: this.coordinateVector.x,
            y: this.coordinateVector.y
        };
    }

    // 前進，為了便於繪圖，傳回起點與終點座標
    forward(length) {
        const from = this.coordinate();

        const v = p5.Vector.mult(this.headingVector, length);
        this.coordinateVector.add(v);

        const to = this.coordinate();

        return {from, to};
    }

    // 轉彎
    turn(angle) {
        this.headingVector.rotate(angle);
    }

    // 將目前狀態置入堆疊
    push() {
        this.state.push(new Turtle(
            this.coordinateVector.x,
            this.coordinateVector.y,
            this.headingVector.heading()
        ));
    }

    // 將堆疊頂的第一個狀態彈出，作為目前海龜狀態  
    pop() {
        const t = this.state.pop();
        this.coordinateVector = t.coordinateVector;
        this.headingVector = t.headingVector;
    }
    
    // 轉向
    reverse() {
        this.headingVector.mult(-1);
    }
}   