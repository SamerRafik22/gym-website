// Admin Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.id || user.role !== 'admin') {
        // Redirect to login if not authenticated or not admin
        alert('Admin access required!');
        window.location.href = '/login';
        return;
    }
    
    // Initialize admin dashboard
    initializeAdminDashboard();
    setupTabNavigation();
    loadDashboardStats();
    loadMembers();
});

function initializeAdminDashboard() {
    console.log('Initializing Admin Dashboard...');
    
    // Update navigation for admin
    updateAdminNavigation();
    
    // Set up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
        console.log('Logout button event listener added');
    }
    
    // Set up action buttons
    const createSessionBtn = document.getElementById('createSessionBtn');
    if (createSessionBtn) {
        createSessionBtn.addEventListener('click', createSession);
        console.log('Create session button event listener added');
    }
    
    const refreshMembersBtn = document.getElementById('refreshMembersBtn');
    if (refreshMembersBtn) {
        refreshMembersBtn.addEventListener('click', refreshMembers);
    }
    
    const refreshSessionsBtn = document.getElementById('refreshSessionsBtn');
    if (refreshSessionsBtn) {
        refreshSessionsBtn.addEventListener('click', refreshSessions);
    }
    
    const createNutritionBtn = document.getElementById('createNutritionBtn');
    if (createNutritionBtn) {
        createNutritionBtn.addEventListener('click', createNutritionPlan);
    }
    
    const refreshNutritionBtn = document.getElementById('refreshNutritionBtn');
    if (refreshNutritionBtn) {
        refreshNutritionBtn.addEventListener('click', refreshNutritionPlans);
    }
    
    const refreshReservationsBtn = document.getElementById('refreshReservationsBtn');
    if (refreshReservationsBtn) {
        refreshReservationsBtn.addEventListener('click', refreshReservations);
    }
    
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
    
    // Set up modal close buttons
    const closeMemberModalBtn = document.getElementById('closeMemberModalBtn');
    if (closeMemberModalBtn) {
        closeMemberModalBtn.addEventListener('click', closeMemberModal);
    }
    
    const closeSessionModalBtn = document.getElementById('closeSessionModalBtn');
    if (closeSessionModalBtn) {
        closeSessionModalBtn.addEventListener('click', closeSessionModal);
    }
    
    const closeNutritionModalBtn = document.getElementById('closeNutritionModalBtn');
    if (closeNutritionModalBtn) {
        closeNutritionModalBtn.addEventListener('click', closeNutritionModal);
    }
    
    // Set up search functionality
    const memberSearch = document.getElementById('memberSearch');
    if (memberSearch) {
        memberSearch.addEventListener('input', debounce(searchMembers, 300));
    }
    
    // Set up filter functionality
    const reservationFilter = document.getElementById('reservationFilter');
    if (reservationFilter) {
        reservationFilter.addEventListener('change', filterReservations);
    }
}

function updateAdminNavigation() {
    // Add admin indicator to navigation
    setTimeout(() => {
        const userGreeting = document.querySelector('.user-greeting');
        
        if (userGreeting) {
            userGreeting.innerHTML = '<span style="color: #ff7a1a;">🛡️ Admin</span>';
        }
    }, 100);
}

function setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            btn.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            // Load data for the selected tab
            loadTabData(tabName);
        });
    });
}

function loadTabData(tabName) {
    switch(tabName) {
        case 'users':
            loadMembers();
            break;
        case 'sessions':
            loadSessions();
            break;
        case 'reservations':
            loadReservations();
            break;
        case 'nutrition':
            loadNutritionPlans();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

async function loadDashboardStats() {
    try {
        const token = localStorage.getItem('token');
        
        // Load dashboard statistics
        const response = await fetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            const stats = result.data;
            
            // Update dashboard stats
            document.getElementById('totalMembers').textContent = stats.totalMembers || 0;
            document.getElementById('monthlyRevenue').textContent = `$${stats.monthlyRevenue || 0}`;
            document.getElementById('todaysSessions').textContent = stats.todaysSessions || 0;
            document.getElementById('activeReservations').textContent = stats.activeReservations || 0;
        } else {
            throw new Error('Failed to load stats');
        }
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Show simulated data for demo
        loadSimulatedStats();
    }
}

function loadSimulatedStats() {
    // Fallback simulated statistics based on our test data
    document.getElementById('totalMembers').textContent = '4';
    document.getElementById('monthlyRevenue').textContent = '$237';
    document.getElementById('todaysSessions').textContent = '0';
    document.getElementById('activeReservations').textContent = '0';
}

// Initialize pagination managers
let membersPaginationManager;
let sessionsPaginationManager;
let reservationsPaginationManager;
let nutritionPaginationManager;

async function loadMembers(page = 1, limit = 2) {
    const membersGrid = document.getElementById('membersGrid');
    membersGrid.innerHTML = '<div class="loading">Loading members...</div>';
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            displayMembers(result.data || []);
            
            // Initialize or update pagination
            if (!membersPaginationManager) {
                membersPaginationManager = createPaginationManager('membersPagination', {
                    onPageChange: (page, limit) => loadMembers(page, limit)
                });
            }
            membersPaginationManager.updatePagination(result.pagination);
        } else {
            console.error('API Error:', response.status, response.statusText);
            throw new Error('Failed to load members');
        }
    } catch (error) {
        console.error('Error loading members:', error);
        // Show simulated data for demo
        displaySimulatedMembers();
    }
}

function displayMembers(members) {
    const membersGrid = document.getElementById('membersGrid');
    
    if (members.length === 0) {
        membersGrid.innerHTML = '<div class="empty-state">No members found</div>';
        return;
    }
    
    const membersHTML = members.map(member => `
        <div class="member-card" data-member-id="${member._id}">
            <div class="member-avatar">
                <span class="avatar-text">${member.name.charAt(0)}</span>
            </div>
            <div class="member-info">
                <h3>${member.name}</h3>
                <p class="member-email">${member.email}</p>
                <div class="member-meta">
                    <span class="membership-badge ${member.membershipType}">${member.membershipType}</span>
                    <span class="member-status ${member.membershipStatus}">${member.membershipStatus}</span>
                </div>
                <div class="member-actions">
                    <button class="action-btn small edit-member-btn" data-member-id="${member._id}">Edit</button>
                    <button class="action-btn small danger delete-member-btn" data-member-id="${member._id}">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
    
    membersGrid.innerHTML = membersHTML;
    
    // Add event listeners for member actions
    document.querySelectorAll('.edit-member-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const memberId = btn.getAttribute('data-member-id');
            editMember(memberId);
        });
    });
    
    document.querySelectorAll('.delete-member-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const memberId = btn.getAttribute('data-member-id');
            deleteMember(memberId);
        });
    });
    
    document.querySelectorAll('.member-card').forEach(card => {
        card.addEventListener('click', () => {
            const memberId = card.getAttribute('data-member-id');
            viewMember(memberId);
        });
    });
}

function displaySimulatedMembers() {
    const simulatedMembers = [
        { 
            _id: '1', 
            name: 'Test User', 
            email: 'test@example.com', 
            membershipType: 'elite', 
            membershipStatus: 'active' 
        },
        { 
            _id: '2', 
            name: 'John Doe', 
            email: 'john@example.com', 
            membershipType: 'premium', 
            membershipStatus: 'active' 
        },
        { 
            _id: '3', 
            name: 'Jane Smith', 
            email: 'jane@example.com', 
            membershipType: 'standard', 
            membershipStatus: 'active' 
        }
    ];
    
    displayMembers(simulatedMembers);
    
    // Initialize pagination for simulated data
    if (!membersPaginationManager) {
        membersPaginationManager = createPaginationManager('membersPagination', {
            onPageChange: (page, limit) => loadMembers(page, limit)
        });
    }
    
    // Set up pagination for simulated data (3 items, 2 pages with limit=2)
    membersPaginationManager.updatePagination({
        currentPage: 1,
        totalPages: 2,
        totalItems: 3,
        itemsPerPage: 2
    });
}

async function loadSessions(page = 1, limit = 2) {
    const sessionsList = document.getElementById('sessionsList');
    sessionsList.innerHTML = '<div class="loading">Loading sessions...</div>';
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/sessions?page=${page}&limit=${limit}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            displaySessions(result.data || []);
            
            // Initialize or update pagination
            if (!sessionsPaginationManager) {
                sessionsPaginationManager = createPaginationManager('sessionsPagination', {
                    onPageChange: (page, limit) => loadSessions(page, limit)
                });
            }
            sessionsPaginationManager.updatePagination(result.pagination);
        } else {
            console.error('Sessions API Error:', response.status, response.statusText);
            throw new Error('Failed to load sessions');
        }
    } catch (error) {
        console.error('Error loading sessions:', error);
        displaySimulatedSessions();
    }
}

function displaySessions(sessions) {
    const sessionsList = document.getElementById('sessionsList');
    
    if (sessions.length === 0) {
        sessionsList.innerHTML = '<div class="empty-state">No sessions found</div>';
        return;
    }
    
    const sessionsHTML = sessions.map(session => `
        <div class="session-card">
            <div class="session-info">
                <h3>${session.name}</h3>
                <p class="session-meta">
                    <span class="session-type">${session.type.replace('-', ' ')}</span>
                    <span class="session-date">${new Date(session.date).toLocaleDateString()}</span>
                    <span class="session-time">${session.time}</span>
                </p>
                <div class="session-capacity">
                    <span>Capacity: ${session.currentBookings || 0}/${session.maxCapacity}</span>
                    ${session.description ? `<p class="session-description">${session.description}</p>` : ''}
                </div>
            </div>
            <div class="session-actions">
                <button class="action-btn small edit-session-btn" data-session-id="${session._id}">Edit</button>
                <button class="action-btn small danger delete-session-btn" data-session-id="${session._id}">Delete</button>
            </div>
        </div>
    `).join('');
    
    sessionsList.innerHTML = sessionsHTML;
    
    // Add event listeners for session actions
    document.querySelectorAll('.edit-session-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sessionId = btn.getAttribute('data-session-id');
            editSession(sessionId);
        });
    });
    
    document.querySelectorAll('.delete-session-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sessionId = btn.getAttribute('data-session-id');
            deleteSession(sessionId);
        });
    });
}

function displaySimulatedSessions() {
    const simulatedSessions = [
        {
            _id: '1',
            name: 'Morning Yoga',
            type: 'group',
            date: new Date(),
            time: '09:00 AM',
            currentBookings: 8,
            maxCapacity: 15
        },
        {
            _id: '2',
            name: 'Personal Training with Mike',
            type: 'private-session',
            date: new Date(),
            time: '02:00 PM',
            currentBookings: 1,
            maxCapacity: 1
        }
    ];
    
    displaySessions(simulatedSessions);
    
    // Initialize pagination for simulated data
    if (!sessionsPaginationManager) {
        sessionsPaginationManager = createPaginationManager('sessionsPagination', {
            onPageChange: (page, limit) => loadSessions(page, limit)
        });
    }
    
    // Set up pagination for simulated data (2 items, 1 page with limit=2)
    sessionsPaginationManager.updatePagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 2
    });
}

async function loadReservations(page = 1, limit = 2) {
    const reservationsList = document.getElementById('reservationsList');
    reservationsList.innerHTML = '<div class="loading">Loading reservations...</div>';
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/reservations?page=${page}&limit=${limit}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            displayReservations(result.data || []);
            
            // Initialize or update pagination
            if (!reservationsPaginationManager) {
                reservationsPaginationManager = createPaginationManager('reservationsPagination', {
                    onPageChange: (page, limit) => loadReservations(page, limit)
                });
            }
            reservationsPaginationManager.updatePagination(result.pagination);
        } else {
            console.error('Reservations API Error:', response.status, response.statusText);
            throw new Error('Failed to load reservations');
        }
    } catch (error) {
        console.error('Error loading reservations:', error);
        // Show simulated data for demo
        const simulatedReservations = [
            {
                _id: '1',
                userId: { name: 'Test User', email: 'test@example.com' },
                sessionId: { name: 'Morning Yoga', date: new Date(), time: '09:00 AM' },
                status: 'confirmed',
                bookingDate: new Date()
            }
        ];
        displayReservations(simulatedReservations);
        
        // Initialize pagination for simulated data
        if (!reservationsPaginationManager) {
            reservationsPaginationManager = createPaginationManager('reservationsPagination', {
                onPageChange: (page, limit) => loadReservations(page, limit)
            });
        }
        
        // Set up pagination for simulated data (1 item, 1 page with limit=2) 
        reservationsPaginationManager.updatePagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: 1,
            itemsPerPage: 2
        });
    }
}

function displayReservations(reservations) {
    const reservationsList = document.getElementById('reservationsList');
    
    if (reservations.length === 0) {
        reservationsList.innerHTML = '<div class="empty-state">No reservations found</div>';
        return;
    }
    
            const reservationsHTML = reservations.map(reservation => `
        <div class="reservation-card">
            <div class="reservation-info">
                <h3>${reservation.userId?.name || 'Unknown User'}</h3>
                <p class="reservation-session">${reservation.sessionId?.name || 'Unknown Session'}</p>
                <p class="reservation-meta">
                    <span>${reservation.sessionId?.date ? new Date(reservation.sessionId.date).toLocaleDateString() : 'No date'}</span>
                    <span>${reservation.sessionId?.time || 'No time'}</span>
                    <span class="status ${reservation.status}">${reservation.status}</span>
                </p>
            </div>
            <div class="reservation-actions">
                <button class="action-btn small confirm-reservation-btn" data-reservation-id="${reservation._id}">Confirm</button>
                <button class="action-btn small danger cancel-reservation-btn" data-reservation-id="${reservation._id}">Cancel</button>
            </div>
        </div>
    `).join('');
    
    reservationsList.innerHTML = reservationsHTML;
    
    // Add event listeners for reservation actions
    document.querySelectorAll('.confirm-reservation-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const reservationId = btn.getAttribute('data-reservation-id');
            updateReservationStatus(reservationId, 'confirmed');
        });
    });
    
    document.querySelectorAll('.cancel-reservation-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const reservationId = btn.getAttribute('data-reservation-id');
            updateReservationStatus(reservationId, 'cancelled');
        });
    });
}

async function loadNutritionPlans(page = 1, limit = 2) {
    const nutritionPlansGrid = document.getElementById('nutritionPlansGrid');
    nutritionPlansGrid.innerHTML = '<div class="loading">Loading nutrition plans...</div>';
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/nutrition-plans?page=${page}&limit=${limit}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            displayNutritionPlans(result.data || []);
            
            // Initialize or update pagination
            if (!nutritionPaginationManager) {
                nutritionPaginationManager = createPaginationManager('nutritionPagination', {
                    onPageChange: (page, limit) => loadNutritionPlans(page, limit)
                });
            }
            nutritionPaginationManager.updatePagination(result.pagination);
        } else {
            console.error('Nutrition Plans API Error:', response.status, response.statusText);
            throw new Error('Failed to load nutrition plans');
        }
    } catch (error) {
        console.error('Error loading nutrition plans:', error);
        // Show simulated data for demo
        const simulatedPlans = [
            {
                _id: '1',
                name: 'Weight Loss Plan',
                description: 'Balanced plan for healthy weight loss',
                category: 'weight-loss',
                assignedUsers: 5
            },
            {
                _id: '2',
                name: 'Muscle Gain Plan',
                description: 'High protein plan for muscle building',
                category: 'muscle-gain',
                assignedUsers: 3
            }
        ];
        displayNutritionPlans(simulatedPlans);
        
        // Initialize pagination for simulated data
        if (!nutritionPaginationManager) {
            nutritionPaginationManager = createPaginationManager('nutritionPagination', {
                onPageChange: (page, limit) => loadNutritionPlans(page, limit)
            });
        }
        
        // Set up pagination for simulated data (2 items, 1 page with limit=2)
        nutritionPaginationManager.updatePagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: 2,
            itemsPerPage: 2
        });
    }
}

function displayNutritionPlans(plans) {
    const nutritionPlansGrid = document.getElementById('nutritionPlansGrid');
    
    if (plans.length === 0) {
        nutritionPlansGrid.innerHTML = '<div class="empty-state">No nutrition plans found</div>';
        return;
    }
    
    const plansHTML = plans.map(plan => `
        <div class="nutrition-plan-card">
            <div class="plan-info">
                <h3>${plan.name}</h3>
                <p class="plan-description">${plan.description}</p>
                <div class="plan-meta">
                    <span class="plan-category">${plan.category}</span>
                    <span class="plan-assigned">${plan.assignedUsers || 0} users assigned</span>
                </div>
            </div>
            <div class="plan-actions">
                <button class="action-btn small edit-nutrition-btn" data-plan-id="${plan._id}">Edit</button>
                <button class="action-btn small danger delete-nutrition-btn" data-plan-id="${plan._id}">Delete</button>
            </div>
        </div>
    `).join('');
    
    nutritionPlansGrid.innerHTML = plansHTML;
    
    // Add event listeners for nutrition plan actions
    document.querySelectorAll('.edit-nutrition-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const planId = btn.getAttribute('data-plan-id');
            editNutritionPlan(planId);
        });
    });
    
    document.querySelectorAll('.delete-nutrition-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const planId = btn.getAttribute('data-plan-id');
            deleteNutritionPlan(planId);
        });
    });
}

async function loadAnalytics() {
    try {
        console.log('Loading real analytics data...');
        const token = localStorage.getItem('token');
        
        // Load real analytics data from backend
        const response = await fetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            const stats = result.data;
            console.log('Analytics stats received:', stats);
            
            // Update membership distribution
            document.getElementById('standardCount').textContent = stats.membershipStats?.standard || 0;
            document.getElementById('premiumCount').textContent = stats.membershipStats?.premium || 0;
            document.getElementById('eliteCount').textContent = stats.membershipStats?.elite || 0;
            
            // Update revenue
            document.getElementById('thisMonthRevenue').textContent = `$${stats.monthlyRevenue || 0}`;
            
            // Calculate last month revenue (90% of current for demo)
            const lastMonthRevenue = Math.floor((stats.monthlyRevenue || 0) * 0.9);
            document.getElementById('lastMonthRevenue').textContent = `$${lastMonthRevenue}`;
            
            // Calculate growth percentage
            const growthPercent = lastMonthRevenue > 0 
                ? (((stats.monthlyRevenue || 0) - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
                : 0;
            document.getElementById('revenueGrowth').textContent = `+${growthPercent}%`;
            
            // Load session statistics
            await loadSessionStats();
            
        } else {
            throw new Error('Failed to load analytics');
        }
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        // Fallback to simulated data if API fails
        loadSimulatedAnalytics();
    }
}

async function loadSessionStats() {
    try {
        const token = localStorage.getItem('token');
        
        // Get sessions data
        const response = await fetch('/api/admin/sessions', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            const sessions = result.data || [];
            
            // Count sessions by type
            const sessionTypes = sessions.reduce((acc, session) => {
                acc[session.type] = (acc[session.type] || 0) + 1;
                return acc;
            }, {});
            
            document.getElementById('groupClassCount').textContent = sessionTypes['group'] || 0;
            document.getElementById('personalTrainingCount').textContent = sessionTypes['private-session'] || 0;
            document.getElementById('privateCoachingCount').textContent = sessionTypes['private-coach'] || 0;
            
        } else {
            // Use placeholder values if sessions API fails
            document.getElementById('groupClassCount').textContent = '0';
            document.getElementById('personalTrainingCount').textContent = '0';
            document.getElementById('privateCoachingCount').textContent = '0';
        }
        
    } catch (error) {
        console.error('Error loading session stats:', error);
        // Use placeholder values if API fails
        document.getElementById('groupClassCount').textContent = '0';
        document.getElementById('personalTrainingCount').textContent = '0';
        document.getElementById('privateCoachingCount').textContent = '0';
    }
}

function loadSimulatedAnalytics() {
    // Fallback simulated analytics data
    console.log('Using simulated analytics data');
    document.getElementById('standardCount').textContent = '2';
    document.getElementById('premiumCount').textContent = '1';
    document.getElementById('eliteCount').textContent = '1';
    
    document.getElementById('thisMonthRevenue').textContent = '$237';
    document.getElementById('lastMonthRevenue').textContent = '$190';
    document.getElementById('revenueGrowth').textContent = '+24.7%';
    
    document.getElementById('groupClassCount').textContent = '0';
    document.getElementById('personalTrainingCount').textContent = '0';
    document.getElementById('privateCoachingCount').textContent = '0';
}

// Action functions
function refreshMembers() {
    loadMembers();
}

function refreshSessions() {
    loadSessions();
}

function refreshReservations() {
    loadReservations();
}

function refreshNutritionPlans() {
    loadNutritionPlans();
}

async function viewMember(memberId) {
    try {
        console.log('Loading member details for:', memberId);
        const token = localStorage.getItem('token');
        
        // Fetch member details from API
        const response = await fetch(`/api/admin/users/${memberId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            const member = result.data;
            
            // Format the member details
            const memberDetails = `
                <div class="member-details">
                    <div class="member-header">
                        <h4>${member.name}</h4>
                        <span class="membership-badge ${member.membershipType}">${member.membershipType.toUpperCase()}</span>
                    </div>
                    
                    <div class="member-info-grid">
                        <div class="info-section">
                            <h5>📧 Contact Information</h5>
                            <p><strong>Email:</strong> ${member.email}</p>
                            <p><strong>Phone:</strong> ${member.phone || 'Not provided'}</p>
                            <p><strong>Username:</strong> ${member.username || 'Not set'}</p>
                        </div>
                        
                        <div class="info-section">
                            <h5>📍 Address</h5>
                            <p><strong>Address:</strong> ${member.address || 'Not provided'}</p>
                            <p><strong>City:</strong> ${member.city || 'Not provided'}</p>
                            <p><strong>ZIP:</strong> ${member.zipCode || 'Not provided'}</p>
                        </div>
                        
                        <div class="info-section">
                            <h5>👤 Personal Details</h5>
                            <p><strong>Age:</strong> ${member.age || 'Not provided'}</p>
                            <p><strong>Gender:</strong> ${member.gender || 'Not specified'}</p>
                            <p><strong>Join Date:</strong> ${new Date(member.joinDate).toLocaleDateString()}</p>
                        </div>
                        
                        <div class="info-section">
                            <h5>💳 Membership Details</h5>
                            <p><strong>Type:</strong> ${member.membershipType}</p>
                            <p><strong>Status:</strong> ${member.membershipStatus}</p>
                            <p><strong>Expiry:</strong> ${member.membershipExpiry ? new Date(member.membershipExpiry).toLocaleDateString() : 'Not set'}</p>
                        </div>
                        
                        <div class="info-section">
                            <h5>🎁 Benefits Remaining</h5>
                            <p><strong>Guest Passes:</strong> ${member.guestPassesRemaining || 0}</p>
                            <p><strong>Personal Training Sessions:</strong> ${member.personalTrainingSessionsRemaining || 0}</p>
                        </div>
                        
                        <div class="info-section">
                            <h5>🆘 Emergency Contact</h5>
                            <p><strong>Name:</strong> ${member.emergencyName || 'Not provided'}</p>
                            <p><strong>Phone:</strong> ${member.emergencyPhone || 'Not provided'}</p>
                            <p><strong>Relation:</strong> ${member.emergencyRelation || 'Not specified'}</p>
                        </div>
                    </div>
                    
                    <div class="member-actions">
                        <button class="action-btn" onclick="editMember('${memberId}')">✏️ Edit Member</button>
                        <button class="action-btn danger" onclick="deleteMember('${memberId}')">🗑️ Delete Member</button>
                    </div>
                </div>
            `;
            
            // Update modal content
            document.getElementById('memberModalTitle').textContent = 'Member Details';
            document.getElementById('memberModalBody').innerHTML = memberDetails;
            
            // Show modal
            document.getElementById('memberModal').style.display = 'block';
            
        } else {
            throw new Error('Failed to load member details');
        }
        
    } catch (error) {
        console.error('Error loading member details:', error);
        alert('❌ Error loading member details. Please try again.');
    }
}

async function editMember(memberId) {
    try {
        // First, get the member data
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/users/${memberId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch member data');
        }
        
        const result = await response.json();
        const member = result.data;
        
        // Show member edit modal
        const memberModal = document.getElementById('memberModal');
        const modalTitle = document.getElementById('memberModalTitle');
        const modalBody = document.getElementById('memberModalBody');
        
        modalTitle.textContent = 'Edit Member';
        modalBody.innerHTML = `
            <form id="memberForm">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="memberName" value="${member.name}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="memberEmail" value="${member.email}" required>
                </div>
                <div class="form-group">
                    <label>Membership Type</label>
                    <select id="memberType" required>
                        <option value="standard" ${member.membershipType === 'standard' ? 'selected' : ''}>Standard</option>
                        <option value="premium" ${member.membershipType === 'premium' ? 'selected' : ''}>Premium</option>
                        <option value="elite" ${member.membershipType === 'elite' ? 'selected' : ''}>Elite</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="memberStatus" required>
                        <option value="active" ${member.membershipStatus === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${member.membershipStatus === 'inactive' ? 'selected' : ''}>Inactive</option>
                        <option value="suspended" ${member.membershipStatus === 'suspended' ? 'selected' : ''}>Suspended</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select id="memberRole" required>
                        <option value="member" ${member.role === 'member' ? 'selected' : ''}>Member</option>
                        <option value="trainer" ${member.role === 'trainer' ? 'selected' : ''}>Trainer</option>
                        <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" onclick="closeMemberModal()" class="action-btn">Cancel</button>
                    <button type="submit" class="action-btn primary">Update Member</button>
                </div>
            </form>
        `;
        
        memberModal.style.display = 'block';
        
        // Handle form submission
        document.getElementById('memberForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const updateData = {
                name: document.getElementById('memberName').value,
                email: document.getElementById('memberEmail').value,
                membershipType: document.getElementById('memberType').value,
                membershipStatus: document.getElementById('memberStatus').value,
                role: document.getElementById('memberRole').value
            };
            
            try {
                const updateResponse = await fetch(`/api/admin/users/${memberId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updateData)
                });
                
                const updateResult = await updateResponse.json();
                
                if (updateResult.success) {
                    alert('Member updated successfully!');
                    closeMemberModal();
                    loadMembers(); // Refresh the members list
                } else {
                    alert('Error: ' + updateResult.message);
                }
            } catch (error) {
                console.error('Update member error:', error);
                alert('Failed to update member');
            }
        });
        
    } catch (error) {
        console.error('Edit member error:', error);
        alert('Failed to load member data');
    }
}

async function deleteMember(memberId) {
    if (confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/users/${memberId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Member deleted successfully!');
                loadMembers(); // Refresh the members list
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Delete member error:', error);
            alert('Failed to delete member');
        }
    }
}

function createSession() {
    const sessionModal = document.getElementById('sessionModal');
    const modalTitle = document.getElementById('sessionModalTitle');
    const modalBody = document.getElementById('sessionModalBody');
    
    modalTitle.textContent = 'Create New Session';
    modalBody.innerHTML = `
        <form id="sessionForm">
            <div class="form-group">
                <label>Session Name</label>
                <input type="text" id="sessionName" required>
            </div>
            <div class="form-group">
                <label>Type</label>
                <select id="sessionType" required>
                    <option value="group">Group Class</option>
                    <option value="private-coach">Private Coach</option>
                    <option value="private-session">Private Session</option>
                </select>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="sessionDate" required>
            </div>
            <div class="form-group">
                <label>Time</label>
                <input type="time" id="sessionTime" required>
            </div>
            <div class="form-group">
                <label>Max Capacity</label>
                <input type="number" id="sessionCapacity" min="1" max="100" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="sessionDescription" rows="3"></textarea>
            </div>
            <div class="modal-actions">
                <button type="button" onclick="closeSessionModal()" class="action-btn">Cancel</button>
                <button type="submit" class="action-btn primary">Create Session</button>
            </div>
        </form>
    `;
    
    sessionModal.style.display = 'block';
    
    // Handle form submission
    document.getElementById('sessionForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Convert 24-hour time to 12-hour format
        function convertTo12Hour(time24) {
            const [hours, minutes] = time24.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        }
        
        const sessionData = {
            name: document.getElementById('sessionName').value,
            type: document.getElementById('sessionType').value,
            date: document.getElementById('sessionDate').value,
            time: convertTo12Hour(document.getElementById('sessionTime').value),
            maxCapacity: parseInt(document.getElementById('sessionCapacity').value),
            description: document.getElementById('sessionDescription').value
        };
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(sessionData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Session created successfully!');
                closeSessionModal();
                loadSessions(); // Refresh the sessions list
            } else {
                let errorMessage = result.message;
                if (result.errors && result.errors.length > 0) {
                    errorMessage += '\n\nDetails:\n' + result.errors.join('\n');
                }
                alert('Error: ' + errorMessage);
            }
        } catch (error) {
            console.error('Create session error:', error);
            alert('Failed to create session');
        }
    });
}

async function editSession(sessionId) {
    try {
        console.log('Loading session for editing:', sessionId);
        const token = localStorage.getItem('token');
        
        // Fetch session details from API
        const response = await fetch(`/api/admin/sessions/${sessionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            const session = result.data;
            
            // Convert 24-hour time to 12-hour format for display
            function convertTo12Hour(time24) {
                if (!time24) return '';
                const [hours, minutes] = time24.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour % 12 || 12;
                return `${hour12}:${minutes} ${ampm}`;
            }
            
            // Create edit form
            const editForm = `
                <form id="editSessionForm" class="session-form">
                    <div class="form-group">
                        <label for="editSessionName">Session Name *</label>
                        <input type="text" id="editSessionName" name="name" value="${session.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editSessionType">Session Type *</label>
                        <select id="editSessionType" name="type" required>
                            <option value="group" ${session.type === 'group' ? 'selected' : ''}>Group Class</option>
                            <option value="private-session" ${session.type === 'private-session' ? 'selected' : ''}>Personal Training</option>
                            <option value="private-coach" ${session.type === 'private-coach' ? 'selected' : ''}>Private Coaching</option>
                        </select>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editSessionDate">Date *</label>
                            <input type="date" id="editSessionDate" name="date" value="${session.date.split('T')[0]}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editSessionTime">Time *</label>
                            <input type="time" id="editSessionTime" name="time" value="${session.time}" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editSessionMaxCapacity">Max Capacity *</label>
                            <input type="number" id="editSessionMaxCapacity" name="maxCapacity" value="${session.maxCapacity}" min="1" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editSessionPrice">Price ($)</label>
                            <input type="number" id="editSessionPrice" name="price" value="${session.price || 0}" min="0" step="0.01">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="editSessionTrainer">Trainer</label>
                        <input type="text" id="editSessionTrainer" name="trainer" value="${session.trainer || ''}" placeholder="Trainer name">
                    </div>
                    
                    <div class="form-group">
                        <label for="editSessionLocation">Location</label>
                        <input type="text" id="editSessionLocation" name="location" value="${session.location || ''}" placeholder="Gym area or room">
                    </div>
                    
                    <div class="form-group">
                        <label for="editSessionDescription">Description</label>
                        <textarea id="editSessionDescription" name="description" rows="3" placeholder="Session description...">${session.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="editSessionDifficulty">Difficulty Level</label>
                        <select id="editSessionDifficulty" name="difficulty">
                            <option value="beginner" ${session.difficulty === 'beginner' ? 'selected' : ''}>Beginner</option>
                            <option value="intermediate" ${session.difficulty === 'intermediate' ? 'selected' : ''}>Intermediate</option>
                            <option value="advanced" ${session.difficulty === 'advanced' ? 'selected' : ''}>Advanced</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="editSessionIsActive" name="isActive" ${session.isActive ? 'checked' : ''}>
                            Active Session
                        </label>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="action-btn primary">💾 Update Session</button>
                        <button type="button" class="action-btn" onclick="closeSessionModal()">❌ Cancel</button>
                    </div>
                </form>
            `;
            
            // Update modal content
            document.getElementById('sessionModalTitle').textContent = 'Edit Session';
            document.getElementById('sessionModalBody').innerHTML = editForm;
            
            // Show modal
            document.getElementById('sessionModal').style.display = 'block';
            
            // Add form submission handler
            document.getElementById('editSessionForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const sessionData = {
                    name: formData.get('name'),
                    type: formData.get('type'),
                    date: formData.get('date'),
                    time: formData.get('time'),
                    maxCapacity: parseInt(formData.get('maxCapacity')),
                    price: parseFloat(formData.get('price')) || 0,
                    trainer: formData.get('trainer'),
                    location: formData.get('location'),
                    description: formData.get('description'),
                    difficulty: formData.get('difficulty'),
                    isActive: formData.get('isActive') === 'on'
                };
                
                try {
                    const updateResponse = await fetch(`/api/admin/sessions/${sessionId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(sessionData)
                    });
                    
                    if (updateResponse.ok) {
                        alert('✅ Session updated successfully!');
                        closeSessionModal();
                        loadSessions(); // Refresh the sessions list
                    } else {
                        const error = await updateResponse.json();
                        alert(`❌ Error updating session: ${error.message}`);
                    }
                } catch (error) {
                    console.error('Error updating session:', error);
                    alert('❌ Error updating session. Please try again.');
                }
            });
            
        } else {
            throw new Error('Failed to load session details');
        }
        
    } catch (error) {
        console.error('Error loading session for editing:', error);
        alert('❌ Error loading session details. Please try again.');
    }
}

async function deleteSession(sessionId) {
    if (confirm('Are you sure you want to delete this session? All related reservations will also be deleted.')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Session deleted successfully!');
                loadSessions(); // Refresh the sessions list
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Delete session error:', error);
            alert('Failed to delete session');
        }
    }
}

function createNutritionPlan() {
    const nutritionModal = document.getElementById('nutritionModal');
    const modalTitle = document.getElementById('nutritionModalTitle');
    const modalBody = document.getElementById('nutritionModalBody');
    
    modalTitle.textContent = 'Create Custom Nutrition Plan for Member';
    
    // First load members list
    console.log('About to load members...');
    loadMembersForNutrition().then(members => {
        console.log('Members received in createNutritionPlan:', members);
        modalBody.innerHTML = `
            <form id="nutritionForm">
                <div class="form-group">
                    <label>Select Member</label>
                    <select id="assignedTo" required>
                        <option value="">Choose a member...</option>
                        ${members.map(member => `
                            <option value="${member._id}" ${member.hasNutritionPlan ? 'disabled' : ''}>
                                ${member.name} (${member.email}) - ${member.membershipType.toUpperCase()}
                                ${member.hasNutritionPlan ? ' - Already has plan' : ''}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Plan Title</label>
                    <input type="text" id="planTitle" placeholder="Custom Nutrition Plan" value="Custom Nutrition Plan">
                </div>
                
                <div class="form-group">
                    <label>Goals</label>
                    <textarea id="goals" rows="2" placeholder="Weight loss, muscle gain, etc."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Notes</label>
                    <textarea id="notes" rows="2" placeholder="Special instructions, allergies, preferences..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Target Calories per Day</label>
                    <input type="number" id="targetCalories" value="2000" min="800" max="5000">
                </div>
                
                <div class="form-group">
                    <label>Target Protein (grams)</label>
                    <input type="number" id="targetProtein" value="150" min="50" max="300">
                </div>
                
                <div class="form-group">
                    <label>Target Water (liters)</label>
                    <input type="number" id="targetWater" value="2.5" min="1" max="5" step="0.5">
                </div>
                
                <h4>Weekly Meal Schedule</h4>
                <div class="meal-schedule-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Breakfast</th>
                                <th>Lunch</th>
                                <th>Dinner</th>
                                <th>Snacks</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => `
                                <tr>
                                    <td><strong>${day}</strong></td>
                                    <td><input type="text" id="${day.toLowerCase()}_breakfast" placeholder="e.g., Oatmeal with fruits"></td>
                                    <td><input type="text" id="${day.toLowerCase()}_lunch" placeholder="e.g., Grilled chicken salad"></td>
                                    <td><input type="text" id="${day.toLowerCase()}_dinner" placeholder="e.g., Salmon with vegetables"></td>
                                    <td><input type="text" id="${day.toLowerCase()}_snacks" placeholder="e.g., Greek yogurt, nuts"></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="modal-actions">
                    <button type="button" id="cancelNutritionBtn" class="action-btn">Cancel</button>
                    <button type="submit" class="action-btn primary">Create Nutrition Plan</button>
                </div>
            </form>
        `;
        
        // Add event listeners
        document.getElementById('cancelNutritionBtn').addEventListener('click', closeNutritionModal);
        
        // Handle form submission
        document.getElementById('nutritionForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                assignedTo: document.getElementById('assignedTo').value,
                planTitle: document.getElementById('planTitle').value,
                goals: document.getElementById('goals').value,
                notes: document.getElementById('notes').value,
                targetCalories: parseInt(document.getElementById('targetCalories').value),
                targetProtein: parseInt(document.getElementById('targetProtein').value),
                targetWater: parseFloat(document.getElementById('targetWater').value),
                schedule: {}
            };
            
            // Build schedule object
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
            
            days.forEach(day => {
                formData.schedule[day] = {};
                meals.forEach(meal => {
                    const input = document.getElementById(`${day}_${meal}`);
                    formData.schedule[day][meal] = input ? input.value : '';
                });
            });
            
            if (!formData.assignedTo) {
                alert('Please select a member');
                return;
            }
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/admin/nutrition-plans', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Nutrition plan created successfully!');
                    closeNutritionModal();
                    refreshNutritionPlans(); // Refresh the plans list
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Create nutrition plan error:', error);
                alert('Error creating nutrition plan');
            }
        });
        
        nutritionModal.style.display = 'block';
    }).catch(error => {
        console.error('Error loading members:', error);
        alert('Error loading members list');
    });
}

// Load members for nutrition plan assignment
async function loadMembersForNutrition() {
    try {
        console.log('Loading members for nutrition...');
        const token = localStorage.getItem('token');
        console.log('Token:', token ? 'Present' : 'Missing');
        
        const response = await fetch('/api/admin/members-for-nutrition', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.success) {
            console.log('Members loaded:', result.data.length);
            return result.data;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error loading members for nutrition:', error);
        
        // Temporary fallback - return the current user as a test member
        console.log('Falling back to current user...');
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.name) {
            return [{
                _id: currentUser.id || 'temp-id',
                name: currentUser.name,
                email: currentUser.email,
                membershipType: currentUser.membershipType || 'standard',
                hasNutritionPlan: false
            }];
        }
        
        return [];
    }
}

// Refresh nutrition plans list
async function refreshNutritionPlans() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/nutrition-plans', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayNutritionPlans(result.data);
        } else {
            console.error('Error loading nutrition plans:', result.message);
        }
    } catch (error) {
        console.error('Error loading nutrition plans:', error);
    }
}

// Display nutrition plans in the grid
function displayNutritionPlans(plans) {
    const grid = document.getElementById('nutritionPlansGrid');
    
    if (plans.length === 0) {
        grid.innerHTML = '<div class="no-data">No nutrition plans found</div>';
        return;
    }
    
    grid.innerHTML = plans.map(plan => `
        <div class="nutrition-plan-card">
            <h3>${plan.planTitle}</h3>
            <p><strong>Member:</strong> ${plan.memberName}</p>
            <p><strong>Email:</strong> ${plan.memberEmail}</p>
            <p><strong>Goals:</strong> ${plan.goals || 'No specific goals'}</p>
            <p><strong>Target Calories:</strong> ${plan.targetCalories}/day</p>
            <p><strong>Target Protein:</strong> ${plan.targetProtein}g</p>
            <p><strong>Target Water:</strong> ${plan.targetWater}L</p>
            <p><strong>Created:</strong> ${new Date(plan.createdAt).toLocaleDateString()}</p>
            <div class="plan-actions">
                <button class="action-btn" data-plan-id="${plan._id}">✏️ Edit</button>
                <button class="action-btn danger" data-plan-id="${plan._id}">🗑️ Delete</button>
                <button class="action-btn" data-plan-id="${plan._id}">👁️ View Schedule</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners for action buttons
    grid.querySelectorAll('.plan-actions button').forEach(button => {
        const planId = button.getAttribute('data-plan-id');
        button.addEventListener('click', function() {
            if (this.textContent.includes('Edit')) {
                editNutritionPlan(planId);
            } else if (this.textContent.includes('Delete')) {
                deleteNutritionPlan(planId);
            } else if (this.textContent.includes('View')) {
                viewNutritionPlanSchedule(planId);
            }
        });
    });
}

async function editNutritionPlan(planId) {
    try {
        console.log('Loading nutrition plan for editing:', planId);
        const token = localStorage.getItem('token');
        
        // Fetch nutrition plan details from API
        const response = await fetch(`/api/admin/nutrition-plans/${planId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            const plan = result.data;
            
            // Create edit form with pre-filled data
            const editForm = `
                <form id="editNutritionForm" class="nutrition-form">
                    <div class="form-group">
                        <label for="editPlanTitle">Plan Title *</label>
                        <input type="text" id="editPlanTitle" name="planTitle" value="${plan.planTitle}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editGoals">Fitness Goals</label>
                        <textarea id="editGoals" name="goals" rows="3" placeholder="Member's fitness goals...">${plan.goals || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="editNotes">Notes</label>
                        <textarea id="editNotes" name="notes" rows="3" placeholder="Additional notes...">${plan.notes || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editTargetCalories">Target Calories</label>
                            <input type="number" id="editTargetCalories" name="targetCalories" value="${plan.targetCalories || 2000}" min="1000" max="5000">
                        </div>
                        
                        <div class="form-group">
                            <label for="editTargetProtein">Target Protein (g)</label>
                            <input type="number" id="editTargetProtein" name="targetProtein" value="${plan.targetProtein || 150}" min="50" max="300">
                        </div>
                        
                        <div class="form-group">
                            <label for="editTargetWater">Target Water (L)</label>
                            <input type="number" id="editTargetWater" name="targetWater" value="${plan.targetWater || 2.5}" min="1" max="5" step="0.1">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Weekly Meal Schedule</label>
                        <div class="meal-schedule-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Day</th>
                                        <th>Breakfast</th>
                                        <th>Lunch</th>
                                        <th>Dinner</th>
                                        <th>Snacks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => `
                                        <tr>
                                            <td><strong>${day.charAt(0).toUpperCase() + day.slice(1)}</strong></td>
                                            <td><input type="text" name="schedule.${day}.breakfast" value="${plan.schedule[day]?.breakfast || ''}" placeholder="Breakfast meal"></td>
                                            <td><input type="text" name="schedule.${day}.lunch" value="${plan.schedule[day]?.lunch || ''}" placeholder="Lunch meal"></td>
                                            <td><input type="text" name="schedule.${day}.dinner" value="${plan.schedule[day]?.dinner || ''}" placeholder="Dinner meal"></td>
                                            <td><input type="text" name="schedule.${day}.snacks" value="${plan.schedule[day]?.snacks || ''}" placeholder="Snacks"></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="action-btn primary">💾 Update Plan</button>
                        <button type="button" class="action-btn" onclick="closeNutritionModal()">❌ Cancel</button>
                    </div>
                </form>
            `;
            
            // Update modal content
            document.getElementById('nutritionModalTitle').textContent = 'Edit Nutrition Plan';
            document.getElementById('nutritionModalBody').innerHTML = editForm;
            
            // Show modal
            document.getElementById('nutritionModal').style.display = 'block';
            
            // Add form submission handler
            document.getElementById('editNutritionForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                
                // Build schedule object from form data
                const schedule = {};
                ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
                    schedule[day] = {
                        breakfast: formData.get(`schedule.${day}.breakfast`) || '',
                        lunch: formData.get(`schedule.${day}.lunch`) || '',
                        dinner: formData.get(`schedule.${day}.dinner`) || '',
                        snacks: formData.get(`schedule.${day}.snacks`) || ''
                    };
                });
                
                const planData = {
                    planTitle: formData.get('planTitle'),
                    goals: formData.get('goals'),
                    notes: formData.get('notes'),
                    targetCalories: parseInt(formData.get('targetCalories')) || 2000,
                    targetProtein: parseInt(formData.get('targetProtein')) || 150,
                    targetWater: parseFloat(formData.get('targetWater')) || 2.5,
                    schedule: schedule
                };
                
                try {
                    const updateResponse = await fetch(`/api/admin/nutrition-plans/${planId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(planData)
                    });
                    
                    if (updateResponse.ok) {
                        alert('✅ Nutrition plan updated successfully!');
                        closeNutritionModal();
                        loadNutritionPlans(); // Refresh the nutrition plans list
                    } else {
                        const error = await updateResponse.json();
                        alert(`❌ Error updating nutrition plan: ${error.message}`);
                    }
                } catch (error) {
                    console.error('Error updating nutrition plan:', error);
                    alert('❌ Error updating nutrition plan. Please try again.');
                }
            });
            
        } else {
            throw new Error('Failed to load nutrition plan details');
        }
        
    } catch (error) {
        console.error('Error loading nutrition plan for editing:', error);
        alert('❌ Error loading nutrition plan details. Please try again.');
    }
}

async function viewNutritionPlanSchedule(planId) {
    try {
        console.log('Loading nutrition plan schedule for:', planId);
        const token = localStorage.getItem('token');
        
        // Fetch nutrition plan details from API
        const response = await fetch(`/api/admin/nutrition-plans/${planId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            const plan = result.data;
            
            // Create schedule view
            const scheduleView = `
                <div class="nutrition-schedule-view">
                    <div class="plan-header">
                        <h4>${plan.planTitle}</h4>
                        <p><strong>Assigned to:</strong> ${plan.memberName} (${plan.memberEmail})</p>
                    </div>
                    
                    ${plan.goals ? `
                        <div class="plan-section">
                            <h5>🎯 Fitness Goals</h5>
                            <p>${plan.goals}</p>
                        </div>
                    ` : ''}
                    
                    ${plan.notes ? `
                        <div class="plan-section">
                            <h5>📝 Notes</h5>
                            <p>${plan.notes}</p>
                        </div>
                    ` : ''}
                    
                    <div class="plan-section">
                        <h5>📊 Daily Targets</h5>
                        <div class="targets-grid">
                            <div class="target-item">
                                <span class="target-label">Calories:</span>
                                <span class="target-value">${plan.targetCalories || 2000} kcal</span>
                            </div>
                            <div class="target-item">
                                <span class="target-label">Protein:</span>
                                <span class="target-value">${plan.targetProtein || 150}g</span>
                            </div>
                            <div class="target-item">
                                <span class="target-label">Water:</span>
                                <span class="target-value">${plan.targetWater || 2.5}L</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="plan-section">
                        <h5>🍽️ Weekly Meal Schedule</h5>
                        <div class="schedule-table-view">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Day</th>
                                        <th>Breakfast</th>
                                        <th>Lunch</th>
                                        <th>Dinner</th>
                                        <th>Snacks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => `
                                        <tr>
                                            <td><strong>${day.charAt(0).toUpperCase() + day.slice(1)}</strong></td>
                                            <td>${plan.schedule[day]?.breakfast || '<em>Not set</em>'}</td>
                                            <td>${plan.schedule[day]?.lunch || '<em>Not set</em>'}</td>
                                            <td>${plan.schedule[day]?.dinner || '<em>Not set</em>'}</td>
                                            <td>${plan.schedule[day]?.snacks || '<em>Not set</em>'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="schedule-actions">
                        <button class="action-btn" onclick="editNutritionPlan('${planId}')">✏️ Edit Plan</button>
                        <button class="action-btn" onclick="closeNutritionModal()">❌ Close</button>
                    </div>
                </div>
            `;
            
            // Update modal content
            document.getElementById('nutritionModalTitle').textContent = 'Nutrition Plan Schedule';
            document.getElementById('nutritionModalBody').innerHTML = scheduleView;
            
            // Show modal
            document.getElementById('nutritionModal').style.display = 'block';
            
        } else {
            throw new Error('Failed to load nutrition plan schedule');
        }
        
    } catch (error) {
        console.error('Error loading nutrition plan schedule:', error);
        alert('❌ Error loading nutrition plan schedule. Please try again.');
    }
}

async function deleteNutritionPlan(planId) {
    if (confirm('Are you sure you want to delete this nutrition plan?')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/nutrition-plans/${planId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Nutrition plan deleted successfully!');
                loadNutritionPlans(); // Refresh the plans list
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Delete nutrition plan error:', error);
            alert('Failed to delete nutrition plan');
        }
    }
}

function editSession(sessionId) {
    alert(`Edit session ${sessionId} - Feature coming soon!`);
}

async function updateReservationStatus(reservationId, status) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/reservations/${reservationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Reservation ${status} successfully!`);
            loadReservations(); // Refresh the reservations list
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Update reservation error:', error);
        alert('Failed to update reservation status');
    }
}

function generateReport() {
    try {
        console.log('Generating comprehensive report...');
        
        // Get current analytics data
        const totalMembers = document.getElementById('totalMembers').textContent;
        const monthlyRevenue = document.getElementById('monthlyRevenue').textContent;
        const todaysSessions = document.getElementById('todaysSessions').textContent;
        const activeReservations = document.getElementById('activeReservations').textContent;
        
        // Get membership distribution
        const standardCount = document.getElementById('standardCount').textContent;
        const premiumCount = document.getElementById('premiumCount').textContent;
        const eliteCount = document.getElementById('eliteCount').textContent;
        
        // Get session stats
        const groupClassCount = document.getElementById('groupClassCount').textContent;
        const personalTrainingCount = document.getElementById('personalTrainingCount').textContent;
        const privateCoachingCount = document.getElementById('privateCoachingCount').textContent;
        
        // Create report content
        const reportContent = `
REDEFINELAB GYM - ADMIN REPORT
Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

=== EXECUTIVE SUMMARY ===
Total Members: ${totalMembers}
Monthly Revenue: ${monthlyRevenue}
Today's Sessions: ${todaysSessions}
Active Reservations: ${activeReservations}

=== MEMBERSHIP DISTRIBUTION ===
Standard Members: ${standardCount}
Premium Members: ${premiumCount}
Elite Members: ${eliteCount}

=== SESSION STATISTICS ===
Group Classes: ${groupClassCount}
Personal Training: ${personalTrainingCount}
Private Coaching: ${privateCoachingCount}

=== RECOMMENDATIONS ===
• Monitor Elite member satisfaction for retention
• Consider adding more group classes if demand is high
• Review Premium tier benefits for conversion optimization
        `;
        
        // Create and download report
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gym-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Show success message
        alert('📋 Report generated successfully! Check your downloads folder.');
        
    } catch (error) {
        console.error('Error generating report:', error);
        alert('❌ Error generating report. Please try again.');
    }
}

function searchMembers() {
    const searchTerm = document.getElementById('memberSearch').value.toLowerCase();
    const memberCards = document.querySelectorAll('.member-card');
    
    memberCards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const email = card.querySelector('.member-email').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || email.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterReservations() {
    const filterValue = document.getElementById('reservationFilter').value;
    const reservationCards = document.querySelectorAll('.reservation-card');
    
    reservationCards.forEach(card => {
        const status = card.querySelector('.status').textContent;
        
        if (filterValue === 'all' || status === filterValue) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Modal functions
function closeMemberModal() {
    document.getElementById('memberModal').style.display = 'none';
}

function closeSessionModal() {
    document.getElementById('sessionModal').style.display = 'none';
}

function closeNutritionModal() {
    document.getElementById('nutritionModal').style.display = 'none';
}

// Simple logout function
function logout() {
    console.log('Logout function called');
    
    // Clear stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    console.log('Token and user data cleared');
    
    // Redirect to login page
    window.location.href = '/login';
}

// Make functions globally accessible
window.logout = logout;
window.editMember = editMember;
window.deleteMember = deleteMember;
window.viewMember = viewMember;
window.createSession = createSession;
window.editSession = editSession;
window.deleteSession = deleteSession;
window.createNutritionPlan = createNutritionPlan;
window.editNutritionPlan = editNutritionPlan;
window.deleteNutritionPlan = deleteNutritionPlan;
window.updateReservationStatus = updateReservationStatus;
window.closeMemberModal = closeMemberModal;
window.closeSessionModal = closeSessionModal;
window.closeNutritionModal = closeNutritionModal;

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 