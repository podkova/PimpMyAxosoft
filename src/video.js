const urlParams = new URLSearchParams(window.location.search);

document.write('<a style="color: gray; float: right" href="' + urlParams.get('url') + '&force=true">DOWNLOAD</a><video id="video" width="1280" style="transform: translate(-50%, -50%); position: absolute; top: 50%; left: 50%;" autoplay src="');
document.write(urlParams.get('url'));
document.write('" controls></video>');

var videoElement = document.getElementById("video");

videoElement.addEventListener('loadedmetadata', function(e)
{
    var marginWidth = 70;
    var marginHeight = 110;
    window.resizeTo(1280 + marginWidth, videoElement.videoHeight * 1280 / videoElement.videoWidth + marginHeight);
});
