const fmt=m=>m>=60?(Math.floor(m/60)+'h '+(m%60?m%60+'m':'')).trim():m+'m';
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

fetch('data/progress.json?v='+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(data=>{
  const now=new Date(),today=iso(now);
  document.querySelector('#today').textContent=now.toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric'});
  const logs=data.logs||[],byDay={},sessionsByDay={};
  logs.forEach(x=>{
    byDay[x.date]=(byDay[x.date]||0)+x.minutes;
    (sessionsByDay[x.date] ||= []).push(x);
  });
  document.querySelector('#todayTime').textContent=fmt(byDay[today]||0);

  let start=new Date(now);
  start.setDate(now.getDate()-((now.getDay()+6)%7));
  start.setHours(0,0,0,0);
  const week=logs.filter(x=>new Date(x.date+'T00:00:00')>=start&&new Date(x.date+'T00:00:00')<=now);
  const wt=week.reduce((a,x)=>a+x.minutes,0),wd=new Set(week.map(x=>x.date)).size;
  ['weekTime','weekTotal'].forEach(id=>document.querySelector('#'+id).textContent=fmt(wt));
  document.querySelector('#weekDays').textContent=wd+' / 7';
  document.querySelector('#studyDays').textContent=wd;
  document.querySelector('#dailyAvg').textContent=fmt(wd?Math.round(wt/wd):0);
  document.querySelector('#sessionCount').textContent=week.length;

  const active=Object.keys(byDay).filter(d=>byDay[d]>0).sort();
  let best=0,cur=0,prev=null;
  active.forEach(s=>{
    const dt=new Date(s+'T12:00:00');
    cur=prev&&Math.round((dt-prev)/86400000)===1?cur+1:1;
    best=Math.max(best,cur);
    prev=dt;
  });
  let streak=0,d=new Date(now);
  if(!byDay[today])d.setDate(d.getDate()-1);
  while(byDay[iso(d)]){streak++;d.setDate(d.getDate()-1)}
  document.querySelector('#streak').textContent=streak;
  document.querySelector('#bestStreak').textContent=best;

  const heat=document.querySelector('#heatmap'),months=document.querySelector('#months'),end=new Date(now),begin=new Date(end);
  begin.setDate(end.getDate()-363-((end.getDay()+6)%7));
  begin.setHours(12,0,0,0);
  let col=1,lastMonth=-1;
  const level=m=>m===0?0:m<=15?1:m<=30?2:m<=60?3:m<=90?4:m<=120?5:m<=180?6:7;

  const showDetail=(date,cell)=>{
    document.querySelectorAll('.day.selected').forEach(x=>x.classList.remove('selected'));
    if(cell)cell.classList.add('selected');
    const items=sessionsByDay[date]||[],total=byDay[date]||0;
    const dt=new Date(date+'T12:00:00');
    document.querySelector('#detailDate').textContent=dt.toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
    document.querySelector('#detailTotal').textContent=total?'总学习 '+fmt(total):'没有学习记录';
    document.querySelector('#detailSessions').innerHTML=items.length
      ? items.map(x=>'<div class="detail-session"><span>'+esc(x.track)+' · '+esc(x.topic)+'</span><b>'+fmt(x.minutes)+'</b></div>').join('')
      : '<div class="detail-empty">这一天还没有记录学习内容。</div>';
  };

  for(let x=new Date(begin);x<=end;x.setDate(x.getDate()+1)){
    const date=iso(x),m=byDay[date]||0;
    if(x.getDay()===1){
      if(x.getMonth()!==lastMonth){
        const label=document.createElement('span');
        label.textContent=(x.getMonth()+1)+'月';
        label.style.gridColumn=col;
        months.appendChild(label);
        lastMonth=x.getMonth();
      }
      col++;
    }
    const el=document.createElement('button');
    el.type='button';
    el.className='day l'+level(m);
    el.title=date+' · '+fmt(m);
    el.setAttribute('aria-label',date+'，学习 '+fmt(m));
    el.addEventListener('click',()=>showDetail(date,el));
    heat.appendChild(el);
  }

  const tracks=document.querySelector('#tracks');
  (data.tracks||[]).forEach(t=>{
    tracks.insertAdjacentHTML('beforeend','<div class="track"><div class="track-line"><span>'+esc(t.name)+'</span><b>'+t.progress+'%</b></div><div class="bar"><i style="width:'+t.progress+'%"></i></div></div>');
  });

  const recent=document.querySelector('#recent');
  logs.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).forEach(x=>{
    recent.insertAdjacentHTML('beforeend','<div class="recent-row"><span class="meta">'+x.date.slice(5)+'</span><span>'+esc(x.track)+' · '+esc(x.topic)+'</span><b>'+fmt(x.minutes)+'</b></div>');
  });
  if(!logs.length)recent.innerHTML='<div class="empty">还没有学习时长记录。从下一次学习开始记录。</div>';
  document.querySelector('#updated').textContent=data.updated||'—';

  const todayCell=[...document.querySelectorAll('.day')].find(x=>x.getAttribute('aria-label')?.startsWith(today));
  showDetail(today,todayCell||null);
}).catch(()=>document.querySelector('#recent').innerHTML='<div class="empty">数据加载失败。</div>');