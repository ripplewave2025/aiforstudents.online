class AHole extends HTMLElement {
  constructor() {
    super();
    const template = document.createElement("template");
    template.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          width: 100%;
          height: 400px;
        }
        canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at 50% 50%, transparent 0%, var(--bg) 70%);
        }
      </style>
      <canvas></canvas>
      <div class="overlay"></div>
      <slot></slot>
    `;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.canvas = this.shadowRoot.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.circles = [];
  }

  connectedCallback() {
    this.resize();
    this.animate();
    window.addEventListener("resize", this.resize.bind(this));
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.canvas.width = this.offsetWidth;
    this.canvas.height = this.offsetHeight;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (Math.random() > 0.95) {
      this.circles.push(this.createCircle());
    }

    for (let i = this.circles.length - 1; i >= 0; i--) {
      const circle = this.circles[i];
      if (circle.radius > circle.maxRadius || circle.opacity <= 0) {
        this.circles.splice(i, 1);
        continue;
      }
      circle.radius += circle.speed;
      circle.opacity = 1 - circle.radius / circle.maxRadius;
      this.drawCircle(circle);
    }

    requestAnimationFrame(this.animate.bind(this));
  }

  createCircle() {
    const maxRadius = Math.random() * 200 + 100;
    return {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      radius: 0,
      maxRadius: maxRadius,
      speed: Math.random() * 0.5 + 0.2,
      color: `rgba(88, 101, 242, ${Math.random() * 0.5 + 0.2})`,
      opacity: 1,
    };
  }

  drawCircle(circle) {
    this.ctx.beginPath();
    this.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = circle.color.replace(/,\s*\d*\.?\d+\)$/, `, ${circle.opacity})`);
    this.ctx.fill();
  }
}

customElements.define("a-hole", AHole);
