   // Demo user credentials
        const users = {
            'lender@loanflow.com': { password: 'lender123', role: 'lender', name: 'zaheer Lender' },
            'borrower@loanflow.com': { password: 'borrower123', role: 'borrower', name: 'pardhav Borrower' },
            'admin@loanflow.com': { password: 'admin123', role: 'admin', name: 'kesava User' },
            'analyst@loanflow.com': { password: 'analyst123', role: 'analyst', name: 'pran Analyst' }
        };

        // Current user state
        let currentUser = null;

        // Navigation scroll functionality
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Login scroll button
        document.getElementById('login-scroll-btn').addEventListener('click', function() {
            document.getElementById('login').scrollIntoView({ behavior: 'smooth' });
        });

        // Learn more button
        document.getElementById('learn-more-btn').addEventListener('click', function() {
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
        });

        // Login functionality
        document.getElementById('login-btn').addEventListener('click', function() {
            const role = document.getElementById('user-role').value;
            const email = document.getElementById('user-email').value;
            const password = document.getElementById('user-password').value;
            
            // Validate credentials
            if (users[email] && users[email].password === password && users[email].role === role) {
                currentUser = {
                    email: email,
                    role: users[email].role,
                    name: users[email].name
                };
                
                // Show success notification
                showNotification('Login successful!', 'success');
                
                // Switch to app view
                document.getElementById('landing-page').classList.add('hidden');
                document.getElementById('app-container').classList.remove('hidden');
                
                // Update UI for current user
                updateUIForUser(currentUser);
            } else {
                showNotification('Invalid email, password, or role mismatch!', 'error');
            }
        });

        // Logout functionality
        document.getElementById('logout-btn').addEventListener('click', function() {
            currentUser = null;
            document.getElementById('app-container').classList.add('hidden');
            document.getElementById('landing-page').classList.remove('hidden');
            
            // Clear login forms
            document.getElementById('user-email').value = '';
            document.getElementById('user-password').value = '';
            
            showNotification('Logged out successfully!', 'success');
        });

        // Update UI based on user role
        function updateUIForUser(user) {
            document.getElementById('current-user').textContent = user.name;
            document.getElementById('user-name').textContent = user.name;
            document.getElementById('user-role').textContent = 
                user.role === 'analyst' ? 'Financial Analyst' : 
                user.role.charAt(0).toUpperCase() + user.role.slice(1);
            document.getElementById('user-avatar').textContent = 
                user.role === 'lender' ? 'L' : 
                user.role === 'borrower' ? 'B' : 
                user.role === 'admin' ? 'A' : 'FA';
            
            // Hide all dashboards
            document.querySelectorAll('.role-dashboard').forEach(dashboard => {
                dashboard.classList.add('hidden');
            });
            
            // Show appropriate dashboard
            document.getElementById(`${user.role}-dashboard`).classList.remove('hidden');
            
            // Update sidebar menu based on role
            updateSidebarMenu(user.role);
            
            // Update header navigation based on role
            updateHeaderNavigation(user.role);
        }

        // Update sidebar menu based on role
        function updateSidebarMenu(role) {
            const sidebarMenu = document.getElementById('sidebar-menu');
            sidebarMenu.innerHTML = '';
            
            let menuItems = [];
            
            if (role === 'lender') {
                menuItems = [
                    { id: 'dashboard', icon: 'tachometer-alt', text: 'Dashboard' },
                    { id: 'applications', icon: 'file-invoice-dollar', text: 'Loan Applications' },
                    { id: 'loans', icon: 'hand-holding-usd', text: 'Active Loans' },
                    { id: 'payments', icon: 'history', text: 'Payment History' },
                    { id: 'analytics', icon: 'chart-bar', text: 'Analytics' },
                    { id: 'settings', icon: 'cog', text: 'Settings' }
                ];
            } else if (role === 'borrower') {
                menuItems = [
                    { id: 'dashboard', icon: 'tachometer-alt', text: 'Dashboard' },
                    { id: 'browse', icon: 'search-dollar', text: 'Browse Loans' },
                    { id: 'applications', icon: 'file-contract', text: 'My Applications' },
                    { id: 'schedule', icon: 'calendar-check', text: 'Payment Schedule' },
                    { id: 'payments', icon: 'history', text: 'Payment History' },
                    { id: 'profile', icon: 'user', text: 'Profile' }
                ];
            } else if (role === 'admin') {
                menuItems = [
                    { id: 'dashboard', icon: 'tachometer-alt', text: 'Dashboard' },
                    { id: 'users', icon: 'users', text: 'User Management' },
                    { id: 'security', icon: 'shield-alt', text: 'Security' },
                    { id: 'settings', icon: 'cog', text: 'System Settings' },
                    { id: 'analytics', icon: 'chart-bar', text: 'System Analytics' }
                ];
            } else if (role === 'analyst') {
                menuItems = [
                    { id: 'dashboard', icon: 'tachometer-alt', text: 'Dashboard' },
                    { id: 'portfolio', icon: 'chart-line', text: 'Portfolio Analytics' },
                    { id: 'risk', icon: 'exclamation-triangle', text: 'Risk Analysis' },
                    { id: 'reports', icon: 'file-export', text: 'Reports' },
                    { id: 'data', icon: 'database', text: 'Data Management' }
                ];
            }
            
            menuItems.forEach((item, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="#" class="sidebar-link ${index === 0 ? 'active' : ''}" data-section="${item.id}">
                        <i class="fas fa-${item.icon}"></i> ${item.text}
                    </a>
                `;
                sidebarMenu.appendChild(li);
            });
            
            // Add event listeners to sidebar links
            document.querySelectorAll('.sidebar-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active class from all sidebar links
                    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                    
                    // Add active class to clicked link
                    this.classList.add('active');
                    
                    // Show corresponding section
                    const sectionId = this.getAttribute('data-section');
                    showSection(sectionId);
                });
            });
        }

        // Update header navigation based on role
        function updateHeaderNavigation(role) {
            const navLinks = document.querySelectorAll('.nav-dashboard, .nav-loans, .nav-payments, .nav-reports, .nav-settings');
            
            // Remove active class from all nav links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to dashboard link
            document.querySelector('.nav-dashboard').classList.add('active');
            
            // Add event listeners to header navigation
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active class from all nav links
                    navLinks.forEach(l => l.classList.remove('active'));
                    
                    // Add active class to clicked link
                    this.classList.add('active');
                    
                    // Show corresponding section based on link class and user role
                    const linkType = this.classList[0].replace('nav-', '');
                    let sectionId = '';
                    
                    if (linkType === 'dashboard') {
                        sectionId = 'dashboard';
                    } else if (linkType === 'loans') {
                        if (role === 'lender') sectionId = 'loans';
                        else if (role === 'borrower') sectionId = 'browse';
                        else if (role === 'admin') sectionId = 'users';
                        else if (role === 'analyst') sectionId = 'portfolio';
                    } else if (linkType === 'payments') {
                        if (role === 'lender') sectionId = 'payments';
                        else if (role === 'borrower') sectionId = 'schedule';
                        else if (role === 'admin') sectionId = 'security';
                        else if (role === 'analyst') sectionId = 'risk';
                    } else if (linkType === 'reports') {
                        if (role === 'lender') sectionId = 'analytics';
                        else if (role === 'borrower') sectionId = 'payments';
                        else if (role === 'admin') sectionId = 'analytics';
                        else if (role === 'analyst') sectionId = 'reports';
                    } else if (linkType === 'settings') {
                        if (role === 'lender') sectionId = 'settings';
                        else if (role === 'borrower') sectionId = 'profile';
                        else if (role === 'admin') sectionId = 'settings';
                        else if (role === 'analyst') sectionId = 'data';
                    }
                    
                    // Update sidebar active link
                    document.querySelectorAll('.sidebar-link').forEach(sidebarLink => {
                        sidebarLink.classList.remove('active');
                        if (sidebarLink.getAttribute('data-section') === sectionId) {
                            sidebarLink.classList.add('active');
                        }
                    });
                    
                    showSection(sectionId);
                });
            });
        }

        // Show section based on ID
        function showSection(sectionId) {
            // Hide all sections
            document.querySelectorAll('.section-content').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the selected section
            const currentDashboard = document.querySelector('.role-dashboard:not(.hidden)');
            const section = currentDashboard.querySelector(`#${currentUser.role}-${sectionId}-content`);
            if (section) {
                section.classList.add('active');
            }
        }

        // Show notification
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // Loan offer creation
        document.getElementById('create-offer-btn')?.addEventListener('click', function() {
            const amount = document.getElementById('loan-amount').value;
            const rate = document.getElementById('interest-rate').value;
            const term = document.getElementById('loan-term').value;
            const description = document.getElementById('loan-description').value;
            
            if (!amount || !rate || !term) {
                showNotification('Please fill in all required fields!', 'error');
                return;
            }
            
            showNotification(`Loan offer created successfully!`, 'success');
            
            // Reset form
            document.getElementById('loan-amount').value = '';
            document.getElementById('interest-rate').value = '';
            document.getElementById('loan-term').value = '';
            document.getElementById('loan-description').value = '';
        });

        // Loan application approval/rejection
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('approve-btn')) {
                const row = e.target.closest('tr');
                const applicant = row.cells[1].textContent;
                row.cells[4].innerHTML = '<span class="status approved">Approved</span>';
                row.cells[5].innerHTML = '<button class="btn btn-primary">View</button>';
                showNotification(`Loan application from ${applicant} approved!`, 'success');
            }
            
            if (e.target.classList.contains('reject-btn')) {
                const row = e.target.closest('tr');
                const applicant = row.cells[1].textContent;
                row.cells[4].innerHTML = '<span class="status rejected">Rejected</span>';
                row.cells[5].innerHTML = '<button class="btn btn-primary">View</button>';
                showNotification(`Loan application from ${applicant} rejected!`, 'error');
            }
            
            if (e.target.classList.contains('apply-btn')) {
                const row = e.target.closest('tr');
                const lender = row.cells[0].textContent;
                showNotification(`Loan application submitted to ${lender}!`, 'success');
            }
            
            if (e.target.classList.contains('pay-btn')) {
                const row = e.target.closest('tr');
                const amount = row.cells[1].textContent;
                row.cells[4].innerHTML = '<span class="status paid">Paid</span>';
                row.cells[5].innerHTML = '<button class="btn btn-outline" disabled>Paid</button>';
                showNotification(`Payment of ${amount} processed successfully!`, 'success');
            }
        });

        // Loan calculator functionality
        document.getElementById('calculate-btn').addEventListener('click', function() {
            const amount = parseFloat(document.getElementById('calc-loan-amount').value);
            const rate = parseFloat(document.getElementById('calc-interest-rate').value) / 100 / 12;
            const term = parseInt(document.getElementById('calc-loan-term').value);
            
            if (isNaN(amount) || isNaN(rate) || isNaN(term)) {
                showNotification('Please enter valid numbers for all fields!', 'error');
                return;
            }
            
            // Calculate monthly payment
            const monthlyPayment = (amount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
            const totalPayment = monthlyPayment * term;
            const totalInterest = totalPayment - amount;
            
            // Display results
            document.getElementById('monthly-payment').textContent = '$' + monthlyPayment.toFixed(2);
            document.getElementById('total-interest').textContent = '$' + totalInterest.toFixed(2);
            document.getElementById('total-payment').textContent = '$' + totalPayment.toFixed(2);
            
            document.getElementById('calculation-result').style.display = 'block';
        });

        // Initialize charts
        window.onload = function() {
            // Performance Chart for Analyst
            const performanceCtx = document.getElementById('performanceChart');
            if (performanceCtx) {
                new Chart(performanceCtx, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                        datasets: [{
                            label: 'Loan Portfolio Value ($)',
                            data: [2100000, 2150000, 2200000, 2250000, 2300000, 2320000, 2350000, 2380000, 2400000, 2420000],
                            borderColor: '#3498db',
                            backgroundColor: 'rgba(52, 152, 219, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: false,
                                ticks: {
                                    callback: function(value) {
                                        return '$' + (value / 1000000).toFixed(1) + 'M';
                                    }
                                }
                            }
                        }
                    }
                });
            }
            
            // System Chart for Admin
            const systemCtx = document.getElementById('systemChart');
            if (systemCtx) {
                new Chart(systemCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Active Loans', 'Pending Applications', 'Completed Loans', 'Defaulted Loans'],
                        datasets: [{
                            data: [67, 23, 145, 5],
                            backgroundColor: [
                                '#3498db',
                                '#f39c12',
                                '#2ecc71',
                                '#e74c3c'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
        };