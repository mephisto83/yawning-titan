
const tab_log = function (json_args) {
    var args = JSON.parse(unescape(json_args));
    console[args[0]].apply(console, Array.prototype.slice.call(args, 1));
}

// chrome.extension.onRequest.addListener(function (request) {
//     if (request.command !== 'sendToConsole')
//         return;
//     chrome.tabs.executeScript(request.tabId, {
//         code: "(" + tab_log + ")('" + request.args + "');",
//     });
// });
console.log(chrome);
if (chrome.action) {
    // // listen for our browerAction to be clicked
    // chrome.action.onClicked.addListener(function (tab) {
    //     // for the current tab, inject the "index.js" file & execute it
    //     console.log('chrome.browserAction.onClicked')
    //     doInCurrentTab((tab) => {
    //         console.log(tab);
    //         chrome.scripting.executeScript(
    //             {
    //                 target: { tabId: tab.id },
    //                 files: ['index.js'],
    //             },
    //             () => { });

    //     })
    // });
}
console.log(chrome.scripting.executeScript);
// const tabId = getTabId();
function doInCurrentTab(tabCallback) {
    chrome.tabs.query(
        { currentWindow: true, active: true },
        function (tabArray) { tabCallback(tabArray[0]); }
    );
}