// await yawningTitan({local: 'http://localhost:16552/', name: 'EpisodesHeader', '.episodes-header'})
function packCss(str: string) {
    packed_css_strings.push(str);
}
function packUrls(str: string) {
    packed_urls.push(str);
}
const packed_urls: string[] = [];
const packed_css_strings: string[] = [];
packUrls('https://codex.nflxext.com/^3.0.0/truthBundle/webui/1.22.5-shakti-css-va968cffa/css/css/less|pages|akiraClient.less/1/a0rou4tskn5eq/none/true/none');
packUrls('https://codex.nflxext.com/^3.0.0/truthBundle/webui/1.22.5-shakti-css-va968cffa/css/css/less|core|error-page.less/1/a0rou4tskn5eq/none/true/none');
async function yawningTitan(args: { className: string, name: string, local: string, selector: string, depth: number }) {
    let {
        local,
        name = 'Component',
        className = '.class-name',
        selector = '.thisone',
        depth = 5
    } = args;
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
        { from: '><', to: `>\n<` },
        { from: '="0"', to: '={0}' }].forEach((item) => {
            outerHtml = (outerHtml).replaceAll(item.from, item.to)
        })
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

        await storeLocal(local, {
            data: JSON.stringify(output)
        });

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
                let { data } = await fetchCss(local, href);
                result.push(data);
            } catch (e) {
                console.warn('didnt get ' + href);
            }
        }
    }
    for (let i = 0; i < packed_urls.length; i++) {
        let { data } = await fetchCss(local, packed_urls[i]);
        result.push(data);
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
                let { data } = await fetchCss(local, href);
                result.push(data);
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
    console.log('putTogetherCssRules')
    for (let i = 0; i < cssRules.length; i++) {
        for (let j = 0; j < cssRules[i].length; j++) {
            let rule = cssRules[i][j];
            if (rule && rule.selectorText && rule.cssText) {
                console.log(rule.selectorText);
                if (isRuleApplied(el, rule.selectorText)) {
                    let splitSelector = rule.selectorText.split(',');
                    let selectableRule = splitSelector.filter((x: string) => {
                        return isRuleApplied(el, `${x}`.trim())
                    }).join(',')
                    console.log(selectableRule);
                    rule.cssText.replace(rule.selectorText, selectableRule)
                    result.push(rule.cssText.replace(rule.selectorText, selectableRule || rule.selectorText));
                }
            }
            else {
                console.log('missing something')
            }
        }
    }
    return result;
}
