function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}
// Text Rotator Class
class TextRotator {
  constructor(element) {
    this.element = element;
    this.roles = JSON.parse(element.getAttribute('data-rotate'));
    this.speed = parseInt(element.getAttribute('data-period'), 10) || 2000;
    this.index = 0;
    this.txt = '';
    this.isDeleting = false;
    this.animate();
  }

  animate() {
    const currentRole = this.roles[this.index];
    const delta = 100; // Typing speed
    
    if (this.isDeleting) {
      this.txt = currentRole.substring(0, this.txt.length - 1);
    } else {
      this.txt = currentRole.substring(0, this.txt.length + 1);
    }

    this.element.innerHTML = '<span>' + this.txt + '</span>';

    if (!this.isDeleting && this.txt === currentRole) {
      // Pause at complete word
      setTimeout(() => {
        this.isDeleting = true;
        this.animate();
      }, this.speed);
    } else if (this.isDeleting && this.txt === '') {
      // Move to next word
      this.isDeleting = false;
      this.index = (this.index + 1) % this.roles.length;
      setTimeout(() => this.animate(), delta);
    } else {
      // Continue typing/deleting
      setTimeout(() => this.animate(), delta);
    }
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
  const textElements = document.querySelectorAll('.animated-text');
  textElements.forEach(el => new TextRotator(el));
});