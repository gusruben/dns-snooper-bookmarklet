# DNS Snooper Bookmarklet

This is a little bookmarklet for inspecting the subdomains of the current website. It's powered by [DNS Dumpster](https://dnsdumpster.com/).

## 🔧 Installation

**Prerequisites:** To use the bookmarklet, you'll need a free API key from <dnsdumpster.com>. You'll also need a modern version of [Bun](http://bun.sh/).

1. Grab one from [/my-account](https://dnsdumpster.com/my-account/).
2. Clone the repo with `git clone https://github.com/gusruben/dns-snooper-bookmarklet`.
3. Install dependencies with `bun install`.
4. Add your API key to `src/secrets.ts`.
5. Build the bookmarklet with `bun build`.
6. By default, the bookmarklet will be built in `dist/bookmarklet.txt`. Create a new bookmark in your browser and paste the contents of `bookmarklet.txt` into the URL. Done!

## Screenshots



> This project was made for [Hacklet](http://hacklet.hackclub.com/).