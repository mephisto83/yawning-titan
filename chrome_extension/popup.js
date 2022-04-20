// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor");
const state = {
    port: null
}
let componentNameInput = document.querySelector('.component-name');
let cssSelectorInput = document.querySelector('.css-selector');
function exec(name, className, pause, toplevel) {
    return yawningTitan({
        local: 'http://localhost:16552/',
        depth: parseInt(toplevel) ? parseInt(toplevel) : 0,
        pause: pause || false,
        name: name || 'Component',
        className: className || '.component'
    })
}

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function () {
        console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
        console.error('Async: Could not copy text: ', err);
    });
}

let itemButton = document.querySelector('.yawning-titan.scss');
let item = document.querySelector('.yawning-titan.scss-component');
itemButton.addEventListener('click', () => {
    copyTextToClipboard(item.value)
})
let waitSeconds = document.querySelector('.wait-5-seconds');
let reactButton = document.querySelector('.yawning-titan.react');
let react = document.querySelector('.yawning-titan.react-component');
let buttonRow = document.querySelector('.button-row');
let toplevelComponentOnly = document.querySelector('.top-level-only');
reactButton.addEventListener('click', () => {
    copyTextToClipboard(react.value)
})

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    chrome.runtime.sendMessage({ message: 'hello' });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: exec,
        args: [componentNameInput.value, cssSelectorInput.value, waitSeconds.checked, toplevelComponentOnly.value]
    }, (injectionResults) => {
        for (const frameResult of injectionResults) {
            console.log(frameResult.result);

            let res = frameResult.result;
            if (res) {
                react.value = res.react;
                item.value = res.css;
                if (buttonRow) {
                    buttonRow.classList.remove('hide');
                }

            }
        }
    });
});

// For long-lived connections:
chrome.runtime.onConnectExternal.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        // See other examples for sample onMessage handlers.
        console.log(msg);
    });
});
chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name);
    if (port.name === "yawning-popup") {
        port.onMessage.addListener(function (msg) {
            if (msg && msg.message) {
                switch (msg.message) {
                    case 'css':
                        state.css = msg.css;
                        break;
                    case 'output':
                        console.log('received output')
                        console.log(msg);
                        break;
                }
            }
        });
        port.onDisconnect.addListener(function () {
            state.port = null;
        })
        state.port = port;
    }
});