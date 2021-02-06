// https://stackoverflow.com/a/8943487
let URL_REGEX =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
function linkify(text) {
    return text.replace(URL_REGEX, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
}

var targetNode = document.getElementById('gridHeader');

var config = { childList: true, subtree: true };

var callback = function(mutationsList, observer) {
    for(var mutation of mutationsList) {
        if (mutation.type == 'childList') {
            for (var node of mutation.addedNodes)
            {
                if (node.className == "item-field-table")
                {
                    var jnode = $(node);
                    jnode.find("[class='field']").each(function(index){
                        if ($(this).find('div').length == 0)
                        {
                            var txt = $(this).html();
                            txt = linkify(txt);
                            $(this).html(txt);
                        }
                    });
                }
                else if (node.tagName == "UL")
                {
                    var jnode = $(node);
                    jnode.find(".comment-text").each(function(index){
                        var txt = $(this).html();
                        txt = linkify(txt);
                        $(this).html(txt);
                    });
                }
            }
        }
    }
};

var observer = new MutationObserver(callback);
observer.observe(targetNode, config);
