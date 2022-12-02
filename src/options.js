function save_options()
{
    var videoPlayerEnabled = document.getElementById('VideoPlayer').checked;
    var debugLogsEnabled = document.getElementById('DebugLogs').checked;

    chrome.storage.sync.set({
        videoPlayerEnabled: videoPlayerEnabled,
        debugLogsEnabled: debugLogsEnabled
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
        debugLogsEnabled: false
    }, function(items) {
        document.getElementById('VideoPlayer').checked = items.videoPlayerEnabled;
        document.getElementById('DebugLogs').checked = items.debugLogsEnabled;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
