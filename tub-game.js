// 设置画布的尺寸
const mini2_canvas = document.getElementById('minigame2_world');
mini2_canvas.style.width = '66vw';
mini2_canvas.style.height = (66 * 2 * 0.707) + 'vw';  // 高度是66vw的两倍

// 动态更新canvas的实际宽高以保证比例正确
mini2_canvas.width = window.innerWidth * 0.66;
mini2_canvas.height = mini2_canvas.width * 2 * 0.707;

// 获取Matter.js库的模块
const { Engine: mini2_Engine, Render: mini2_Render, Runner: mini2_Runner, World: mini2_World, Bodies: mini2_Bodies } = Matter;

// 创建引擎
const mini2_engine = mini2_Engine.create();
const mini2_world = mini2_engine.world;

// 创建渲染器
const mini2_render = mini2_Render.create({
    canvas: mini2_canvas,
    engine: mini2_engine,
    options: {
        width: mini2_canvas.width,
        height: mini2_canvas.height,
        wireframes: false, // 不显示线框
        background: 'transparent' // 设置背景颜色
    }
});

// 运行引擎和渲染器
mini2_Engine.run(mini2_engine);
mini2_Render.run(mini2_render);

// 创建一个Runner来控制物理引擎的更新频率
const mini2_runner = mini2_Runner.create();
mini2_Runner.run(mini2_runner, mini2_engine);

// 创建边界（上、下、左、右）
// 边界的厚度
const mini2_wallThickness = 10;

// 顶部边界
const mini2_topWall = mini2_Bodies.rectangle(mini2_canvas.width / 2, 0, mini2_canvas.width, mini2_wallThickness, {
    isStatic: true,
    render: {
        fillStyle: 'black'
    }
});

// 底部边界
const mini2_bottomWall = mini2_Bodies.rectangle(mini2_canvas.width / 2, mini2_canvas.height, mini2_canvas.width, mini2_wallThickness, {
    isStatic: true,
    render: {
        fillStyle: 'black'
    }
});

// 左侧边界
const mini2_leftWall = mini2_Bodies.rectangle(0, mini2_canvas.height / 2, mini2_wallThickness, mini2_canvas.height, {
    isStatic: true,
    render: {
        fillStyle: 'black'
    }
});

// 右侧边界
const mini2_rightWall = mini2_Bodies.rectangle(mini2_canvas.width, mini2_canvas.height / 2, mini2_wallThickness, mini2_canvas.height, {
    isStatic: true,
    render: {
        fillStyle: 'black'
    }
});

// 添加边界到物理世界中
mini2_World.add(mini2_world, [mini2_topWall, mini2_bottomWall, mini2_leftWall, mini2_rightWall]);

// 生成0.556画面宽度的长方形，距离底部0.043画面高度的位置
const rectWidth = mini2_canvas.width * 0.556; // 0.556画面宽度
const rectHeight = mini2_canvas.height * 0.015; // 长方形的高度，可以随意设定
const rectX = mini2_canvas.width / 2; // 在画布的水平中心位置
const rectY = mini2_canvas.height - (mini2_canvas.height * 0.058); // 在距离底部0.043画面高度的位置

const mini2_rectangle = mini2_Bodies.rectangle(rectX, rectY, rectWidth, rectHeight, {
    isStatic: true,
    render: {
        fillStyle: 'blue' // 设置矩形的颜色为蓝色
    }
});

// 将矩形添加到物理世界中
mini2_World.add(mini2_world, mini2_rectangle);

const angle = 1.900;  // 30°角（弧度制）
const smallRectWidth = mini2_canvas.width * 0.26;  // 小长方形的宽度
const smallRectHeight = mini2_canvas.height * 0.035;  // 小长方形的高度
const offsetX = rectWidth / 2;  // 水平偏移量（矩形的半宽）

// 左端点的长方形
const leftRectX = rectX - offsetX - mini2_canvas.width * 0.03;
const leftRect = mini2_Bodies.rectangle(leftRectX, rectY - mini2_canvas.height * 0.1, smallRectWidth, smallRectHeight, {
    angle: -angle,  // 向左倾斜30°
    isStatic: true,
    render: {
        fillStyle: 'red'  // 颜色为红色
    }
});

// 右端点的长方形
const rightRectX = rectX + offsetX + mini2_canvas.width * 0.03;;
const rightRect = mini2_Bodies.rectangle(rightRectX, rectY - mini2_canvas.height * 0.1, smallRectWidth, smallRectHeight, {
    angle: angle,  // 向右倾斜30°
    isStatic: true,
    render: {
        fillStyle: 'green'  // 颜色为绿色
    }
});

// 将两个倾斜的长方形添加到物理世界中
mini2_World.add(mini2_world, [leftRect, rightRect]);


const mini2_buttons = document.querySelectorAll('.minigame2buttons')

// 用来存储创建的物理矩形，以便在 afterRender 时手动绘制文本
const mini2_boxes = [];
const mini2_valueToText = {}; // 存储矩形和对应的文本

mini2_buttons.forEach(button => {
    button.addEventListener('click', (event) => {
        // 获取按钮的尺寸和位置
        const buttonRect = button.getBoundingClientRect();
        const buttonWidth = buttonRect.width;
        const buttonHeight = buttonRect.height;
        const buttonText = button.innerText;

        // 按钮的位置相对于canvas左上的x、y坐标
        const buttonX = buttonRect.left + buttonWidth / 2;
        const buttonY = buttonRect.top + buttonHeight / 2;

        // 创建与按钮大小相同的物理矩形
        const mini2_buttonBody = mini2_Bodies.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, {
            chamfer: { radius: 20 },
            render: {
                fillStyle: '#2D6A4F', // 设置按钮颜色
            }
        });

        // 将按钮矩形添加到物理世界
        mini2_World.add(mini2_world, mini2_buttonBody);

        // 存储矩形到 boxes 数组中，以便后续渲染文本
        mini2_boxes.push(mini2_buttonBody);

        // 将按钮文本与物理矩形关联，存储在 valueToText 对象中
        mini2_valueToText[mini2_buttonBody.id] = buttonText;
    });
});

// 获取 Matter.js 渲染器的 canvas 上下文
const mini2_context = mini2_render.context;

// 监听渲染器的 afterRender 事件，在每次渲染后绘制文本
Matter.Events.on(mini2_render, 'afterRender', function () {
    mini2_boxes.forEach(box => {
        mini2_context.font = '18px Lora';  // 设置字体
        mini2_context.fillStyle = '#D8F3DC';  // 设置文字颜色

        // 获取物体的中心位置
        const x = box.position.x;
        const y = box.position.y;

        // 获取物体的文本内容
        const word = mini2_valueToText[box.id] || '';

        // 绘制文本，居中显示在物体上
        mini2_context.textAlign = 'center';
        mini2_context.textBaseline = 'middle';
        mini2_context.fillText(word, x, y);  // 在物体的中心绘制文本
    });
});

// 监听窗口大小变化，自动调整canvas尺寸以及边界
window.addEventListener('resize', () => {
    // 保存旧的canvas尺寸
    const mini2_oldWidth = mini2_canvas.width;
    const mini2_oldHeight = mini2_canvas.height;

    // 调整canvas尺寸
    mini2_canvas.width = window.innerWidth * 0.66;
    mini2_canvas.height = mini2_canvas.width * 2 * 0.707;
    mini2_render.canvas.width = mini2_canvas.width;
    mini2_render.canvas.height = mini2_canvas.height;
    mini2_render.options.width = mini2_canvas.width;
    mini2_render.options.height = mini2_canvas.height;

    // 计算新的比例
    const mini2_scaleX = mini2_canvas.width / mini2_oldWidth;
    const mini2_scaleY = mini2_canvas.height / mini2_oldHeight;

    // 更新墙壁的位置和缩放比例
    Matter.Body.setPosition(mini2_topWall, { x: mini2_canvas.width / 2, y: 0 });
    Matter.Body.setPosition(mini2_bottomWall, { x: mini2_canvas.width / 2, y: mini2_canvas.height });
    Matter.Body.setPosition(mini2_leftWall, { x: 0, y: mini2_canvas.height / 2 });
    Matter.Body.setPosition(mini2_rightWall, { x: mini2_canvas.width, y: mini2_canvas.height / 2 });

    // 重新缩放墙壁
    Matter.Body.scale(mini2_topWall, mini2_scaleX, 1);
    Matter.Body.scale(mini2_bottomWall, mini2_scaleX, 1);
    Matter.Body.scale(mini2_leftWall, 1, mini2_scaleY);
    Matter.Body.scale(mini2_rightWall, 1, mini2_scaleY);

    // 更新矩形的位置
    const newRectY = mini2_canvas.height - (mini2_canvas.height * 0.058);
    Matter.Body.setPosition(mini2_rectangle, { x: mini2_canvas.width / 2, y: newRectY });
    Matter.Body.scale(mini2_rectangle, mini2_scaleX, mini2_scaleY);


    // 更新左端点小矩形的位置和尺寸
    const newLeftRectX = mini2_canvas.width / 2 - (mini2_canvas.width * 0.556 / 2) - mini2_canvas.width * 0.03;
    const newLeftRectY = newRectY - mini2_canvas.height * 0.1;
    Matter.Body.setPosition(leftRect, { x: newLeftRectX, y: newLeftRectY });
    Matter.Body.scale(leftRect, mini2_scaleX, mini2_scaleY);

    // 更新右端点小矩形的位置和尺寸
    const newRightRectX = mini2_canvas.width / 2 + (mini2_canvas.width * 0.556 / 2) + mini2_canvas.width * 0.03;
    const newRightRectY = newRectY - mini2_canvas.height * 0.1;
    Matter.Body.setPosition(rightRect, { x: newRightRectX, y: newRightRectY });
    Matter.Body.scale(rightRect, mini2_scaleX, mini2_scaleY);


    // 调整渲染器的视角
    mini2_Render.lookAt(mini2_render, {
        min: { x: 0, y: 0 },
        max: { x: mini2_canvas.width, y: mini2_canvas.height }
    });
});