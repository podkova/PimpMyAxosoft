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

let sidePanelDescCallback = function(mutationsList, observer) {
    // Description - side panel
    for (var mutation of mutationsList) {
        if (mutation.target.className == "content")
            linkifyDOMElement(mutation.target);
        else if (mutation.target.firstChild.className == "content")
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
                    var jnode = $(node);
                    jnode.find("[class='field']").each(function(index){
                        if ($(this).parent().prev().children().first().text() == "Description:") // Beware, web crawling voodoo
                        {
                            // Convert dead links to hyperlinks
                            var txt = $(this).html();
                            txt = linkifyText(txt);
                            $(this).html(txt);

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
    e.preventDefault();
    const text = (e.originalEvent || e).clipboardData.getData('text/html');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = text;
    $(wrapper).find('*').removeAttr('style');
    document.execCommand("insertHTML", false, wrapper.innerHTML);
});
