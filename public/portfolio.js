/**
 * Portfolio JavaScript File
 */

// Chart instance
let allocationChart = null;

document.addEventListener('DOMContentLoaded', function() {
    // Load portfolio data
    loadPortfolioData();
    
    // Add event listener to refresh button
    const refreshButton = document.getElementById('refresh-assets-btn');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            loadPortfolioData();
            showToast('Refreshed', 'Portfolio data has been refreshed', 'success');
        });
    }
});

async function loadPortfolioData() {
    try {
        // Show loading states
        document.getElementById('chart-loading').style.display = 'block';
        document.getElementById('asset-list').innerHTML = '<div class="loading-spinner"></div>';
        
        // Load market data for current prices
        const marketData = await apiRequest('/crypto/markets');
        const marketPrices = {};
        
        marketData.forEach(coin => {
            marketPrices[coin.id] = {
                price: coin.current_price,
                change: coin.price_change_percentage_24h,
                image: coin.image,
                name: coin.name
            };
        });
        
        // Load portfolio assets
        const assets = await apiRequest('/portfolio');
        
        if (assets && assets.length > 0) {
            // Calculate portfolio metrics
            const portfolioMetrics = calculatePortfolioMetrics(assets, marketPrices);
            
            // Update summary cards
            updatePortfolioSummary(portfolioMetrics);
            
            // Update allocation chart
            updateAllocationChart(assets, marketPrices);
            
            // Update asset list
            updateAssetList(assets, marketPrices);
        } else {
            // Handle empty portfolio
            document.getElementById('total-portfolio-value').textContent = formatCurrency(0);
            document.getElementById('portfolio-change').textContent = '+0.00%';
            document.getElementById('active-assets-count').textContent = '0';
            document.getElementById('best-performer-name').textContent = '-';
            document.getElementById('best-performer-change').textContent = '+0.00%';
            document.getElementById('worst-performer-name').textContent = '-';
            document.getElementById('worst-performer-change').textContent = '-0.00%';
            
            document.getElementById('chart-loading').style.display = 'none';
            document.getElementById('allocation-legend').innerHTML = '';
            
            if (allocationChart) {
                allocationChart.destroy();
                allocationChart = null;
            }
            
            document.getElementById('asset-list').innerHTML = 
                '<div class="empty-list">You don\'t have any assets in your portfolio yet.<br>Start trading to add assets to your portfolio.</div>';
        }
    } catch (error) {
        console.error('Failed to load portfolio data:', error);
        showToast('Error', 'Failed to load portfolio data', 'error');
        
        // Clear loading states
        document.getElementById('chart-loading').style.display = 'none';
        document.getElementById('asset-list').innerHTML = 
            '<div class="empty-list">Failed to load portfolio data. Please try again.</div>';
    }
}

function calculatePortfolioMetrics(assets, marketPrices) {
    let totalValue = 0;
    let totalChange = 0;
    let bestPerformer = null;
    let worstPerformer = null;
    
    const assetsWithMetrics = assets.map(asset => {
        const marketData = marketPrices[asset.coinId];
        if (!marketData) return null;
        
        const price = marketData.price;
        const change = marketData.change;
        const value = asset.amount * price;
        
        totalValue += value;
        
        // Calculate weighted change contribution
        const changeContribution = value * (change / 100);
        totalChange += changeContribution;
        
        return {
            ...asset,
            price,
            change,
            value,
            changeContribution
        };
    }).filter(asset => asset !== null);
    
    // Find best and worst performers
    if (assetsWithMetrics.length > 0) {
        bestPerformer = assetsWithMetrics.reduce((best, current) => 
            current.change > best.change ? current : best, assetsWithMetrics[0]);
            
        worstPerformer = assetsWithMetrics.reduce((worst, current) => 
            current.change < worst.change ? current : worst, assetsWithMetrics[0]);
    }
    
    // Calculate percentage change
    let totalChangePercentage = 0;
    if (totalValue > 0) {
        totalChangePercentage = (totalChange / (totalValue - totalChange)) * 100;
    }
    
    return {
        totalValue,
        totalChangePercentage,
        activeAssetsCount: assetsWithMetrics.length,
        bestPerformer,
        worstPerformer,
        assetsWithMetrics
    };
}

function updatePortfolioSummary(metrics) {
    document.getElementById('total-portfolio-value').textContent = formatCurrency(metrics.totalValue);
    
    const portfolioChangeElement = document.getElementById('portfolio-change');
    portfolioChangeElement.textContent = metrics.totalChangePercentage >= 0 ? 
        `+${formatPercentage(metrics.totalChangePercentage)}` : 
        formatPercentage(metrics.totalChangePercentage);
    portfolioChangeElement.className = `summary-card-change ${metrics.totalChangePercentage >= 0 ? 'positive' : 'negative'}`;
    
    document.getElementById('active-assets-count').textContent = metrics.activeAssetsCount;
    
    if (metrics.bestPerformer) {
        document.getElementById('best-performer-name').textContent = metrics.bestPerformer.coinName;
        document.getElementById('best-performer-change').textContent = `+${formatPercentage(metrics.bestPerformer.change)}`;
    } else {
        document.getElementById('best-performer-name').textContent = '-';
        document.getElementById('best-performer-change').textContent = '+0.00%';
    }
    
    if (metrics.worstPerformer) {
        document.getElementById('worst-performer-name').textContent = metrics.worstPerformer.coinName;
        document.getElementById('worst-performer-change').textContent = formatPercentage(metrics.worstPerformer.change);
    } else {
        document.getElementById('worst-performer-name').textContent = '-';
        document.getElementById('worst-performer-change').textContent = '-0.00%';
    }
}

function updateAllocationChart(assets, marketPrices) {
    const chartContainer = document.getElementById('allocation-chart');
    const legendContainer = document.getElementById('allocation-legend');
    
    // Clear existing content
    legendContainer.innerHTML = '';
    
    // Prepare data for chart
    const assetData = assets.map(asset => {
        const price = marketPrices[asset.coinId]?.price || 0;
        return {
            id: asset.coinId,
            name: asset.coinName,
            symbol: asset.symbol.toUpperCase(),
            value: asset.amount * price,
            amount: asset.amount,
            color: COIN_COLORS[asset.coinId] || getRandomColor(asset.coinId)
        };
    }).filter(asset => asset.value > 0);
    
    // Sort by value (descending)
    assetData.sort((a, b) => b.value - a.value);
    
    // Calculate total value
    const totalValue = assetData.reduce((sum, asset) => sum + asset.value, 0);
    
    // Prepare chart data
    const labels = assetData.map(asset => asset.symbol);
    const values = assetData.map(asset => asset.value);
    const colors = assetData.map(asset => asset.color);
    
    // Create chart
    if (allocationChart) {
        allocationChart.destroy();
    }
    
    if (assetData.length > 0) {
        allocationChart = new Chart(chartContainer, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const percentage = ((value / totalValue) * 100).toFixed(2);
                                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Create legend
        assetData.forEach(asset => {
            const percentage = ((asset.value / totalValue) * 100).toFixed(2);
            
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${asset.color}"></div>
                <div class="legend-label">${asset.name}</div>
                <div class="legend-value">${formatCurrency(asset.value)}</div>
                <div class="legend-percentage">${percentage}%</div>
            `;
            
            legendContainer.appendChild(legendItem);
        });
    } else {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-list';
        emptyMessage.textContent = 'No assets to display';
        legendContainer.appendChild(emptyMessage);
    }
    
    // Hide loading spinner
    document.getElementById('chart-loading').style.display = 'none';
}

function updateAssetList(assets, marketPrices) {
    const assetListContainer = document.getElementById('asset-list');
    assetListContainer.innerHTML = '';
    
    if (assets.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-list';
        emptyMessage.textContent = 'You don\'t have any assets in your portfolio yet.';
        assetListContainer.appendChild(emptyMessage);
        return;
    }
    
    // Sort assets by value (descending)
    const assetsWithValue = assets.map(asset => {
        const price = marketPrices[asset.coinId]?.price || 0;
        const change = marketPrices[asset.coinId]?.change || 0;
        return {
            ...asset,
            price,
            change,
            value: asset.amount * price
        };
    });
    
    assetsWithValue.sort((a, b) => b.value - a.value);
    
    // Create asset items
    assetsWithValue.forEach(asset => {
        const assetItem = createAssetItem(asset);
        assetListContainer.appendChild(assetItem);
    });
}

function createAssetItem(asset) {
    const isPositive = asset.change >= 0;
    const colorKey = asset.coinId.toLowerCase();
    const color = COIN_COLORS[colorKey] || '#6B7280';
    
    const item = document.createElement('div');
    item.className = 'asset-item';
    
    item.innerHTML = `
        <div class="asset-coin">
            <div class="coin-icon" style="background-color: ${color}20; color: ${color}">
                ${asset.symbol.toUpperCase().substring(0, 2)}
            </div>
            <div class="coin-info">
                <div class="coin-name">${asset.coinName}</div>
                <div class="coin-symbol">${asset.symbol.toUpperCase()}</div>
            </div>
        </div>
        <div class="asset-price">${formatCurrency(asset.price)}</div>
        <div class="asset-holdings">
            <span class="asset-holdings-value">${formatNumber(asset.amount, 8)}</span>
            <span class="asset-holdings-symbol">${asset.symbol.toUpperCase()}</span>
        </div>
        <div class="asset-value-amount">${formatCurrency(asset.value)}</div>
        <div class="asset-change">
            <span class="asset-change-value ${isPositive ? 'positive' : 'negative'}">
                ${isPositive ? '+' : ''}${formatPercentage(asset.change)}
            </span>
        </div>
        <div class="asset-actions-container">
            <button class="asset-action-btn view" title="View Details" onclick="viewAssetDetails('${asset.coinId}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button class="asset-action-btn trade" title="Trade" onclick="tradeAsset('${asset.coinId}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 9 3-3 3 3"></path><path d="M13 18H7a2 2 0 0 1-2-2V6"></path><path d="m22 15-3 3-3-3"></path><path d="M11 6h6a2 2 0 0 1 2 2v10"></path></svg>
            </button>
        </div>
    `;
    
    return item;
}

// Asset action placeholders
function viewAssetDetails(coinId) {
    showToast('Info', `Viewing details for ${coinId}`, 'info');
    window.location.href = `trading.html?coin=${coinId}`;
}

function tradeAsset(coinId) {
    showToast('Info', `Trading ${coinId}`, 'info');
    window.location.href = `trading.html?coin=${coinId}`;
}

// Utility function for random colors
function getRandomColor(seed) {
    // Simple hash function for strings
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to hex color
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    
    return color;
}