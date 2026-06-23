$(document).ready(function() {
    // Helper: Show field error
    function showFieldError(inputEl, message) {
        const $input = $(inputEl);
        $input.addClass('is-invalid').removeClass('is-valid');
        $input.siblings('.invalid-feedback').text(message);
    }

    // Helper: Clear field error
    function clearFieldError(inputEl) {
        const $input = $(inputEl);
        $input.removeClass('is-invalid').addClass('is-valid');
        $input.siblings('.invalid-feedback').text('');
    }

    // Validate Login Form
    function validateLoginForm(formEl) {
        const $form = $(formEl);
        const email = $form.find('input[name="email"]').val().trim();
        const password = $form.find('input[name="password"]').val();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let isValid = true;

        // Validate email
        if (!email) {
            showFieldError($form.find('input[name="email"]'), 'Email is required.');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showFieldError($form.find('input[name="email"]'), 'Please enter a valid email.');
            isValid = false;
        } else {
            clearFieldError($form.find('input[name="email"]'));
        }

        // Validate password
        if (!password) {
            showFieldError($form.find('input[name="password"]'), 'Password is required.');
            isValid = false;
        } else if (password.length < 6) {
            showFieldError($form.find('input[name="password"]'), 'Password must be at least 6 characters.');
            isValid = false;
        } else {
            clearFieldError($form.find('input[name="password"]'));
        }

        return isValid;
    }

    // Validate Signup Form
    function validateSignupForm(formEl) {
        const $form = $(formEl);
        const name = $form.find('input[name="name"]').val().trim();
        const email = $form.find('input[name="email"]').val().trim();
        const role = $form.find('select[name="role"]').val();
        const password = $form.find('input[name="password"]').val();
        const confirmPassword = $form.find('input[name="confirmPassword"]').val();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let isValid = true;

        // Validate name
        if (!name) {
            showFieldError($form.find('input[name="name"]'), 'Name is required.');
            isValid = false;
        } else if (name.length < 2) {
            showFieldError($form.find('input[name="name"]'), 'Name must be at least 2 characters.');
            isValid = false;
        } else {
            clearFieldError($form.find('input[name="name"]'));
        }

        // Validate email
        if (!email) {
            showFieldError($form.find('input[name="email"]'), 'Email is required.');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showFieldError($form.find('input[name="email"]'), 'Please enter a valid email.');
            isValid = false;
        } else {
            clearFieldError($form.find('input[name="email"]'));
        }

        // Validate role
        if (!role) {
            showFieldError($form.find('select[name="role"]'), 'Please select a role.');
            isValid = false;
        } else {
            clearFieldError($form.find('select[name="role"]'));
        }

        // Validate password
        if (!password) {
            showFieldError($form.find('input[name="password"]'), 'Password is required.');
            isValid = false;
        } else if (password.length < 8) {
            showFieldError($form.find('input[name="password"]'), 'Password must be at least 8 characters.');
            isValid = false;
        } else {
            clearFieldError($form.find('input[name="password"]'));
        }

        // Validate confirm password
        if (!confirmPassword) {
            showFieldError($form.find('input[name="confirmPassword"]'), 'Please confirm your password.');
            isValid = false;
        } else if (confirmPassword !== password) {
            showFieldError($form.find('input[name="confirmPassword"]'), 'Passwords do not match.');
            isValid = false;
        } else {
            clearFieldError($form.find('input[name="confirmPassword"]'));
        }

        return isValid;
    }

    // Password Strength Meter
    function passwordStrengthMeter(passwordInput, meterContainer) {
        $(passwordInput).on('input', function() {
            const password = $(this).val();
            let score = 0;

            if (password.length >= 8) score++;
            if (/[A-Z]/.test(password)) score++;
            if (/[0-9]/.test(password)) score++;
            if (/[!@#$%^&*]/.test(password)) score++;

            const $meter = $(meterContainer);
            $meter.find('div').removeClass('bg-danger bg-warning bg-success');

            if (score === 1) {
                $meter.find('div:nth-child(1)').addClass('bg-danger');
            } else if (score === 2) {
                $meter.find('div:nth-child(1), div:nth-child(2)').addClass('bg-warning');
            } else if (score === 3) {
                $meter.find('div:nth-child(1), div:nth-child(2), div:nth-child(3)').addClass('bg-warning');
            } else if (score === 4) {
                $meter.find('div').addClass('bg-success');
            }
        });
    }

    // Attach validators
    const $loginForm = $('#loginForm');
    if ($loginForm.length) {
        $loginForm.on('submit', function(e) {
            e.preventDefault();
            if (validateLoginForm(this)) {
                // Submit form
                this.submit();
            }
        });
    }

    const $signupForm = $('#signupForm');
    if ($signupForm.length) {
        $signupForm.on('submit', function(e) {
            e.preventDefault();
            if (validateSignupForm(this)) {
                // Submit form
                this.submit();
            }
        });

        // Attach password strength meter
        passwordStrengthMeter('input[name="password"]', '#passwordMeter');
    }
});