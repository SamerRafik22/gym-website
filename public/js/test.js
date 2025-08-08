function addResult(message, isSuccess = true) {
    const results = document.getElementById('results');
    const div = document.createElement('div');
    div.className = `result ${isSuccess ? 'success' : 'error'}`;
    div.innerHTML = `<strong>${new Date().toLocaleTimeString()}</strong><br>${message}`;
    results.appendChild(div);
}

async function testServer() {
    try {
        const apiUrl = window.location.protocol === 'file:' 
            ? 'http://localhost:3000/api/test'
            : '/api/test';
        
        addResult(`Testing server at: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.success) {
            addResult(`✅ Server is working! Message: ${data.message}`, true);
        } else {
            addResult(`❌ Server responded but with error: ${data.message}`, false);
        }
    } catch (error) {
        addResult(`❌ Server connection failed: ${error.message}`, false);
    }
}

async function testRegistration() {
    try {
                        const apiUrl = window.location.protocol === 'file:'
                    ? 'http://localhost:3000/api/auth/register'
                    : '/api/auth/register';
        
        const testData = {
            name: 'Test User',
            username: 'testuser123',
            email: 'test@example.com',
            password: 'password123',
            phone: '1234567890',
            age: 25,
            gender: 'male',
            membershipType: 'standard',
            fitnessGoals: ['general_fitness'],
            medicalConditions: [],
            address: 'Test Address',
            city: 'Test City',
            zipCode: '12345',
            emergencyName: 'Emergency Contact',
            emergencyPhone: '0987654321',
            emergencyRelation: 'Friend',
            billingType: 'monthly'
        };

        addResult(`Testing registration API at: ${apiUrl}`);
        addResult(`Test data: ${JSON.stringify(testData, null, 2)}`);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            addResult(`✅ Registration API works! User created: ${result.data.user.name}`, true);
        } else {
            addResult(`❌ Registration failed: ${result.message}. Errors: ${JSON.stringify(result.errors || 'None')}`, false);
        }
    } catch (error) {
        addResult(`❌ Registration API test failed: ${error.message}`, false);
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('testServerBtn').addEventListener('click', testServer);
    document.getElementById('testRegistrationBtn').addEventListener('click', testRegistration);
    
    // Auto-test server on page load
    addResult('Page loaded. Current protocol: ' + window.location.protocol);
    testServer();
}); 