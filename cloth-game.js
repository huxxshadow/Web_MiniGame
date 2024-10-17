(function () {
    // 获取Matter.js库的模块
    const { Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint, Composite, Composites, Events } = Matter;

    // 画布和元素
    const canvas = document.getElementById('cloth_game_world');
    const elements = document.querySelectorAll('.attached-element');
    const endElement = document.querySelector('.attached-end-element');

    // 初始化画布尺寸
    let width = window.innerWidth;
    let height = width * 1.4;
    const pixelRatio = window.devicePixelRatio;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width;
    canvas.height = height;

    // 创建引擎和世界
    const engine = Engine.create({
        enableSleeping: true, // 启用睡眠，提高性能
    });
    const world = engine.world;

    // 调整物理引擎设置，优化性能
    engine.constraintIterations = 2; // 约束迭代次数（默认2）
    engine.positionIterations = 6;   // 位置迭代次数（默认6）
    engine.velocityIterations = 4;   // 速度迭代次数（默认4）

    // 创建渲染器，禁用不必要的显示选项
    const render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: width,
            height: height,
            wireframes: false,
            background: 'transparent',
            pixelRatio: pixelRatio,
            showAngleIndicator: false,
            showCollisions: false,
            showVelocity: false,
            showBroadphase: false,
            showBounds: false,
            showDebug: false,
            showAxes: false,
            showPositions: false,
            showConvexHulls: false,
        }
    });

    // 运行引擎和渲染器
    Engine.run(engine);

    // 创建Runner，使用固定时间步长，提高模拟稳定性
    const runner = Runner.create({
        delta: 1000 / 60, // 固定时间步长（60 FPS）
        isFixed: true,
    });
    Runner.run(runner, engine);

    // 创建边界和布料的函数
    let cloth;
    let boundaries = [];
    let group;
    let columns = 20; // 减少列数，优化性能
    let rows = 20;    // 减少行数，优化性能

    function createBoundariesAndCloth() {
        // 如果已经存在，移除之前的布料和边界
        if (cloth) {
            Composite.remove(world, cloth);
        }
        if (boundaries.length > 0) {
            Composite.remove(world, boundaries);
        }

        // 创建新的边界
        const wallThickness = 10;
        boundaries = [
            // 上边界
            Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, {
                isStatic: true,
                restitution: 0.98,
                render: { fillStyle: 'transparent' }
            }),
            // 下边界
            Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, {
                isStatic: true,
                restitution: 0.98,
                render: { fillStyle: 'transparent' }
            }),
            // 左边界
            Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, {
                isStatic: true,
                restitution: 0.98,
                render: { fillStyle: 'transparent' }
            }),
            // 右边界
            Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, {
                isStatic: true,
                restitution: 0.98,
                render: { fillStyle: 'transparent' }
            })
        ];

        // 添加边界到世界
        World.add(world, boundaries);

        // 创建布料
        const startX = width / 10;
        const startY = width / 20;
        const columnGap = width / 120;
        const rowGap = width / 50;
        const particleRadius = width / 60;
        const crossBrace = false;

        group = Body.nextGroup(true);

        const particleOptions = {
            inertia: Infinity,
            friction: 0.00002,
            collisionFilter: { group: group },
            render: { visible: false }
        };

        const constraintOptions = {
            stiffness: 0.06,
            render: { visible: false } // 禁用约束渲染，优化性能
        };

        // 使用较小的网格尺寸，优化性能
        cloth = Composites.stack(startX, startY, columns, rows, columnGap, rowGap, function (x, y) {
            return Bodies.circle(x, y, particleRadius, particleOptions);
        });

        // 连接粒子形成网格
        Composites.mesh(cloth, columns, rows, crossBrace, constraintOptions);

        // 固定顶部的粒子
        for (let i = 0; i < columns; i++) {
            cloth.bodies[i].isStatic = true;
        }

        // 添加布料到世界
        World.add(world, cloth);
    }

    // 初次创建边界和布料
    createBoundariesAndCloth();

    // 添加鼠标控制
    const mouse = Mouse.create(render.canvas);
    mouse.pixelRatio = pixelRatio;

    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.98,
            render: { visible: false }
        }
    });

    // 根据需要移除鼠标滚轮事件监听
    if (mouse.mousewheel) {
        mouse.element.removeEventListener('wheel', mouse.mousewheel);
        mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
    }

    World.add(world, mouseConstraint);

    // 保持鼠标与渲染同步
    render.mouse = mouse;

    // 缓存元素的尺寸，避免重复计算
    const elementDimensions = Array.from(elements).map(element => ({
        element: element,
        width: element.offsetWidth,
        height: element.offsetHeight - width / 1.25 - 550
    }));

    const endElementWidth = endElement.offsetWidth;
    const endElementHeight = endElement.offsetHeight - width / 1.3 - 450;

    // 更新元素位置的函数
    function updateElementPositions() {
        window.requestAnimationFrame(() => {
            elementDimensions.forEach(({ element, width: elemWidth, height: elemHeight }, index) => {
                let bodyIndex = (index % 2 === 0)
                    ? 44 + Math.floor((index + 1) / 2) * 60
                    : 15 + Math.floor((index + 1) / 2) * 60;

                const body = cloth.bodies[bodyIndex];
                if (body) {
                    const translateX = body.position.x - elemWidth / 2;
                    const translateY = body.position.y - elemHeight / 2;
                    element.style.transform = `translate(${translateX}px, ${translateY}px)`;
                    element.style.position = 'absolute';
                }
            });

            // 更新endElement的位置
            const middleParticleIndex = columns * rows - Math.floor(columns / 2) - 1;
            const middleParticle = cloth.bodies[middleParticleIndex];

            if (middleParticle) {
                const translateX = middleParticle.position.x - endElementWidth / 2;
                const translateY = middleParticle.position.y - endElementHeight / 2;
                endElement.style.transform = `translate(${translateX}px, ${translateY}px)`;
                endElement.style.position = 'absolute';
            }
        });
    }

    // 监听引擎的afterUpdate事件，更新元素位置
    Events.on(engine, 'afterUpdate', updateElementPositions);

    // 优化窗口大小变化时的处理，使用防抖函数
    let resizeTimeout;
    let previousWidth = width;
    let previousHeight = height;

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // 更新画布尺寸
            width = window.innerWidth;
            height = width * 1.4;

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            canvas.width = width;
            canvas.height = height;

            // 调整渲染器的尺寸和视角
            Render.setSize(render, width, height);
            render.bounds.max.x = width;
            render.bounds.max.y = height;

            // 计算缩放比例
            const scaleRatioX = width / previousWidth;
            const scaleRatioY = height / previousHeight;

            // 缩放世界中的所有物体
            Composite.scale(world, scaleRatioX, scaleRatioY, { x: 0, y: 0 });

            // 更新之前的尺寸
            previousWidth = width;
            previousHeight = height;

            // 重新计算元素尺寸
            elementDimensions.forEach(item => {
                item.width = item.element.offsetWidth;
                item.height = item.element.offsetHeight - width / 1.25 - 550;
            });

            // 更新endElement的尺寸
            endElementWidth = endElement.offsetWidth;
            endElementHeight = endElement.offsetHeight - width / 1.3 - 450;
        }, 100); // 防抖延迟，单位为毫秒
    });
})();