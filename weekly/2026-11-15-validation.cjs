const fs=require('fs'),vm=require('vm'),assert=require('assert');
const h=fs.readFileSync('index.html','utf8'),js=h.match(/<script>([\s\S]*)<\/script>/)[1]; new vm.Script(js);
const elements={},make=id=>({id,innerHTML:'',textContent:'',style:{display:'',setProperty(){}},classList:{add(){},remove(){},toggle(){}},querySelectorAll:()=>[]});
const c={document:{getElementById:id=>elements[id]??=make(id),querySelectorAll:()=>[]},URL,encodeURIComponent};vm.createContext(c);const run=x=>vm.runInContext(x,c);run(js);
const prior=JSON.parse(fs.readFileSync('weekly/2026-11-08-corrected-snapshot.json'));
for(const obj of ['allData','shops','music','early','analysis','moves'])for(const m of ['jul','aug','sep','oct'])assert.equal(run(`JSON.stringify(${obj}.${m})`),JSON.stringify(prior[obj][m]),obj+'.'+m+' archive changed');
for(const m of ['jul','aug','sep','oct','nov']){
 run(`month='${m}';filter='All';shopFilter='All';musicMarket='japan';rf();rsf();render();rseries();draw();`);
 for(const id of ['tbody','mobile','catgrid','chart','analysiscard','earlygrid'])assert(elements[id].innerHTML,id+' empty '+m);
 assert(!run('data().some(isMusicTrend)'),m+' overall music');
 for(const id of ['tbody','catgrid','earlygrid','movesgrid','series'])assert(!/M!LK|Vaundy|EBiDAN|Mrs\. GREEN APPLE|LISA|Tate McRae/.test(elements[id].innerHTML),id+' music leak '+m);
 for(const cat of run('cats')){run(`filter=${JSON.stringify(cat)};render()`);assert(elements.mobile.innerHTML,'filter empty');}
}
run("month='nov';filter='All';shopFilter='All';musicMarket='global';rf();rsf();render();");
assert.equal(run('data().length'),2);assert.equal(run('early.nov.length'),9);assert.equal(run('shops.nov.length'),2);assert.equal(run('scopeScanNov.length'),34);assert.equal(run('discoveryCoverageNov.length'),10);
for(const [k,n]of Object.entries({japan:10,global:10,early:5}))assert.equal(run(`music.nov.${k}.length`),n);
assert.equal((elements.musiclist.innerHTML.match(/class="song"/g)||[]).length,10);assert.equal((elements.musicearly.innerHTML.match(/class="song"/g)||[]).length,5);
assert.equal((elements.musiclist.innerHTML.match(/open\.spotify\.com/g)||[]).length,10);assert.equal((elements.musicearly.innerHTML.match(/open\.spotify\.com/g)||[]).length,5);
assert(run('allData.nov.every(x=>x.v.reduce((a,b)=>a+b,0)===x.s && x.v.every((n,i)=>n>=0&&n<=[30,20,20,15,15][i]))'));
assert(run('allData.nov.every(x=>mh(x).includes("NEW"))'));assert(run('shops.nov.every(x=>mh(x,shops).includes("NEW"))'));
// Known prior-month values exercise every delta branch; same function feeds PC and mobile cards.
assert(run('mh({n:allData.oct[0].n,s:allData.oct[0].s+1}).includes("+1")'));assert(run('mh({n:allData.oct[0].n,s:allData.oct[0].s-1}).includes("-1")'));assert(run('mh({n:allData.oct[0].n,s:allData.oct[0].s}).includes("±0")'));
for(const key of ['allData.nov','shops.nov'])assert(run(`${key}.every(x=>x.l.length&&x.l.every(l=>l[1].startsWith('https://')))`));
assert(run('Object.values(music.nov).flat().every(x=>x[4]?.startsWith("https://"))'));
assert(run('music.nov.global.concat(music.nov.early).every(x=>x[3])'));assert.equal(run('new Set(music.nov.global.concat(music.nov.early).map(x=>x[0]+x[1])).size'),15);
assert(run('early.nov.some(x=>x[0]==="パンどろぼう" && x[2]==="接点拡大 WATCH")'));assert(!run('shops.nov.some(x=>/パンどろぼう|マリー/.test(x.n))'));
assert.equal(run('scopeScanNov.filter(x=>x.origin==="new").length'),23);assert.equal(run('scopeScanNov.filter(x=>x.origin==="tracking").length'),10);assert.equal(run('scopeScanNov.filter(x=>x.origin==="unconfirmed").length'),1);
for(const id of ['ranking','categories','history','early','shopping','music','analysis','appendix','audit'])assert(h.includes('id="'+id+'"'));
assert(h.includes('document.getElementById(id)'));assert.equal(run('monthOrder.length'),5);assert.equal((h.match(/data-month=/g)||[]).length,5);assert.equal((elements.auditcounts.innerHTML.match(/auditstat/g)||[]).length,10);
assert(elements.musicanalysis.innerHTML.includes('昇格1曲'));assert(elements.earlygrid.innerHTML.includes('接点拡大 WATCH'));assert.equal((elements.coveragegrid.innerHTML.match(/class="card"/g)||[]).length,10);
run("shopFilter='Food / Drink';rshop()");assert(elements.shophot.innerHTML.includes('吉野家'));assert(!elements.shophot.innerHTML.includes('パッケージ版'));
run("musicMarket='japan';rmusic()");assert.equal(elements.musicearlywrap.style.display,'none');assert.equal((elements.musiclist.innerHTML.match(/open\.spotify\.com/g)||[]).length,10);
run("month='oct';render()");assert(elements['next-observations'].hidden);
console.log('PASS: JS syntax; 5 months; Jul–Oct data unchanged; all sections/category filters render in DOM stub; 2 overall / 9 Watch / 2 Shopping / Music10-10-5; 34 audit rows (23 discovery,10 tracking,1 unavailable); score sums/delta branches; URLs/Spotify; music scope. No claim of visual browser testing.');
