const log = (message: string, type: string = 'info') => {
    const output = document.getElementById('output');
    const timestamp = new Date().toLocaleTimeString();
    const className = type === 'success' ? 'success-msg' : type === 'error' ? 'error-msg' : type === 'warning' ? 'warning-msg' : 'info-msg';
    if (output) {
        output.innerHTML += `<div class="${className}">[${timestamp}] ${message}</div>`;
        output.scrollTop = output.scrollHeight;
    }
};

const logObject = (obj: any, label: string = '') => {
    const output = document.getElementById('output');
    const timestamp = new Date().toLocaleTimeString();
    const formatted = JSON.stringify(obj, null, 2);
    if (output) {
        output.innerHTML += `<div class="info-msg">[${timestamp}] ${label}</div><pre>${formatted}</pre>`;
        output.scrollTop = output.scrollHeight;
    }
};

export { log, logObject };
