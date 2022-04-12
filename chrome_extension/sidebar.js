const state = {
    cssResults: {}
}
async function onRequest(har_entry) {
    if (har_entry && har_entry.response && har_entry.response.headers) {
        if (har_entry.response.headers.find(x => x.name === 'content-type' && x.value === 'text/css')) {
            let element = document.querySelector('#css_list');
            if (element) {
                element.innerHTML = `${JSON.stringify(har_entry, null, 4)}`;
                let res = await fetch(har_entry.request.url);
                let css_text = await res.text();
                state.cssResults[har_entry.request.url] = css_text;
            }
        }
    }
}
chrome.devtools.network.getHAR(async function (result) {
    var entries = result.entries;
    if (!entries.length) {
        console.warn("ChromeFirePHP suggests that you reload the page to track" +
            " FirePHP messages for all the requests");
    }
    for (var i = 0; i < entries.length; ++i)
        await onRequest(entries[i]);

    chrome.devtools.network.onRequestFinished.addListener(onRequest);
});
