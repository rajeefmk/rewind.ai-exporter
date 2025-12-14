const btnEstimate = document.getElementById('btn-estimate');
const btnExport = document.getElementById('btn-export');
const btnShow = document.getElementById('btn-show');
const statusDiv = document.getElementById('status');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');

let lastExportPath = null;

btnEstimate.addEventListener('click', async () => {
    statusDiv.textContent = 'Calculating estimate...';
    try {
        const estimate = await window.api.getEstimate();
        statusDiv.textContent = `Estimated size: ${estimate}`;
    } catch (error) {
        statusDiv.textContent = `Error: ${error.message}`;
    }
});

btnExport.addEventListener('click', async () => {
    statusDiv.textContent = 'Starting export...';
    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    btnShow.style.display = 'none';
    
    try {
        await window.api.startExport();
        // UI updates will come via IPC events
    } catch (error) {
        statusDiv.textContent = `Failed to start export: ${error.message}`;
    }
});

btnShow.addEventListener('click', () => {
    if (lastExportPath) {
        window.api.showInFolder(lastExportPath);
    }
});

window.api.onProgress((text) => {
    statusDiv.textContent = text;
});

window.api.onProgressValue((percentage) => {
    progressFill.style.width = `${percentage}%`;
});

window.api.onError((error) => {
    statusDiv.textContent = `Error: ${error}`;
    progressContainer.style.display = 'none';
});

window.api.onComplete((path) => {
    statusDiv.textContent = `Export complete! Saved to: ${path}`;
    progressFill.style.width = '100%';
    lastExportPath = path;
    btnShow.style.display = 'block';
});
