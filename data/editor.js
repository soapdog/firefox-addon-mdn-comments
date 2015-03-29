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

document.querySelector("#save_comment").addEventListener("click", function(event){

    addNewComment();
});

self.port.on("displayComments", function(comments) {
    var el = document.querySelector("#comments");
    el.innerHTML = "";
    comments.forEach(function(comment) {
        el.innerHTML = el.innerHTML + "<p>" + comment.comment + "</p><hr>";
    });
});

self.port.on("loading", function() {
    var el = document.querySelector("#comments");
    el.innerHTML = "<h2>Loading...</h2>";
});

refreshCurrentComments();

