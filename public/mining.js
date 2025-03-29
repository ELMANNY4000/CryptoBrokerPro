// Mining JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Load common.js utility functions if not already loaded
    if (typeof apiRequest !== 'function') {
        const commonScript = document.createElement('script');
        commonScript.src = 'common.js';
        commonScript.onload = initMining;
        document.head.appendChild(commonScript);
    } else {
        initMining();
    }
});

function initMining() {
    // Update user info
    loadUserData()
        .then(user => {
            document.querySelector('.user-name').textContent = user.username;
            document.querySelector('.user-avatar').textContent = user.username.charAt(0).toUpperCase();
        })
        .catch(err => {
            console.error('Error loading user data:', err);
            showToast('Error', 'Failed to load user data. Please try again.', 'error');
        });

    // Load mining data
    loadMiningData();

    // Set up event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Refresh buttons
    document.getElementById('refreshWorkersBtn').addEventListener('click', () => {
        loadMiningWorkers();
    });
    
    document.getElementById('refreshRewardsBtn').addEventListener('click', () => {
        loadMiningRewards();
    });

    // Add worker button
    document.getElementById('addWorkerBtn').addEventListener('click', () => {
        openAddWorkerModal();
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // Cancel add worker button
    document.getElementById('cancelAddWorker').addEventListener('click', () => {
        closeAllModals();
    });

    // Cancel delete worker button
    document.getElementById('cancelDeleteWorker').addEventListener('click', () => {
        closeAllModals();
    });

    // Add worker form submission
    document.getElementById('addWorkerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        submitAddWorkerForm();
    });

    // Delete worker confirmation
    document.getElementById('confirmDeleteWorker').addEventListener('click', () => {
        const workerId = document.getElementById('deleteWorkerModal').getAttribute('data-worker-id');
        if (workerId) {
            deleteWorker(parseInt(workerId));
        }
    });
}

async function loadMiningData() {
    try {
        // Load Bitcoin price
        await loadBitcoinPrice();
        
        // Load mining workers and rewards
        await Promise.all([
            loadMiningWorkers(),
            loadMiningRewards()
        ]);
        
        // Update mining overview statistics
        updateMiningOverview();
    } catch (error) {
        console.error('Error loading mining data:', error);
        showToast('Error', 'Failed to load mining data. Please try again.', 'error');
    }
}

async function loadBitcoinPrice() {
    try {
        const marketData = await apiRequest('/api/crypto/markets');
        const bitcoinData = marketData.find(coin => coin.id === 'bitcoin');
        
        if (bitcoinData) {
            document.getElementById('bitcoinPrice').textContent = formatCurrency(bitcoinData.current_price);
        }
    } catch (error) {
        console.error('Error loading Bitcoin price:', error);
        throw error;
    }
}

async function loadMiningWorkers() {
    const workersGrid = document.getElementById('workersGrid');
    workersGrid.innerHTML = `
        <div class="loading-indicator">
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading workers...</div>
        </div>
    `;
    
    try {
        const workers = await apiRequest('/api/mining/workers');
        
        // Update UI with worker data
        renderMiningWorkers(workers);
        
        // Update overview statistics
        updateMiningOverview();
        
        return workers;
    } catch (error) {
        console.error('Error loading mining workers:', error);
        workersGrid.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="color: var(--danger-color); margin-bottom: 1rem;">Failed to load mining workers.</div>
                <button class="btn btn-outline" onclick="loadMiningWorkers()">Try Again</button>
            </div>
        `;
        throw error;
    }
}

function renderMiningWorkers(workers) {
    const workersGrid = document.getElementById('workersGrid');
    
    if (!workers || workers.length === 0) {
        workersGrid.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="color: var(--text-secondary); margin-bottom: 1rem;">No mining workers found.</div>
                <div style="color: var(--text-secondary); margin-bottom: 1rem;">Add a worker to start mining.</div>
                <button class="btn btn-primary" onclick="openAddWorkerModal()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                    Add Worker
                </button>
            </div>
        `;
        return;
    }
    
    workersGrid.innerHTML = '';
    
    workers.forEach(worker => {
        const workerCard = document.createElement('div');
        workerCard.className = 'worker-card';
        
        // Calculate daily earnings based on hashrate
        const dailyEarnings = calculateDailyEarnings(worker.hashrate, worker.isActive);
        
        workerCard.innerHTML = `
            <div class="worker-header">
                <div class="worker-name">${worker.name}</div>
                <div class="worker-status ${worker.isActive ? 'active' : 'inactive'}">
                    ${worker.isActive ? 'Active' : 'Inactive'}
                </div>
            </div>
            <div class="worker-stats">
                <div class="worker-stat">
                    <div class="worker-stat-title">Hashrate:</div>
                    <div class="worker-stat-value">${formatNumber(worker.hashrate)} MH/s</div>
                </div>
                <div class="worker-stat">
                    <div class="worker-stat-title">Daily Earnings:</div>
                    <div class="worker-stat-value">${dailyEarnings.toFixed(8)} BTC</div>
                </div>
                <div class="worker-stat">
                    <div class="worker-stat-title">Last Online:</div>
                    <div class="worker-stat-value">${formatDateTime(worker.updatedAt)}</div>
                </div>
            </div>
            <div class="worker-actions">
                <button class="btn btn-sm ${worker.isActive ? 'btn-danger' : 'btn-success'}" onclick="toggleWorkerStatus(${worker.id}, ${!worker.isActive})">
                    ${worker.isActive ? 'Stop' : 'Start'}
                </button>
                <button class="btn btn-sm btn-outline" onclick="openDeleteWorkerModal(${worker.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </div>
        `;
        
        workersGrid.appendChild(workerCard);
    });
}

async function loadMiningRewards() {
    const rewardsTableBody = document.getElementById('rewardsTableBody');
    rewardsTableBody.innerHTML = `
        <tr class="loading-row">
            <td colspan="4">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading rewards...</div>
            </td>
        </tr>
    `;
    
    try {
        const [rewards, marketData] = await Promise.all([
            apiRequest('/api/mining/rewards'),
            apiRequest('/api/crypto/markets')
        ]);
        
        // Get Bitcoin price for value calculation
        const bitcoinData = marketData.find(coin => coin.id === 'bitcoin');
        const bitcoinPrice = bitcoinData ? bitcoinData.current_price : 0;
        
        // Update UI with rewards data
        renderMiningRewards(rewards, bitcoinPrice);
        
        // Update overview statistics
        updateMiningOverview();
        
        return rewards;
    } catch (error) {
        console.error('Error loading mining rewards:', error);
        rewardsTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2rem;">
                    <div style="color: var(--danger-color); margin-bottom: 1rem;">Failed to load mining rewards.</div>
                    <button class="btn btn-outline" onclick="loadMiningRewards()">Try Again</button>
                </td>
            </tr>
        `;
        throw error;
    }
}

function renderMiningRewards(rewards, bitcoinPrice) {
    const rewardsTableBody = document.getElementById('rewardsTableBody');
    
    if (!rewards || rewards.length === 0) {
        rewardsTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2rem;">
                    <div style="color: var(--text-secondary);">No mining rewards found.</div>
                </td>
            </tr>
        `;
        return;
    }
    
    rewardsTableBody.innerHTML = '';
    
    // Sort rewards by timestamp (most recent first)
    rewards.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    rewards.forEach(reward => {
        const row = document.createElement('tr');
        
        // Calculate value in USD
        const valueUsd = reward.amount * bitcoinPrice;
        
        // Determine status (all rewards are confirmed for simplicity)
        const status = 'confirmed';
        
        row.innerHTML = `
            <td>${formatDateTime(reward.timestamp)}</td>
            <td>${reward.amount.toFixed(8)} BTC</td>
            <td>${formatCurrency(valueUsd)}</td>
            <td>
                <span class="status-badge ${status}">
                    ${status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </span>
            </td>
        `;
        
        rewardsTableBody.appendChild(row);
    });
}

function updateMiningOverview() {
    // This function updates the statistics in the mining overview section
    
    // Get all workers
    apiRequest('/api/mining/workers')
        .then(workers => {
            // Calculate active workers
            const activeWorkers = workers.filter(worker => worker.isActive);
            document.getElementById('activeWorkers').textContent = `${activeWorkers.length}/${workers.length}`;
            
            // Calculate total hashrate
            const totalHashrate = workers.reduce((sum, worker) => {
                return sum + (worker.isActive ? worker.hashrate : 0);
            }, 0);
            document.getElementById('totalHashrate').textContent = `${formatNumber(totalHashrate)} MH/s`;
            
            // Calculate daily earnings
            const dailyEarnings = calculateTotalDailyEarnings(workers);
            document.getElementById('dailyEarnings').textContent = `${dailyEarnings.toFixed(8)} BTC`;
            
            return apiRequest('/api/mining/rewards');
        })
        .then(rewards => {
            // Calculate total rewards
            const totalRewards = rewards.reduce((sum, reward) => sum + reward.amount, 0);
            document.getElementById('totalRewards').textContent = `${totalRewards.toFixed(8)} BTC`;
        })
        .catch(error => {
            console.error('Error updating mining overview:', error);
        });
}

function calculateDailyEarnings(hashrate, isActive) {
    // This is a simplified calculation for the simulation
    // In a real-world scenario, this would depend on network difficulty, block reward, etc.
    if (!isActive) return 0;
    
    // Assume a reward rate of 0.00001 BTC per 1000 MH/s per day
    return (hashrate / 1000) * 0.00001;
}

function calculateTotalDailyEarnings(workers) {
    return workers.reduce((sum, worker) => {
        return sum + calculateDailyEarnings(worker.hashrate, worker.isActive);
    }, 0);
}

async function toggleWorkerStatus(workerId, newStatus) {
    try {
        await apiRequest(`/api/mining/workers/${workerId}`, {
            method: 'PATCH',
            body: { isActive: newStatus }
        });
        
        // Reload workers
        await loadMiningWorkers();
        
        // Update overview statistics
        updateMiningOverview();
        
        showToast(
            'Success', 
            `Worker ${newStatus ? 'started' : 'stopped'} successfully.`,
            'success'
        );
    } catch (error) {
        console.error('Error toggling worker status:', error);
        showToast(
            'Error',
            `Failed to ${newStatus ? 'start' : 'stop'} worker. Please try again.`,
            'error'
        );
    }
}

async function deleteWorker(workerId) {
    try {
        await apiRequest(`/api/mining/workers/${workerId}`, {
            method: 'DELETE'
        });
        
        // Close the modal
        closeAllModals();
        
        // Reload workers
        await loadMiningWorkers();
        
        // Update overview statistics
        updateMiningOverview();
        
        showToast('Success', 'Worker deleted successfully.', 'success');
    } catch (error) {
        console.error('Error deleting worker:', error);
        showToast('Error', 'Failed to delete worker. Please try again.', 'error');
    }
}

function openAddWorkerModal() {
    // Reset the form
    document.getElementById('addWorkerForm').reset();
    
    // Show the modal
    document.getElementById('addWorkerModal').classList.add('show');
}

function openDeleteWorkerModal(workerId) {
    // Set the worker ID
    document.getElementById('deleteWorkerModal').setAttribute('data-worker-id', workerId);
    
    // Show the modal
    document.getElementById('deleteWorkerModal').classList.add('show');
}

function closeAllModals() {
    // Hide all modals
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

async function submitAddWorkerForm() {
    // Get form data
    const workerName = document.getElementById('workerName').value;
    const hashrate = parseFloat(document.getElementById('hashrate').value);
    const isActive = document.getElementById('isActive').checked;
    
    // Validate
    if (!workerName || isNaN(hashrate) || hashrate <= 0) {
        showToast('Error', 'Please fill in all required fields correctly.', 'error');
        return;
    }
    
    try {
        // Create worker
        await apiRequest('/api/mining/workers', {
            method: 'POST',
            body: {
                name: workerName,
                hashrate,
                isActive
            }
        });
        
        // Close the modal
        closeAllModals();
        
        // Reload workers
        await loadMiningWorkers();
        
        // Update overview statistics
        updateMiningOverview();
        
        showToast('Success', 'Worker added successfully.', 'success');
    } catch (error) {
        console.error('Error adding worker:', error);
        showToast('Error', 'Failed to add worker. Please try again.', 'error');
    }
}