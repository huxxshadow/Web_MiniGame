// 设置画布的尺寸
const mini2_canvas = document.getElementById('minigame2_world');
const mini2_pixelRatio = window.devicePixelRatio;
const widthFactor = 0.40;
const heightFactor = 0.50;

// 缓存频繁使用的值
let mini2_width = window.innerWidth * widthFactor;
let mini2_height = window.innerWidth * heightFactor;

mini2_canvas.width = mini2_width;
mini2_canvas.height = mini2_height;

const { Engine: mini2_Engine, Render: mini2_Render, Runner: mini2_Runner, World: mini2_World, Bodies: mini2_Bodies } = Matter;

const mini2_engine = mini2_Engine.create();
const mini2_world = mini2_engine.world;

// 创建渲染器配置对象
const renderOptions = {
    canvas: mini2_canvas,
    engine: mini2_engine,
    options: {
        width: mini2_canvas.width,
        height: mini2_canvas.height,
        wireframes: false,
        background: 'transparent',
        pixelRatio: mini2_pixelRatio
    }
};

const mini2_render = mini2_Render.create(renderOptions);

// 使用 requestAnimationFrame 优化渲染
Matter.Runner.run(mini2_engine);
let renderRequestId;

function optimizedRender() {
    mini2_Render.world(mini2_render);
    renderRequestId = requestAnimationFrame(optimizedRender);
}
optimizedRender();

const mini2_runner = mini2_Runner.create();
mini2_Runner.run(mini2_runner, mini2_engine);

// 创建边界的通用配置
const mini2_wallThickness = 10;
const wallConfig = {
    isStatic: true,
    restitution: 0.98,
    render: {
        fillStyle: 'transparent'
    }
};

// 创建边界
const mini2_topWall = mini2_Bodies.rectangle(mini2_width / 2, 0, mini2_width, mini2_wallThickness, wallConfig);
const mini2_bottomWall = mini2_Bodies.rectangle(mini2_width / 2, mini2_height, mini2_width, mini2_wallThickness, wallConfig);
const mini2_leftWall = mini2_Bodies.rectangle(0, mini2_height / 2, mini2_wallThickness, mini2_height, wallConfig);
const mini2_rightWall = mini2_Bodies.rectangle(mini2_width, mini2_height / 2, mini2_wallThickness, mini2_height, wallConfig);

mini2_World.add(mini2_world, [mini2_topWall, mini2_bottomWall, mini2_leftWall, mini2_rightWall]);

// 创建主矩形
const rectWidth = mini2_width * 0.48;
const rectHeight = mini2_height * 0.015;
const rectX = mini2_width / 2;
const rectY = mini2_height - (mini2_height * 0.058);

const mini2_rectangle = mini2_Bodies.rectangle(rectX, rectY, rectWidth, rectHeight, wallConfig);
mini2_World.add(mini2_world, mini2_rectangle);

// 创建倾斜矩形
const angle = 1.820;
const smallRectWidth = mini2_width * 0.26;
const smallRectHeight = mini2_height * 0.035;
const offsetX = rectWidth / 2;

const leftRect = mini2_Bodies.rectangle(
    rectX - offsetX - mini2_width * 0.06,
    rectY - mini2_height * 0.1,
    smallRectWidth,
    smallRectHeight,
    { ...wallConfig, angle: -angle }
);

const rightRect = mini2_Bodies.rectangle(
    rectX + offsetX + mini2_width * 0.06,
    rectY - mini2_height * 0.1,
    smallRectWidth,
    smallRectHeight,
    { ...wallConfig, angle: angle }
);

mini2_World.add(mini2_world, [leftRect, rightRect]);

// 优化按钮点击处理
const mini2_boxes = new Set();
const mini2_valueToText = new Map();

const buttonHandler = (() => {
    let throttleTimer;
    
    return (event) => {
        if (throttleTimer) return;
        
        throttleTimer = setTimeout(() => {
            throttleTimer = null;
        }, 100);

        const button = event.currentTarget;
        const buttonRect = button.getBoundingClientRect();
        
        const mini2_buttonBody = mini2_Bodies.rectangle(
            mini2_width * 0.62,
            mini2_height * 0.24,
            buttonRect.width,
            buttonRect.height,
            {
                chamfer: { radius: 20 },
                restitution: 0.98,
                render: { fillStyle: '#2D6A4F' }
            }
        );

        mini2_World.add(mini2_world, mini2_buttonBody);
        mini2_boxes.add(mini2_buttonBody);
        mini2_valueToText.set(mini2_buttonBody.id, button.innerText);
    };
})();

document.querySelectorAll('.minigame2buttons').forEach(button => {
    button.addEventListener('click', buttonHandler);
});

// 优化文本渲染
const mini2_context = mini2_render.context;

Matter.Events.on(mini2_render, 'afterRender', () => {
    mini2_context.font = '18px Lora';
    mini2_context.fillStyle = '#D8F3DC';

    mini2_boxes.forEach(box => {
        const text = mini2_valueToText.get(box.id);
        if (!text) return;

        mini2_context.save();
        mini2_context.translate(box.position.x, box.position.y);
        mini2_context.rotate(box.angle);
        mini2_context.textAlign = 'center';
        mini2_context.textBaseline = 'middle';
        mini2_context.fillText(text, 0, 0);
        mini2_context.restore();
    });
});

// 优化窗口大小调整
const resizeHandler = (() => {
    let resizeTimer;
    
    return () => {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
        }
        
        resizeTimer = setTimeout(() => {
            const mini2_oldWidth = mini2_width;
            const mini2_oldHeight = mini2_height;

            mini2_width = window.innerWidth * widthFactor;
            mini2_height = window.innerWidth * heightFactor;

            Matter.Render.setSize(mini2_render, mini2_width, mini2_height);

            const mini2_scaleX = mini2_width / mini2_oldWidth;
            const mini2_scaleY = mini2_height / mini2_oldHeight;
            const newRectY = mini2_height - (mini2_height * 0.058);

            // 批量更新位置和缩放
            const updates = [
                { body: mini2_topWall, pos: { x: mini2_width / 2, y: 0 }, scale: [mini2_scaleX, 1] },
                { body: mini2_bottomWall, pos: { x: mini2_width / 2, y: mini2_height }, scale: [mini2_scaleX, 1] },
                { body: mini2_leftWall, pos: { x: 0, y: mini2_height / 2 }, scale: [1, mini2_scaleY] },
                { body: mini2_rightWall, pos: { x: mini2_width, y: mini2_height / 2 }, scale: [1, mini2_scaleY] },
                { body: mini2_rectangle, pos: { x: mini2_width / 2, y: newRectY }, scale: [mini2_scaleX, mini2_scaleY] },
                { body: leftRect, pos: { x: mini2_width / 2 - (mini2_width * 0.48 / 2) - mini2_width * 0.06, y: newRectY - mini2_height * 0.1 }, scale: [mini2_scaleX, mini2_scaleY] },
                { body: rightRect, pos: { x: mini2_width / 2 + (mini2_width * 0.48 / 2) + mini2_width * 0.06, y: newRectY - mini2_height * 0.1 }, scale: [mini2_scaleX, mini2_scaleY] }
            ];

            updates.forEach(({ body, pos, scale }) => {
                Matter.Body.setPosition(body, pos);
                Matter.Body.scale(body, ...scale);
            });

            mini2_Render.lookAt(mini2_render, {
                min: { x: 0, y: 0 },
                max: { x: mini2_width, y: mini2_height }
            });
        }, 100);
    };
})();

window.addEventListener('resize', resizeHandler);