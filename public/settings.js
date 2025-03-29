/**
 * Settings JavaScript File
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load user data
    loadUserData().then(user => {
        if (user) {
            populateUserProfile(user);
        }
    });
    
    // Setup settings navigation
    setupSettingsNavigation();
    
    // Setup form submissions
    setupFormSubmissions();
});

function populateUserProfile(user) {
    // Set username and email (read-only)
    document.getElementById('username').value = user.username || '';
    document.getElementById('email').value = user.email || '';
    
    // Set editable fields if they exist
    if (user.profile) {
        document.getElementById('first-name').value = user.profile.firstName || '';
        document.getElementById('last-name').value = user.profile.lastName || '';
        document.getElementById('bio').value = user.profile.bio || '';
    }
}

function setupSettingsNavigation() {
    const navLinks = document.querySelectorAll('.settings-nav a');
    const settingsSections = document.querySelectorAll('.settings-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = link.getAttribute('data-section');
            
            // Update active state for nav links
            navLinks.forEach(item => {
                item.parentElement.classList.remove('active');
            });
            link.parentElement.classList.add('active');
            
            // Show selected section
            settingsSections.forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`${section}-section`).classList.add('active');
        });
    });
}

function setupFormSubmissions() {
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const bio = document.getElementById('bio').value;
            
            try {
                // In a real application, we would send this data to the server
                // await apiRequest('/user/profile', {
                //     method: 'PUT',
                //     body: JSON.stringify({
                //         firstName,
                //         lastName,
                //         bio
                //     })
                // });
                
                // For the demo, just show success message
                showToast('Success', 'Profile updated successfully', 'success');
            } catch (error) {
                console.error('Failed to update profile:', error);
                showToast('Error', 'Failed to update profile', 'error');
            }
        });
    }
    
    // Password form submission
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Simple validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                showToast('Error', 'All password fields are required', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showToast('Error', 'New passwords do not match', 'error');
                return;
            }
            
            try {
                // In a real application, we would send this data to the server
                // await apiRequest('/user/password', {
                //     method: 'PUT',
                //     body: JSON.stringify({
                //         currentPassword,
                //         newPassword
                //     })
                // });
                
                // For the demo, just show success message
                showToast('Success', 'Password updated successfully', 'success');
                
                // Reset form
                passwordForm.reset();
            } catch (error) {
                console.error('Failed to update password:', error);
                showToast('Error', 'Failed to update password', 'error');
            }
        });
    }
    
    // Setup notification preference toggles
    const notificationToggles = document.querySelectorAll('#notifications-section .toggle-switch input');
    const savePreferencesBtn = document.querySelector('#notifications-section .btn');
    
    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', function() {
            // Get the state of all toggles
            const preferences = {};
            notificationToggles.forEach(toggle => {
                const settingName = toggle.closest('.notification-setting').querySelector('h3').textContent;
                preferences[settingName] = toggle.checked;
            });
            
            // In a real application, we would send these preferences to the server
            // For the demo, just show success message
            showToast('Success', 'Notification preferences saved', 'success');
        });
    }
    
    // Setup theme options
    const themeOptions = document.querySelectorAll('.theme-option');
    
    themeOptions.forEach(option => {
        if (!option.classList.contains('disabled')) {
            option.addEventListener('click', function() {
                themeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // In a real application, we would update the theme
                // For the demo, just show a message
                showToast('Info', 'Theme changes are not available in the demo', 'info');
            });
        }
    });
}