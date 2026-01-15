/*!
 * Grayscale Theme JavaScript
 * Based on Start Bootstrap - Grayscale Bootstrap Theme
 */

// jQuery to collapse the navbar on scroll
$(window).scroll(function() {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
});

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});

// Remove the focused state after click,
// otherwise bootstrap will still highlight the link
$("a").mouseup(function() {
    $(this).blur();
});

// ============================================
// TYPING EFFECT
// ============================================
class TypeWriter {
    constructor(element, blocks, wait = 3000) {
        this.element = element;
        this.blocks = blocks;
        this.wait = parseInt(wait, 10);
        this.blockIndex = 0;
        this.txt = '';
        this.isTypingCmd = true;
        this.cmd = '';
        this.resp = '';
        this.cmdPos = 0;
        this.respPos = 0;
        this.type();
    }

    type() {
        const current = this.blockIndex % this.blocks.length;
        const block = this.blocks[current];
        const cmd = block.cmd;
        const resp = block.resp;

        if (cmd === 'clear') {
            this.element.innerHTML = `<div class='typed-block'>&nbsp;</div>`;
            setTimeout(() => {
                this.blockIndex++;
                this.isTypingCmd = true;
                this.cmdPos = 0;
                this.respPos = 0;
                this.type();
            }, 600);
            return;
        }

        let html = "<div class='typed-block'>";
        // Typing command
        if (this.isTypingCmd) {
            this.cmdPos++;
            let shownCmd = cmd.substring(0, this.cmdPos);
            html += `<span class='typed-cmd'>$ ${shownCmd}</span>`;
            html += "</div>";
            this.element.innerHTML = html;
            if (this.cmdPos < cmd.length) {
                setTimeout(() => this.type(), 60);
            } else {
                this.isTypingCmd = false;
                setTimeout(() => this.type(), 400);
            }
            return;
        }
        // Mostrar respuesta instantáneamente
        html += `<span class='typed-cmd'>$ ${cmd}</span><br><span class='typed-resp'>${resp}</span></div>`;
        this.element.innerHTML = html;
        setTimeout(() => {
            this.blockIndex++;
            this.isTypingCmd = true;
            this.cmdPos = 0;
            this.respPos = 0;
            this.type();
        }, this.wait);
    }
}

// Initialize typing effect when DOM is loaded
$(document).ready(function() {
    const typedElement = document.getElementById('typed-output');
    if (typedElement) {
        // Bloques de comandos y respuestas
        const blocks = [
            { cmd: 'whoami', resp: 'av4sin' },
            { cmd: 'ls', resp: 'blog.md\ngames/\nREADME.md' },
            { cmd: 'uname -s', resp: 'Linux' },
            { cmd: 'echo "Hola!"', resp: 'Hola!' },
            { cmd: 'cat skills.txt', resp: 'C\nPython\nJava' },
            { cmd: 'pwd', resp: '/home/av4sin' },
            { cmd: 'date', resp: '2026-01-15' },
            { cmd: 'clear', resp: '' },
            { cmd: 'echo "Bienvenido!"', resp: 'Bienvenido!' }
        ];
        const wait = typedElement.getAttribute('data-wait');
        new TypeWriter(typedElement, blocks, wait);
    }
    
    // Add animation on scroll
    animateOnScroll();
});

// ============================================
// ANIMATE ON SCROLL
// ============================================
function animateOnScroll() {
    const elements = document.querySelectorAll('.skill-item, .project-card, .stat-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });
}

// Add CSS for animations dynamically
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .animate-in {
        animation: fadeInUp 0.6s ease forwards !important;
    }
    
    .cursor {
        animation: blink 0.7s infinite;
    }
    
    @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
    }
    
    .typed-text {
        border-right: none;
    }
`;
document.head.appendChild(animationStyles);

// ============================================
// SMOOTH REVEAL ON SCROLL
// ============================================
$(window).scroll(function() {
    $('.content-section, .featured-projects-section').each(function() {
        var position = $(this).offset().top;
        var scroll = $(window).scrollTop();
        var windowHeight = $(window).height();
        
        if (scroll > position - windowHeight + 200) {
            $(this).addClass('visible');
        }
    });
});

// ============================================
// PARALLAX EFFECT FOR INTRO
// ============================================
$(window).scroll(function() {
    var scroll = $(window).scrollTop();
    $('.intro .intro-body').css({
        'transform': 'translateY(' + scroll * 0.3 + 'px)',
        'opacity': 1 - scroll / 600
    });
});

// ============================================
// FIXED SCROLL ARROW
// ============================================
$(document).ready(function() {
    var $scrollArrow = $('#scroll-arrow');
    var sections = ['#about', '#featured-projects', '#blog', '#contact'];
    var currentSectionIndex = 0;
    
    // Update arrow href based on current position
    function updateScrollArrow() {
        var scroll = $(window).scrollTop();
        var windowHeight = $(window).height();
        var documentHeight = $(document).height();
        
        // Hide arrow when near bottom of page
        if (scroll + windowHeight >= documentHeight - 100) {
            $scrollArrow.addClass('hidden');
            return;
        } else {
            $scrollArrow.removeClass('hidden');
        }
        
        // Find next section
        for (var i = 0; i < sections.length; i++) {
            var $section = $(sections[i]);
            if ($section.length && $section.offset().top > scroll + 100) {
                $scrollArrow.attr('href', sections[i]);
                return;
            }
        }
        
        // If past all sections, hide
        $scrollArrow.addClass('hidden');
    }
    
    // Update on scroll
    $(window).scroll(function() {
        updateScrollArrow();
    });
    
    // Initialize
    updateScrollArrow();
});
