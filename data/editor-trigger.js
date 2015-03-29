
var oldInnerHTML = window.document.body.innerHTML;
var MINIMUM_LENGHT_FOR_TRIGGER_ATTACHMENT = 20;

console.log("inside content script");

function calculateAnchor(content) {
    return content.split(" ", 5).join("_").toLowerCase();
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

            self.port.emit("openEditor", anchor);
        });

    });

    self.port.emit("editorTriggersAttached");

});

self.port.on("detach", function() {
    window.document.body.innerHTML = oldInnerHTML;
});