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
    constructor(element, words, wait = 3000) {
        this.element = element;
        this.words = words;
        this.wait = parseInt(wait, 10);
        this.txt = '';
        this.wordIndex = 0;
        this.isDeleting = false;
        this.type();
    }

    type() {
        const current = this.wordIndex % this.words.length;
        const fullTxt = this.words[current];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.element.innerHTML = `<span class="typed-text">${this.txt}</span><span class="cursor">|</span>`;

        let typeSpeed = 100;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.wait;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// Initialize typing effect when DOM is loaded
$(document).ready(function() {
    const typedElement = document.getElementById('typed-output');
    if (typedElement) {
        const words = JSON.parse(typedElement.getAttribute('data-words'));
        const wait = typedElement.getAttribute('data-wait');
        new TypeWriter(typedElement, words, wait);
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
