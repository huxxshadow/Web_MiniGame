let cloth_game_topWall, cloth_game_bottomWall, cloth_game_leftWall, cloth_game_rightWall, cloth_game_cloth;
const cloth_game_elements = document.querySelectorAll('.attached-element');

// 设置画布的尺寸
const cloth_game_canvas = document.getElementById('cloth_game_world');
cloth_game_canvas.style.width = '100vw';
cloth_game_canvas.style.height = '140vw';  // 高度是屏幕宽度的两倍
const cloth_game_pixelRatio = window.devicePixelRatio;  // 获取设备的像素比

// 动态更新canvas的实际宽高以保证比例正确
let cloth_game_width = window.innerWidth;
let cloth_game_height = cloth_game_width * 1.4;

cloth_game_canvas.width = cloth_game_width;
cloth_game_canvas.height = cloth_game_height;

// 获取Matter.js库的模块
const { Engine: cloth_game_Engine, Render: cloth_game_Render, Runner: cloth_game_Runner, World: cloth_game_World, Bodies: cloth_game_Bodies, Mouse: cloth_game_Mouse, MouseConstraint: cloth_game_MouseConstraint, Composite: cloth_game_Composite } = Matter;

// 创建引擎
const cloth_game_engine = cloth_game_Engine.create();
const cloth_game_world = cloth_game_engine.world;

// 创建渲染器
const cloth_game_render = cloth_game_Render.create({
    canvas: cloth_game_canvas,
    engine: cloth_game_engine,
    options: {
        width: cloth_game_canvas.width,
        height: cloth_game_canvas.height,
        wireframes: false, // 不显示线框
        background: 'transparent',
        pixelRatio: cloth_game_pixelRatio
    }
});

// 运行引擎和渲染器
cloth_game_Engine.run(cloth_game_engine);
cloth_game_Render.run(cloth_game_render);

// 创建一个Runner来控制物理引擎的更新频率
const cloth_game_runner = cloth_game_Runner.create();
cloth_game_Runner.run(cloth_game_runner, cloth_game_engine);

// 用于存储元素与粒子之间的映射关系
const elementBodyMappings = [];

// 创建边界和布料的函数
function createBoundariesAndCloth() {
    // 清除之前的边界和布料
    if (cloth_game_cloth) {
        cloth_game_Composite.remove(cloth_game_world, cloth_game_cloth);
    }
    if (cloth_game_topWall) {
        cloth_game_Composite.remove(cloth_game_world, [cloth_game_topWall, cloth_game_bottomWall, cloth_game_leftWall, cloth_game_rightWall]);
    }

    // 创建边界（上、下、左、右）
    const cloth_game_wallThickness = 10;

    cloth_game_topWall = cloth_game_Bodies.rectangle(cloth_game_width / 2, 0, cloth_game_width, cloth_game_wallThickness, {
        isStatic: true,
        restitution: 0.98,
        render: {
            fillStyle: 'transparent'
        }
    });

    cloth_game_bottomWall = cloth_game_Bodies.rectangle(cloth_game_width / 2, cloth_game_height, cloth_game_width, cloth_game_wallThickness, {
        isStatic: true,
        restitution: 0.98,
        render: {
            fillStyle: 'transparent'
        }
    });

    cloth_game_leftWall = cloth_game_Bodies.rectangle(0, cloth_game_height / 2, cloth_game_wallThickness, cloth_game_height, {
        isStatic: true,
        restitution: 0.98,
        render: {
            fillStyle: 'transparent'
        }
    });

    cloth_game_rightWall = cloth_game_Bodies.rectangle(cloth_game_width, cloth_game_height / 2, cloth_game_wallThickness, cloth_game_height, {
        isStatic: true,
        restitution: 0.98,
        render: {
            fillStyle: 'transparent'
        }
    });

    // 添加新边界到物理世界中
    cloth_game_World.add(cloth_game_world, [cloth_game_topWall, cloth_game_bottomWall, cloth_game_leftWall, cloth_game_rightWall]);

    // 创建布料
    const cloth_game_xx = cloth_game_width / 10;
    const cloth_game_yy = cloth_game_width / 20;
    const cloth_game_columns = 20;
    const cloth_game_rows = 20;
    const cloth_game_columnGap = cloth_game_width / 120;
    const cloth_game_rowGap = cloth_game_width / 50;
    const cloth_game_particleRadius = cloth_game_width / 60;
    const cloth_game_crossBrace = false;

    const cloth_game_group = Matter.Body.nextGroup(true);
    const cloth_game_particleOptions = {
        inertia: Infinity,
        friction: 0.00002,
        collisionFilter: { group: cloth_game_group },
        render: { visible: false }
    };

    const cloth_game_constraintOptions = {
        stiffness: 0.06,
        render: { type: 'line', anchors: false, strokeStyle: "#1B4332" }
    };

    // 创建粒子网格（布料）
    cloth_game_cloth = Matter.Composites.stack(cloth_game_xx, cloth_game_yy, cloth_game_columns, cloth_game_rows, cloth_game_columnGap, cloth_game_rowGap, function (x, y) {
        return Matter.Bodies.circle(x, y, cloth_game_particleRadius, cloth_game_particleOptions);
    });

    // 连接粒子为网格（布料的约束）
    Matter.Composites.mesh(cloth_game_cloth, cloth_game_columns, cloth_game_rows, cloth_game_crossBrace, cloth_game_constraintOptions);

    for (let i = 0; i < 20; i++) {
        cloth_game_cloth.bodies[i].isStatic = true;
    }
    // 固定每一行的首位两个粒子
    for (let row = 0; row < cloth_game_rows; row++) {
        const firstParticleIndex = row * cloth_game_columns;          // 每一行的第一个粒子
        const lastParticleIndex = (row + 1) * cloth_game_columns - 1; // 每一行的最后一个粒子

        cloth_game_cloth.bodies[firstParticleIndex].isStatic = true;
        cloth_game_cloth.bodies[lastParticleIndex].isStatic = true;
    }

    // 添加布料到物理世界中
    cloth_game_World.add(cloth_game_world, cloth_game_cloth);
}

// 检查Story Net tab是否active
function isStoryNetActive() {
    const storyNetTab = document.getElementById('tab-storynet');
    return storyNetTab && storyNetTab.classList.contains('kt-tab-title-active');
}

// 更新元素显示状态
function updateElementsVisibility() {
    const isActive = isStoryNetActive();
    
    cloth_game_elements.forEach(element => {
        element.style.visibility = isActive ? 'visible' : 'hidden';
    });
    
    const endElement = document.getElementsByClassName('attached-end-element')[0];
    if (endElement) {
        endElement.style.visibility = isActive ? 'visible' : 'hidden';
    }
}

// 初次创建边界和布料，但仅在Story Net active时显示元素
createBoundariesAndCloth();
updateElementsVisibility();

// 添加鼠标控制
const cloth_game_mouse = cloth_game_Mouse.create(cloth_game_render.canvas);
cloth_game_mouse.pixelRatio = cloth_game_pixelRatio;
const cloth_game_mouseConstraint = cloth_game_MouseConstraint.create(cloth_game_engine, {
    mouse: cloth_game_mouse,
    constraint: {
        stiffness: 0.98,
        render: {
            visible: false
        }
    }
});

cloth_game_mouse.element.removeEventListener('wheel', cloth_game_mouse.mousewheel);
cloth_game_mouse.element.removeEventListener('DOMMouseScroll', cloth_game_mouse.mousewheel);

cloth_game_World.add(cloth_game_world, cloth_game_mouseConstraint);

// 保持鼠标与渲染同步
cloth_game_render.mouse = cloth_game_mouse;

// 监听tab切换事件
const tabsContainer = document.querySelector('.kt-tabs-wrap');
if (tabsContainer) {
    tabsContainer.addEventListener('click', function(event) {
        // 给一个小延迟确保类名已更新
        setTimeout(updateElementsVisibility, 50);
    });
}

Matter.Events.on(cloth_game_engine, 'afterUpdate', function () {
    if (!isStoryNetActive()) return; // 如果Story Net不是active，不更新位置

    cloth_game_elements.forEach((element, index) => {
        var bodyIndex = 0;
        if (index % 2 == 0) {
            bodyIndex = 44 + Math.floor((index + 1) / 2) * 60;
        } else {
            bodyIndex = 15 + Math.floor((index + 1) / 2) * 60;
        }

        if (cloth_game_cloth.bodies[bodyIndex]) {
            const body = cloth_game_cloth.bodies[bodyIndex];
            const elementWidth = element.offsetWidth;
            const elementHeight = element.offsetHeight - cloth_game_width / 1.25-550;

            element.style.position = "absolute";
            element.style.left = (body.position.x - elementWidth / 2) + 'px';
            element.style.top = (body.position.y - elementHeight / 2) + 'px';
        }

        const middleParticleIndex = 20 * 20 - 20 / 2;
        const middleParticle = cloth_game_cloth.bodies[middleParticleIndex];

        if (middleParticle) {
            const endElement = document.getElementsByClassName('attached-end-element')[0];
            if (endElement) {
                const endElementWidth = endElement.offsetWidth;
                const endElementHeight = endElement.offsetHeight - cloth_game_width / 1.3 -450;

                endElement.style.position = "absolute";
                endElement.style.left = (middleParticle.position.x - endElementWidth / 2) + 'px';
                endElement.style.top = (middleParticle.position.y - endElementHeight / 2) + 'px';
            }
        }
    });
});

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const later = () => {
            timeout = null;
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 监听窗口大小变化
window.addEventListener('resize', debounce(() => {
    cloth_game_width = window.innerWidth;
    cloth_game_height = cloth_game_width * 1.4;

    cloth_game_canvas.width = cloth_game_width;
    cloth_game_canvas.height = cloth_game_height;

    Matter.Render.setSize(cloth_game_render, cloth_game_width, cloth_game_height);
    cloth_game_Render.lookAt(cloth_game_render, {
        min: { x: 0, y: 0 },
        max: { x: cloth_game_width, y: cloth_game_height }
    });

    createBoundariesAndCloth();
    updateElementsVisibility();
}, 200));