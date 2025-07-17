// SolarScheduler PWA App JavaScript
// Handles app initialization, subscription validation, and UI interactions

class SolarSchedulerApp {
    constructor() {
        this.isSubscribed = false;
        this.subscriptionData = null;
        this.currentView = 'dashboard';
        this.deferredPrompt = null;
        
        this.init();
    }

    async init() {
        console.log('SolarScheduler App: Initializing...');
        
        // Register service worker
        await this.registerServiceWorker();
        
        // Check subscription status
        await this.checkSubscriptionStatus();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup PWA install prompt
        this.setupInstallPrompt();
        
        // Initialize app interface
        this.initializeApp();
        
        console.log('SolarScheduler App: Initialization complete');
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
                
                // Handle service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker is available
                            this.showUpdateAvailable();
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    async checkSubscriptionStatus() {
        try {
            // First check if user is logged in
            const currentUser = JSON.parse(localStorage.getItem('solarscheduler_current_user') || 'null');
            if (!currentUser) {
                console.log('No user logged in, redirecting to login');
                window.location.href = '/login.html';
                return;
            }

            // Check for stored subscription data
            const storedSubscription = localStorage.getItem('solarscheduler_subscription');
            if (storedSubscription) {
                const subscription = JSON.parse(storedSubscription);
                
                // Validate with server
                const response = await fetch(`/subscription-status/${subscription.customer_id}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'active') {
                        this.isSubscribed = true;
                        this.subscriptionData = data;
                        return;
                    }
                }
            }

            // Check URL parameters for subscription session
            const urlParams = new URLSearchParams(window.location.search);
            const sessionId = urlParams.get('session_id');
            
            if (sessionId) {
                // Validate session with Stripe
                const response = await fetch('/validate-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ session_id: sessionId })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.isSubscribed = true;
                    this.subscriptionData = data;
                    
                    // Store subscription data
                    localStorage.setItem('solarscheduler_subscription', JSON.stringify(data));
                    
                    // Clean URL
                    window.history.replaceState({}, document.title, '/app.html');
                    return;
                }
            }

            // No valid subscription found - user must subscribe
            this.isSubscribed = false;
        } catch (error) {
            console.error('Subscription check failed:', error);
            this.isSubscribed = false;
        }
    }

    initializeApp() {
        const loadingEl = document.getElementById('app-loading');
        const subscriptionEl = document.getElementById('subscription-required');
        const appEl = document.getElementById('app-main');

        if (this.isSubscribed) {
            // Show main app
            loadingEl.style.display = 'none';
            subscriptionEl.style.display = 'none';
            appEl.style.display = 'flex';
            
            // Initialize app features
            this.initializeNavigation();
            this.loadDashboardData();
        } else {
            // Show subscription required screen
            loadingEl.style.display = 'none';
            subscriptionEl.style.display = 'flex';
            appEl.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Refresh subscription button
        const refreshBtn = document.getElementById('refresh-subscription');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
                await this.checkSubscriptionStatus();
                this.initializeApp();
                refreshBtn.innerHTML = '<i class="fas fa-refresh"></i> I already subscribed';
            });
        }

        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // User menu
        const userMenuBtn = document.getElementById('user-menu');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', () => {
                this.showUserMenu();
            });
        }

        // Notifications
        const notificationsBtn = document.getElementById('notifications');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => {
                this.showNotifications();
            });
        }
    }

    initializeNavigation() {
        // Set initial active state
        this.switchView('dashboard');
    }

    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Update views
        document.querySelectorAll('.app-view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`).classList.add('active');

        this.currentView = viewName;

        // Load view-specific data
        this.loadViewData(viewName);
    }

    async loadViewData(viewName) {
        switch (viewName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'jobs':
                await this.loadJobsData();
                break;
            case 'calendar':
                await this.loadCalendarData();
                break;
            case 'team':
                await this.loadTeamData();
                break;
            case 'customers':
                await this.loadCustomersData();
                break;
            case 'reports':
                await this.loadReportsData();
                break;
        }
    }

    async loadDashboardData() {
        // Simulate API call with demo data
        console.log('Loading dashboard data...');
        
        // In a real app, this would fetch from your API
        const dashboardData = {
            stats: {
                revenue: 127500,
                projects: 23,
                installations: 8,
                energy: 45.2
            },
            recentJobs: [
                {
                    id: 1,
                    title: 'Solar Installation - Johnson Residence',
                    location: '123 Main St, City',
                    status: 'installing',
                    date: 'In Progress'
                },
                {
                    id: 2,
                    title: 'Maintenance Check - Smith Home',
                    location: '456 Oak Ave, City',
                    status: 'scheduled',
                    date: 'Tomorrow, 9:00 AM'
                }
            ],
            team: [
                {
                    id: 1,
                    name: 'John Doe',
                    role: 'Lead Installer',
                    status: 'available',
                    avatar: 'JD'
                },
                {
                    id: 2,
                    name: 'Sarah Miller',
                    role: 'Solar Technician',
                    status: 'onsite',
                    avatar: 'SM'
                }
            ]
        };

        // Update UI with data
        this.updateDashboardUI(dashboardData);
    }

    updateDashboardUI(data) {
        // Update stats if needed
        // Update job list if needed
        // Update team list if needed
        console.log('Dashboard UI updated with:', data);
    }

    async loadJobsData() {
        console.log('Loading jobs data...');
        // Implement jobs data loading
    }

    async loadCalendarData() {
        console.log('Loading calendar data...');
        // Implement calendar data loading
    }

    async loadTeamData() {
        console.log('Loading team data...');
        // Implement team data loading
    }

    async loadCustomersData() {
        console.log('Loading customers data...');
        // Implement customers data loading
    }

    async loadReportsData() {
        console.log('Loading reports data...');
        // Implement reports data loading
    }

    setupInstallPrompt() {
        // Listen for PWA install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        // Handle install button click
        const installBtn = document.getElementById('install-btn');
        const installDismiss = document.getElementById('install-dismiss');
        const installPrompt = document.getElementById('install-prompt');

        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (this.deferredPrompt) {
                    this.deferredPrompt.prompt();
                    const { outcome } = await this.deferredPrompt.userChoice;
                    console.log(`Install prompt outcome: ${outcome}`);
                    this.deferredPrompt = null;
                    installPrompt.style.display = 'none';
                }
            });
        }

        if (installDismiss) {
            installDismiss.addEventListener('click', () => {
                installPrompt.style.display = 'none';
                localStorage.setItem('installPromptDismissed', 'true');
            });
        }

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('App is running in standalone mode');
            return;
        }

        // Show install prompt if not dismissed
        const dismissed = localStorage.getItem('installPromptDismissed');
        if (!dismissed) {
            setTimeout(() => this.showInstallPrompt(), 5000);
        }
    }

    showInstallPrompt() {
        const installPrompt = document.getElementById('install-prompt');
        if (installPrompt && this.isSubscribed) {
            installPrompt.style.display = 'block';
        }
    }

    showUserMenu() {
        // Implement user menu
        console.log('Showing user menu...');
    }

    showNotifications() {
        // Implement notifications
        console.log('Showing notifications...');
    }

    showUpdateAvailable() {
        // Show update notification
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const updateBanner = document.createElement('div');
            updateBanner.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; background: #2563eb; color: white; padding: 1rem; text-align: center; z-index: 10000;">
                    <span>A new version is available!</span>
                    <button onclick="window.location.reload()" style="background: white; color: #2563eb; border: none; padding: 0.5rem 1rem; margin-left: 1rem; border-radius: 4px; cursor: pointer;">
                        Update Now
                    </button>
                </div>
            `;
            document.body.appendChild(updateBanner);
        }
    }

    // Utility methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(date));
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.solarSchedulerApp = new SolarSchedulerApp();
});

// Handle app state changes
window.addEventListener('online', () => {
    console.log('App is back online');
    if (window.solarSchedulerApp) {
        window.solarSchedulerApp.loadViewData(window.solarSchedulerApp.currentView);
    }
});

window.addEventListener('offline', () => {
    console.log('App is offline');
    // Show offline indicator
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarSchedulerApp;
}