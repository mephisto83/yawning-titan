const state = {
    cssResults: {},
    port: null
}
async function onRequest(har_entry) {
    if (har_entry && har_entry.response && har_entry.response.headers) {
        if (har_entry.response.headers.find(x => x.name === 'content-type' && x.value.indexOf('text/css') !== -1)) {
            let res = await fetch(har_entry.request.url);
            let css_text = await res.text();
            state.cssResults[har_entry.request.url] = css_text;
            if (state.port) {
                try {
                    state.port.postMessage({
                        css: state.cssResults
                    });
                } catch (e) { }
            }
            // chrome.runtime.sendMessage({ message: state, from: 'dev-tools' });
        }
    }
}
chrome.devtools.network.getHAR(async function (result) {
    var entries = result.entries;
    if (!entries.length) {
        console.log("Yawning Titan suggests that you reload the page to track" +
            " all the css request");
    }
    for (var i = 0; i < entries.length; ++i)
        await onRequest(entries[i]);

    chrome.devtools.network.onRequestFinished.addListener(onRequest);
});
chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name);
    if (port.name === "yawning-devtool") {
        state.port = port;
        port.onMessage.addListener(function (msg) {
            if (msg && msg.message) {
                switch (msg.message) {
                    case 'req-css':
                        if (state.cssResults) {
                            state.port.postMessage({
                                message: 'css',
                                css: state.cssResults
                            });
                        }
                        break;
                }
            }
        });
        port.onDisconnect.addListener(function () {
            state.port = null;
        })
        if (state.cssResults && state.port) {
            state.port.postMessage({
                message: 'css',
                css: state.cssResults
            });
        }
    }
});
// chrome.devtools.panels.create('Yawning Titan', null, 'sidebar.html');