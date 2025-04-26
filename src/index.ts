import { DNSDUMPSTER_API_KEY } from "./secrets";

// there are a LOT of these, this list just has some of the most common
const SECOND_LEVEL_TLDS = [".co.uk", ".org.uk", ".ac.uk", ".gov.uk", ".me.uk", ".com.au", ".org.au", ".edu.au", ".gov.au", ".net.au", ".co.jp", ".or.jp", ".ac.jp", ".go.jp", ".co.nz", ".org.nz", ".govt.nz", ".school.nz", ".co.za", ".org.za", ".gov.za", ".com.br", ".org.br", ".edu.br", ".gov.br", ".co.in", ".org.in", ".gov.in", ".edu.in", ".com.cn", ".org.cn", ".edu.cn", ".gov.cn", ".com.ru", ".org.ru", ".edu.ru", ".gov.ru", ".com.fr", ".asso.fr", ".gouv.fr", ".co.it", ".org.it", ".edu.it", ".gov.it", ".com.mx", ".org.mx", ".edu.mx", ".gob.mx", ".com.ar", ".org.ar", ".edu.ar", ".gob.ar", ".com.co", ".org.co", ".edu.co", ".gov.co", ".com.ua", ".org.ua", ".edu.ua", ".gov.ua", ".co.kr", ".or.kr", ".ac.kr", ".go.kr", ".co.id", ".or.id", ".ac.id", ".go.id", ".co.th", ".or.th", ".ac.th", ".go.th", ".com.vn", ".org.vn", ".edu.vn", ".gov.vn", ".com.pk", ".org.pk", ".edu.pk", ".gov.pk", ".com.ph", ".org.ph", ".edu.ph", ".gov.ph", ".com.de", ".co.il", ".co.nl", ".com.sg", ".com.tr", ".com.tw", ".com.hk", ".com.es", ".com.pt", ".com.pl", ".eu.com", ".eu.org", ".me.uk", ".net.au", ".net.cn", ".net.nz", ".net.ru", ".co.bz", ".co.cc", ".co.tv", ".co.at", ".or.at", ".gv.at", ".ac.at", ".co.hu", ".co.ee", ".com.my", ".edu.my", ".gov.my", ".org.my", ".co.ke", ".or.ke", ".ac.ke", ".go.ke"];
let domain;
if (SECOND_LEVEL_TLDS.find((tld) => window.location.hostname.endsWith(tld))) {
    domain = window.location.hostname.split('.').slice(-3).join('.');
} else {
    domain = window.location.hostname.split('.').slice().join('.');
}

alert(domain);