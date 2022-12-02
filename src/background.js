var debugLogsEnabled = false;

chrome.storage.sync.get({ debugLogsEnabled: false }, function(items)
{
    debugLogsEnabled = items.debugLogsEnabled;
});

function debugLog(msg)
{
    if (debugLogsEnabled)
        console.log(msg);
}

var downloads = {}

function handleCreated(item)
{
    debugLog('handleCreated');
    debugLog(item);

    if (item && item.state == "in_progress" && item.url.includes("axosoft") && !item.url.includes("force=true"))
    {
        downloads[item.id] = {}
        downloads[item.id]['url'] = item.url;
        downloads[item.id]['shown'] = false;
    }
}

function handleChanged(item)
{
    debugLog('handleChanged');
    debugLog(item);

    if (item.id in downloads && !downloads[item.id]['shown'])
    {
        if (item.mime && item.mime.current == "video/mp4")
        {
            chrome.downloads.cancel(item.id);
            chrome.downloads.erase({
                limit: 1,
                orderBy: ["-startTime"]
              });

            downloads[item.id]['shown'] = true;

            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { item: item });

                var width = 1290;
                var height = 960;

                chrome.windows.create({
                    width: width,
                    height: height,
                    url: chrome.runtime.getURL("video.htm?url=" + downloads[item.id]['url']),
                    type: "popup"
                  });
            });
        }
    }
}

chrome.storage.sync.get({ videoPlayerEnabled: false }, function(items)
{
    if (items.videoPlayerEnabled)
    {
        debugLog("[videoPlayerEnabled=true] Registering downloads.onCreated and downloads.onChanged listeners.");
        chrome.downloads.onCreated.addListener(handleCreated);
        chrome.downloads.onChanged.addListener(handleChanged);           
    }
    else
    {
        debugLog("[videoPlayerEnabled=false] Listeners for downloads.onCreated and downloads.onChanged were not registered.");
    }
});
