// https://stackoverflow.com/a/8943487
let URL_REGEX =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
let ISSUE_REGEX = /( |^)((T|B)([1-9][0-9]*))/gm;

function linkifyText(text) {
    return (text.includes('href') ? text : text.replace(URL_REGEX, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    })).replace(ISSUE_REGEX, function(wholeMatch, prefix, issueId) {
        const url = 'viewitem?id=' + issueId.substring(1) + '&type=' + (issueId.substring(0, 1) == 'T' ? 'features' : 'tasks') + '&force_use_number=true';
        return prefix + '<a href="' + url + '" class="issue-link">' + issueId + '</a>';
    });
}

function linkifyDOMElement(domElem) {
    var jElem = $(domElem);
    var txt = jElem.html();
    txt = linkifyText(txt);
    jElem.html(txt);
}

function addUberViewSimpleEvent(parent, author, date, timestamp, content) {

    const newElem = $('<li class="axo-lightgrid-item selectable uber-view-event" data-timestamp="' + timestamp + '" style="background: #f6f8f9">' +
    '    <div class="comment-body htmlreset">' +
    '        <div class="comment-container">' +
    '            <div class="comment-content">' +
    '                <div class="comment-meta" style="text-align: left; padding: 3px; margin: 0px; ">' +
    '                    <span class="comment-author" style="font-size: 11px; font-style: normal; max-width: inherit;">' +
    '                        <b>' + author + '</b> ' + content +
    '                    </span>' +
    '                    <span class="comment-time" style="margin-right: 5px; font-size: 10px; font-style: italic; color: #1c2933; vertical-align: sub;">' + date + '</span>' +
    '                </div>' +
    '            </div>' +
    '        </div>' +
    '    </div>' +
    '</li>');

    parent.append(newElem);
}

function refreshAdvancedComments(commentsSection, commentLoadTimestamp) {
    const minRequiredTimeout = 3000;
    const timePassed = Date.now() - commentLoadTimestamp;
    const actualTimeout = minRequiredTimeout - timePassed;

    if (actualTimeout <= 0)
        refreshAdvancedCommentsDelayed(commentsSection);
    else
    {
        $('#uber-view-progress-container').show();
        $('#uber-view-progress-bar').animate({
            width: 100
        }, actualTimeout);

        setTimeout(() => {
            refreshAdvancedCommentsDelayed(commentsSection);
            $('#uber-view-progress-container').fadeOut(500);
        }, actualTimeout);
    }
}

function refreshAdvancedCommentsDelayed(commentsSection) {
    const commentListParent = $(commentsSection).find('ul.axo-lightgrid-separatedlist');

    const commentList = $(commentListParent).find('li.selectable');
    commentList.each(function(){
        const dateStr = $(this).find('.comment-time').first().text();
        const dateData = Date.parse(dateStr.substring(3, 6) + dateStr.substring(0, 3) + dateStr.substring(6, 100)).toString();
        $(this).attr('data-timestamp', dateData);
    });

    // History list
    const historyList = $('.yui3-historyaccordionui-content').find('li.selectable');
    historyList.each(function(){
        const dateStr = $(this).find('.body').first().text().replace('on ', '').replace(' at', '');
        const dateData = Date.parse(dateStr.substring(3, 6) + dateStr.substring(0, 3) + dateStr.substring(6, 100)).toString();

        const author = $(this).find('.header').first().text().replace('Added by: ', '').replace('Changed by: ', '');

        // TODO: this should be configurable - exposed for the user in some settings panel
        const allowedRowTypes = ['Workflow Step', 'Assigned To', /*'Sprint'*/, 'Severity'];
        let content = '';

        const table = $(this).find('table.changetable').find('tbody');
        table.find('tr').each(function(){
            if (allowedRowTypes.includes($(this).children().first().text())) {
                if (content.length != 0)
                    content += ' and ';

                switch ($(this).children().eq(0).text()) {
                    case 'Workflow Step': content += 'set workflow step to'; break;
                    case 'Assigned To': content += 'assigned issue to'; break;
                    case 'Sprint': content += 'set sprint to'; break;
                    case 'Severity': content += 'marked issue as'; break;
                }

                content += ' <b>' + $(this).children().last().text() + '</b>';
            }
        });
        if (content.length != 0)
            addUberViewSimpleEvent(commentListParent, author, dateStr, dateData, content);
    });

    // SVN commits list
    const issueId = $('label.item-field-id').data('issue-id');
    const commitList = $('.axo-sourcecontrolcommitui-content').find('li.commit');
    commitList.each(function(){
        const dateStr = $(this).find('.commit-date').text().trim().replace('On ', '').replace('at ', '');
        const dateData = Date.parse(dateStr.substring(3, 6) + dateStr.substring(0, 3) + dateStr.substring(6, 100)).toString();

        const content = $(this).find('.message').text().replace('[axof: ' + issueId + '] ', '').replace('[axot: ' + issueId + '] ', '').replace('(rev: ', '&#9745; SVN commit <b>r').replace(')', '</b>: ');

        addUberViewSimpleEvent(commentListParent, '', dateStr, dateData, content);
    });

    const newCommentList = $(commentListParent).find('li.selectable');

    const parent = newCommentList.first().parent();
    newCommentList.sort(function(a,b){
        const ret = $(a).data('timestamp') < $(b).data('timestamp') ? -1 : 1;
        return ret;
    }).appendTo(parent);

    uberViewEnabled = true;

    $("#adv-comments-button").on('click', function() {
        const uberViewEvents = $('.uber-view-event');
        uberViewEnabled = !uberViewEnabled;
        if (uberViewEnabled)
            uberViewEvents.stop().fadeIn(200);
        else
            uberViewEvents.stop().fadeOut(200);
    });
}

function expandHistory() {
    setTimeout(() => {
        const historyList = $('.yui3-historyaccordionui-content').find('li.selectable');
        if (historyList.length === 0)
            expandHistory();
        else {
            historyList.each(function(){
                const plus = $(this).find('.fa-plus-square-o');
                if (plus.length != 0)
                    plus[0].click();
            });
        }
    }, 200);
}

let sidePanelDescCallback = function(mutationsList, observer) {
    // Description - side panel
    for (var mutation of mutationsList) {
        if (mutation.target.className == "content")
            linkifyDOMElement(mutation.target);
        else if (mutation.target.firstChild && mutation.target.firstChild.className == "content")
            linkifyDOMElement(mutation.target.firstChild);
    }
}

let mainCallback = function(mutationsList, sidePanelDescObserver) {
    for(var mutation of mutationsList) {
        if (mutation.type == 'childList') {
            for (var node of mutation.addedNodes)
            {
                // Description - issue view
                if (node.className == "item-field-table")
                {
                    let commentsHandled = false;
                    let descHandled = false;
                    let jnode = $(node);
                    jnode.find("[class='field']").each(function(index){
                        if ($(this).parent().prev().children().first().text() == "Description:" // Match description editor and description viewer
                            && $(this).find('#description').length == 0) // Discard description editor
                        {
                            // Convert dead links to hyperlinks
                            linkifyDOMElement(this);

                            descHandled = true;
                            if (commentsHandled)
                                return false; // break each()
                        }
                        else if ($(this).parent().prev().children().first().text() == "Comments:") // Match comments viewer
                        {
                            $(this).find('#sort')
                                .after('<li style="vertical-align: middle; display: none" id="uber-view-progress-container">' +
                                       '    <div style="width: 108px; background: #d7e0e0; border-radius: 4px; padding: 4px; height: 20px;">' +
                                       '        <div style="background: #425f75; width: 0; height: 100%; border-radius: 2px;" id="uber-view-progress-bar"></div>' +
                                       '    </div>' +
                                       '</li>')
                                .after('<li id="adv-comments-button" class="axo-menuitem-button">' +
                                       '    <a class="button button--basic button--small axo-menuitem-content">Uber View</a>' +
                                       '</li>');

                            const commentsSection = this;
                            const commentLoadTimestamp = Date.now();

                            $(this).find("#adv-comments-button").on('click', function() {
                                $(this).unbind('click');
                                refreshAdvancedComments(commentsSection, commentLoadTimestamp);
                            });

                            expandHistory();

                            commentsHandled = true;
                            if (descHandled)
                                return false; // break each()                           
                        }
                    });
                }
                // Description - side panel
                else if (node.id == "descriptionAccordionItem")
                {
                    // Install the side panel desc observer
                    var sidePanelDescConfig = { characterData: true, attributes: true, subtree: true };
                    var sidePanelDescObserver = new MutationObserver(sidePanelDescCallback);
                    sidePanelDescObserver.observe(node, sidePanelDescConfig);
                }
                // Comments - everywhere
                else if (node.tagName == "UL")
                {
                    $(node).find(".comment-text").each(function(index){

                        // Move comment author's name to the left and make it more visible
                        // - bold
                        // - bigger
                        // - not italic
                        // - without length limit
                        var meta = $(this).next();
                        meta.css({ 'text-align' : 'left', 'padding' : '3px', 'margin' : '0', 'background' : '#d7e0e0' });
                        meta.find('.comment-author').css({ 'font-weight' : 'bold', 'font-size' : '12px', 'font-style' : 'normal', 'max-width' : 'inherit', 'vertical-align' : 'sub' });

                        // Move comment's text BELOW the comment's author
                        $(this).insertAfter(meta);

                        // Adjust text padding
                        $(this).css('padding', '4px 10px 4px 0px');

                        // Convert dead links to hyperlinks
                        linkifyDOMElement(this);
                    });
                }
                
            }
        }
    }

    const issueIdLabel = $('label.item-field-id');
    if (issueIdLabel.length == 1 && !issueIdLabel.data('issue-id'))
    {
        const issueType = $('#view-item-subtitle').text() == 'Bug' ? 'B' : 'T';

        const issueId = issueIdLabel.text().trim();

        issueIdLabel.data('issue-id', issueId);
        issueIdLabel.data('issue-type', issueType);

        const url = 'viewitem?id=' + issueId + '&type=' + (issueType == 'T' ? 'features' : 'tasks') + '&force_use_number=true';

        issueIdLabel.text(issueType + issueId);
        issueIdLabel.attr('title', 'Click to copy hyperlink to clipboard!')
        issueIdLabel.css({ 'cursor' : 'copy', 'color' : '#607a8a' });
        issueIdLabel.on('click', function() {
            urlToClipboard(url, issueType + issueId);
        });
    }
};

function urlToClipboard(url, text)
{
    const html = '<a style="font-family: Arial" href="' + url + '">' + text + '</a>';
    const item = new ClipboardItem({
        'text/html' : new Blob([html], {type: 'text/html'}),
        'text/plain' : new Blob([text], {type: 'text/plain'})
    });
    navigator.clipboard.write([item]);
}

// Install the main observer
setTimeout(() => {
    let mainConfig = { childList: true, subtree: true, characterData: true, attributes: true};
    let mainObserver = new MutationObserver(mainCallback);
    let mainNode = document.getElementById('bottomLayout');
    mainObserver.observe(mainNode, mainConfig);
}, 1000);

// Remove formatting from copied text (e.g. green background when copying comments)
document.addEventListener("paste", function(e) {
    const text = (e.originalEvent || e).clipboardData.getData('text/html');
    if (text) {
        e.preventDefault();
        const wrapper = document.createElement('div');
        wrapper.innerHTML = text;
        $(wrapper).find('*').removeAttr('style');
        document.execCommand("insertHTML", false, wrapper.innerHTML);
    }
});
