const fs = require("fs");
const path = require("path");

const read = (file) => fs.readFileSync(path.join(__dirname, file), "utf8");
const page = read("index.html");
const styles = read("styles.css") + "\n" + read("brand.css");
const client = read("script.js");
const files = { "/": page, "/index.html": page, "/styles.css": styles, "/brand.css": "", "/script.js": client };
const output = "const files = " + JSON.stringify(files) + ";\n" +
  "export default { async fetch(request) { const url = new URL(request.url); const body = files[url.pathname] || files['/']; const type = url.pathname.endsWith('.css') ? 'text/css; charset=utf-8' : url.pathname.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8'; return new Response(body, {headers:{'content-type':type,'cache-control':'public, max-age=3600'}}); } };";

fs.mkdirSync(path.join(__dirname, "dist", "server"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "dist", "server", "index.js"), output);
