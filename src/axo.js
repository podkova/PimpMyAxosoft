// https://stackoverflow.com/a/8943487
let URL_REGEX =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
function linkifyText(text) {
    return text.includes('href') ? text : text.replace(URL_REGEX, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
}

function linkifyDOMElement(domElem) {
    var jElem = $(domElem);
    var txt = jElem.html();
    txt = linkifyText(txt);
    jElem.html(txt);
}

var gCommentsSection = null;

function addUberViewEvent(afterElem, author, date, timestamp, content) {

    const newElem = $('<li style="margin-left: 25px" class="axo-lightgrid-item selectable" data-timestamp="' + timestamp + '">' +
    '    <div class="comment-body htmlreset">' +
    '        <div class="comment-container">' +
    '            <div class="comment-content">' +
    '                <div class="comment-meta" style="text-align: left; padding: 3px; margin: 0px; background: rgb(215, 224, 224);">' +
    '                    <span class="comment-author" style="font-weight: bold; font-size: 12px; font-style: normal; max-width: inherit; vertical-align: sub;">' + author + '</span>' +
    '                    <span class="comment-time" style="float: right; margin-right: 10px">' + date + '</span>' +
    '                </div>' +
    '                <div class="comment-text" style="padding: 4px 10px 4px 0px;">' + content + '</div>' +
    '            </div>' +
    '        </div>' +
    '    </div>' +
    '</li>');

    newElem.insertAfter(afterElem);
}

function addUberViewSimpleEvent(afterElem, author, date, timestamp, content) {

    const newElem = $('<li class="axo-lightgrid-item selectable" data-timestamp="' + timestamp + '">' +
    '    <div class="comment-body htmlreset">' +
    '        <div class="comment-container">' +
    '            <div class="comment-content">' +
    '                <div class="comment-meta" style="text-align: left; padding: 3px; margin: 0px; ">' +
    '                    <span class="comment-author" style="font-size: 11px; font-style: normal; max-width: inherit; vertical-align: sub;">' +
    '                        <b>' + author + '</b> ' + content +
    '                    </span>' +
    '                    <span class="comment-time" style="float: right; margin-right: 5px; font-size: 10px; font-style: italic">' + date + '</span>' +
    '                </div>' +
    '            </div>' +
    '        </div>' +
    '    </div>' +
    '</li>');


    newElem.insertAfter(afterElem);
}

function refreshAdvancedComments() {
    const historyList = $('.yui3-historyaccordionui-content').find('li.selectable');

    historyList.each(function(){
        $(this).find('.fa-plus-square-o')[0].click();
    });

    setTimeout(() => { refreshAdvancedCommentsDelayed(); }, 4000);
}

function refreshAdvancedCommentsDelayed() {
    const commentList = $(gCommentsSection).find('li.selectable');

    commentList.each(function(){
        const dateStr = $(this).find('.comment-time').first().text();
        const dateData = Date.parse(dateStr.substring(3, 6) + dateStr.substring(0, 3) + dateStr.substring(6, 100)).toString();
        $(this).attr('data-timestamp', dateData);
    });

    const historyList = $('.yui3-historyaccordionui-content').find('li.selectable');

    historyList.each(function(){
        const dateStr = $(this).find('.body').first().text().replace('on ', '').replace(' at', '');
        const dateData = Date.parse(dateStr.substring(3, 6) + dateStr.substring(0, 3) + dateStr.substring(6, 100)).toString();

        const author = $(this).find('.header').first().text().replace('Added by: ', '').replace('Changed by: ', '');

        const allowedRowTypes = ['Workflow Step', 'Assigned To', 'Sprint', 'Severity'];
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
            addUberViewSimpleEvent(commentList.first(), author, dateStr, dateData, content);

        // if (content.length != 0) {
        //     content = '<span style="font-size: 12px">' + content + '</span>';
        //     addUberViewEvent(commentList.first(), author, dateStr, dateData, content);                
        // }
    });

    const newCommentList = $(gCommentsSection).find('li.selectable');

    const parent = newCommentList.first().parent();
    newCommentList.sort(function(a,b){
        const ret = $(a).data('timestamp') < $(b).data('timestamp') ? -1 : 1;
        return ret;
    }).appendTo(parent);
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
                            let txt = $(this).html();
                            txt = linkifyText(txt);
                            $(this).html(txt);

                            descHandled = true;
                            if (commentsHandled)
                                return false; // break each()
                        }
                        else if ($(this).parent().prev().children().first().text() == "Comments:") // Match comments viewer
                        {
                            gCommentsSection = this;

                            $(this).parent().prev().children().first().html(
                                "Comments: <a " +
                                "style=\"float: right; font-size: 9px; margin-top: -10px\" " +
                                "id=\"adv-comments-button\" " +
                                "class=\"button button--basic button--small axo-menuitem-content\">" +
                                "Advanced</a>");

                            $("#adv-comments-button").on('click', refreshAdvancedComments);

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
                        meta.find('.comment-time').css({ 'float' : 'right', 'margin-right' : '10px' });

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
};

// Install the main observer
let mainConfig = { childList: true, subtree: true, characterData: true, attributes: true};
let mainObserver = new MutationObserver(mainCallback);
let mainNode = document.getElementById('bottomLayout');
mainObserver.observe(mainNode, mainConfig);

// Fix style for links (prevents bolding and double underscore)
let styleTag = $('<style>.comment-text a { border-bottom: 0 !important; font-weight: inherit !important; }</style>')
$('html > head').append(styleTag);

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
