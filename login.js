// SolarScheduler Login JavaScript
// Handles authentication, form validation, and user flow

class SolarSchedulerAuth {
    constructor() {
        this.currentTab = 'login';
        this.users = JSON.parse(localStorage.getItem('solarscheduler_users') || '[]');
        this.currentUser = JSON.parse(localStorage.getItem('solarscheduler_current_user') || 'null');
        
        this.init();
    }

    init() {
        console.log('SolarScheduler Auth: Initializing...');
        
        // Check if user is already logged in
        if (this.currentUser) {
            this.redirectToWelcome();
            return;
        }
        
        this.setupEventListeners();
        this.setupFormValidation();
        
        console.log('SolarScheduler Auth: Ready');
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e);
        });

        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup(e);
        });

        // Social auth buttons
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleSocialAuth(e.target.closest('.social-btn'));
            });
        });

        // Password strength checking
        document.getElementById('signup-password').addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
        });

        // Confirm password validation
        document.getElementById('signup-confirm-password').addEventListener('input', (e) => {
            this.validatePasswordMatch();
        });
    }

    setupFormValidation() {
        // Real-time email validation
        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.addEventListener('blur', (e) => {
                this.validateEmail(e.target);
            });
        });

        // Real-time password validation
        document.querySelectorAll('input[type="password"]').forEach(input => {
            input.addEventListener('blur', (e) => {
                this.validatePassword(e.target);
            });
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tabName}-form`).classList.add('active');
    }

    async handleLogin(event) {
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');

        this.showLoading('Signing you in...');

        try {
            // Simulate API delay
            await this.delay(1500);

            // Find user
            const user = this.users.find(u => u.email === email);
            
            if (!user) {
                throw new Error('No account found with this email address');
            }

            if (user.password !== password) {
                throw new Error('Invalid password');
            }

            // Successful login
            this.currentUser = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                company: user.company,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('solarscheduler_current_user', JSON.stringify(this.currentUser));

            this.showSuccess('Welcome back!');
            
            // Redirect to welcome page after brief delay
            setTimeout(() => {
                this.redirectToWelcome();
            }, 1000);

        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
        }
    }

    async handleSignup(event) {
        const formData = new FormData(event.target);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            company: formData.get('company'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };

        this.showLoading('Creating your account...');

        try {
            // Validate form
            this.validateSignupForm(userData);

            // Simulate API delay
            await this.delay(2000);

            // Check if user already exists
            if (this.users.find(u => u.email === userData.email)) {
                throw new Error('An account with this email already exists');
            }

            // Create new user
            const newUser = {
                id: Date.now().toString(),
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                company: userData.company,
                password: userData.password,
                createdAt: new Date().toISOString(),
                subscription: null
            };

            this.users.push(newUser);
            localStorage.setItem('solarscheduler_users', JSON.stringify(this.users));

            // Set as current user
            this.currentUser = {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                company: newUser.company,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('solarscheduler_current_user', JSON.stringify(this.currentUser));

            this.showSuccess('Account created successfully!');
            
            // Redirect to welcome page after brief delay
            setTimeout(() => {
                this.redirectToWelcome();
            }, 1000);

        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
        }
    }

    async handleSocialAuth(button) {
        const provider = button.classList.contains('google') ? 'Google' : 'Microsoft';
        
        this.showLoading(`Connecting to ${provider}...`);

        try {
            // Simulate OAuth flow
            await this.delay(2000);

            // For demo purposes, create a mock social user
            const mockUser = {
                id: Date.now().toString(),
                firstName: 'Demo',
                lastName: 'User',
                email: `demo.user@${provider.toLowerCase()}.com`,
                company: 'Demo Solar Company',
                provider: provider,
                createdAt: new Date().toISOString(),
                subscription: null
            };

            this.users.push(mockUser);
            localStorage.setItem('solarscheduler_users', JSON.stringify(this.users));

            this.currentUser = {
                id: mockUser.id,
                firstName: mockUser.firstName,
                lastName: mockUser.lastName,
                email: mockUser.email,
                company: mockUser.company,
                provider: provider,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('solarscheduler_current_user', JSON.stringify(this.currentUser));

            this.showSuccess(`Connected with ${provider}!`);
            
            setTimeout(() => {
                this.redirectToWelcome();
            }, 1000);

        } catch (error) {
            this.hideLoading();
            this.showError(`Failed to connect with ${provider}`);
        }
    }

    validateSignupForm(data) {
        if (data.password !== data.confirmPassword) {
            throw new Error('Passwords do not match');
        }

        if (data.password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        if (!this.isValidEmail(data.email)) {
            throw new Error('Please enter a valid email address');
        }

        if (!data.firstName.trim() || !data.lastName.trim()) {
            throw new Error('First and last name are required');
        }

        if (!data.company.trim()) {
            throw new Error('Company name is required');
        }
    }

    validateEmail(input) {
        const isValid = this.isValidEmail(input.value);
        this.updateFieldValidation(input, isValid, 'Please enter a valid email address');
        return isValid;
    }

    validatePassword(input) {
        const isValid = input.value.length >= 8;
        this.updateFieldValidation(input, isValid, 'Password must be at least 8 characters');
        return isValid;
    }

    validatePasswordMatch() {
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const isValid = password === confirmPassword && confirmPassword.length > 0;
        
        this.updateFieldValidation(
            document.getElementById('signup-confirm-password'),
            isValid,
            'Passwords do not match'
        );
        
        return isValid;
    }

    updateFieldValidation(input, isValid, errorMessage) {
        const inputGroup = input.closest('.input-group');
        
        // Remove existing validation classes
        inputGroup.classList.remove('error', 'success');
        
        // Remove existing error message
        const existingError = inputGroup.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        if (input.value.length > 0) {
            if (isValid) {
                inputGroup.classList.add('success');
            } else {
                inputGroup.classList.add('error');
                
                // Add error message
                const errorEl = document.createElement('div');
                errorEl.className = 'field-error';
                errorEl.textContent = errorMessage;
                inputGroup.parentNode.appendChild(errorEl);
            }
        }
    }

    updatePasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');

        let strength = 0;
        let strengthLevel = '';

        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        // Remove existing strength classes
        strengthBar.className = 'strength-fill';

        switch (strength) {
            case 0:
            case 1:
                strengthLevel = 'weak';
                strengthText.textContent = 'Weak password';
                break;
            case 2:
                strengthLevel = 'fair';
                strengthText.textContent = 'Fair password';
                break;
            case 3:
            case 4:
                strengthLevel = 'good';
                strengthText.textContent = 'Good password';
                break;
            case 5:
                strengthLevel = 'strong';
                strengthText.textContent = 'Strong password';
                break;
        }

        if (password.length > 0) {
            strengthBar.classList.add(strengthLevel);
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showLoading(message) {
        const loadingEl = document.getElementById('auth-loading');
        const messageEl = loadingEl.querySelector('p');
        messageEl.textContent = message;
        loadingEl.style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('auth-loading').style.display = 'none';
    }

    showSuccess(message) {
        this.hideLoading();
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Remove existing notifications
        document.querySelectorAll('.auth-notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `auth-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    redirectToWelcome() {
        window.location.href = '/index.html';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Password toggle functionality
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    const icon = toggle.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Initialize authentication when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.solarSchedulerAuth = new SolarSchedulerAuth();
});

// Add notification styles dynamically
const notificationStyles = `
    <style>
        .auth-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            display: flex;
            align-items: center;
            min-width: 300px;
            animation: slideIn 0.3s ease;
        }
        
        .auth-notification.success {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        
        .auth-notification.error {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex: 1;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0.25rem;
            opacity: 0.8;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
        
        .input-group.error input {
            border-color: #ef4444;
        }
        
        .input-group.success input {
            border-color: #10b981;
        }
        
        .field-error {
            color: #ef4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);