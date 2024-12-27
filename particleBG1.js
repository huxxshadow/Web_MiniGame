document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.particlebg');
    let particlesContainers = [];
    
    function createParticles() {
        sections.forEach((section, index) => {
            if (particlesContainers[index]) return;
            
            const particlesContainer = document.createElement('div');
            particlesContainer.id = `particles-js-${index}`;
            particlesContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                opacity: 0;
                transition: opacity 1.5s ease;
                pointer-events: auto !important;
            `;
            
            // 为section添加样式以支持pointer-events穿透
            section.style.cssText = `
                position: relative;
                pointer-events: none;
            `;
            
            // 确保section的内容仍然可以响应事件
            const sectionContent = section.querySelector('.kt-row-layout-inner');
            if (sectionContent) {
                sectionContent.style.cssText = `
                    position: relative;
                    z-index: 1;
                    pointer-events: auto;
                `;
            }
            
            // 创建一个包装器来确保particle层始终在底部但可以响应事件
            const particleWrapper = document.createElement('div');
            particleWrapper.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 0;
                pointer-events: auto;
            `;
            
            particleWrapper.appendChild(particlesContainer);
            section.insertBefore(particleWrapper, section.firstChild);
            particlesContainers[index] = particlesContainer;
            
            // 初始化particles.js
            particlesJS.load(`particles-js-${index}`, particlesData.configUrl, function() {
                console.log(`particles.js config loaded for section ${index}`);
                if (window.innerWidth > 2100) {
                    setTimeout(() => {
                        particlesContainer.style.opacity = '1';
                    }, 100);
                }
                
                // 确保particles.js生成的canvas也能接收事件
                const canvas = particlesContainer.querySelector('canvas');
                if (canvas) {
                    canvas.style.pointerEvents = 'auto';
                }
            });
        });
    }

    function removeParticles() {
        particlesContainers.forEach((container, index) => {
            if (container) {
                container.style.opacity = '0';
                setTimeout(() => {
                    const wrapper = container.parentElement;
                    if (wrapper && wrapper.parentElement) {
                        wrapper.parentElement.removeChild(wrapper);
                    }
                    particlesContainers[index] = null;
                }, 1500);
            }
        });
    }

    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth > 2100) {
                createParticles();
            } else {
                removeParticles();
            }
        }, 250);
    }

    if (window.innerWidth > 2100) {
        createParticles();
    }

    window.addEventListener('resize', handleResize);
});