const { Engine, Render, Runner, Bodies, Composite, Events, World, Body } = Matter;

// 创建引擎
let engine = Engine.create();
let world = engine.world;
let runner;
let render;

// 画布设置
const canvas = document.getElementById('gameCanvas');
let canvasHeight = 400; // 初始高度
let canvasWidth = window.innerWidth; // 动态获取窗口宽度

// 初始化渲染器
function initializeRender() {

    render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: canvasWidth,
            height: canvasHeight,
            wireframes: false,
            background: 'transparent'
        }
    });









    // 获取 canvas 的 2D 上下文，用于手动绘制文字
    const context = render.context;



    // 手动绘制文字
    Events.on(render, 'afterRender', function () {
        boxes.forEach(box => {
            context.font = '12px Arial';
            context.fillStyle = 'black';

            const x = box.position.x;
            const y = box.position.y;
            const word = valueToText[box.value] || box.value.toString();

            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(word, x, y);
        });
    });



    // 检查是否有两个物体可以合并
    Events.on(engine, 'beforeUpdate', function () {
        for (let i = 0; i < boxes.length; i++) {
            for (let j = i + 1; j < boxes.length; j++) {
                const bodyA = boxes[i];
                const bodyB = boxes[j];

                if (bodyA.value === bodyB.value && areBodiesClose(bodyA, bodyB)) {
                    mergeBoxes(bodyA, bodyB);
                    boxes.splice(j, 1);
                    boxes.splice(i, 1);
                    break;
                }
            }
        }
    });
}

// 游戏状态
let score = 0;
let nextHeightIncreaseThreshold = 300; // 每增加100分时增加高度
const scoreElement = document.getElementById('score');

// 边界变量
let ground, ceiling, leftWall, rightWall;

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 更新分数
function updateScore(value) {
    score += value;
    scoreElement.textContent = score;

    // 检查是否达到了增加高度的阈值
    if (score >= nextHeightIncreaseThreshold) {
        // increaseCanvasHeight();
        nextHeightIncreaseThreshold += 300; // 下一个阈值
    }
}

// 增加画布高度并调整边界
function increaseCanvasHeight() {
    canvasHeight += 5;
    render.bounds.max.y = canvasHeight;
    canvas.height = canvasHeight;
    render.options.height = canvasHeight;
    render.canvas.height = canvasHeight;
    Render.setPixelRatio(render, window.devicePixelRatio);

    // 移动底部边界（地板）
    Body.setPosition(ground, { x: canvasWidth / 2 + 50, y: canvasHeight + 25 });
    // 更新左右墙的高度
    Body.setPosition(leftWall, { x: -25, y: canvasHeight / 2 });
    Body.setPosition(rightWall, { x: canvasWidth + 25, y: canvasHeight / 2 });

    // 拉长左右墙的高度
    Body.scale(leftWall, 1, (canvasHeight + 50) / leftWall.bounds.max.y) + 0.1;
    Body.scale(rightWall, 1, (canvasHeight + 50) / rightWall.bounds.max.y) + 0.1;
}

// 创建边界
function createBoundaries() {
    const thickness = 50;

    // 添加 render 属性，用于改变边界的颜色
    const boundaryStyle = {
        isStatic: true,
        render: {
            fillStyle: '#34572B',  // 内部填充颜色
            strokeStyle: '#34572B',  // 边框颜色
            lineWidth: 3            // 边框线宽
        }
    };

    ground = Bodies.rectangle(canvasWidth / 2, canvasHeight + thickness / 2, canvasWidth + 100, thickness, boundaryStyle);
    ceiling = Bodies.rectangle(canvasWidth / 2, -thickness / 2, canvasWidth + 100, thickness, boundaryStyle);
    leftWall = Bodies.rectangle(-thickness / 2, canvasHeight / 2, thickness, canvasHeight + 100, boundaryStyle);
    rightWall = Bodies.rectangle(canvasWidth + thickness / 2, canvasHeight / 2, thickness, canvasHeight + 100, boundaryStyle);

    Composite.add(world, [ground, ceiling, leftWall, rightWall]);
}




// 添加一个标志变量来跟踪resize是否正在处理中
let isResizing = false;

// 处理窗口大小变化
function handleResize() {
    // 如果已经在处理resize，则直接返回
    if (isResizing) {
        return;
    }

    // 设置标志为正在处理
    isResizing = true;

    try {

        const bodies = Composite.allBodies(world);
        bodies.forEach(body => {
            Body.setVelocity(body, { x: 0, y: 0 });
            Body.setAngularVelocity(body, 0);
        }, 500);

        // 停止当前的物理引擎和渲染器
        Runner.stop(runner);
        Render.stop(render);

        // 清除现有的物理世界
        World.clear(world);
        Engine.clear(engine);

        // 创建新的引擎和世界
        engine = Engine.create();
        world = engine.world;

        // 更新画布尺寸
        canvasWidth = window.innerWidth;

        // 重新初始化渲染器
        initializeRender();

        // 重新创建边界
        createBoundaries();

        // 清空并重建方块数组
        boxes.length = 0;

        // 重新启动物理引擎和渲染器
        runner = Runner.create();
        Runner.run(runner, engine);
        Render.run(render);

        // 更新上次的尺寸
        lastWidth = window.innerWidth;
        lastHeight = window.innerHeight;


        render.canvas.width = canvasWidth;
        render.canvas.height = canvasHeight;
        // 更新渲染器视口
        Render.lookAt(render, {
            min: { x: 0, y: 0 },
            max: { x: canvasWidth, y: canvasHeight }
        });
    } finally {
        // 确保一定时间后才允许下一次resize
        setTimeout(() => {
            isResizing = false;
        }, 300);
    }
}



// 创建防抖后的resize处理函数
const debouncedResize = debounce(handleResize, 1000);

// 监听窗口大小变化
window.addEventListener('resize', debouncedResize);

// 初始化方块
const boxSize = 75;
const boxes = [];

// 不同数字的颜色
const colors = {
    1: '#D8F3DC',
    2: '#F3D8E7',
    4: '#F35A5A',
    8: '#5A7AF3',
    16: '#F39C5A',
    32: '#9C5AF3',
    64: '#F3E45A',
    128: '#5AF3E0',
    256: '#5A5AF3',
    512: '#F35A9A',
    1024: '#8F8F8F',
    2048: '#5AF39C'
};

// 映射数字到对应的英文单词
const valueToText = {
    1: "Try",
    2: "Effort",
    4: "Failure",
    8: "Reflection",
    16: "Growth",
    32: "Persistence",
    64: "inspiration",
    128: "Progress",
    256: "Perseverance",
    512: "Improvement",
    1024: "Success",
    2048: "GreatGame",
    default: "GreatGame"
};

// 构造不同形状的大小乘数 factor
const shapeFactors = {
    1: 0.7,
    2: 1,
    4: 1.2,
    8: 1.4,
    16: 1.5,
    32: 1.6,
    64: 1.7,
    128: 1.8,
    256: 1.9,
    512: 2.0,
    1024: 2.1,
    2048: 2.2
};

// 创建形状
function createShape(x, y, value = 1) {
    let shape;
    const factor = shapeFactors[value] || 1.0;
    let options = {
        label: value.toString(),
        restitution: 0.7,
        render: {
            fillStyle: colors[value] || '#FFAA33',
            text: {
                content: valueToText[value] || value.toString(),
                size: 24,
                color: '#34572B',
                align: 'center'
            }
        }
    };

    switch (value) {
        case 1:
            shape = Bodies.circle(x, y, boxSize / 2 * factor, options);
            break;
        case 2:
            shape = Bodies.rectangle(x, y, boxSize * factor, boxSize * factor, options);
            break;
        case 4:
            shape = Bodies.polygon(x, y, 3, boxSize / 2 * factor, options);
            break;
        case 8:
            shape = Bodies.polygon(x, y, 5, boxSize / 2 * factor, options);
            break;
        case 16:
            shape = Bodies.polygon(x, y, 6, boxSize / 2 * factor, options);
            break;
        case 32:
            shape = Bodies.polygon(x, y, 8, boxSize / 2 * factor, options);
            break;
        case 64:
            shape = Bodies.polygon(x, y, 10, boxSize / 2 * factor, options);
            break;
        case 128:
            shape = Bodies.polygon(x, y, 12, boxSize / 2 * factor, options);
            break;
        case 256:
            shape = Bodies.polygon(x, y, 14, boxSize / 2 * factor, options);
            break;
        case 512:
            shape = Bodies.polygon(x, y, 16, boxSize / 2 * factor, options);
            break;
        case 1024:
            shape = Bodies.circle(x, y, boxSize / 2 * factor, options);
            break;
        case 2048:
            shape = Bodies.polygon(x, y, 18, boxSize / 2 * factor, options);
            break;
        default:
            shape = Bodies.rectangle(x, y, boxSize * factor, boxSize * factor, options);
    }

    shape.value = value;
    shape.factor = factor;
    boxes.push(shape);
    Composite.add(world, shape);
    return shape;
}

// 合并两个方块
function mergeBoxes(boxA, boxB) {
    const newValue = boxA.value * 2;
    const newBox = createShape((boxA.position.x + boxB.position.x) / 2, (boxA.position.y + boxB.position.y) / 2, newValue);
    Composite.remove(world, boxA);
    Composite.remove(world, boxB);
    updateScore(newValue);
}



// 检查物体之间的距离，考虑 factor
function areBodiesClose(bodyA, bodyB) {
    const distance = Math.sqrt(Math.pow(bodyA.position.x - bodyB.position.x, 2) +
        Math.pow(bodyA.position.y - bodyB.position.y, 2));
    const combinedSize = (boxSize / 2 * bodyA.factor) + (boxSize / 2 * bodyB.factor);
    return distance < combinedSize;
}

// 生成新方块
function generateNewBox() {
    const x = Math.random() * (canvasWidth - 100) + 50;
    const y = Math.random() * 300 + 50;
    createShape(x, y, 1);
}

document.addEventListener('keydown', function (event) {
    const gravityMap = {
        'w': [0, -1],
        'W': [0, -1], 
        's': [0, 1],
        'S': [0, 1],
        'a': [-1, 0], 
        'A': [-1, 0],
        'd': [1, 0],
        'D': [1, 0],
    };
    
    if (gravityMap[event.key]) {
        [engine.world.gravity.x, engine.world.gravity.y] = gravityMap[event.key];
        generateNewBox();
    }
});

// 记录上一次的窗口尺寸
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;





// 初始化游戏
initializeRender();

createBoundaries();
Render.run(render);
runner = Runner.create();
Runner.run(runner, engine);