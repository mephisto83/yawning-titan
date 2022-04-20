"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// await yawningTitan({ local: 'http://localhost:16552/', name: 'EpisodesHeader', className: '.episodes-header' })
function packCss(str) {
    if (packed_css_strings.indexOf(str) === -1)
        packed_css_strings.push(str);
}
function packUrls(str) {
    packed_urls.push(str);
}
const packed_urls = [];
const packed_css_strings = [];
function yawningTitan(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let { local, name = 'Component', className = '.class-name', selector = '.thisone', depth = 5, pause } = args;
        console.log('Yawning in all the stuff!!');
        console.log(args);
        if (pause) {
            console.log('pausing for 5 seconds.');
            yield (new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true);
                }, 5000);
            }));
        }
        let el = document.querySelector(selector);
        if (el) {
            let sheets = yield loadStyleSheets(local);
            sheets.push(...packed_css_strings);
            let cssRules = [];
            for (let i = 0; i < sheets.length; i++) {
                cssRules.push(rulesForCssText(sheets[i]));
            }
            console.log(cssRules);
            let rules = deepYawn(el, cssRules, depth);
            let unique_rules = [];
            rules.forEach((item) => {
                if (unique_rules.indexOf(item) === -1) {
                    unique_rules.push(item);
                }
            });
            let outerHtml = el.outerHTML || '';
            if (depth === 0) {
                outerHtml = el.outerHTML.replaceAll(el.innerHTML, '{props.children}');
            }
            [{ from: 'class=', to: 'className=' },
                { from: 'tabindex=', to: 'tabIndex=' },
                { from: 'fill-rule=', to: 'fillRule=' },
                { from: 'clip-rule=', to: 'clipRule=' },
                { from: 'for=', to: 'htmlFor=' },
                { from: '><', to: `>\n<` },
                { from: '="0"', to: '={0}' }].forEach((item) => {
                outerHtml = (outerHtml).replaceAll(item.from, item.to);
            });
            outerHtml = fixImgTags(outerHtml);
            outerHtml = fixStyle(outerHtml);
            let output = {
                css: `${className}{
                ${unique_rules.join('\n')}
            }`,
                fileName: `${name}`,
                react: `
            import './${name}.scss';
            export default function ${name}(props: any) { 
                return (
                    ${outerHtml}
                );
            }`
            };
            if (local) {
                yield storeLocal(local, {
                    data: JSON.stringify(output)
                });
            }
            return output;
        }
        else {
            console.log('no element found');
        }
    });
}
function deepYawn(el, cssRules, depth) {
    let rules = [];
    let elementCss = putTogetherCssRules(cssRules, el);
    rules.push(...elementCss);
    if (el.children) {
        if (depth) {
            for (let i = 0; i < el.children.length; i++) {
                let child = el.children[i];
                rules.push(...deepYawn(child, cssRules, depth - 1));
            }
        }
    }
    return rules;
}
function fetchCss(url, cssUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetchPost(url, { url: cssUrl });
    });
}
function storeLocal(url, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield fetch(`${url}component`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        return response.json();
    });
}
function fetchPost(url, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        return response.json();
    });
}
function isRuleApplied(element, selector) {
    if (selector.indexOf('dljDpR') !== -1)
        console.log(selector);
    if (typeof element.matches == 'function')
        return element.matches(selector);
    if (typeof element.matchesSelector == 'function')
        return element.matchesSelector(selector);
    var matches = (element.document || element.ownerDocument).querySelectorAll(selector);
    var i = 0;
    while (matches[i] && matches[i] !== element)
        i++;
    return matches[i] ? true : false;
}
function loadLinks(local) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = [];
        let links = document.querySelectorAll('link[rel="stylesheet"]');
        console.log(`links found: ` + links.length);
        for (let i = 0; i < links.length; i++) {
            let href = links[i].getAttribute('href') || '';
            if (href) {
                try {
                    if (local) {
                        let { data } = yield fetchCss(local, href);
                        result.push(data);
                    }
                }
                catch (e) {
                    console.warn('didnt get ' + href);
                }
            }
        }
        for (let i = 0; i < packed_urls.length; i++) {
            if (local) {
                let { data } = yield fetchCss(local, packed_urls[i]);
                result.push(data);
            }
        }
        return result;
    });
}
function loadSheets(local) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = [];
        let stylesheets = document.querySelectorAll('style');
        console.log(`stylesheets found: ` + stylesheets.length);
        for (let i = 0; i < stylesheets.length; i++) {
            let href = stylesheets[i].getAttribute('href') || '';
            if (href) {
                try {
                    if (local) {
                        let { data } = yield fetchCss(local, href);
                        result.push(data);
                    }
                }
                catch (e) {
                    console.warn('didnt get ' + href);
                }
            }
            if (stylesheets[i].innerHTML) {
                result.push(stylesheets[i].innerHTML);
            }
        }
        return result;
    });
}
function loadStyleSheets(local) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = [];
        let stylesheets = yield loadSheets(local);
        result.push(...stylesheets);
        let links = yield loadLinks(local);
        result.push(...links);
        console.log(`stylesheets found: ` + result.length);
        let styled = document.querySelectorAll('style');
        console.log(styled);
        console.log(styled.length);
        for (let i = 0; i < styled.length; i++) {
            if (styled[i].sheet && styled[i].sheet.cssRules) {
                let rules = styled[i].sheet.cssRules;
                console.log('got styled');
                console.log(rules);
                if (rules) {
                    for (let j = 0; j < rules.length; j++) {
                        console.log(rules[j].cssText);
                        result.push(rules[j].cssText);
                    }
                }
            }
        }
        return result;
    });
}
function rulesForCssText(styleContent) {
    var _a;
    var doc = document.implementation.createHTMLDocument(""), styleElement = document.createElement("style");
    styleElement.textContent = styleContent;
    // the style will only be parsed once it is added to a document
    doc.body.appendChild(styleElement);
    return (_a = styleElement === null || styleElement === void 0 ? void 0 : styleElement.sheet) === null || _a === void 0 ? void 0 : _a.cssRules;
}
;
function putTogetherCssRules(cssRules, el) {
    let result = [];
    for (let i = 0; i < cssRules.length; i++) {
        for (let j = 0; j < cssRules[i].length; j++) {
            let rule = cssRules[i][j];
            if (rule && rule.selectorText && rule.cssText) {
                if (isRuleApplied(el, rule.selectorText)) {
                    let splitSelector = rule.selectorText.split(',');
                    let selectableRule = splitSelector.filter((x) => {
                        return isRuleApplied(el, `${x}`.trim());
                    }).join(',');
                    rule.cssText.replace(rule.selectorText, selectableRule);
                    result.push(rule.cssText.replace(rule.selectorText, selectableRule || rule.selectorText));
                }
            }
            else {
            }
        }
    }
    return result;
}
window.yawningTitan = yawningTitan;
((function () {
    var yawningPopup = window.chrome.runtime.connect({ name: "yawning-popup" });
    yawningPopup.postMessage({ joke: "Knock knock" });
    yawningPopup.onMessage.addListener(function (msg) {
        console.log('popup sending message ');
        if (msg && msg.message) {
            switch (msg.message) {
                case 'req-css':
                    yawningDevtool.postMessage(msg);
                    break;
            }
        }
    });
    window.yawningPopup = yawningPopup;
    var yawningDevtool = window.chrome.runtime.connect({ name: "yawning-devtool" });
    yawningDevtool.postMessage({ joke: "Knock knock" });
    yawningDevtool.onMessage.addListener(function (msg) {
        console.log('dev tool sending message ');
        if (msg && msg.message) {
            switch (msg.message) {
                case 'css':
                    yawningPopup.postMessage(msg);
                    console.log(msg);
                    if (msg && msg.css) {
                        for (let i in msg.css) {
                            packCss(msg.css[i]);
                        }
                    }
                    break;
            }
        }
    });
}))();
console.log('Yawning Titan injected!');
function fixImgTags(outerHtml) {
    const regex = /\<img[(a-zA-Z )=":\/\-\_.0-9?&;\']*\>/gm;
    // Alternative syntax using RegExp constructor
    // const regex = new RegExp('\\<img[(a-zA-Z )=":\\/\\-\\.0-9?&;]*>', 'gm')
    const str = outerHtml;
    let m;
    let matches = [];
    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            console.log(`Found match, group ${groupIndex}: ${match}`);
            matches.unshift(match);
        });
    }
    matches.forEach((m) => {
        if (outerHtml.indexOf(m) !== -1) {
            let index = outerHtml.indexOf(m);
            outerHtml = outerHtml.split('');
            outerHtml.splice(index + m.length - 1, 0, '/');
            outerHtml = outerHtml.join('');
        }
    });
    return outerHtml;
}
function fixStyle(outerHtml) {
    const regex = /style\=\"[(a-zA-Z )#=":\/\-\.0-9?_&;\\(\),%\']*\"/gm;
    // Alternative syntax using RegExp constructor
    // const regex = new RegExp('\\<img[(a-zA-Z )=":\\/\\-\\.0-9?&;]*>', 'gm')
    const str = outerHtml;
    let m;
    let matches = [];
    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            console.log(`Found match, group ${groupIndex}: ${match}`);
            matches.unshift(match);
        });
    }
    matches.forEach((m) => {
        if (outerHtml.indexOf(m) !== -1) {
            let index = outerHtml.indexOf(m);
            outerHtml = outerHtml.split('');
            let obj = convertStyleToObj(m);
            let style_text = `style={${JSON.stringify(obj)}}`;
            outerHtml.splice(index, m.length, style_text);
            outerHtml = outerHtml.join('');
        }
    });
    return outerHtml;
}
function convertStyleToObj(m) {
    m = m.split('=')[1];
    m = m.replace(/['"]+/g, '');
    let styles = m.split(';');
    let object = {};
    styles.map((s) => {
        let parts = s.split(':');
        let name = parts[0].trim();
        let value = `${parts[1]}`.trim();
        let temp_name = name.split('-');
        temp_name = temp_name.map((a, i) => {
            if (i) {
                return `${a[0].toUpperCase()}${a.substring(1)}`;
            }
            return a;
        });
        if (temp_name.join('')) {
            object[temp_name.join('')] = value;
        }
    });
    delete object[""];
    return object;
}
//# sourceMappingURL=index.js.map