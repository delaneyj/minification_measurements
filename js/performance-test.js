let testCount = 0;
let testResults = [];
let currentTest = {
    minified: null,
    unminified: null
};

// Listen for messages from iframes
window.addEventListener('message', (event) => {
    if (event.data.type === 'loadComplete') {
        if (event.data.version === 'minified') {
            currentTest.minified = event.data.time;
            document.getElementById('minifiedTime').textContent = `${event.data.time.toFixed(2)} ms`;
        } else if (event.data.version === 'unminified') {
            currentTest.unminified = event.data.time;
            document.getElementById('unminifiedTime').textContent = `${event.data.time.toFixed(2)} ms`;
        }
        
        // Check if both tests are complete
        if (currentTest.minified !== null && currentTest.unminified !== null) {
            displayComparison();
            addTestResult();
            currentTest = { minified: null, unminified: null };
        }
    }
});

function runTest() {
    // Reset current test
    currentTest = { minified: null, unminified: null };
    
    // Clear previous times
    document.getElementById('minifiedTime').textContent = 'Loading...';
    document.getElementById('unminifiedTime').textContent = 'Loading...';
    
    // Reload both iframes with cache busting
    const timestamp = new Date().getTime();
    document.getElementById('minifiedFrame').src = `minified.html?${timestamp}`;
    document.getElementById('unminifiedFrame').src = `unminified.html?${timestamp}`;
}

function displayComparison() {
    const minTime = currentTest.minified;
    const unminTime = currentTest.unminified;
    const difference = unminTime - minTime;
    const speedMultiple = (unminTime / minTime).toFixed(2);
    
    document.getElementById('speedMultiple').textContent = speedMultiple;
    document.getElementById('timeSaved').textContent = difference.toFixed(2);
    document.getElementById('summary').style.display = 'block';
}

function addTestResult() {
    testCount++;
    const minTime = currentTest.minified;
    const unminTime = currentTest.unminified;
    const difference = unminTime - minTime;
    const speedMultiple = (unminTime / minTime).toFixed(2);
    
    testResults.push({
        minified: minTime,
        unminified: unminTime,
        difference: difference,
        speedMultiple: speedMultiple
    });
    
    // Add row to table
    const tbody = document.getElementById('resultsBody');
    const row = tbody.insertRow();
    row.innerHTML = `
        <td>${testCount}</td>
        <td>${minTime.toFixed(2)}</td>
        <td>${unminTime.toFixed(2)}</td>
        <td>${difference.toFixed(2)}</td>
        <td>${speedMultiple}x</td>
    `;
    
    // Update averages if we have more than one test
    if (testResults.length > 1) {
        updateAverages();
    }
}

function updateAverages() {
    const avgMinified = testResults.reduce((sum, r) => sum + r.minified, 0) / testResults.length;
    const avgUnminified = testResults.reduce((sum, r) => sum + r.unminified, 0) / testResults.length;
    const avgDifference = avgUnminified - avgMinified;
    const avgSpeedMultiple = (avgUnminified / avgMinified).toFixed(2);
    
    document.getElementById('avgMinified').textContent = avgMinified.toFixed(2);
    document.getElementById('avgUnminified').textContent = avgUnminified.toFixed(2);
    document.getElementById('avgImprovement').textContent = avgSpeedMultiple + 'x';
    document.getElementById('averageResults').style.display = 'block';
}

function clearResults() {
    testCount = 0;
    testResults = [];
    document.getElementById('resultsBody').innerHTML = '';
    document.getElementById('summary').style.display = 'none';
    document.getElementById('averageResults').style.display = 'none';
    document.getElementById('minifiedTime').textContent = '-';
    document.getElementById('unminifiedTime').textContent = '-';
}

// Event listeners
document.getElementById('runTest').addEventListener('click', runTest);
document.getElementById('clearResults').addEventListener('click', clearResults);

// Run initial test on page load
window.addEventListener('load', () => {
    setTimeout(runTest, 500);
});