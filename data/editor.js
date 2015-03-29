var data = {url: self.options.url, anchor: self.options.anchor};
var SERVER_URL = "https://cryptic-garden-2517.herokuapp.com/comments"

console.log("loading editor.js");


function refreshCurrentComments() {
    console.log("emit getComments");
    self.port.emit("getComments", data);
    console.log("emit'd");
}

function addNewComment() {
    var content = document.querySelector("#new_comment").value;

    self.port.emit("addComment", {comment: content});

}

function bindAlternateTriggers() {
    [].forEach.call(document.querySelectorAll(".activate-alternate"), function(item){

        item.addEventListener("click", function(event){

            var alternateContent = this.getAttribute("data-content");
            var selector = self.options.selector.replace(">small:nth-of-type(1)","");

            console.log("Clicked an alternate trigger! content: ", alternateContent);
            console.log("selector:", self.options.selector);



            self.port.emit("changeContent", {selector: selector, content: alternateContent});

            console.log("damn!");
        });

    });
}

document.querySelector("#save_comment").addEventListener("click", function(event){

    addNewComment();
});

self.port.on("displayComments", function(comments) {
    var el = document.querySelector("#comments");
    var alternateIndex = 0;
    el.innerHTML = "";
    comments.forEach(function(comment) {
        var commentWithLinks = comment.comment.replace(/#(\d+)/, "<a target='_blank' href='https://bugzilla.mozilla.org/show_bug.cgi?id=$1'>#$1</a>");
        commentWithLinks = commentWithLinks.replace(/<alternate[^>]*>(.*?)<\/alternate>/, "**Alternate:** <div class='alternate'>$1</div><br><button class='activate-alternate' data-content='$1'>Activate</button>");

        console.log(commentWithLinks);
        el.innerHTML = el.innerHTML + "<div class='comment-entry'>" +marked(commentWithLinks) +"</div>";
    });
    bindAlternateTriggers();
});

self.port.on("loading", function() {
    var el = document.querySelector("#comments");
    el.innerHTML = "<h2>Loading...</h2>";
});

console.log("loading marked and hljs...");
marked.setOptions({
    highlight: function (code) {
        return hljs.highlightAuto(code).value;
    }
});

console.log("engines loaded, refreshing comments...");
refreshCurrentComments();

