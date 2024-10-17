// 获取画布元素并设置尺寸
const mini2_canvas = document.getElementById('minigame2_world');
mini2_canvas.style.width = '66vw';
mini2_canvas.style.height = (66 * 2 * 0.707) + 'vw';  // 高度为宽度的两倍乘以0.707

const mini2_pixelRatio = window.devicePixelRatio;  // 获取设备的像素比

// 定义画布宽高变量
let mini2_width = window.innerWidth * 0.66;
let mini2_height = mini2_width * 2 * 0.707;

mini2_canvas.width = mini2_width;
mini2_canvas.height = mini2_height;

// 获取Matter.js的模块
const { Engine: mini2_Engine, Render: mini2_Render, Runner: mini2_Runner, World: mini2_World, Bodies: mini2_Bodies, Events: mini2_Events } = Matter;

// 创建引擎、渲染器和世界
const mini2_engine = mini2_Engine.create();
const mini2_world = mini2_engine.world;

const mini2_render = mini2_Render.create({
    canvas: mini2_canvas,
    engine: mini2_engine,
    options: {
        width: mini2_canvas.width,
        height: mini2_canvas.height,
        wireframes: false,
        background: 'transparent',
        pixelRatio: mini2_pixelRatio
    }
});

// 运行引擎和渲染器
mini2_Engine.run(mini2_engine);
mini2_Render.run(mini2_render);

// 创建Runner
const mini2_runner = mini2_Runner.create();
mini2_Runner.run(mini2_runner, mini2_engine);

// 定义墙壁和矩形的变量
let mini2_topWall, mini2_bottomWall, mini2_leftWall, mini2_rightWall;
let mini2_rectangle;
let leftRect, rightRect;

// 创建墙壁的函数
function createWalls() {
    const mini2_wallThickness = 10;

    mini2_topWall = mini2_Bodies.rectangle(mini2_width / 2, 0, mini2_width, mini2_wallThickness, {
        isStatic: true,
        restitution: 0.98,
        render: { fillStyle: 'transparent' }
    });

    mini2_bottomWall = mini2_Bodies.rectangle(mini2_width / 2, mini2_height, mini2_width, mini2_wallThickness, {
        isStatic: true,
        restitution: 0.98,
        render: { fillStyle: 'transparent' }
    });

    mini2_leftWall = mini2_Bodies.rectangle(0, mini2_height / 2, mini2_wallThickness, mini2_height, {
        isStatic: true,
        restitution: 0.98,
        render: { fillStyle: 'transparent' }
    });

    mini2_rightWall = mini2_Bodies.rectangle(mini2_width, mini2_height / 2, mini2_wallThickness, mini2_height, {
        isStatic: true,
        restitution: 0.98,
        render: { fillStyle: 'transparent' }
    });

    return [mini2_topWall, mini2_bottomWall, mini2_leftWall, mini2_rightWall];
}

// 创建主矩形的函数
function createMainRectangle() {
    const rectWidth = mini2_width * 0.556;
    const rectHeight = mini2_height * 0.015;
    const rectX = mini2_width / 2;
    const rectY = mini2_height - (mini2_height * 0.058);

    return mini2_Bodies.rectangle(rectX, rectY, rectWidth, rectHeight, {
        isStatic: true,
        restitution: 0.98,
        render: { fillStyle: 'transparent' }
    });
}

// 创建倾斜矩形的函数
function createInclinedRectangles() {
    const angle = 1.820;  // 弧度值约等于30°
    const smallRectWidth = mini2_width * 0.26;
    const smallRectHeight = mini2_height * 0.035;
    const rectWidth = mini2_width * 0.556;
    const rectX = mini2_width / 2;
    const rectY = mini2_height - (mini2_height * 0.058);
    const offsetX = rectWidth / 2;

    const leftRectX = rectX - offsetX - mini2_width * 0.06;
    leftRect = mini2_Bodies.rectangle(leftRectX, rectY - mini2_height * 0.1, smallRectWidth, smallRectHeight, {
        angle: -angle,
        isStatic: true,
        restitution: 0.98,
        render: { fillStyle: 'transparent' }
    });

    const rightRectX = rectX + offsetX + mini2_width * 0.06;
    rightRect = mini2_Bodies.rectangle(rightRectX, rectY - mini2_height * 0.1, smallRectWidth, smallRectHeight, {
        angle: angle,
        isStatic: true,
        restitution: 0.98,
        render: { fillStyle: 'transparent' }
    });

    return [leftRect, rightRect];
}

// 创建并添加墙壁和矩形
let walls = createWalls();
mini2_World.add(mini2_world, walls);

mini2_rectangle = createMainRectangle();
mini2_World.add(mini2_world, mini2_rectangle);

[leftRect, rightRect] = createInclinedRectangles();
mini2_World.add(mini2_world, [leftRect, rightRect]);

// 选择所有按钮并定义存储的变量
const mini2_buttons = document.querySelectorAll('.minigame2buttons');
const mini2_boxes = [];
const mini2_valueToText = {};

// 为每个按钮添加点击事件
mini2_buttons.forEach(button => {
    button.addEventListener('click', () => {
        const buttonRect = button.getBoundingClientRect();
        const buttonWidth = buttonRect.width;
        const buttonHeight = buttonRect.height;
        const buttonText = button.innerText;

        const mini2_buttonBody = mini2_Bodies.rectangle(mini2_width * 0.64, mini2_height * 0.2, buttonWidth, buttonHeight, {
            chamfer: { radius: 20 },
            restitution: 0.98,
            render: { fillStyle: '#2D6A4F' }
        });

        mini2_World.add(mini2_world, mini2_buttonBody);
        mini2_boxes.push(mini2_buttonBody);
        mini2_valueToText[mini2_buttonBody.id] = buttonText;
    });
});

// 获取渲染器的上下文
const mini2_context = mini2_render.context;

// 在渲染后绘制文本
mini2_Events.on(mini2_render, 'afterRender', function () {
    mini2_context.save();
    mini2_context.font = '18px Lora';
    mini2_context.fillStyle = '#D8F3DC';
    mini2_context.textAlign = 'center';
    mini2_context.textBaseline = 'middle';

    mini2_boxes.forEach(box => {
        mini2_context.save();
        mini2_context.translate(box.position.x, box.position.y);
        mini2_context.rotate(box.angle);

        const word = mini2_valueToText[box.id] || '';
        mini2_context.fillText(word, 0, 0);

        mini2_context.restore();
    });
    mini2_context.restore();
});

// 定义防抖函数
function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// 在窗口大小变化时，重新调整尺寸
window.addEventListener('resize', debounce(() => {
    // 移除旧的墙壁和矩形
    Matter.World.remove(mini2_world, walls);
    Matter.World.remove(mini2_world, mini2_rectangle);
    Matter.World.remove(mini2_world, [leftRect, rightRect]);

    // 更新画布尺寸
    mini2_width = window.innerWidth * 0.66;
    mini2_height = mini2_width * 2 * 0.707;
    Matter.Render.setSize(mini2_render, mini2_width, mini2_height);

    // 重新创建墙壁和矩形
    walls = createWalls();
    mini2_World.add(mini2_world, walls);

    mini2_rectangle = createMainRectangle();
    mini2_World.add(mini2_world, mini2_rectangle);

    [leftRect, rightRect] = createInclinedRectangles();
    mini2_World.add(mini2_world, [leftRect, rightRect]);

    // 调整渲染器的视角
    mini2_Render.lookAt(mini2_render, {
        min: { x: 0, y: 0 },
        max: { x: mini2_width, y: mini2_height }
    });
}, 250));  // 250毫秒的防抖间隔