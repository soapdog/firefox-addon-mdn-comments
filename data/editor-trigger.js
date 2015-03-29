
var oldInnerHTML = window.document.body.innerHTML;
var MINIMUM_LENGHT_FOR_TRIGGER_ATTACHMENT = 20;

console.log("inside content script");

function calculateAnchor(content) {
    return content.split(" ", 5).join("_").toLowerCase();
}

function getSelector(_context){
    var index, localName,pathSelector, that = _context, node;
    if(that =='null') throw 'not an  dom reference';
    index =  getIndex(that);

    while(that.tagName){
        pathSelector = that.localName+(pathSelector?'>'+pathSelector :'');
        that = that.parentNode;
    }
    pathSelector = pathSelector+':nth-of-type('+index+')';

    return pathSelector;
}

function getIndex(node){
    var i=1;
    var tagName = node.tagName;

    while(node.previousSibling){
        node = node.previousSibling;
        if(node.nodeType === 1 && (tagName.toLowerCase() == node.tagName.toLowerCase())){
            i++;
        }
    }
    return i;
}


self.port.on("attachEditorTriggers", function(selector) {
    var elements = document.querySelectorAll(selector);
    var element;
    for (var i = 0; i < elements.length; i++) {
        element = elements[i];
        if (element.innerHTML.length >= MINIMUM_LENGHT_FOR_TRIGGER_ATTACHMENT) {
            // only attach this for larger content.
            element.innerHTML = element.innerHTML + " <small class='comment-editor-trigger'>&#128172;</small>";
        }
    }
    // need to bind everyone.

    [].forEach.call(document.querySelectorAll(".comment-editor-trigger"), function(item){

        item.addEventListener("click", function(event){
            console.log("Clicked a trigger!");

            var anchor = calculateAnchor(item.parentNode.textContent);
            var selector = getSelector(event.target);

            self.port.emit("openEditor", {anchor: anchor, selector: selector});
        });

    });

    self.port.emit("editorTriggersAttached");

});

self.port.on("changeContent", function(data) {
    console.log("[worker] Received changeContent", data);
    document.querySelector(data.selector).innerHTML = data.content;
    console.log("damn!");
});

self.port.on("detach", function() {
    window.document.body.innerHTML = oldInnerHTML;
});