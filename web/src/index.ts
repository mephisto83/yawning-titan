
// await yawningTitan({ local: 'http://localhost:16552/', name: 'EpisodesHeader', className: '.episodes-header' })
function packCss(str: string) {
    if (packed_css_strings.indexOf(str) === -1)
        packed_css_strings.push(str);
}
function packUrls(str: string) {
    packed_urls.push(str);
}
const packed_urls: string[] = [];
const packed_css_strings: string[] = [];
async function yawningTitan(args: {
    pause: boolean, className: string, name: string, local: string, selector: string, depth: number
}) {
    let {
        local,
        name = 'Component',
        className = '.class-name',
        selector = '.thisone',
        depth = 5,
        pause
    } = args;
    console.log('Yawning in all the stuff!!')
    console.log(args)
    if (pause) {
        console.log('pausing for 5 seconds.')
        await (new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 5000)
        }))
    }
    let el = document.querySelector(selector);
    if (el) {
        let sheets = await loadStyleSheets(local);
        sheets.push(...packed_css_strings);
        let cssRules: any[] = [];
        for (let i = 0; i < sheets.length; i++) {
            cssRules.push(rulesForCssText(sheets[i]))
        }
        console.log(cssRules);
        let rules = deepYawn(el, cssRules, depth)
        let unique_rules: string[] = [];
        rules.forEach((item: string) => {
            if (unique_rules.indexOf(item) === -1) {
                unique_rules.push(item);
            }
        });
        let outerHtml: any = el.outerHTML || '';
        if (depth === 0) {
            outerHtml = (el.outerHTML as any).replaceAll(el.innerHTML, '{props.children}');
        }
        [{ from: 'class=', to: 'className=' },
        { from: 'tabindex=', to: 'tabIndex=' },
        { from: 'fill-rule=', to: 'fillRule=' },
        { from: 'clip-rule=', to: 'clipRule=' },
        { from: 'for=', to: 'htmlFor=' },
        { from: '><', to: `>\n<` },
        { from: '="0"', to: '={0}' }].forEach((item) => {
            outerHtml = (outerHtml).replaceAll(item.from, item.to)
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
        }
        if (local) {
            await storeLocal(local, {
                data: JSON.stringify(output)
            });
        }


        return output;
    }
    else {
        console.log('no element found');
    }
}

function deepYawn(el: any, cssRules: any, depth: number) {
    let rules: string[] = [];
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
async function fetchCss(url: string, cssUrl: string): Promise<{ ok: boolean, data: string }> {
    return fetchPost(url, { url: cssUrl });
}
async function storeLocal(url: string, data: { data: string }) {
    let response = await fetch(`${url}component`, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json();
}
async function fetchPost(url: string, data: { url: string }) {
    let response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json();
}
function isRuleApplied(element: any, selector: string) {
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
async function loadLinks(local: string) {
    let result: string[] = [];
    let links = document.querySelectorAll('link[rel="stylesheet"]');
    console.log(`links found: ` + links.length);
    for (let i = 0; i < links.length; i++) {
        let href = links[i].getAttribute('href') || '';
        if (href) {
            try {
                if (local) {
                    let { data } = await fetchCss(local, href);
                    result.push(data);
                }
            } catch (e) {
                console.warn('didnt get ' + href);
            }
        }
    }
    for (let i = 0; i < packed_urls.length; i++) {
        if (local) {
            let { data } = await fetchCss(local, packed_urls[i]);
            result.push(data);
        }
    }
    return result;
}
async function loadSheets(local: string) {
    let result: string[] = [];
    let stylesheets = document.querySelectorAll('style');
    console.log(`stylesheets found: ` + stylesheets.length);
    for (let i = 0; i < stylesheets.length; i++) {
        let href = stylesheets[i].getAttribute('href') || '';
        if (href) {
            try {
                if (local) {
                    let { data } = await fetchCss(local, href);
                    result.push(data);
                }
            } catch (e) {
                console.warn('didnt get ' + href);
            }
        }
        if (stylesheets[i].innerHTML) {
            result.push(stylesheets[i].innerHTML)
        }
    }
    return result;
}
async function loadStyleSheets(local: string): Promise<string[]> {
    let result: string[] = [];
    let stylesheets = await loadSheets(local);
    result.push(...stylesheets);
    let links = await loadLinks(local);
    result.push(...links);

    console.log(`stylesheets found: ` + result.length);
    let styled = document.querySelectorAll('style[data-styled]');
    console.log(styled);
    console.log(styled.length);
    for (let i = 0; i < styled.length; i++) {
        if ((styled[i] as any).sheet && (styled[i] as any).sheet.cssRules) {
            let rules = (styled[i] as any).sheet.cssRules
            console.log('got styled');
            console.log(rules)
            if (rules) {
                for (let j = 0; j < rules.length; j++) {
                    console.log(rules[j].cssText)
                    result.push(rules[j].cssText);
                }
            }
        }
    }
    return result;
}
function rulesForCssText(styleContent: any) {
    var doc = document.implementation.createHTMLDocument(""),
        styleElement = document.createElement("style");

    styleElement.textContent = styleContent;
    // the style will only be parsed once it is added to a document
    doc.body.appendChild(styleElement);

    return styleElement?.sheet?.cssRules;
};

function putTogetherCssRules(cssRules: any[], el: Element) {
    let result: string[] = [];
    for (let i = 0; i < cssRules.length; i++) {
        for (let j = 0; j < cssRules[i].length; j++) {
            let rule = cssRules[i][j];
            if (rule && rule.selectorText && rule.cssText) {
                if (isRuleApplied(el, rule.selectorText)) {
                    let splitSelector = rule.selectorText.split(',');
                    let selectableRule = splitSelector.filter((x: string) => {
                        return isRuleApplied(el, `${x}`.trim())
                    }).join(',')

                    rule.cssText.replace(rule.selectorText, selectableRule)
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
    var yawningPopup = (window as any).chrome.runtime.connect({ name: "yawning-popup" });
    yawningPopup.postMessage({ joke: "Knock knock" });
    yawningPopup.onMessage.addListener(function (msg: any) {
        console.log('popup sending message ')
        if (msg && msg.message) {
            switch (msg.message) {
                case 'req-css':
                    yawningDevtool.postMessage(msg);
                    break;
            }
        }
    });
    (window as any).yawningPopup = yawningPopup;
    var yawningDevtool = (window as any).chrome.runtime.connect({ name: "yawning-devtool" });
    yawningDevtool.postMessage({ joke: "Knock knock" });
    yawningDevtool.onMessage.addListener(function (msg: any) {
        console.log('dev tool sending message ')
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
console.log('Yawning Titan injected!')

function fixImgTags(outerHtml: any): any {
    const regex = /\<img[(a-zA-Z )=":\/\-\_.0-9?&;\']*\>/gm;

    // Alternative syntax using RegExp constructor
    // const regex = new RegExp('\\<img[(a-zA-Z )=":\\/\\-\\.0-9?&;]*>', 'gm')

    const str = outerHtml;
    let m;
    let matches: string[] = [];

    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            console.log(`Found match, group ${groupIndex}: ${match}`);
            matches.unshift(match)
        });
    }
    matches.forEach((m: string) => {
        if (outerHtml.indexOf(m) !== -1) {
            let index = outerHtml.indexOf(m)
            outerHtml = outerHtml.split('')
            outerHtml.splice(index + m.length - 1, 0, '/')
            outerHtml = outerHtml.join('');
        }
    })
    return outerHtml;
}

function fixStyle(outerHtml: any): any {
    const regex = /style\=\"[(a-zA-Z )=":\/\-\.0-9?&;\\(\),%\']*\"/gm;

    // Alternative syntax using RegExp constructor
    // const regex = new RegExp('\\<img[(a-zA-Z )=":\\/\\-\\.0-9?&;]*>', 'gm')

    const str = outerHtml;
    let m;
    let matches: string[] = [];

    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            console.log(`Found match, group ${groupIndex}: ${match}`);
            matches.unshift(match)
        });
    }
    matches.forEach((m: string) => {
        if (outerHtml.indexOf(m) !== -1) {
            let index = outerHtml.indexOf(m)
            outerHtml = outerHtml.split('')
            let obj = convertStyleToObj(m);
            let style_text = `style={${JSON.stringify(obj)}}`;
            outerHtml.splice(index, m.length, style_text);
            outerHtml = outerHtml.join('');
        }
    })
    return outerHtml;
}
function convertStyleToObj(m: string) {
    m = m.split('=')[1];
    m = m.replace(/['"]+/g, '')
    let styles = m.split(';');
    let object: any = {};
    styles.map((s: string) => {
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
    delete object[""]
    return object;
}