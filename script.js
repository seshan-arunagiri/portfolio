document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('checkbox');
    const root = document.documentElement;
    const body = document.body;
    const overlay = document.getElementById('transitionOverlay');
    const canvas = document.getElementById('effectCanvas');
    const ctx = canvas.getContext('2d');

    // Setup Canvas Size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Custom Cursor Logic
    const customCursor = document.getElementById('customCursor');

    document.addEventListener('mousemove', (e) => {
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
    });

    // Add hover effect to clickable elements
    const clickables = document.querySelectorAll('a, button, input[type="checkbox"], .btn, .social-links a');
    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => customCursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => customCursor.classList.remove('hover'));
    });

    // Theming State
    let currentTheme = 'heaven';
    let animationFrameId;

    // --- Particle Systems ---

    // Zeus (Heaven) - Clouds & Lightning System
    class Lightning {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = 0;
            this.segments = [];
            this.active = false;
            this.opacity = 0;
            this.timer = Math.random() * 200 + 100; // time between strikes
        }
        strike() {
            this.active = true;
            this.opacity = 1;
            this.segments = [];
            this.x = Math.random() * canvas.width;

            let currentX = this.x;
            let currentY = 0;

            while (currentY < canvas.height) {
                const nextX = currentX + (Math.random() - 0.5) * 100;
                const nextY = currentY + Math.random() * 50 + 20;
                this.segments.push({ x: currentX, y: currentY, nx: nextX, ny: nextY });
                currentX = nextX;
                currentY = nextY;
            }
        }
        update() {
            if (!this.active) {
                this.timer--;
                if (this.timer <= 0) {
                    this.strike();
                    this.timer = Math.random() * 200 + 100;
                }
                return;
            }
            this.opacity -= 0.05;
            if (this.opacity <= 0) this.active = false;
        }
        draw() {
            if (!this.active) return;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#fff';

            this.segments.forEach(seg => {
                ctx.moveTo(seg.x, seg.y);
                ctx.lineTo(seg.nx, seg.ny);
            });
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Flash effect
            if (this.opacity > 0.8) {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.2})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }

    class LightParticle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedY = Math.random() * -1 - 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.y += this.speedY;
            if (this.y < -10) this.y = canvas.height + 10;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffd700';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    // Hades (Hell) - Embers & Fire
    class Ember {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 100;
            this.size = Math.random() * 4 + 1;
            this.speedX = (Math.random() - 0.5) * 2;
            this.speedY = Math.random() * -3 - 1;

            const r = Math.floor(Math.random() * 100 + 155); // 155 - 255 (Red/Orange)
            const g = Math.floor(Math.random() * 100);       // 0 - 100 (Red/Orange)
            this.color = `rgba(${r}, ${g}, 0, ${Math.random() * 0.8 + 0.2})`;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Wobble
            if (Math.random() > 0.95) this.speedX += (Math.random() - 0.5);

            if (this.y < -10) {
                this.y = canvas.height + 10;
                this.x = Math.random() * canvas.width;
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff4500';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    // Particle Arrays
    const lightnings = [new Lightning()];
    const lightParticles = Array.from({ length: 50 }, () => new LightParticle());
    const embers = Array.from({ length: 100 }, () => new Ember());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (currentTheme === 'heaven') {
            lightParticles.forEach(p => { p.update(); p.draw(); });
            lightnings.forEach(l => { l.update(); l.draw(); });
        } else {
            embers.forEach(e => { e.update(); e.draw(); });

            // Draw gradient at bottom for fire glow
            const grad = ctx.createLinearGradient(0, canvas.height - 100, 0, canvas.height);
            grad.addColorStop(0, 'rgba(255, 69, 0, 0)');
            grad.addColorStop(1, 'rgba(255, 69, 0, 0.15)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    // Start initial animation
    animate();

    // Theme Switching Logic
    themeSwitch.addEventListener('change', (e) => {
        const newTheme = e.target.checked ? 'hell' : 'heaven';
        const reaperTransition = document.getElementById('reaperTransition');
        const angelTransition = document.getElementById('angelTransition');

        if (newTheme === 'hell') {
            // Trigger Grim Reaper Event
            reaperTransition.classList.add('active');

            // Reaper slides in
            setTimeout(() => {
                reaperTransition.classList.add('moving');
            }, 50);

            // Reaper slashes
            setTimeout(() => {
                reaperTransition.classList.remove('moving');
                reaperTransition.classList.add('slashing');

                // Add the torn overlay effect
                overlay.style.backgroundColor = '#ff4500';
                overlay.style.transform = 'none'; // Prevent scaleY conflict
                overlay.classList.add('active', 'reaper-tear');

            }, 1000); // Wait for slide in

            // Wait for slash and overlay to cover screen, then switch content
            setTimeout(() => {
                currentTheme = newTheme;
                body.setAttribute('data-theme', currentTheme);

                // Change transform origin for exit animation
                overlay.style.transformOrigin = 'top';
                overlay.classList.remove('reaper-tear');
                overlay.style.transform = 'scaleY(0)';

                setTimeout(() => {
                    overlay.classList.remove('active');
                    overlay.style.transform = ''; // reset

                    // Reset reaper
                    reaperTransition.className = 'reaper-transition';
                }, 600);

            }, 1800); // 1000 slide + 800 slash

        } else {
            // Trigger Excalibur Transition Event (Hell -> Heaven)
            angelTransition.classList.add('active'); // Reusing ID angelTransition for overlay

            // Rock pedestal slides up
            setTimeout(() => {
                angelTransition.classList.add('moving');
            }, 50);

            // Excalibur Strikes down
            setTimeout(() => {
                angelTransition.classList.add('striking');
            }, 800); // Wait for rock

            // Sword hits the ground! Holy shockwave & flash
            setTimeout(() => {
                angelTransition.classList.add('flashing');

                // Standard wipe backup underneath just in case
                overlay.style.backgroundColor = '#f0f8ff';
                overlay.style.transform = 'none';
                overlay.style.opacity = '1';
                overlay.classList.add('active');
            }, 1250); // Matches the sword drop animation end (800ms + 450ms)

            // Wait for flash to cover screen, then switch content and reset
            setTimeout(() => {
                currentTheme = newTheme;
                body.setAttribute('data-theme', currentTheme);

                // Start fade out of overlay and flash
                overlay.style.transition = 'opacity 0.8s ease';
                overlay.style.opacity = '0';

                angelTransition.style.transition = 'opacity 0.8s ease';
                angelTransition.style.opacity = '0';

                // Hard reset classes after fade
                setTimeout(() => {
                    overlay.classList.remove('active');
                    overlay.style.transform = '';
                    overlay.style.transition = ''; // reset transition rule

                    angelTransition.className = 'angel-transition';
                    angelTransition.style.transition = '';
                    angelTransition.style.opacity = '';
                }, 800);
            }, 2000); // Give flash enough time to blind screen
        }
    });
});

// Contact Panel Logic
const contactBtn = document.getElementById('contactBtn');
const contactPanelOverlay = document.getElementById('contactPanelOverlay');
const closeContactBtn = document.getElementById('closeContactBtn');

if (contactBtn && contactPanelOverlay && closeContactBtn) {
    contactBtn.addEventListener('click', (e) => {
        e.preventDefault();
        contactPanelOverlay.classList.add('active');
    });

    closeContactBtn.addEventListener('click', () => {
        contactPanelOverlay.classList.remove('active');
    });

    contactPanelOverlay.addEventListener('click', (e) => {
        if (e.target === contactPanelOverlay) {
            contactPanelOverlay.classList.remove('active');
        }
    });
}

// Mobile Menu Logic
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');

        const icon = hamburger.querySelector('i');
        if (hamburger.classList.contains('active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            const icon = hamburger.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-bars';
        });
    });
}

// Generic Copy Text Function
window.copyText = function (text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
        const icon = btnElement.querySelector('i');
        const originalClass = icon.className;
        icon.className = 'fa-solid fa-check';
        icon.style.color = 'var(--btn-primary-bg)';

        setTimeout(() => {
            icon.className = originalClass;
            icon.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        // Fallback for email if clipboard fails
        if (text.includes('@')) {
            window.location.href = `mailto:${text}`;
        }
    });
};
