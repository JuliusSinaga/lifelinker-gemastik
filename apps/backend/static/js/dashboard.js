// Dashboard JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loaded successfully!');
    
    // Add smooth transitions to navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
        });
    });

    // Add hover effects to metric cards
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.06)';
        });
    });

    // Add click functionality to notification cards
    const notifications = document.querySelectorAll('.notification-card');
    notifications.forEach(notification => {
        notification.addEventListener('click', function() {
            this.style.opacity = '0.7';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 200);
        });
    });

    // Auto-refresh data every 30 seconds (placeholder for real implementation)
    setInterval(function() {
        console.log('Auto-refresh triggered (placeholder)');
        // Here you would typically fetch new data from the server
    }, 30000);

    // Add responsive sidebar toggle for mobile
    function addMobileToggle() {
        if (window.innerWidth <= 768) {
            const sidebar = document.querySelector('.sidebar');
            const mainContent = document.querySelector('.main-content');
            
            // Create toggle button if it doesn't exist
            if (!document.querySelector('.sidebar-toggle')) {
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'sidebar-toggle';
                toggleBtn.innerHTML = '☰';
                toggleBtn.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    z-index: 1000;
                    background: #dc2626;
                    color: white;
                    border: none;
                    padding: 10px;
                    border-radius: 5px;
                    font-size: 18px;
                    cursor: pointer;
                `;
                
                toggleBtn.addEventListener('click', function() {
                    sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
                });
                
                document.body.appendChild(toggleBtn);
            }
        }
    }

    // Call mobile toggle setup
    addMobileToggle();
    
    // Re-check on window resize
    window.addEventListener('resize', addMobileToggle);
});