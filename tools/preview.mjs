// Local-only preview matching Cloudflare Pages' extensionless HTML routes.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.ET_PREVIEW_PORT||4178);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
  try {
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file=path.resolve(root,'.'+pathname);
    if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);return res.end();}
    if(path.relative(root,file).split(path.sep).some(part=>part.startsWith('.'))){res.writeHead(404);return res.end();}
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory()) {
      if(!pathname.endsWith('/')){res.writeHead(302,{Location:pathname+'/'});return res.end();}
      file=path.join(file,'index.html');
    } else if(!path.extname(file)) file+='.html';
    if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end('Not found');}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    if(req.method==='HEAD')return res.end();
    fs.createReadStream(file).pipe(res);
  }catch{res.writeHead(400);res.end('Bad request');}
}).listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}/universities/`));
