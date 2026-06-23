$(document).ready(function() {
    // Staggered fade-in animation for cards
    $('.card').each(function(i) {
        $(this).delay(i * 100).fadeIn(400);
    });

    // Navbar active link detection
    const currentPath = window.location.pathname;
    $('.navbar-nav a').each(function() {
        if ($(this).attr('href') === currentPath) {
            $(this).addClass('active').attr('aria-current', 'page');
        } else {
            $(this).removeClass('active');
        }
    });

    // Bootstrap toast helper function
    window.showToast = function(message, type = 'info') {
        const toastHtml = `
            <div class="toast align-items-center text-white bg-${type}" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        const toastContainer = $('#toast-container').length ? $('#toast-container') : $('<div id="toast-container" class="position-fixed bottom-0 end-0 p-3"></div>').appendTo('body');
        const toastElement = $(toastHtml).appendTo(toastContainer);
        new bootstrap.Toast(toastElement[0]).show();
        toastElement.on('hidden.bs.toast', function() {
            $(this).remove();
        });
    };

    // Animated counter for stat cards
    $('[data-target]').each(function() {
        const target = parseInt($(this).data('target'));
        const duration = 1000;
        const increment = target / (duration / 16);
        let current = 0;
        const $element = $(this);
        
        const counter = setInterval(function() {
            current += increment;
            if (current >= target) {
                $element.text(target);
                clearInterval(counter);
            } else {
                $element.text(Math.floor(current));
            }
        }, 16);
    });

    // Generic confirm-delete helper
    $(document).on('click', '.btn-delete', function(e) {
        if (!confirm('Are you sure you want to delete this item?')) {
            e.preventDefault();
        }
    });

    // Auto-dismiss Bootstrap alerts after 4 seconds
    $('.alert').each(function() {
        setTimeout(() => {
            $(this).fadeOut(500, function() {
                $(this).remove();
            });
        }, 4000);
    });

    // Smooth scroll for anchor links
    $('a[href^="#"]').on('click', function(e) {
        const target = $(this.getAttribute('href'));
        if (target.length) {
            e.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 80
            }, 1000);
        }
    });
});