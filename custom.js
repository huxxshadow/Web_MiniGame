class HoverTrack {
    constructor(el) {
      this.el = el;
      this.hover = false;
      this.calculatePosition();
      this.attachEventsListener();
    }
    
    attachEventsListener() {
      window.addEventListener('mousemove', e => this.onMouseMove(e));
      window.addEventListener('resize', e => this.calculatePosition(e));
    }
    
    calculatePosition() {
      this.el.style.transform = 'translate(0, 0) scale(1)';
      const box = this.el.getBoundingClientRect();
      this.x = box.left + (box.width * 0.5);
      this.y = box.top + (box.height * 0.5);
      this.width = box.width;
      this.height = box.height;
    }
    
    onMouseMove(e) {
      let hover = false;
      // 分别设置水平和垂直方向的检测范围
      let hoverAreaX = (this.hover ? 0.7 : 0.5);
      let hoverAreaY = (this.hover ? 0.5 : 0.4); // 垂直方向检测范围减小
  
      let x = e.clientX - this.x;
      let y = e.clientY - this.y;
      
      // 分别检查x和y方向是否在范围内
      let inXRange = Math.abs(x) < (this.width * hoverAreaX);
      let inYRange = Math.abs(y) < (this.height * hoverAreaY);
      
      if (inXRange && inYRange) {
        hover = true;
        if (!this.hover) {
          this.hover = true;
        }
        this.onHover(e.clientX, e.clientY);
      }
      
      if (!hover && this.hover) {
        this.onLeave();
        this.hover = false;
      }
    }
    
    onHover(x, y) {
      this.el.style.transition = 'transform 0.2s ease-out';
      this.el.style.transform = `translate(${(x - this.x) * 0.25}px, ${(y - this.y) * 0.2}px) scale(1.05)`;
      this.el.style.zIndex = '2';
    }
    
    onLeave() {
      this.el.style.transition = 'transform 0.4s cubic-bezier(0.215, 0.61, 0.355, 1)';
      this.el.style.transform = 'translate(0, 0) scale(1)';
      this.el.style.zIndex = '1';
    }
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    const trackElements = document.querySelectorAll('.hovertrack');
    trackElements.forEach(element => {
      new HoverTrack(element);
    });
  });
  
  
  // 等待页面加载完毕后执行
  document.addEventListener('DOMContentLoaded', function () {
      // 获取HTML元素
      var visitElement = document.getElementsByClassName('total-visits');
  
      // 如果该元素存在，则插入访问人数
   if (visitElement[0]) {
          visitElement[0].setAttribute('data-end', parseInt(visitData.totalVisits, 10) + 0);
          if (typeof window.kadenceCountUp !== 'undefined') {
              window.kadenceCountUp.init();
          }
      }
  });