var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var panel = require("sdk/panel");
var Request = require("sdk/request").Request;

var SERVER_URL = "https://cryptic-garden-2517.herokuapp.com/comments";
var anchor, url;

var button = buttons.ActionButton({
    id: "mozilla-link",
    label: "Visit Mozilla",
    icon: {
        "16": "./icon-16.png",
        "32": "./icon-32.png",
        "64": "./icon-64.png"
    },
    onClick: bindEditorTriggers
});



function addComment(thePort, content) {
    console.log("commenting...");
    thePort.emit("loading");
    Request({
        url: SERVER_URL,
        contentType: "application/json",
        content: JSON.stringify({
            anchor: anchor,
            url: tabs.activeTab.url,
            comment: content
        }),
        onComplete: function (response) {

            console.log("json", response.json);

            refreshComments(thePort);

        }
    }).post();
}

function refreshComments(thePort) {
    console.log("refreshing...");
    thePort.emit("loading");
    Request({
        url: SERVER_URL,
        content: {
            anchor: anchor,
            url: tabs.activeTab.url
        },
        onComplete: function (response) {

            console.log("json", response.json);

            thePort.emit("displayComments", response.json);

        }
    }).get();
}

function bindEditorTriggers(state) {
    console.log("handle click")
    var worker = tabs.activeTab.attach({
        contentScriptFile: "./editor-trigger.js"

    });

    worker.port.emit("attachEditorTriggers", "article#wikiArticle>p");
    worker.port.emit("attachEditorTriggers", "article#wikiArticle li");


    worker.port.on("editorTriggersAttached", function() {
        console.log("triggers attached");
    });

    worker.port.on("openEditor", function(newAnchor) {
        console.log("anchor", newAnchor);
        anchor = newAnchor;

        var commentEditorDialogPanel = panel.Panel({
            width: 600,
            height: 400,
            contentURL: "./editor.html",
            contentScriptFile: ["./highlight.min.js","./marked.min.js","./editor.js"],
            contentScriptOptions: {
                anchor: anchor,
                url: tabs.activeTab.url
            }
        });

        commentEditorDialogPanel.port.on("getComments", function(data) {
            console.log("Received get comments call on panel", data);
            refreshComments(commentEditorDialogPanel.port);
        });

        commentEditorDialogPanel.port.on("addComment", function(data) {
            console.log("Received add comments call from panel", data);
            addComment(commentEditorDialogPanel.port, data.comment);
        });

        commentEditorDialogPanel.show();
    });


    console.log("end")
}

tabs.on("ready", logURL);

function logURL(tab) {
    console.log("loaded", tab.url);
    if (tab.url.indexOf("https://developer.mozilla.org/") !== -1) {
        bindEditorTriggers();
    }
}