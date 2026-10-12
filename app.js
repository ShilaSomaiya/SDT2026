// ===== CONFIG: when hosted on GitHub Pages/Netlify, paste the Google Sheet "Publish to web" CSV link here =====
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT5V0AqpTSSqK4gf6kIZ-nVQdgkTVmnulO2w5pwjd1kixXdEp8bBbwLmrdHEJP8EGwoRZLx6u8v3TIa/pub?gid=1333249164&single=true&output=csv";
//const SHEET_CSV_URL = "";
// Optional: Apps Script web-app link that stores star ratings so everyone sees the same averages
//const FEEDBACK_URL = "";
const FEEDBACK_URL = "https://script.google.com/macros/s/AKfycbwquD2afss6CTD3V92VtXCt3QwATR81uIe81qoy30DZHHB8L230aE_FiRcqyGUBf_Tl/exec";

// Division (A-E) comes from the "Div" column of the published sheet tab. No names are stored in this file.
// =================================================================================================
const MODS={
1:{t:"Introduction to Software Design Thinking",s:{"1.1":"Concept of design thinking in software engineering","1.2":"Stages: Empathize, Define, Ideate, Prototype, Test","1.3":"Human-centered software design approach","1.4":"Design vs. traditional problem-solving","1.5":"Case studies on successful design thinking in software"}},
2:{t:"Empathize & Define",s:{"2.1":"Understanding user needs, pain points, and requirements","2.2":"Conducting user research: interviews, surveys, observation","2.3":"Creating empathy maps and personas","2.4":"Problem framing and defining point-of-view (POV) statements","2.5":"Translating requirements into design goals"}},
3:{t:"Ideation in Software Design",s:{"3.1":"Creativity techniques: brainstorming, SCAMPER, mind mapping","3.2":"Generating multiple design alternatives","3.3":"Storyboarding and user journey mapping","3.4":"Design heuristics for software solutions","3.5":"Evaluating idea feasibility and prioritization"}},
4:{t:"Prototyping Techniques",s:{"4.1":"Types of prototypes: low-fidelity vs. high-fidelity","4.2":"Tools for software prototyping (wireframes, mockups, clickable prototypes)","4.3":"Agile and iterative prototyping","4.4":"Interaction design and UI/UX considerations","4.5":"Rapid prototyping case study in software development"}},
5:{t:"Testing, Feedback & Implementation",s:{"5.1":"Usability testing principles","5.2":"Methods of collecting user feedback","5.3":"Iteration cycles and refinement strategies","5.4":"Translating prototypes into software architecture/design models","5.5":"Capstone project: applying design thinking to solve a real-world software problem"}}};
const DEMO=`Timestamp,Roll Number,Topic number,Submission link(Video Presentation),Div,PPT upload
2026-08-01,1601001,1.1,https://drive.google.com/file/d/SAMPLE_ID_1/view,C,https://drive.google.com/file/d/SAMPLE_PPT_1/view
2026-08-01,1601015,1.1,https://drive.google.com/file/d/SAMPLE_ID_2/view,E,
2026-08-02,1601022,1.2,https://drive.google.com/open?id=SAMPLE_ID_3,A,
2026-08-03,1601030,2.3,https://drive.google.com/file/d/SAMPLE_ID_4/view,B,
2026-08-04,1601041,4.2,https://drive.google.com/file/d/SAMPLE_ID_5/view,D,`;
const $=s=>document.querySelector(s),esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let DATA=[],SAMPLE=true,SKIPPED=0,LOADERR="",SKIPLIST=[];

function parse(t){const d=(t.split("\n")[0].includes("\t"))?"\t":",";const r=[];let row=[],c="",q=false;
 for(let i=0;i<t.length;i++){const ch=t[i];
  if(q){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else q=false}else c+=ch}
  else if(ch=='"')q=true;else if(ch==d){row.push(c);c=""}
  else if(ch=="\n"||ch=="\r"){if(ch=="\r"&&t[i+1]=="\n")i++;row.push(c);c="";r.push(row);row=[]}
  else c+=ch}
 if(c||row.length){row.push(c);r.push(row)}return r.filter(x=>x.some(y=>y.trim()))}

function load(text){const r=parse(text);if(!r.length)return false;const hd=/timestamp|roll|topic|video|submission|faculty|div|ppt/i.test(r[0].join(" "))&&!/https?:/.test(r[0].join(" "));const h=hd?r[0].map(x=>x.toLowerCase()):[];
 const f=re=>h.findIndex(x=>re.test(x)),ix=hd?{ts:f(/timestamp/),roll:f(/roll/),tp:f(/topic/),vid:f(/video|submission/),fac:f(/faculty|div/),ppt:f(/ppt/)}:{ts:0,roll:1,tp:2,vid:3,fac:4,ppt:5};
 DATA=[];SKIPPED=0;SKIPLIST=[];const seen={};
 (hd?r.slice(1):r).forEach(x=>{const g=k=>ix[k]>=0?(x[ix[k]]||"").trim():"";const m=g("tp").match(/(\d)\s*[.,\-\/_]\s*(\d)/);
  const vu=(g("vid").match(/https?:\/\/[^\s,;]+/)||[""])[0],ok=m&&MODS[m[1]]&&MODS[m[1]].s[m[1]+"."+m[2]];
  if(!ok||!vu){SKIPPED++;SKIPLIST.push((g("roll")||"?")+" – topic “"+g("tp")+"” – "+(!ok?"topic number not recognised":"no video link found")+"");return}
  const dv=g("fac").toUpperCase().replace(/^DIV\.?\s*/,""),fn=/^[A-E]$/.test(dv)?dv:(dv?"?":""),tp=m[1]+"."+m[2],vid=vu,k=tp+"|"+(media(vid)||vid);let e=seen[k];
  if(!e){e=seen[k]={ts:g("ts"),rolls:[],tp:tp,mod:+m[1],vid:vid,facs:[],ppts:[]};DATA.push(e)}
  const ro=g("roll"),pp=(g("ppt").match(/https?:\/\/[^\s,;]+/)||[""])[0];if(ro&&!e.rolls.includes(ro))e.rolls.push(ro);if(pp&&!e.ppts.length)e.ppts.push(pp);if(fn&&!e.facs.includes(fn))e.facs.push(fn)});
 return true}

function media(u){let m=u.match(/youtu\.be\/([\w-]{11})|[?&]v=([\w-]{11})|embed\/([\w-]{11})/);
 if(m)return"https://www.youtube.com/embed/"+(m[1]||m[2]||m[3]);
 m=u.match(/\/d\/([\w-]+)/)||u.match(/[?&]id=([\w-]+)/);return m?"https://drive.google.com/file/d/"+m[1]+"/preview":""}

const RK="sdt_rate",RT={};let MY={},CID="anon";
try{MY=JSON.parse(localStorage.getItem(RK)||"{}");CID=localStorage.getItem("sdt_cid")||"";if(!CID){CID=Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem("sdt_cid",CID)}}catch(_){}
const vkey=e=>e.tp+"|"+(media(e.vid)||e.vid);
function sk(k){const my=MY[k]||0,t=RT[k],n=my||(t?Math.round(t.avg):0);
 return`<div class="st" data-k="${esc(k)}">`+[1,2,3,4,5].map(i=>`<button type="button" title="${i} star${i>1?"s":""}" data-r="${i}" class="${i<=n?"on":""}">★</button>`).join("")+`<small>${t?t.avg.toFixed(1)+" ("+t.n+")":(my?"":"Rate this")}${my?(t?" · ":"")+"you: "+my:""}</small></div>`}
const stars=e=>sk(vkey(e));
function rate(k,v,el){const old=MY[k]||0;MY[k]=v;try{localStorage.setItem(RK,JSON.stringify(MY))}catch(_){}
 if(FEEDBACK_URL){const t=RT[k];if(t){t.avg=(t.avg*t.n-old+v)/(old?t.n:t.n+1);if(!old)t.n++}else RT[k]={avg:v,n:1};
  fetch(FEEDBACK_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain"},body:JSON.stringify({key:k,rating:v,client:CID,time:new Date().toISOString()})}).catch(()=>{})}
 el.outerHTML=sk(k)}
if(FEEDBACK_URL)fetch(FEEDBACK_URL).then(r=>r.json()).then(j=>{Object.assign(RT,j);route()}).catch(()=>{});

function card(e){const src=media(e.vid);
 return`<article class="c"><div class="v" data-src="${esc(src)}"><button class="play">▶ Play presentation</button></div>
 <div class="m"><b>${esc(e.rolls.join(", "))||"Submission"}</b><span>${esc(e.facs.map(d=>"Div "+d).join(", "))}</span>${stars(e)}
 <div class="l"><a href="${esc(e.vid)}" target="_blank" rel="noopener">Open video</a>${e.ppts[0]?`<a href="${esc(e.ppts[0])}" target="_blank" rel="noopener">Slides</a>`:""}</div></div></article>`}

function nav(cur){$("#nav").innerHTML=`<a href="#home" class="${cur==0?"on":""}">Home</a>`+Object.keys(MODS).map(k=>`<a href="#m${k}" class="${cur==k?"on":""}">Module ${k}</a>`).join("")}
const banner=()=>(LOADERR?`<div class="banner"><b>Live data not loaded.</b> ${LOADERR}</div>`:"")+(SAMPLE?`<div class="banner"><b>Sample data shown.</b> Use <b>Load data</b> to add your real submissions (CSV from the Google Sheet).</div>`:(SKIPPED?`<div class="banner"><details><summary>${SKIPPED} row(s) skipped – click to see which</summary>${SKIPLIST.map(esc).join("<br>")}</details></div>`:""));

function home(){nav(0);
 $("#app").innerHTML=`<div class="hero"><h2>Student video presentations</h2><p>Choose a module to watch every group's presentation, topic by topic.</p></div>${banner()}<div class="mods">`+
 Object.entries(MODS).map(([k,m])=>{const n=DATA.filter(e=>e.mod==k).length;return`<a class="mod" href="#m${k}"><div class="n">Module ${k}</div><h3>${esc(m.t)}</h3><span>${Object.keys(m.s).length} topics · ${n} presentation${n==1?"":"s"}</span></a>`}).join("")+`</div>`}

function module(k){const m=MODS[k];nav(k);const facs=[...new Set(DATA.filter(e=>e.mod==k).flatMap(e=>e.facs))].sort();
 $("#app").innerHTML=`<div class="hero"><h2>Module ${k}: ${esc(m.t)}</h2></div>${banner()}
 <div class="layout"><aside>${Object.entries(m.s).map(([id,t])=>`<a href="#t${id}" data-go="${id}"><b>${id}</b>${esc(t)}</a>`).join("")}</aside>
 <div><div class="bar"><input id="q" type="search" placeholder="Search roll number…"><select id="fc"><option value="">All divisions</option>${facs.map(f=>`<option value="${esc(f)}">Div ${esc(f)}</option>`).join("")}</select></div><div id="tp"></div></div></div>`;
 const draw=()=>{const q=$("#q").value.toLowerCase(),f=$("#fc").value;
  $("#tp").innerHTML=Object.entries(m.s).map(([id,t])=>{const all=DATA.filter(e=>e.tp==id),L=all.filter(e=>(!q||e.rolls.join(" ").toLowerCase().includes(q))&&(!f||e.facs.includes(f)));
   return`<section id="t${id}"><h3><b>${id}</b> ${esc(t)}<small>${L.length} presentation${L.length==1?"":"s"}</small></h3>${L.length?`<div class="grid">${L.map(card).join("")}</div>`:`<p class="empty">${all.length?"No matches.":"No submissions yet."}</p>`}</section>`}).join("")};
 $("#q").oninput=draw;$("#fc").onchange=draw;draw()}

function route(){const h=location.hash.match(/^#m(\d)$/);if(h&&MODS[h[1]])module(h[1]);else if(!/^#t/.test(location.hash))home();if(!/^#t/.test(location.hash))scrollTo(0,0)}
addEventListener("hashchange",route);
document.addEventListener("click",e=>{
 const sb=e.target.closest(".st button");if(sb){rate(sb.parentElement.dataset.k,+sb.dataset.r,sb.parentElement);return}
 const p=e.target.closest(".play");if(p){const v=p.parentElement,s=v.dataset.src;
  if(s)v.innerHTML=`<iframe src="${s}" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>`;
  else v.innerHTML=`<span style="color:#fff;padding:12px;text-align:center;font-size:.85rem">Preview not available. Use “Open video”.</span>`;return}
 const g=e.target.closest("[data-go]");if(g){e.preventDefault();const el=document.getElementById("t"+g.dataset.go);el&&el.scrollIntoView()}});

const store={get:k=>{try{return localStorage.getItem(k)}catch(_){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}},del:k=>{try{localStorage.removeItem(k)}catch(_){}}};
$("#ld").onclick=()=>$("#dlg").showModal();$("#cx").onclick=()=>$("#dlg").close();
$("#fl").onchange=e=>{const f=e.target.files[0];if(f)f.text().then(t=>$("#ta").value=t)};
$("#ok").onclick=()=>{const t=$("#ta").value;if(load(t)){SAMPLE=false;store.set("sdt_csv",t);$("#dlg").close();route()}else alert("Could not read rows. Include the header row.")};
$("#rs").onclick=()=>{store.del("sdt_csv");load(DEMO);SAMPLE=true;$("#dlg").close();route()};

(async()=>{
 if(SHEET_CSV_URL){try{const r=await fetch(SHEET_CSV_URL+(SHEET_CSV_URL.includes("?")?"&":"?")+"t="+Date.now(),{cache:"no-store"}),tx=await r.text();if(r.ok&&!/^\s*</.test(tx)&&load(tx)){SAMPLE=false;$("#ld").style.display="none";return route()}LOADERR=r.ok?"The link did not return CSV data. Use the CSV link from File → Share → Publish to web for the responses tab.":"The sheet link returned error "+r.status+"."}catch(_){LOADERR="The sheet link could not be reached. Check it is the CSV link from Publish to web."}}
 const s=store.get("sdt_csv");if(s&&load(s))SAMPLE=false;else load(DEMO);
 route()})();
