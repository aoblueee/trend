const fs=require('fs'),vm=require('vm'),assert=require('assert');
function boot(path,content){
 const h=content??fs.readFileSync(path,'utf8'),m=h.match(/<script>([\s\S]*)<\/script>/);assert(m,path+' script');new vm.Script(m[1]);
 const elements={};
 const make=id=>({id,innerHTML:'',textContent:'',style:{display:'',setProperty(){}},classList:{add(){},remove(){},toggle(){}},querySelectorAll:()=>[]});
 const document={getElementById:id=>elements[id]??=(make(id)),querySelectorAll:()=>[]};
 const c={document,URL,encodeURIComponent};vm.createContext(c);vm.runInContext(m[1],c);
 return {h,c,elements,run:x=>vm.runInContext(x,c)};
}
const priorPath='weekly/2026-11-01-effective-index.html';
let prior=fs.existsSync(priorPath)?fs.readFileSync(priorPath,'utf8'):require('child_process').execFileSync('git',['show','HEAD:index.html'],{encoding:'utf8'});
const cur=boot('index.html'),old=boot(priorPath,prior),run=cur.run;
for(const obj of ['allData','shops','music','early','analysis','moves'])for(const m of ['jul','aug','sep','oct']){
 assert.equal(run(`JSON.stringify(${obj}.${m})`),old.run(`JSON.stringify(${obj}.${m})`),obj+'.'+m+' archive changed');
}
for(const m of ['jul','aug','sep','oct','nov']){
 run(`month='${m}';filter='All';shopFilter='All';musicMarket='japan';rf();rsf();render();rseries();draw();`);
 for(const id of ['tbody','mobile','catgrid','chart','analysiscard'])assert(cur.elements[id].innerHTML,id+' empty '+m);
 assert(!run('data().some(isMusicTrend)'),m+' music in overall');
 for(const id of ['tbody','catgrid','earlygrid','movesgrid'])assert(!/M!LK|Vaundy|EBiDAN|Mrs\. GREEN APPLE|LISA|Tate McRae/.test(cur.elements[id].innerHTML),id+' music leaked '+m);
}
run("month='nov';filter='All';shopFilter='All';musicMarket='global';rf();rsf();render();");
assert.equal(run('data().length'),2);assert.equal(run('early.nov.length'),9);assert.equal(run('shops.nov.length'),4);assert.equal(run('scopeScanNov.length'),17);
assert.equal(run('music.nov.japan.length'),10);assert.equal(run('music.nov.global.length'),10);assert.equal(run('music.nov.early.length'),5);
assert.equal((cur.elements.musiclist.innerHTML.match(/class="song"/g)||[]).length,10);assert.equal((cur.elements.musicearly.innerHTML.match(/class="song"/g)||[]).length,5);
assert.equal((cur.elements.musiclist.innerHTML.match(/open\.spotify\.com/g)||[]).length,10);assert.equal((cur.elements.musicearly.innerHTML.match(/open\.spotify\.com/g)||[]).length,5);
assert(run('allData.nov.every(x=>x.v.reduce((a,b)=>a+b,0)===x.s && x.v.every((n,i)=>n>=0&&n<=[30,20,20,15,15][i]))'));
assert(run("mh(allData.nov.find(x=>x.n==='Setlog')).includes('+7')"));assert(run("mh(allData.nov.find(x=>x.n.startsWith('ママが'))).includes('-3')"));
assert(run("shops.nov.every(x=>mh(x,shops).includes('NEW'))"));
for(const key of ['allData.nov','shops.nov'])assert(run(`${key}.every(x=>x.l.length&&x.l.every(l=>l[1].startsWith('https://')))`));
assert(run("Object.values(music.nov).flat().every(x=>x[4]&&x[4].startsWith('https://'))"));
for(const id of ['ranking','categories','history','early','shopping','music','analysis','appendix','audit'])assert(cur.h.includes('id="'+id+'"'));
assert(cur.h.includes('document.getElementById(id)'));assert.equal(run('monthOrder.length'),5);assert.equal((cur.h.match(/data-month=/g)||[]).length,5);
assert(cur.elements.musicanalysis.innerHTML.includes('前週2曲継続・3曲終了'));assert(cur.elements.auditcounts.innerHTML.includes('GLOBAL EARLY'));
assert.equal((cur.elements.auditcounts.innerHTML.match(/auditstat/g)||[]).length,7);
console.log('PASS: syntax; five months; Jul–Oct archives byte-equivalent; all sections render in DOM stub; Nov overall 2 / early 9 / shopping 4 / music 10-10-5 / candidates 17; score sums and monthly deltas; evidence/Spotify URLs; no music leakage.');
