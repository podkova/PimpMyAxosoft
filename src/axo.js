// https://stackoverflow.com/a/8943487
let URL_REGEX =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
function linkify(text) {
    return text.replace(URL_REGEX, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
}

var callback = function(mutationsList, observer) {
    for(var mutation of mutationsList) {
        if (mutation.type == 'childList') {
            for (var node of mutation.addedNodes)
            {
                // DESCRIPTION
                if (node.className == "item-field-table")
                {
                    var jnode = $(node);
                    jnode.find("[class='field']").each(function(index){
                        if ($(this).find('div').length == 0)
                        {
                            // Convert dead links to hyperlinks
                            var txt = $(this).html();
                            txt = linkify(txt);
                            $(this).html(txt);
                        }
                    });
                }
                // COMMENTS
                else if (node.tagName == "UL")
                {
                    var jnode = $(node);
                    jnode.find(".comment-text").each(function(index){

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
                        var txt = $(this).html();
                        txt = linkify(txt);
                        $(this).html(txt);
                    });
                }
            }
        }
    }
};

var targetNode = document.getElementById('gridHeader');
var config = { childList: true, subtree: true };
var observer = new MutationObserver(callback);
observer.observe(targetNode, config);

// Fix style for links (prevents bolding and double underscore)
var styleTag = $('<style>.comment-text a { border-bottom: 0 !important; font-weight: inherit !important; }</style>')
$('html > head').append(styleTag);
