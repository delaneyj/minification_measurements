let testCount = 0;
let testResults = [];
let currentTest = {
    stack: null,
    datastar: null
};

// Listen for messages from iframes
window.addEventListener('message', (event) => {
    if (event.data.type === 'loadComplete') {
        if (event.data.version === 'stack') {
            currentTest.stack = event.data.time;
            document.getElementById('stackTime').textContent = `${event.data.time.toFixed(2)} ms`;
        } else if (event.data.version === 'datastar') {
            currentTest.datastar = event.data.time;
            document.getElementById('datastarTime').textContent = `${event.data.time.toFixed(2)} ms`;
        }
        
        // Check if both tests are complete
        if (currentTest.stack !== null && currentTest.datastar !== null) {
            displayComparison();
            addTestResult();
            currentTest = { stack: null, datastar: null };
        }
    }
});

function runTest() {
    // Reset current test
    currentTest = { stack: null, datastar: null };
    
    // Clear previous times
    document.getElementById('stackTime').textContent = 'Loading...';
    document.getElementById('datastarTime').textContent = 'Loading...';
    
    // Reload both iframes with cache busting
    const timestamp = new Date().getTime();
    document.getElementById('stackFrame').src = `htmx_stack.html?${timestamp}`;
    document.getElementById('datastarFrame').src = `datastar.html?${timestamp}`;
}

function displayComparison() {
    const stackTime = currentTest.stack;
    const datastarTime = currentTest.datastar;
    const difference = stackTime - datastarTime;
    const speedMultiple = (stackTime / datastarTime).toFixed(2);
    
    document.getElementById('speedMultiple').textContent = speedMultiple;
    document.getElementById('timeSaved').textContent = difference.toFixed(2);
    document.getElementById('summary').style.display = 'block';
}

function addTestResult() {
    testCount++;
    const stackTime = currentTest.stack;
    const datastarTime = currentTest.datastar;
    const difference = stackTime - datastarTime;
    const speedMultiple = (stackTime / datastarTime).toFixed(2);
    
    testResults.push({
        stack: stackTime,
        datastar: datastarTime,
        difference: difference,
        speedMultiple: speedMultiple
    });
    
    // Add row to table
    const tbody = document.getElementById('resultsBody');
    const row = tbody.insertRow();
    row.innerHTML = `
        <td>${testCount}</td>
        <td>${stackTime.toFixed(2)}</td>
        <td>${datastarTime.toFixed(2)}</td>
        <td>${difference.toFixed(2)}</td>
        <td>${speedMultiple}x</td>
    `;
    
    // Update averages if we have more than one test
    if (testResults.length > 1) {
        updateAverages();
    }
}

function updateAverages() {
    const avgStack = testResults.reduce((sum, r) => sum + r.stack, 0) / testResults.length;
    const avgDatastar = testResults.reduce((sum, r) => sum + r.datastar, 0) / testResults.length;
    const avgDifference = avgStack - avgDatastar;
    const avgSpeedMultiple = (avgStack / avgDatastar).toFixed(2);
    
    document.getElementById('avgStack').textContent = avgStack.toFixed(2);
    document.getElementById('avgDatastar').textContent = avgDatastar.toFixed(2);
    document.getElementById('avgImprovement').textContent = avgSpeedMultiple + 'x';
    document.getElementById('averageResults').style.display = 'block';
}

function clearResults() {
    testCount = 0;
    testResults = [];
    document.getElementById('resultsBody').innerHTML = '';
    document.getElementById('summary').style.display = 'none';
    document.getElementById('averageResults').style.display = 'none';
    document.getElementById('stackTime').textContent = '-';
    document.getElementById('datastarTime').textContent = '-';
}

// Event listeners
document.getElementById('runTest').addEventListener('click', runTest);
document.getElementById('clearResults').addEventListener('click', clearResults);

// Run initial test on page load
window.addEventListener('load', () => {
    setTimeout(runTest, 500);
});