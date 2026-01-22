const socket = io();
let selectedFile = null;

async function loadStats() {
  try {
    const response = await fetch('/api/stats');
    const stats = await response.json();
    
    document.getElementById('totalScans').textContent = stats.totalScans;
    document.getElementById('threatsDetected').textContent = stats.threatsDetected;
    document.getElementById('accuracy').textContent = stats.accuracy + '%';
    document.getElementById('responseTime').textContent = Math.round(stats.averageResponseTime) + 'ms';
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

function handleFileSelect(event) {
  selectedFile = event.target.files[0];
  document.getElementById('fileName').textContent = selectedFile.name;
  document.getElementById('scanBtn').disabled = false;
}

async function scanFile() {
  if (!selectedFile) return;
  
  const formData = new FormData();
  formData.append('file', selectedFile);
  
  const scanBtn = document.getElementById('scanBtn');
  scanBtn.textContent = '⏳ Scanning...';
  scanBtn.disabled = true;
  
  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    displayResult(result);
    loadStats();
  } catch (error) {
    console.error('Scan error:', error);
    alert('Scan failed. Please try again.');
  } finally {
    scanBtn.textContent = '🛡️ Start Scan';
    scanBtn.disabled = false;
  }
}

function displayResult(result) {
  const resultDiv = document.getElementById('result');
  resultDiv.style.display = 'block';
  resultDiv.className = result.isRansomware ? 'threat' : 'safe';
  
  const icon = result.isRansomware ? '🚨' : '✅';
  const status = result.isRansomware ? 'Threat Detected!' : 'File is Safe';
  const riskColor = {
    'CRITICAL': '#ff4757',
    'HIGH': '#ffa502',
    'MEDIUM': '#ffd32a',
    'LOW': '#2ed573'
  }[result.riskLevel];
  
  resultDiv.innerHTML = `
    <h2>${icon} ${status}</h2>
    <p><strong>File:</strong> ${result.fileName}</p>
    <p><strong>Risk Level:</strong> <span style="color: ${riskColor}; font-weight: bold;">${result.riskLevel}</span></p>
    <p><strong>Confidence:</strong> ${(result.confidence * 100).toFixed(1)}%</p>
    <p><strong>Timestamp:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
    ${result.detectedPatterns.length > 0 ? `
      <h3 style="margin-top: 1rem;">Detected Patterns:</h3>
      <ul style="margin-left: 1.5rem;">
        ${result.detectedPatterns.map(p => `<li>${p.replace(/_/g, ' ').toUpperCase()}</li>`).join('')}
      </ul>
    ` : ''}
    ${result.isRansomware ? `
      <div style="margin-top: 1rem; padding: 1rem; background: rgba(255, 71, 87, 0.1); border-radius: 8px;">
        <h3>🛡️ Recommended Actions:</h3>
        <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
          <li>Isolate the affected system immediately</li>
          <li>Do not pay any ransom demands</li>
          <li>Disconnect from network to prevent spread</li>
          <li>Contact your security team</li>
          <li>Preserve evidence for forensic analysis</li>
        </ul>
      </div>
    ` : ''}
  `;
}

socket.on('threat-detected', (threat) => {
  if (Notification.permission === 'granted') {
    new Notification('🚨 Ransomware Detected!', {
      body: `Threat detected in ${threat.fileName}`,
      icon: '/favicon.ico'
    });
  } else {
    alert(`🚨 THREAT DETECTED: ${threat.fileName}`);
  }
});

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// Load stats on page load and refresh every 5 seconds
loadStats();
setInterval(loadStats, 5000);