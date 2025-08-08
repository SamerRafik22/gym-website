// === RESPONSIVE NAVIGATION COMPONENT ===

class ResponsiveNavigation {
    constructor() {
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        this.createMobileMenu();
        this.setupEventListeners();
        this.handleResize();
    }

    createMobileMenu() {
        // Add mobile menu toggle button to existing header
        const header = document.querySelector('.main-header');
        if (!header) return;

        // Create mobile menu toggle
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = `
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        `;
        mobileToggle.setAttribute('aria-label', 'Toggle mobile menu');
        mobileToggle.setAttribute('aria-expanded', 'false');

        // Insert toggle button
        const headerContent = header.querySelector('.header-content');
        if (headerContent) {
            headerContent.appendChild(mobileToggle);
        }

        // Create mobile menu overlay
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu-overlay';
        mobileMenu.innerHTML = `
            <div class="mobile-menu-content">
                <div class="mobile-menu-header">
                    <div class="mobile-logo">
                        <img src="images/Gemini_Generated_Image_wfkascwfkascwfka.png" alt="RedefineLab Logo" class="mobile-brand-logo">
                        <span class="mobile-brand-name">REDEFINELAB</span>
                    </div>
                    <button class="mobile-menu-close" aria-label="Close mobile menu">
                        <span class="close-icon">&times;</span>
                    </button>
                </div>
                <nav class="mobile-nav">
                    <ul class="mobile-nav-list">
                        <li><a href="/" class="mobile-nav-link">Home</a></li>
                        <li><a href="/about" class="mobile-nav-link">About</a></li>
                        <li><a href="/services" class="mobile-nav-link">Services</a></li>
                        <li><a href="/contact" class="mobile-nav-link">Contact</a></li>
                        <li><a href="/dashboard" class="mobile-nav-link">Dashboard</a></li>
                        <li><a href="/admin" class="mobile-nav-link">Admin</a></li>
                    </ul>
                    <div class="mobile-actions">
                        <a href="/login" class="mobile-login-btn">Login</a>
                        <a href="/join" class="mobile-signup-btn">Join Now</a>
                    </div>
                </nav>
                <div class="mobile-menu-footer">
                    <p>&copy; 2025 RedefineLab</p>
                    <div class="mobile-social">
                        <a href="#" class="mobile-social-link">📱</a>
                        <a href="#" class="mobile-social-link">📧</a>
                        <a href="https://wa.me/201285500002" class="mobile-social-link">💬</a>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(mobileMenu);
    }

    setupEventListeners() {
        // Mobile menu toggle
        const toggleBtn = document.querySelector('.mobile-menu-toggle');
        const closeBtn = document.querySelector('.mobile-menu-close');
        const overlay = document.querySelector('.mobile-menu-overlay');
        const navLinks = document.querySelectorAll('.mobile-nav-link');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleMenu());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeMenu());
        }

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeMenu();
                }
            });
        }

        // Close menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        const overlay = document.querySelector('.mobile-menu-overlay');
        const toggleBtn = document.querySelector('.mobile-menu-toggle');
        
        if (overlay) {
            overlay.classList.add('active');
            document.body.classList.add('menu-open');
            this.isMenuOpen = true;
            
            if (toggleBtn) {
                toggleBtn.classList.add('active');
                toggleBtn.setAttribute('aria-expanded', 'true');
            }
        }
    }

    closeMenu() {
        const overlay = document.querySelector('.mobile-menu-overlay');
        const toggleBtn = document.querySelector('.mobile-menu-toggle');
        
        if (overlay) {
            overlay.classList.remove('active');
            document.body.classList.remove('menu-open');
            this.isMenuOpen = false;
            
            if (toggleBtn) {
                toggleBtn.classList.remove('active');
                toggleBtn.setAttribute('aria-expanded', 'false');
            }
        }
    }

    handleResize() {
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMenu();
        }
    }
}

// Touch gesture support for mobile
class TouchGestures {
    constructor() {
        this.startX = 0;
        this.startY = 0;
        this.init();
    }

    init() {
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
    }

    handleTouchStart(e) {
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        if (!this.startX || !this.startY) return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        
        const diffX = this.startX - currentX;
        const diffY = this.startY - currentY;

        // Detect horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > 50) { // Minimum swipe distance
                if (diffX > 0) {
                    // Swipe left - close menu if open
                    if (window.responsiveNav && window.responsiveNav.isMenuOpen) {
                        window.responsiveNav.closeMenu();
                    }
                } else {
                    // Swipe right - open menu if closed and near edge
                    if (this.startX < 50 && !window.responsiveNav.isMenuOpen) {
                        window.responsiveNav.openMenu();
                    }
                }
            }
        }
    }

    handleTouchEnd(e) {
        this.startX = 0;
        this.startY = 0;
    }
}

// Initialize responsive navigation
document.addEventListener('DOMContentLoaded', function() {
    window.responsiveNav = new ResponsiveNavigation();
    window.touchGestures = new TouchGestures();
});

// Export for global use
window.ResponsiveNavigation = ResponsiveNavigation;