function createStars() {
  const starsContainer = document.querySelector('.stars');
  const numStars = 50;

  for (let i = 0; i < numStars; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 2 + 's';
    star.style.animationDuration = Math.random() * 2 + 1 + 's';
    starsContainer.appendChild(star);
  }
}

function addCardEffects() {
  const cards = document.querySelectorAll('.adventure-card');

  cards.forEach((card) => {
    card.addEventListener('click', function (e) {
      if (this.classList.contains('available')) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
                            position: absolute;
                            border-radius: 50%;
                            background: rgba(255,255,255,0.6);
                            transform: scale(0);
                            animation: ripple 0.6s linear;
                            pointer-events: none;
                        `;

        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        this.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      } else {
        // coming soon
        this.style.animation = 'none';
        setTimeout(() => {
          this.style.animation = 'pulse 0.5s ease-in-out 3';
        }, 10);
      }
    });
  });
}

function animateProgressNumbers() {
  const numbers = document.querySelectorAll('.stat-number');

  numbers.forEach((num, index) => {
    const finalValue = parseInt(num.textContent);
    num.textContent = '0';

    setTimeout(() => {
      let currentValue = 0;
      const increment = finalValue / 30;
      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
          num.textContent = finalValue;
          clearInterval(timer);
        } else {
          num.textContent = Math.floor(currentValue);
        }
      }, 50);
    }, index * 300);
  });
}

const style = document.createElement('style');
style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
document.head.appendChild(style);

window.addEventListener('DOMContentLoaded', () => {
  createStars();
  animateProgressNumbers();
});

setInterval(() => {
  const symbols = ['∑', '∫', '∆', '∞', 'π', 'φ', '√', '≈', '∅', '∃', '∀'];
  const symbol = symbols[(Math.random() * symbols.length) | 0];

  const floatingElement = document.createElement('div');
  floatingElement.className = 'floating-math';
  floatingElement.textContent = symbol;
  floatingElement.style.left = Math.random() * 100 + '%';
  floatingElement.style.color = `hsl(${Math.random() * 360}, 70%, 80%)`;

  document.querySelector('.floating-elements').appendChild(floatingElement);

  setTimeout(() => {
    floatingElement.remove();
  }, 10000);
}, 3000);
