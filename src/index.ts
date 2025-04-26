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
    if (window.dnsScriptHasRun) return;

    const data = await fetchDNSData(domain);
    console.log(data);

    // format data for the table
    const formattedData = data.a.flatMap((entry: any) => 
        entry.ips.map((ip: any) => ({
            host: entry.host,
            ip: ip.ip,
            asn: ip.asn,
            asn_name: ip.asn_name,
            open_services: Object.keys(ip.banners || {}).map(service => 
                `${service}${ip.banners[service]?.apps ? ` (${ip.banners[service].apps.join(", ")})` : ""}`
            ).join(", ") || "None",
            is_website: ip.banners ? !!(ip.banners["http"] || ip.banners["https"]) : false,
        }))
    );

    const uiID = Math.random().toString(36).substring(2, 15);
    const ui = `
<div id="dns-content">
    <h1>DNS Data for <span class="monospace">${domain}</span></h1>
    <table class="monospace">
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
                    <td>${entry.is_website ? `<a href="${entry.host}" target="_blank">${entry.host}</a>` : entry.host}</td>
                    <td>${entry.ip}</td>
                    <td>${entry.asn}</td>
                    <td>${entry.asn_name}</td>
                    <td>${entry.open_services}</td>
                </tr>
            `).join("")}
        </tbody>
    </table>
</div>
`
    const style = `
#dns-${uiID} {
    position: fixed;
    inset: 0;
    z-index: 999999;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-family: sans-serif;
    overflow-y: scroll;
}
#dns-${uiID} #dns-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
}
#dns-${uiID} .monospace {
    font-family: monospace;
}
#dns-${uiID} table {
    border-collapse: collapse;
}
`

    const styleTag = document.createElement("style");
    styleTag.innerHTML = style;
    document.head.appendChild(styleTag);

    const div = document.createElement("div");
    div.id = `dns-${uiID}`;
    div.innerHTML = ui;
    document.body.appendChild(div);

    // @ts-ignore
    window.dnsScriptHasRun = true;

})();