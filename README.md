# PimpMyAxosoft
Chrome plugin making Axosoft issue tracker more user-friendly.
Confirmed to work in Opera with [Install Chrome Extensions plugin](https://addons.opera.com/en/extensions/details/install-chrome-extensions/).

### Installation
The most recent version of the plugin packed from master is always available in the [Chrome Web Store](https://chrome.google.com/webstore/detail/pimpmyaxosoft/fakpcamibelbbpgfldjdifjcjonakkgp).
You can also download the source and load it to Chrome in the Developer Mode. It's very simple, and the steps to do it are described in the [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/mv2/getstarted/#manifest). 

### Features
* You can enable Uber View mode in the issue view
  - Workflow Step, Severity, Assigned To - changes to these fields are injected to the comments section
  - SVN commits are injected to the comments section
* Improved comment section, both in the view issue window and in the side panel
  - Dead links are converted to hyperlinks
  - Author name and post time are moved to the top of the comment and have altered style for more visibility
* Improved Description field, both in the view issue window and in the side panel
  - Dead links are converted to hyperlinks
* Pasting content copied from a comment doesn't transfer the green background

![Screenshot](screenshot.png?raw=true "Screenshot")
