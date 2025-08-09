// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.id) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
        return;
    }
    
    // Load user data
    loadUserData(user);
    
    // Set up event listeners
    setupEventListeners();
});

function loadUserData(user) {
    // Update user name
    document.getElementById('userName').textContent = user.name || 'Member';
    
    // Update membership info
    document.getElementById('membershipId').textContent = user.id || 'N/A';
    document.getElementById('membershipType').textContent = 
        (user.membershipType || 'standard').charAt(0).toUpperCase() + 
        (user.membershipType || 'standard').slice(1);
    document.getElementById('membershipStatus').textContent = 
        user.membershipStatus || 'Active';
    
    // Calculate next billing date (1 month from now)
    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);
    document.getElementById('nextBilling').textContent = nextBilling.toLocaleDateString();
    
    // Set member since date (today for new registrations)
    document.getElementById('memberSince').textContent = new Date().toLocaleDateString();
    
    // Load membership benefits based on type
    loadMembershipBenefits(user.membershipType || 'standard');
    
    // Update navigation to show user is logged in
    updateNavigation(user);
}

function loadMembershipBenefits(membershipType) {
    const benefitsContainer = document.getElementById('membershipBenefits');
    
    const benefits = {
        standard: [
            '24/7 gym access',
            'All equipment access',
            'Locker room access',
            'Private sessions (extra payment)'
        ],
        premium: [
            '24/7 gym access',
            'All equipment access',
            'Locker room access',
            'Group classes included',
            '2 guest passes per month',
            'Priority booking'
        ],
        elite: [
            '24/7 gym access',
            'All equipment access',
            'Locker room access',
            'All group classes',
            'Unlimited guest passes',
            '4 personal training sessions/month',
            'Personalized nutrition plan',
            'Priority support'
        ]
    };
    
    const membershipBenefits = benefits[membershipType] || benefits.standard;
    
    benefitsContainer.innerHTML = `
        <h3>Your Benefits</h3>
        <ul class="benefits-list">
            ${membershipBenefits.map(benefit => `<li>✓ ${benefit}</li>`).join('')}
        </ul>
    `;
}

function updateNavigation(user) {
    // Add logout button to navigation
    const header = document.getElementById('global-header');
    if (header) {
        // Wait for the global header to load, then modify it
        setTimeout(() => {
            const nav = header.querySelector('nav ul');
            if (nav) {
                // Remove login/join buttons if they exist
                    const loginLink = nav.querySelector('a[href="/login"]');
    const joinLink = nav.querySelector('a[href="/join"]');
                
                if (loginLink) loginLink.parentElement.remove();
                if (joinLink) joinLink.parentElement.remove();
                
                // Add user menu
                const userMenu = document.createElement('li');
                userMenu.innerHTML = `
                    <div class="user-menu">
                        <span class="user-greeting">Hi, ${user.name.split(' ')[0]}</span>
                        <button class="logout-btn" id="logoutBtn">Logout</button>
                    </div>
                `;
                nav.appendChild(userMenu);
                
                // Add event listener for logout button
                const logoutBtn = userMenu.querySelector('#logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', logout);
                }
            }
        }, 100);
    }
}

function setupEventListeners() {
    // Nutrition button - only show for Elite members
    const nutritionBtn = document.getElementById('nutritionBtn');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.membershipType !== 'elite') {
        nutritionBtn.textContent = 'Upgrade to Elite';
        nutritionBtn.onclick = () => {
            alert('Nutrition plans are available for Elite members only. Upgrade your membership to access this feature!');
        };
    } else {
        nutritionBtn.onclick = () => {
            loadUserNutritionPlan();
        };
    }
    
    // Other action buttons
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        if (!btn.onclick && btn.id !== 'nutritionBtn') {
            btn.onclick = () => {
                const action = btn.textContent.toLowerCase();
                
                if (action.includes('book') || action.includes('session') || action.includes('classes') || action.includes('join')) {
                    loadAvailableSessions(btn.textContent);
                } else if (action.includes('schedule') || (action.includes('view') && action.includes('schedule'))) {
                    loadUserSchedule();
                } else if (action.includes('progress') || action.includes('track')) {
                    loadUserProgress();
                } else {
                    // For any other buttons, show a helpful message
                    const buttonText = btn.textContent;
                    alert(`The "${buttonText}" feature is coming soon! We're working on making it available.`);
                }
            };
        }
    });
}

function logout() {
    // Clear stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to home page
    window.location.href = '/';
}

// Make logout function globally accessible
window.logout = logout;



// Add some dynamic stats (simulated)
function updateStats() {
    // Simulate some workout statistics
    const workouts = Math.floor(Math.random() * 20) + 5;
    const streak = Math.floor(Math.random() * 14) + 1;
    const hours = Math.floor(Math.random() * 50) + 10;
    
    document.getElementById('workoutsThisMonth').textContent = workouts;
    document.getElementById('streakDays').textContent = streak;
    document.getElementById('totalHours').textContent = hours;
}

// Update stats when page loads
setTimeout(updateStats, 1000);

// Load user's actual session data
async function loadUserStats() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Load user's reservations to get total sessions
        const response = await fetch('/api/reservations', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            // Handle both possible data structures
            let reservations = [];
            if (result.data && Array.isArray(result.data)) {
                reservations = result.data;
            } else if (result.data && result.data.reservations && Array.isArray(result.data.reservations)) {
                reservations = result.data.reservations;
            } else {
                console.error('Unexpected reservations data structure:', result.data);
                return;
            }
            
            // Update total sessions count
            document.getElementById('totalSessions').textContent = reservations.length;
            
            // Calculate average rating (simulated for now)
            const avgRating = (4.5 + Math.random() * 0.5).toFixed(1);
            document.getElementById('avgRating').textContent = avgRating;
            
            // Calculate achievements based on sessions
            const achievements = Math.min(Math.floor(reservations.length / 5) + 1, 10);
            document.getElementById('achievements').textContent = achievements;
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
        // Set default values if API fails
        document.getElementById('totalSessions').textContent = '0';
        document.getElementById('avgRating').textContent = '4.5';
        document.getElementById('achievements').textContent = '1';
    }
}

// Load user stats when page loads
setTimeout(loadUserStats, 1500);

// Load user's nutrition plan (for Elite members)
async function loadUserNutritionPlan() {
    try {
        console.log('Loading user nutrition plan...');
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('❌ Please log in to view your nutrition plan.');
            return;
        }
        
        const response = await fetch('/api/nutrition/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            const plan = result.data;
            
            // Create nutrition plan modal
            const nutritionModal = `
                <div class="modal" id="nutritionModal" style="display: block;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>🍎 Your Nutrition Plan</h3>
                            <button class="modal-close" onclick="closeNutritionModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="nutrition-schedule-view">
                                <div class="plan-header">
                                    <h4>${plan.planTitle}</h4>
                                    <p>Personalized nutrition plan for your fitness goals</p>
                                </div>
                                
                                ${plan.goals ? `
                                    <div class="plan-section">
                                        <h5>🎯 Your Fitness Goals</h5>
                                        <p>${plan.goals}</p>
                                    </div>
                                ` : ''}
                                
                                ${plan.notes ? `
                                    <div class="plan-section">
                                        <h5>📝 Notes from Your Trainer</h5>
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
                                    <h5>🍽️ Your Weekly Meal Schedule</h5>
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
                                    <button class="action-btn" id="closeNutritionModal">❌ Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add modal to page
            document.body.insertAdjacentHTML('beforeend', nutritionModal);
            
            // Add event listener for the close button
            document.getElementById('closeNutritionModal').addEventListener('click', closeNutritionModal);
            
        } else if (response.status === 403) {
            alert('❌ Nutrition plans are only available for Elite members. Please upgrade your membership.');
        } else if (response.status === 404) {
            alert('❌ No nutrition plan found. Please contact your trainer to create a personalized plan.');
        } else {
            throw new Error('Failed to load nutrition plan');
        }
        
    } catch (error) {
        console.error('Error loading nutrition plan:', error);
        alert('❌ Error loading nutrition plan. Please try again.');
    }
}

// Close nutrition modal
function closeNutritionModal() {
    const modal = document.getElementById('nutritionModal');
    if (modal) {
        modal.remove();
    }
}

// Load available sessions for booking
async function loadAvailableSessions(buttonText = 'Book Now') {
    try {
        console.log('Loading available sessions...');
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('❌ Please log in to book sessions.');
            return;
        }
        
        const response = await fetch('/api/sessions', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            // Handle both possible data structures
            let sessions = [];
            if (result.data && Array.isArray(result.data)) {
                sessions = result.data;
            } else if (result.data && result.data.sessions && Array.isArray(result.data.sessions)) {
                sessions = result.data.sessions;
            } else {
                console.error('Unexpected sessions data structure:', result.data);
                alert('📅 Error loading sessions data. Please try again.');
                return;
            }
            
            if (sessions.length === 0) {
                alert('📅 No sessions available at the moment. Check back later!');
                return;
            }
            
            // Determine modal title based on button text
            let modalTitle = '📅 Available Sessions';
            if (buttonText.toLowerCase().includes('classes')) {
                modalTitle = '👥 Available Classes';
            } else if (buttonText.toLowerCase().includes('join')) {
                modalTitle = '👥 Join Classes';
            }
            
            // Create sessions modal
            const sessionsModal = `
                <div class="modal" id="sessionsModal" style="display: block;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${modalTitle}</h3>
                            <button class="modal-close" id="closeSessionsModal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="sessions-list">
                                ${sessions.map(session => `
                                    <div class="session-card">
                                        <div class="session-info">
                                            <h4>${session.name}</h4>
                                            <div class="session-meta">
                                                <span>📅 ${new Date(session.date).toLocaleDateString()}</span>
                                                <span>🕐 ${session.time}</span>
                                                <span>👥 ${session.currentBookings || 0}/${session.maxCapacity} spots</span>
                                                <span class="session-type ${session.type}">${session.type.replace('-', ' ').toUpperCase()}</span>
                                            </div>
                                            ${session.description ? `<p>${session.description}</p>` : ''}
                                        </div>
                                        <div class="session-actions">
                                            <button class="action-btn primary book-session-btn" data-session-id="${session._id}" ${session.currentBookings >= session.maxCapacity ? 'disabled' : ''}>
                                                ${session.currentBookings >= session.maxCapacity ? 'Full' : 'Book Now'}
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add modal to page
            document.body.insertAdjacentHTML('beforeend', sessionsModal);
            
            // Add event listeners for the modal
            document.getElementById('closeSessionsModal').addEventListener('click', closeSessionsModal);
            
            // Add event listeners for book buttons
            document.querySelectorAll('.book-session-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const sessionId = this.getAttribute('data-session-id');
                    bookSession(sessionId);
                });
            });
            
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: Failed to load sessions`);
        }
        
    } catch (error) {
        console.error('Error loading sessions:', error);
        alert(`❌ Error loading sessions: ${error.message}`);
    }
}

// Book a session
async function bookSession(sessionId) {
    try {
        console.log('Booking session:', sessionId);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/sessions/${sessionId}/reserve`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            alert('✅ Session booked successfully!');
            closeSessionsModal();
        } else {
            const error = await response.json();
            console.error('Booking error details:', error);
            alert(`❌ ${error.message || error.error || 'Failed to book session'}`);
        }
        
    } catch (error) {
        console.error('Error booking session:', error);
        alert('❌ Error booking session. Please try again.');
    }
}

// Load user's schedule
async function loadUserSchedule() {
    try {
        console.log('Loading user schedule...');
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('❌ Please log in to view your schedule.');
            return;
        }
        
        const response = await fetch('/api/reservations', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            // Handle both possible data structures
            let reservations = [];
            if (result.data && Array.isArray(result.data)) {
                reservations = result.data;
            } else if (result.data && result.data.reservations && Array.isArray(result.data.reservations)) {
                reservations = result.data.reservations;
            } else {
                console.error('Unexpected reservations data structure:', result.data);
                alert('❌ Error loading schedule data. Please try again.');
                return;
            }
            
            if (reservations.length === 0) {
                alert('📅 You have no upcoming sessions. Book a session to get started!');
                return;
            }
            
            // Create schedule modal
            const scheduleModal = `
                <div class="modal" id="scheduleModal" style="display: block;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>📅 Your Schedule</h3>
                            <button class="modal-close" id="closeScheduleModal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="reservations-list">
                                ${reservations.map(reservation => `
                                    <div class="reservation-card">
                                        <div class="reservation-info">
                                            <h4>${reservation.sessionId.name}</h4>
                                            <div class="reservation-meta">
                                                <span>📅 ${new Date(reservation.sessionId.date).toLocaleDateString()}</span>
                                                <span>🕐 ${reservation.sessionId.time}</span>
                                                <span class="status ${reservation.status}">${reservation.status.toUpperCase()}</span>
                                            </div>
                                            <p>Booked on: ${new Date(reservation.bookingDate).toLocaleDateString()}</p>
                                        </div>
                                        <div class="reservation-actions">
                                            <button class="action-btn danger cancel-reservation-btn" data-reservation-id="${reservation._id}">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add modal to page
            document.body.insertAdjacentHTML('beforeend', scheduleModal);
            
            // Add event listeners for the modal
            document.getElementById('closeScheduleModal').addEventListener('click', closeScheduleModal);
            
            // Add event listeners for cancel buttons
            document.querySelectorAll('.cancel-reservation-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const reservationId = this.getAttribute('data-reservation-id');
                    cancelReservation(reservationId);
                });
            });
            
        } else {
            throw new Error('Failed to load schedule');
        }
        
    } catch (error) {
        console.error('Error loading schedule:', error);
        alert('❌ Error loading schedule. Please try again.');
    }
}

// Load user progress
async function loadUserProgress() {
    try {
        console.log('Loading user progress...');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Create progress modal with simulated data
        const progressModal = `
            <div class="modal" id="progressModal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>📊 Your Progress</h3>
                                                    <button class="modal-close" id="closeProgressModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="progress-stats">
                            <div class="progress-card">
                                <h4>🏋️ Workout Stats</h4>
                                <div class="progress-grid">
                                    <div class="progress-item">
                                        <span class="progress-label">This Month</span>
                                        <span class="progress-value">${Math.floor(Math.random() * 20) + 5} workouts</span>
                                    </div>
                                    <div class="progress-item">
                                        <span class="progress-label">Current Streak</span>
                                        <span class="progress-value">${Math.floor(Math.random() * 14) + 1} days</span>
                                    </div>
                                    <div class="progress-item">
                                        <span class="progress-label">Total Hours</span>
                                        <span class="progress-value">${Math.floor(Math.random() * 50) + 10} hours</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="progress-card">
                                <h4>🎯 Membership Benefits</h4>
                                <div class="benefits-progress">
                                    <div class="benefit-item">
                                        <span>Guest Passes Remaining:</span>
                                        <span class="benefit-value">${user.guestPassesRemaining || 0}</span>
                                    </div>
                                    <div class="benefit-item">
                                        <span>Personal Training Sessions:</span>
                                        <span class="benefit-value">${user.personalTrainingSessionsRemaining || 0}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="progress-card">
                                <h4>📈 Next Goals</h4>
                                <div class="goals-list">
                                    <div class="goal-item">🎯 Complete 30 workouts this month</div>
                                    <div class="goal-item">💪 Increase bench press by 10kg</div>
                                    <div class="goal-item">🏃‍♂️ Run 5km in under 25 minutes</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
                    // Add modal to page
            document.body.insertAdjacentHTML('beforeend', progressModal);
            
            // Add event listeners for the modal
            document.getElementById('closeProgressModal').addEventListener('click', closeProgressModal);
        
    } catch (error) {
        console.error('Error loading progress:', error);
        alert('❌ Error loading progress. Please try again.');
    }
}

// Close modals
function closeSessionsModal() {
    const modal = document.getElementById('sessionsModal');
    if (modal) modal.remove();
}

function closeScheduleModal() {
    const modal = document.getElementById('scheduleModal');
    if (modal) modal.remove();
}

function closeProgressModal() {
    const modal = document.getElementById('progressModal');
    if (modal) modal.remove();
}

// Cancel reservation
async function cancelReservation(reservationId) {
    if (!confirm('Are you sure you want to cancel this session?')) {
        return;
    }
    
    try {
        console.log('Cancelling reservation:', reservationId);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/users/me/reservations/${reservationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            alert('✅ Session cancelled successfully!');
            closeScheduleModal();
            loadUserSchedule(); // Refresh the schedule
        } else {
            const error = await response.json();
            alert(`❌ ${error.message || 'Failed to cancel session'}`);
        }
        
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        alert('❌ Error cancelling session. Please try again.');
    }
}

// Profile photo upload functionality
function initializeProfilePhotoUpload() {
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const photoUploadForm = document.getElementById('photoUploadForm');
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    const uploadForm = document.getElementById('uploadForm');
    const cancelUpload = document.getElementById('cancelUpload');
    const uploadArea = document.querySelector('.upload-area');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImg = document.getElementById('previewImg');
    const removePreview = document.getElementById('removePreview');
    const uploadBtn = document.getElementById('uploadBtn');
    const profilePhotoImg = document.getElementById('profilePhotoImg');
    const profileNameSpan = document.getElementById('profileName');
    const profileEmailSpan = document.getElementById('profileEmail');
    const profileJoinDateSpan = document.getElementById('profileJoinDate');

    // Load current user profile data
    loadCurrentUserProfile();

    // Show upload form when change photo button is clicked
    if (changePhotoBtn) {
        changePhotoBtn.addEventListener('click', function() {
            photoUploadForm.style.display = 'block';
        });
    }

    // Hide upload form when cancel is clicked
    if (cancelUpload) {
        cancelUpload.addEventListener('click', function() {
            photoUploadForm.style.display = 'none';
            resetUploadForm();
        });
    }

    // Handle click on upload area
    if (uploadArea) {
        uploadArea.addEventListener('click', function(e) {
            if (e.target !== removePreview) {
                profilePhotoInput.click();
            }
        });
    }

    // Handle drag and drop
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = '#ff6b35';
            uploadArea.style.background = 'rgba(255, 107, 53, 0.1)';
        });

        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = 'rgba(255, 107, 53, 0.5)';
            uploadArea.style.background = 'transparent';
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = 'rgba(255, 107, 53, 0.5)';
            uploadArea.style.background = 'transparent';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
    }

    // Handle file selection
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }

    // Remove preview
    if (removePreview) {
        removePreview.addEventListener('click', function() {
            resetUploadForm();
        });
    }

    // Handle form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await uploadProfilePhoto();
        });
    }

    function handleFileSelect(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            uploadPlaceholder.style.display = 'none';
            uploadPreview.style.display = 'block';
            uploadBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    function resetUploadForm() {
        profilePhotoInput.value = '';
        uploadPlaceholder.style.display = 'block';
        uploadPreview.style.display = 'none';
        uploadBtn.disabled = true;
        previewImg.src = '';
    }

    async function uploadProfilePhoto() {
        const file = profilePhotoInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePhoto', file);

        const btnText = uploadBtn.querySelector('.btn-text');
        const spinner = uploadBtn.querySelector('.spinner');

        try {
            // Show loading state
            btnText.style.display = 'none';
            spinner.style.display = 'inline-block';
            uploadBtn.disabled = true;

            const response = await fetch('/api/auth/upload-photo', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Update profile photo
                profilePhotoImg.src = result.data.profileImage + '?t=' + new Date().getTime();
                photoUploadForm.style.display = 'none';
                resetUploadForm();
                
                // Update user data in localStorage
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                user.profileImage = result.data.profileImage;
                localStorage.setItem('user', JSON.stringify(user));

                alert('✅ Profile photo updated successfully!');
            } else {
                alert('❌ ' + (result.message || 'Failed to upload photo'));
            }

        } catch (error) {
            console.error('Upload error:', error);
            alert('❌ Error uploading photo. Please try again.');
        } finally {
            // Hide loading state
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
            uploadBtn.disabled = false;
        }
    }

    async function loadCurrentUserProfile() {
        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const result = await response.json();

            if (result.success) {
                const user = result.data.user;
                
                // Update profile photo
                if (user.profileImage) {
                    profilePhotoImg.src = user.profileImage;
                }
                
                // Update profile info
                if (profileNameSpan) profileNameSpan.textContent = user.name || 'N/A';
                if (profileEmailSpan) profileEmailSpan.textContent = user.email || 'N/A';
                if (profileJoinDateSpan) {
                    const joinDate = user.joinDate ? new Date(user.joinDate).toLocaleDateString() : new Date().toLocaleDateString();
                    profileJoinDateSpan.textContent = joinDate;
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }
}

// Initialize profile photo upload when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure all elements are loaded
    setTimeout(initializeProfilePhotoUpload, 100);
});

// Make functions globally accessible
window.loadUserNutritionPlan = loadUserNutritionPlan;
window.closeNutritionModal = closeNutritionModal;
window.loadAvailableSessions = loadAvailableSessions;
window.bookSession = bookSession;
window.loadUserSchedule = loadUserSchedule;
window.loadUserProgress = loadUserProgress;
window.closeSessionsModal = closeSessionsModal;
window.closeScheduleModal = closeScheduleModal;
window.closeProgressModal = closeProgressModal;
window.cancelReservation = cancelReservation; 