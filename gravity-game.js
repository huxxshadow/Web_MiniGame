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
        wireframes: false,
        background: '#fafafa'
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
    Body.setPosition(ground, { x: canvasWidth / 2, y: canvasHeight + 25 });
    // 更新左右墙的高度
    Body.setPosition(leftWall, { x: -25, y: canvasHeight / 2 });
    Body.setPosition(rightWall, { x: canvasWidth + 25, y: canvasHeight / 2 });

    // 拉长左右墙的高度
    Body.scale(leftWall, 1, (canvasHeight + 50) / leftWall.bounds.max.y);
    Body.scale(rightWall, 1, (canvasHeight + 50) / rightWall.bounds.max.y);
}

// 创建边界
function createBoundaries() {
    const thickness = 50;

    ground = Bodies.rectangle(canvasWidth / 2, canvasHeight + thickness / 2, canvasWidth + 100, thickness, { isStatic: true });
    ceiling = Bodies.rectangle(canvasWidth / 2, -thickness / 2, canvasWidth + 100, thickness, { isStatic: true });
    leftWall = Bodies.rectangle(-thickness / 2, canvasHeight / 2, thickness, canvasHeight + 100, { isStatic: true });
    rightWall = Bodies.rectangle(canvasWidth + thickness / 2, canvasHeight / 2, thickness, canvasHeight + 100, { isStatic: true });

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

    // 更新左右墙的宽度
    Body.scale(ground, canvasWidth / ground.bounds.max.x, 1);
    Body.scale(ceiling, canvasWidth / ceiling.bounds.max.x, 1);

    // 确保物体不会被视为超出边界
    render.bounds.min.x = 0;
    render.bounds.max.x = canvasWidth + 100;  // 向右扩展边界
    render.bounds.min.y = 0;
    render.bounds.max.y = canvasHeight + 5; // 向下扩展边界
}

// 监听窗口大小变化
window.addEventListener('resize', updateBoundaries);

// 初始化方块
const boxSize = 50;
const boxes = [];

// 不同数字的颜色
const colors = {
    1: '#FF5733',
    2: '#33FF57',
    4: '#3357FF',
    8: '#FF33A6',
    16: '#33FFF3',
    32: '#FF8C33',
    64: '#9D33FF',
    128: '#FFC300',
    256: '#FF5733',
    512: '#33FF57',
    1024: '#3357FF',
    2048: '#FF33A6'
};

// 根据数字生成不同的形状
function createShape(x, y, value = 1) {
    let shape;
    let options = {
        label: value.toString(),
        restitution: 0.7,
        render: {
            fillStyle: colors[value] || '#FFAA33',
            text: {
                content: value.toString(),
                size: 24,
                color: 'black',
                align: 'center'
            }
        }
    };

    switch (value) {
        case 1:
            shape = Bodies.circle(x, y, boxSize / 2, options);
            break;
        case 2:
            shape = Bodies.rectangle(x, y, boxSize, boxSize, options);
            break;
        case 4:
            shape = Bodies.polygon(x, y, 3, boxSize / 2, options);
            break;
        case 8:
            shape = Bodies.polygon(x, y, 5, boxSize / 2, options);
            break;
        case 16:
            shape = Bodies.polygon(x, y, 6, boxSize / 2, options);
            break;
        case 32:
            shape = Bodies.polygon(x, y, 8, boxSize / 2, options);
            break;
        case 64:
            shape = Bodies.polygon(x, y, 10, boxSize / 2, options);
            break;
        case 128:
            shape = Bodies.polygon(x, y, 12, boxSize / 2, options);
            break;
        case 256:
            shape = Bodies.polygon(x, y, 14, boxSize / 2, options);
            break;
        case 512:
            shape = Bodies.polygon(x, y, 16, boxSize / 2, options);
            break;
        case 1024:
            shape = Bodies.circle(x, y, boxSize, options);
            break;
        case 2048:
            shape = Bodies.polygon(x, y, 18, boxSize / 2, options);
            break;
        default:
            shape = Bodies.rectangle(x, y, boxSize, boxSize, options);
    }

    shape.value = value;
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

            if (bodyA.value === bodyB.value && areBodiesClose(bodyA, bodyB) && isBodyStill(bodyA) && isBodyStill(bodyB)) {
                mergeBoxes(bodyA, bodyB);
                boxes.splice(j, 1);
                boxes.splice(i, 1);
                break;
            }
        }
    }
});

// 检查物体之间的距离
function areBodiesClose(bodyA, bodyB) {
    const distance = Math.sqrt(Math.pow(bodyA.position.x - bodyB.position.x, 2) +
        Math.pow(bodyA.position.y - bodyB.position.y, 2));
    return distance < boxSize;
}

// 检查物体是否静止
function isBodyStill(body) {
    return Math.abs(body.velocity.x) < 0.1 && Math.abs(body.velocity.y) < 0.1;
}

// 生成新方块
function generateNewBox() {
    const x = Math.random() * (canvasWidth - 100) + 50;
    const y = Math.random() * 300 + 50;
    createShape(x, y, 1);
}

// 控制重力和施加作用力
document.addEventListener('keydown', function (event) {
    switch (event.key.toLowerCase()) {
        case 'w':
            engine.world.gravity.x = 0;
            engine.world.gravity.y = -1;
            generateNewBox();  // 按下W时生成新方块
            break;
        case 's':
            engine.world.gravity.x = 0;
            engine.world.gravity.y = 1;
            generateNewBox();  // 按下S时生成新方块
            break;
        case 'a':
            engine.world.gravity.x = -1;
            engine.world.gravity.y = 0;
            generateNewBox();  // 按下A时生成新方块
            break;
        case 'd':
            engine.world.gravity.x = 1;
            engine.world.gravity.y = 0;
            generateNewBox();  // 按下D时生成新方块
            break;
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

// 初始化游戏
createBoundaries();
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);