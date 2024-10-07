const { Engine, Render, Runner, Bodies, Composite, Events, World, Body } = Matter;

// 创建引擎
const engine = Engine.create();
const world = engine.world;

// 画布设置
const canvas = document.getElementById('gameCanvas');
let canvasHeight = 400; // 初始高度
let canvasWidth = window.innerWidth; // 动态获取窗口宽度

const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: canvasWidth,
        height: canvasHeight,
        wireframes: false,  // 禁用线框模式，启用填充和文本渲染
        background: 'transparent'
    }
});

// 游戏状态
let score = 0;
let nextHeightIncreaseThreshold = 300; // 每增加100分时增加高度
const scoreElement = document.getElementById('score');

// 边界变量
let ground, ceiling, leftWall, rightWall;

// 更新分数
function updateScore(value) {
    score += value;
    scoreElement.textContent = score;

    // 检查是否达到了增加高度的阈值
    if (score >= nextHeightIncreaseThreshold) {
        increaseCanvasHeight();
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
            fillStyle: '#34572B',  // 内部填充颜色 (例如：番茄红)
            strokeStyle: '#34572B',  // 边框颜色 (例如：黑色)
            lineWidth: 3            // 边框线宽
        }
    };

    ground = Bodies.rectangle(canvasWidth / 2, canvasHeight + thickness / 2, canvasWidth + 100, thickness, boundaryStyle);
    ceiling = Bodies.rectangle(canvasWidth / 2, -thickness / 2, canvasWidth + 100, thickness, boundaryStyle);
    leftWall = Bodies.rectangle(-thickness / 2, canvasHeight / 2, thickness, canvasHeight + 100, boundaryStyle);
    rightWall = Bodies.rectangle(canvasWidth + thickness / 2, canvasHeight / 2, thickness, canvasHeight + 100, boundaryStyle);

    Composite.add(world, [ground, ceiling, leftWall, rightWall]);
}

// 更新边界当窗口大小变化时
function updateBoundaries() {
    canvasWidth = window.innerWidth;

    // 更新 canvas 宽度
    canvas.width = canvasWidth;
    render.options.width = canvasWidth;
    render.canvas.width = canvasWidth;

    // 更新地板和天花板的位置
    Body.setPosition(ground, { x: canvasWidth / 2 - 200, y: canvasHeight + 25 });
    Body.setPosition(ceiling, { x: canvasWidth / 2 - 200, y: -25 });

    // 更新左右墙的位置
    Body.setPosition(leftWall, { x: -25, y: canvasHeight / 2 });
    Body.setPosition(rightWall, { x: canvasWidth + 25, y: canvasHeight / 2 });

    Body.scale(ground, canvasWidth / ground.bounds.max.x + 0.1, 1);
    Body.scale(ceiling, canvasWidth / ceiling.bounds.max.x + 0.1, 1);

    // 确保物体不会被视为超出边界
    render.bounds.min.x = 0;
    render.bounds.max.x = canvasWidth + 100;  // 向右扩展边界
    render.bounds.min.y = 0;
    render.bounds.max.y = canvasHeight + 5; // 向下扩展边界
}

// 监听窗口大小变化
window.addEventListener('resize', updateBoundaries);

// 初始化方块
const boxSize = 75;
const boxes = [];

// 不同数字的颜色
const colors = {
    1: '#D8F3DC',  // 淡绿色
    2: '#F3D8E7',  // 淡紫色
    4: '#F35A5A',  // 亮红色
    8: '#5A7AF3',  // 亮蓝色
    16: '#F39C5A', // 橙色
    32: '#9C5AF3', // 深紫色
    64: '#F3E45A', // 亮黄色
    128: '#5AF3E0', // 亮青色
    256: '#5A5AF3', // 深蓝色
    512: '#F35A9A', // 亮粉红色
    1024: '#8F8F8F', // 中性灰色
    2048: '#5AF39C' // 青绿色
};

// 映射数字到对应的英文单词，按照给定的顺序和同义词扩展
const valueToText = {
    1: "Try",              // 尝试
    2: "Effort",           // 努力
    4: "Failure",     // 坚持
    8: "Reflection",       // 反思
    16: "Growth",          // 成长
    32: "Persistence",     // 坚持（同义词）
    64: "inspiration",   // 反思（同义词）
    128: "Progress",    // 成长（同义词）
    256: "Perseverance",     // 坚持（同义词）
    512: "Improvement",  // 反思（同义词）
    1024: "Success",   // 成长（同义词）
    2048: "GreatGame",        // 
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
    const factor = shapeFactors[value] || 1.0;  // 根据 value 获取对应的 factor
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
    shape.factor = factor;  // 保存 factor 信息
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

// 检查物体之间的距离
// 检查物体之间的距离，考虑 factor
function areBodiesClose(bodyA, bodyB) {
    const distance = Math.sqrt(Math.pow(bodyA.position.x - bodyB.position.x, 2) +
        Math.pow(bodyA.position.y - bodyB.position.y, 2));
    const combinedSize = (boxSize / 2 * bodyA.factor) + (boxSize / 2 * bodyB.factor);  // 考虑 factor
    return distance < combinedSize;
}

// // 检查物体是否静止
// function isBodyStill(body) {
//     return Math.abs(body.velocity.x) < 0.1 && Math.abs(body.velocity.y) < 0.1;
// }

// 生成新方块
function generateNewBox() {
    const x = Math.random() * (canvasWidth - 100) + 50;
    const y = Math.random() * 300 + 50;
    createShape(x, y, 1);
}

// 控制重力和施加作用力
document.addEventListener('keydown', function (event) {
    const gravityMap = { 'w': [0, -1], 's': [0, 1], 'a': [-1, 0], 'd': [1, 0] };
    if (gravityMap[event.key]) {
        [engine.world.gravity.x, engine.world.gravity.y] = gravityMap[event.key];
        generateNewBox();
    }
});

// 添加窗口大小变化时的反作用力
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;

window.addEventListener('resize', function () {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    const deltaX = newWidth - lastWidth;
    const deltaY = newHeight - lastHeight;

    // 当窗口变大时，施加反方向的力
    if (deltaX !== 0 || deltaY !== 0) {
        boxes.forEach(box => {
            const forceX = (deltaX > 0) ? -0.03 : -0.03;
            const forceY = (deltaY > 0) ? -0.01 : 0.01;

            Body.applyForce(box, box.position, { x: forceX, y: forceY });
        });
    }

    // 更新宽度和高度
    lastWidth = newWidth;
    lastHeight = newHeight;
});

// 获取 canvas 的 2D 上下文，用于手动绘制文字
const context = render.context;

// 手动绘制文字
Events.on(render, 'afterRender', function () {
    boxes.forEach(box => {
        context.font = '12px Arial';  // 设置字体
        context.fillStyle = 'black';  // 设置文字颜色

        // 获取物体的位置
        const x = box.position.x;
        const y = box.position.y;

        // 获取物体的值，并映射到相应的单词
        const word = valueToText[box.value] || box.value.toString();

        // 绘制文本，居中显示
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(word, x, y);  // 在物体的中心绘制单词
    });
});


// 初始化游戏
createBoundaries();
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);