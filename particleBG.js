document.addEventListener('DOMContentLoaded', function() {
    // 查找所有带有 particlebg 类的 Kadence section
    const sections = document.querySelectorAll('.particlebg');
    
    sections.forEach((section, index) => {
        // 创建 particles-js 容器
        const particlesContainer = document.createElement('div');
        particlesContainer.id = `particles-js`;
        particlesContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
        `;
        
        // 确保 section 有相对定位
        section.style.position = 'relative';
        
        // 确保 section 的内容在粒子效果之上
        const sectionContent = section.querySelector('.kt-row-layout-inner');
        if (sectionContent) {
            sectionContent.style.position = 'relative';
            sectionContent.style.zIndex = '1';
        }
        
        // 将 particles 容器插入到 section 的最前面
        section.insertBefore(particlesContainer, section.firstChild);
        
        // 使用配置文件初始化 particles.js
        particlesJS.load(`particles-js`, particlesData.configUrl, function() {
            console.log(`particles.js config loaded for section`);
        });
    });
});