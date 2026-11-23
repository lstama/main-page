const { chromium } = require("playwright");
const http = require("http"); const fs = require("fs"); const path = require("path");
const ROOT = "/home/lstama/Repositories/lstama/fe-pattern"; const PORT = 8316;
const MIME = { ".html":"text/html",".js":"text/javascript",".css":"text/css" };
const server = http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split("?")[0]);if(p==="/")p="/index.html";const f=path.join(ROOT,p);if(!fs.existsSync(f)){res.writeHead(404);res.end("nf");return;}res.writeHead(200,{"Content-Type":MIME[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(res);});
(async()=>{await new Promise(r=>server.listen(PORT,r));
const b=await chromium.launch();const page=await b.newPage({viewport:{width:500,height:700}});
await page.goto("http://localhost:"+PORT+"/patterns/date-picker/index.html");
await page.locator("#date-trigger").click();await page.waitForTimeout(150);
const info = await page.evaluate(()=>{
  const cal=document.getElementById("date-calendar");
  const wrap=document.querySelector(".input-wrap");
  const cs=getComputedStyle(cal);
  return {
    calTop: cs.top, calLeft: cs.left, calPos: cs.position, calDisplay: cs.display,
    wrapPos: getComputedStyle(wrap).position,
    calOffsetParent: cal.offsetParent?cal.offsetParent.id+" pos="+getComputedStyle(cal.offsetParent).position:"null",
    calRectY: cal.getBoundingClientRect().y, wrapRectY: wrap.getBoundingClientRect().y, wrapRectH: wrap.getBoundingClientRect().height
  };
});
console.log(JSON.stringify(info,null,1));
await b.close();await new Promise(r=>server.close(r));
})().catch(e=>{console.error(e);process.exit(1);});
