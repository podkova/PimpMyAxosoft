function save_options()
{
    var videoPlayerEnabled = document.getElementById('VideoPlayer').checked;
    var debugLogsEnabled = document.getElementById('DebugLogs').checked;
    var blinkingEnabled = document.getElementById('Blinking').checked;

    chrome.storage.sync.set({
        videoPlayerEnabled: videoPlayerEnabled,
        debugLogsEnabled: debugLogsEnabled,
        blinkingEnabled: blinkingEnabled
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() { status.textContent = ''; }, 750);
    });
}
  
function restore_options()
{
    chrome.storage.sync.get({
        videoPlayerEnabled: false,
        debugLogsEnabled: false,
        blinkingEnabled: true
    }, function(items) {
        document.getElementById('VideoPlayer').checked = items.videoPlayerEnabled;
        document.getElementById('DebugLogs').checked = items.debugLogsEnabled;
        document.getElementById('Blinking').checked = items.blinkingEnabled;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
