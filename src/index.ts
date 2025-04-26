import { DNSDUMPSTER_API_KEY } from "./secrets";

async function fetchDNSData(domain: string) {
    const res = await fetch(" https://test.cors.workers.dev/?https://api.dnsdumpster.com/domain/" + domain, {
        headers: {
            "X-API-Key": DNSDUMPSTER_API_KEY,
        }
    });

    if (res.status !== 200) {
        console.error("Error fetching DNS data: ", res.statusText);
        return;
    }

    return await res.json();
}

// there are a LOT of these, this list just has some of the most common
const SECOND_LEVEL_TLDS = [".co.uk", ".org.uk", ".ac.uk", ".gov.uk", ".me.uk", ".com.au", ".org.au", ".edu.au", ".gov.au", ".net.au", ".co.jp", ".or.jp", ".ac.jp", ".go.jp", ".co.nz", ".org.nz", ".govt.nz", ".school.nz", ".co.za", ".org.za", ".gov.za", ".com.br", ".org.br", ".edu.br", ".gov.br", ".co.in", ".org.in", ".gov.in", ".edu.in", ".com.cn", ".org.cn", ".edu.cn", ".gov.cn", ".com.ru", ".org.ru", ".edu.ru", ".gov.ru", ".com.fr", ".asso.fr", ".gouv.fr", ".co.it", ".org.it", ".edu.it", ".gov.it", ".com.mx", ".org.mx", ".edu.mx", ".gob.mx", ".com.ar", ".org.ar", ".edu.ar", ".gob.ar", ".com.co", ".org.co", ".edu.co", ".gov.co", ".com.ua", ".org.ua", ".edu.ua", ".gov.ua", ".co.kr", ".or.kr", ".ac.kr", ".go.kr", ".co.id", ".or.id", ".ac.id", ".go.id", ".co.th", ".or.th", ".ac.th", ".go.th", ".com.vn", ".org.vn", ".edu.vn", ".gov.vn", ".com.pk", ".org.pk", ".edu.pk", ".gov.pk", ".com.ph", ".org.ph", ".edu.ph", ".gov.ph", ".com.de", ".co.il", ".co.nl", ".com.sg", ".com.tr", ".com.tw", ".com.hk", ".com.es", ".com.pt", ".com.pl", ".eu.com", ".eu.org", ".me.uk", ".net.au", ".net.cn", ".net.nz", ".net.ru", ".co.bz", ".co.cc", ".co.tv", ".co.at", ".or.at", ".gv.at", ".ac.at", ".co.hu", ".co.ee", ".com.my", ".edu.my", ".gov.my", ".org.my", ".co.ke", ".or.ke", ".ac.ke", ".go.ke"];
let domain;
if (SECOND_LEVEL_TLDS.find((tld) => window.location.hostname.endsWith(tld))) {
    domain = window.location.hostname.split(".").slice(-3).join(".");
} else {
    domain = window.location.hostname.split(".").slice(-2).join(".");
}

(async () => {

    // @ts-ignore prevent the script from running twice
    if (window.dnsScriptHasRun) {
        const elem = document.querySelector("[dns-bookmarklet]") as HTMLDivElement | null;
        if (elem) {
            elem.style.display= "unset";
            return;
        }
    }

    const data = await fetchDNSData(domain);
    console.log(data);

    // format data for the table
    const formattedData = data.a.flatMap((entry: any) => 
        entry.ips.map((ip: any) => {
            const openServices = Object.keys(ip.banners || {});

            return {
                host: entry.host,
                ip: ip.ip,
                asn: ip.asn,
                asnName: ip.asn_name,
                openServices: openServices.map(service => 
                    `${service}${ip.banners[service]?.apps ? ` (${ip.banners[service].apps.join(", ")})` : ""}`
                ).join(", ")
                    .replace(/(https?)/g, "<span class='service-web'>$1</span>")
                    .replace(/(ssh)/g, "<span class='service-ssh'>$1</span>")
                    .replace(/(ip)/g, "<span class='service-ip'>$1</span>") ||
                    "<span class='service-none'>None</span>",
                isWebsite: openServices.includes("http") || openServices.includes("https"),
            };
        })
    );

    const colors = [ "#ff6188", "#fc9867", "#ffd866", "#a9dc76", "#78dce8", "#ab9df2"];
    const unusedColors = [...colors];
    const asnColorMap: Record<string, string> = {};
    formattedData.forEach((entry: any) => {
        if (!asnColorMap[entry.asn]) {
            if (unusedColors.length === 0) unusedColors.push(...colors);

            const colorIndex = Math.floor(Math.random() * unusedColors.length);
            asnColorMap[entry.asn] = unusedColors[colorIndex] as string;
            unusedColors.splice(colorIndex, 1);
        }
        entry.asnColor = asnColorMap[entry.asn];
    });

    const uiID = Math.random().toString(36).substring(2, 15);
    const ui = `
<div id="dns-content">
    <div class="dns-header">
        <button id="dns-close" onclick="document.getElementById('dns-${uiID}').style.display='none'">
            <?xml version="1.0" encoding="UTF-8"?><svg width="1em" height="1em" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="white"><path d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>
        <h1>DNS Data for <a href="//${domain}">${domain}</a></h1>
    </div>
    <table>
        <thead>
            <tr>
                <th>Host</th>
                <th>IP</th>
                <th>ASN</th>
                <th>ASN Name</th>
                <th>Open Services</th>
            </tr>
        </thead>
        <tbody>
            ${formattedData.map((entry: any) => `
                <tr>
                    <td>${entry.isWebsite ? `<a href="//${entry.host}" target="_blank">${entry.host}</a>` : entry.host}</td>
                    <td>${entry.ip}</td>
                    <td>${entry.asn}</td>
                    <td class="asn"><span style="--asn-color: ${entry.asnColor}">${entry.asnName}</span></td>
                    <td>${entry.openServices}</td>
                </tr>
            `).join("")}
        </tbody>
    </table>
</div>
`
    const style = `
@font-face {
  font-family: 'Space Mono';
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url(https://cdn.jsdelivr.net/fontsource/fonts/space-mono@latest/latin-400-normal.woff2) format('woff2'), url(https://cdn.jsdelivr.net/fontsource/fonts/space-mono@latest/latin-400-normal.woff) format('woff');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
#dns-${uiID} {
    position: fixed;
    inset: 0;
    z-index: 999999;
    background: var(--background);
    color: white;
    font-family: "Space Mono", monospace;
    overflow-y: scroll;
    
    --background: #1c1e1f;
    --text: white;
    --text-muted: rgba(255,255,255,0.4);
    --table-text: white;
    --header-bg: #141414;
    --row-odd-bg: #17191a;
    --row-even-bg: #141414;
    --link: #78dce8;
    --padding-x: 1.4rem;
    --padding-y: 0.8rem;
}
#dns-${uiID} #dns-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding-top: 1.25rem;
    padding-bottom: 2.5rem;
}
#dns-${uiID} .dns-header {
    display: flex;
    align-items: center;
    padding: var(--padding-y) var(--padding-x);
}
#dns-${uiID} .dns-header h1 {
    flex-grow: 1;
    text-align: center;
}
#dns-${uiID} #dns-close {
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
    color: var(--text);
    font-size: 2.75rem;
    cursor: pointer;
    position: absolute;
    left: 4rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    opacity: 0.75;
}
#dns-${uiID} #dns-close:hover {
    background-color: rgba(255, 255, 255, 0.1);
    opacity: 1;
}

#dns-${uiID} table {
    border-collapse: collapse;
    width: 90%;
    margin: 1.25rem 0;
    color: var(--table-text);
}
#dns-${uiID} th, #dns-${uiID} td {
    padding: var(--padding-y) var(--padding-x);
    text-align: left;
}
#dns-${uiID} th {
    background: var(--header-bg);
    font-weight: bold;
}
#dns-${uiID} tr:nth-child(odd) {
    background: var(--row-odd-bg);
}
#dns-${uiID} tr:nth-child(even) {
    background: var(--row-even-bg);
}
#dns-${uiID} .asn {
    padding: calc(var(--padding-y) - 0.2rem) calc(var(--padding-x) - 0.35rem);
}
#dns-${uiID} .asn span {
    padding: 0.2rem 0.35rem;
    border-radius: 0.25rem;
    color: var(--asn-color);
    position: relative;
    display: inline-block;
}
#dns-${uiID} .asn span::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 0.25rem;
    background: var(--asn-color);
    opacity: 0.1;
}
#dns-${uiID} a {
    color: var(--link);
}
#dns-${uiID} .service-web {
    color: ${colors[2]};
}
#dns-${uiID} .service-ssh {
    color: ${colors[5]};
}
#dns-${uiID} .service-ip {
    color: ${colors[3]};
}
#dns-${uiID} .service-none {
    color: var(--text-muted);
}
`;

    const styleTag = document.createElement("style");
    styleTag.innerHTML = style;
    document.head.appendChild(styleTag);

    const div = document.createElement("div");
    div.id = `dns-${uiID}`;
    div.setAttribute("dns-bookmarklet", "true");
    div.innerHTML = ui;
    document.body.appendChild(div);

    // @ts-ignore
    window.dnsScriptHasRun = true;

})();