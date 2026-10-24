import {CATEGORIES,CATEGORY_TREE,COLORS,SEASONS,USAGES,seasonList,seasonLabel,evaluate} from './core.mjs';
import {decryptShopping} from './shopping-crypto.mjs';
import {shoppingView,evaluationView} from './shopping-view.mjs';
import {wardrobeInsights,UNFILLED} from './insights.mjs';
import {insightPanels} from './insights-view.mjs';
import {icon,heading,introCard,clothingCards,recordHero} from './wardrobe-view.mjs';
import {validatePublicSnapshot,PUBLIC_FIELDS,OPTIONAL_FIELDS} from './public-snapshot.mjs';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=document.querySelector('#reader'),dialog=document.querySelector('#item-dialog');
const blankFilters=()=>({search:'',category:'',subcategory:'',color:'',season:'',usage:'',brand:'',scene:''});
let snapshot,items=[],loading=false,page=location.hash.slice(1)||'wardrobe',filters=blankFilters(),showFilters=false,listView=false,sortByCategory=true,detailId='',shopping,candidateStatus='考虑中',unlocking=false,unlockEpoch=0;
const date=t=>new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',dateStyle:'medium',timeStyle:'short'}).format(new Date(t));
const options=(list,value,blank)=>`<option value="">${blank}</option>${list.map(x=>`<option value="${esc(x)}" ${x===value?'selected':''}>${esc(x===UNFILLED?'未填写':x)}</option>`).join('')}`;
const values=key=>[...new Set(items.map(i=>i[key]?.trim()).filter(Boolean))];
function filteredItems(){
  const selected=items.filter(i=>(!filters.category||i.category===filters.category)&&(!filters.subcategory||(filters.subcategory==='__unclassified'?!i.subcategory:i.subcategory===filters.subcategory))&&(!filters.color||i.color===filters.color)&&(!filters.season||(filters.season===UNFILLED?!i.seasons.length:i.seasons.includes(filters.season)))&&(!filters.usage||(filters.usage===UNFILLED?!i.usage:i.usage===filters.usage))&&(!filters.brand||(filters.brand===UNFILLED?!i.brand?.trim():i.brand?.trim()===filters.brand))&&(!filters.scene||(filters.scene===UNFILLED?!i.scenes?.length:i.scenes?.includes(filters.scene)))&&(!filters.search||[i.name,i.category,i.subcategory,i.color,i.fabric,i.fit,i.brand,i.size,...(i.scenes||[])].join(' ').toLowerCase().includes(filters.search.trim().toLowerCase())));
  if(!sortByCategory)return selected;
  const rank=(list,value)=>{const n=list.indexOf(value);return n<0?list.length:n;};
  return selected.sort((a,b)=>rank(CATEGORIES,a.category)-rank(CATEGORIES,b.category)||rank(CATEGORY_TREE[a.category]||[],a.subcategory)-rank(CATEGORY_TREE[b.category]||[],b.subcategory)||a.name.localeCompare(b.name,'zh-CN',{numeric:true}));
}
function wardrobeList(){
  const selected=filteredItems();
  if(!selected.length)return `<div class="empty">${icon('hanger',35)}<h3>${items.length?'没有找到符合条件的衣物':'还没有发布在用衣物'}</h3><p>${items.length?'换个关键词或清除筛选试试。':'在电脑整理并发布后，就能在这里查看。'}</p>${items.length?'<button class="btn primary" data-action="clear-filters">清除筛选</button>':''}</div>`;
  const cards=group=>clothingCards(group,{listView,readOnly:true});
  if(!sortByCategory)return cards(selected);
  const groups=new Map();
  for(const item of selected){const key=JSON.stringify([item.category,item.subcategory]);if(!groups.has(key))groups.set(key,{category:item.category,subcategory:item.subcategory,items:[]});groups.get(key).items.push(item);}
  return [...groups.values()].map(group=>`<section class="wardrobe-group" aria-label="${esc(group.category||'未选品类')} / ${esc(group.subcategory||'未分类')}"><header class="wardrobe-group-heading"><h3><span>${esc(group.category||'未选品类')}</span>${esc(group.subcategory||'未分类')}</h3><span class="wardrobe-group-count">${group.items.length} 件</span></header>${cards(group.items)}</section>`).join('');
}
function subcategories(){
  if(!filters.category)return '';
  const list=['',...(CATEGORY_TREE[filters.category]||[])];if(items.some(i=>i.category===filters.category&&!i.subcategory))list.push('__unclassified');
  return `<div class="subcategory-filter" role="group" aria-label="${esc(filters.category)}二级分类"><span class="subcategory-label">${esc(filters.category)}细分</span><div class="category-tabs">${list.map(s=>`<button class="tab ${filters.subcategory===s?'active':''}" data-action="subcategory" data-id="${esc(s)}" aria-pressed="${filters.subcategory===s}">${esc(s==='__unclassified'?'未分类':s||'全部'+filters.category)}</button>`).join('')}</div></div>`;
}
function filterPanel(){
  const fields=[['color','主色',Object.keys(COLORS)],['usage','使用情况',USAGES],['season','季节',[...SEASONS,UNFILLED]]];
  if(snapshot.fields.includes('brand'))fields.push(['brand','品牌',[...values('brand'),UNFILLED]]);
  if(snapshot.fields.includes('scenes'))fields.push(['scene','使用场景',[...new Set(items.flatMap(i=>i.scenes||[])),UNFILLED]]);
  return `<div class="filter-panel">${fields.map(([key,label,list])=>`<label>${label}<select data-filter="${key}">${options(list,filters[key],'全部')}</select></label>`).join('')}<button class="btn small" data-action="clear-filters">重置筛选</button></div>`;
}
function wardrobePage(){
  const wear=items.filter(i=>i.usage==='常穿').length,idle=items.filter(i=>i.usage==='闲置').length,scenes=new Set(items.flatMap(i=>i.scenes||[]));
  const stats=[['全部衣物',items.length,'已记录的在用衣物','wardrobe',''],['常穿单品',wear,'日常反复选择的喜欢','heart','常穿'],['闲置单品',idle,'也许值得重新发现','box','闲置'],['覆盖场景',snapshot.fields.includes('scenes')?scenes.size:'—',snapshot.fields.includes('scenes')?'标签可重叠计数':'本次未公开场景','spark','overview']];
  return `${heading('MY WARDROBE','我的衣橱','每一件都值得被看见，每一次搭配都有迹可循。')}${introCard()}<div class="stats">${stats.map(([label,n,foot,ico,id])=>`<button class="stat ${filters.usage&&filters.usage===id?'active':''}" data-action="stat-filter" data-id="${id}"><span class="stat-label">${label}${icon(ico,16)}</span><div class="stat-value">${n}<small>${id==='overview'?'个':'件'}</small></div><div class="stat-foot">${foot}</div></button>`).join('')}</div><div class="section-heading"><h2>衣橱里的日常 <span id="result-count">${filteredItems().length} 件单品</span></h2><button class="btn small ${sortByCategory?'soft':''}" data-action="sort-category" aria-pressed="${sortByCategory}">${icon('list',14)}${sortByCategory?'按分类排列中':'按分类排列'}</button></div><div class="wardrobe-toolbar"><div class="category-tabs">${['',...CATEGORIES].map(category=>`<button class="tab ${filters.category===category?'active':''}" data-action="category" data-id="${esc(category)}" aria-pressed="${filters.category===category}">${esc(category||'全部')}</button>`).join('')}</div><div class="toolbar-right"><label class="searchbox">${icon('search',15)}<input id="wardrobe-search" type="search" aria-label="搜索衣物" placeholder="搜索衣物、面料、颜色…" value="${esc(filters.search)}"></label><button class="btn icon-only" data-action="toggle-filters" aria-label="展开筛选" aria-expanded="${showFilters}">${icon('filter',17)}</button><div class="view-buttons"><button data-action="view-grid" class="${!listView?'active':''}" aria-label="网格视图">${icon('grid',14)}</button><button data-action="view-list" class="${listView?'active':''}" aria-label="列表视图">${icon('list',15)}</button></div></div></div>${subcategories()}${showFilters?filterPanel():''}<div id="wardrobe-content">${wardrobeList()}</div>`;
}
function insightsPage(){
  const stats=wardrobeInsights(items);
  return `${heading('KNOW YOUR WARDROBE','衣橱概览','从品类、品牌、季节和使用习惯了解你的衣橱。')}<div class="panel"><div class="eyebrow">已记录的在用衣物</div><div class="stat-value">${stats.total}<small>件</small></div><p>按最近成功发布的在用衣物统计，占比以 ${stats.total} 件为基数。点击任意统计行可查看对应衣物。</p></div>${insightPanels(stats,{fields:snapshot.fields})}`;
}
function informationPage(){
  const labels={...PUBLIC_FIELDS,...OPTIONAL_FIELDS};
  return `${heading('PUBLISHED WARDROBE','发布信息','手机与电脑查询同一份已发布衣橱。')}<div class="settings-wrap"><section class="panel"><h3>当前查询版本</h3><p>更新时间：${esc(date(snapshot.publishedAt))}<br>版本：${esc(snapshot.version)}<br>在用衣物：${items.length} 件</p><button class="btn primary" data-action="refresh" ${loading?'disabled':''}>${icon('clock',15)}${loading?'正在刷新…':'刷新数据'}</button></section><section class="panel"><h3>已公开的衣物信息</h3><p>${snapshot.fields.map(key=>esc(labels[key]||key)).join('、')}。</p><p>页面仅供查询。请在电脑编辑完成后重新发布，手机即可读取新版本。</p></section></div>`;
}
function shoppingPage(){
  if(shopping)return shoppingView(shopping,{candidateStatus})+'<p><button class="btn small" data-action="shopping-lock">锁定购衣页</button></p>';
  return `${heading('THOUGHTFUL ADDITIONS','购衣决策','购买计划与建议单独用密码保护，衣橱和概览可以直接查看。')}<section class="panel">${snapshot.shopping?'<form id="shopping-unlock"><label class="field"><span>购衣页密码</span><input name="password" type="password" required minlength="4" maxlength="256" autocomplete="current-password"></label><button class="btn primary" type="submit">解锁购衣页</button><p id="shopping-error" role="status"></p></form><p>密码只在当前设备用于解密，不会发送到 GitHub。刷新页面或锁定后需要重新输入。</p>':'<h3>购衣页尚未发布</h3><p>请在电脑的“偏好与数据”中设置购衣页密码，然后重新发布。计划与建议将加密后出现在这里。</p>'}</section>`;
}
function shoppingDetail(id,analysis=false){
  if(!shopping)return;const candidate=shopping.candidates.find(c=>c.id===id);if(!candidate)return;
  const plan=shopping.plans.find(p=>p.id===candidate.planId),context={scene:plan?.scene||candidate.scenes?.[0]||shopping.prefs.scenes?.[0]||'',budget:plan?.budget??shopping.prefs.budget,currency:plan?.currency||shopping.prefs.currency};
  const body=analysis?evaluationView(shopping,evaluate(candidate,shopping,context)):`${recordHero(candidate)}<div class="detail-properties">${[['面料',candidate.fabric],['版型',candidate.fit],['季节',seasonLabel(candidate)],['洗护',candidate.care],['价格',candidate.price===''||candidate.price==null?'未记录':candidate.price+' '+(candidate.currency||'CNY')],['关联计划',plan?.title]].map(([label,value])=>`<div class="property"><small>${label}</small><span>${esc(value||'未填写')}</span></div>`).join('')}</div>${candidate.notes?`<div class="note-box">${esc(candidate.notes)}</div>`:''}`;
  dialog.innerHTML=`<div class="modal-header"><div><h2>${esc(candidate.name)}</h2><p>${analysis?'根据本次发布数据生成的基础规则建议':'已发布的候选信息'}</p></div><button class="modal-close" data-action="close-detail" aria-label="关闭详情">${icon('close',21)}</button></div><div class="modal-content"><div class="modal-body">${body}</div></div>`;dialog.showModal();
}
function lockShopping(){shopping=undefined;unlockEpoch++;if(dialog.open)dialog.close();dialog.innerHTML='';render();}
function render(){
  if(page==='plans')page='shopping';
  if(!['wardrobe','insights','shopping','information'].includes(page))page='wardrobe';
  const names={wardrobe:'我的衣橱',insights:'衣橱概览',shopping:'购衣决策',information:'发布信息'};
  const nav=(key,label,ico,count)=>`<button class="nav-item ${page===key?'active':''}" data-nav="${key}" aria-label="${label}" ${page===key?'aria-current="page"':''}>${icon(ico,19)}<span>${label}</span>${count!=null?`<span class="count">${count}</span>`:''}</button>`;
  root.innerHTML=`<div class="layout"><aside class="sidebar"><div class="brand"><img src="./icon.svg" alt=""><div><div class="brand-name">WearWise</div><small>LESS, BUT BETTER</small></div></div><div class="nav-label">我的衣物</div>${nav('wardrobe','我的衣橱','wardrobe',items.length)}${nav('insights','衣橱概览','chart')}<div class="nav-label">未来添置</div>${nav('shopping','购衣决策','spark')}<div class="sidebar-bottom">${nav('information','发布信息','info')}<div class="sidebar-note"><strong>${icon('leaf',14)} 让衣橱，更懂你</strong>留下喜欢的，穿好拥有的。<br>每一次添置，都多一点思考。</div></div><button class="nav-item mobile-settings ${page==='information'?'active':''}" data-nav="information" style="display:none">${icon('info',19)}<span>发布信息</span></button></aside><main class="main"><header class="topbar"><div class="breadcrumb">我的空间 <span>/</span><strong>${names[page]}</strong></div><div class="mobile-brand"><img src="./icon.svg" alt="">WearWise</div><div class="top-right"><span class="date">${new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'long',day:'numeric',weekday:'long'}).format(new Date())}</span><button class="local-label sync-status" data-action="refresh" aria-label="刷新数据" ${loading?'disabled':''}><i class="local-dot"></i>${loading?'更新中…':'已发布 · 刷新'}</button><div class="avatar" aria-label="个人衣橱">我</div></div></header><div class="content"><div class="publication"><span>更新于 ${esc(date(snapshot.publishedAt))}</span><span title="${esc(snapshot.version)}">版本 ${esc(snapshot.version.slice(0,8))}</span></div>${snapshot.example?`<div class="demo-banner">${icon('info',15)}<span>当前是虚构示例衣橱，展示内容并非你的真实衣物。</span></div>`:''}<p id="refresh-error" role="status"></p>${({wardrobe:wardrobePage,insights:insightsPage,shopping:shoppingPage,information:informationPage})[page]()}<div class="footer-note">WearWise · 好好穿衣，慢慢添置</div></div></main></div>`;
  document.title=`WearWise · ${names[page]}`;
}
function detail(id){
  const item=items.find(i=>i.id===id);if(!item)return;
  detailId=id;
  const props={fabric:'面料成分',care:'洗护方式',seasons:'适用季节',subcategory:'细分类',brand:'品牌',size:'尺码 / 合身',thickness:'厚薄',usage:'使用情况'};
  const selected=filteredItems(),index=selected.findIndex(i=>i.id===id);
  dialog.innerHTML=`<div class="modal-header"><div><h2>衣物档案</h2></div><button class="modal-close" data-action="close-detail" aria-label="关闭衣物详情">${icon('close',21)}</button></div><div class="modal-content"><div class="modal-body">${recordHero(item)}<div class="detail-properties">${Object.entries(props).filter(([key])=>snapshot.fields.includes(key)).map(([key,label])=>`<div class="property"><small>${label}</small><span>${esc((Array.isArray(item[key])?item[key].join(' / '):item[key])||'未填写')}</span></div>`).join('')}</div></div><div class="modal-footer"><button class="btn small" data-action="detail-prev" ${index<=0?'disabled':''}>← 上一件</button><span class="subtle">${index+1} / ${selected.length}</span><button class="btn small" data-action="detail-next" ${index<0||index>=selected.length-1?'disabled':''}>下一件 →</button></div></div>`;
  if(!dialog.open)dialog.showModal();dialog.querySelector('.modal-content').scrollTop=0;
}
async function load(){
  if(loading)return;loading=true;if(snapshot)render();
  try{
    const url=new URL('./wardrobe.json',location.href);url.searchParams.set('refresh',Date.now());
    const response=await fetch(url,{cache:'no-store',credentials:'omit'});
    if(!response.ok)throw new Error(response.status===404?'尚未发布衣橱，请先在电脑上完成发布。':'暂时无法读取衣橱，请稍后刷新。');
    const next=validatePublicSnapshot(await response.json());shopping=undefined;unlockEpoch++;snapshot=next;items=next.items.map(item=>({...item,status:'在用'}));loading=false;render();if(dialog.open)dialog.close();dialog.innerHTML='';
  }catch(error){
    loading=false;
    if(snapshot){render();document.querySelector('#refresh-error').textContent='刷新失败，仍显示本次已读取的版本。请检查网络后重试。';}
    else root.innerHTML=`<main class="boot">暂时无法打开衣橱<span>${esc(error.message)}</span><button class="btn primary" data-action="refresh">重新读取</button></main>`;
  }
}
function navigate(next){page=next;if(location.hash.slice(1)!==next)location.hash=next;else render();}
function action(e){
  const nav=e.target.closest('[data-nav]');if(nav)return navigate(nav.dataset.nav);
  const target=e.target.closest('[data-action]');if(!target)return;
  const {action,id=''}=target.dataset;
  if(action==='refresh')return void load();
  if(action==='shopping-lock')return lockShopping();
  if(shopping&&action==='candidate-status'){candidateStatus=id;return render();}
  if(shopping&&['evaluate','candidate-detail'].includes(action))return shoppingDetail(id,action==='evaluate');
  if(action==='category'){filters.category=id;filters.subcategory='';return render();}
  if(action==='subcategory'){filters.subcategory=id;return render();}
  if(action==='clear-filters'){filters=blankFilters();return render();}
  if(action==='toggle-filters'){showFilters=!showFilters;return render();}
  if(action==='sort-category'){sortByCategory=!sortByCategory;return render();}
  if(action==='view-grid'||action==='view-list'){listView=action==='view-list';return render();}
  if(action==='stat-filter'){if(id==='overview')return navigate('insights');filters.usage=id;return render();}
  if(action==='insight-filter'){
    filters=blankFilters();const key=target.dataset.key;
    filters[key]=key==='subcategory'&&id===UNFILLED?'__unclassified':id;
    if(key==='subcategory')filters.category=target.dataset.category;
    showFilters=true;return navigate('wardrobe');
  }
  if(action==='item-detail')return detail(id);
  if(action==='close-detail')return dialog.close();
  if(action==='detail-prev'||action==='detail-next'){const selected=filteredItems(),index=selected.findIndex(i=>i.id===detailId),item=selected[index+(action==='detail-prev'?-1:1)];if(item)detail(item.id);}
}
root.addEventListener('input',e=>{if(e.target.id==='wardrobe-search'){filters.search=e.target.value;document.querySelector('#wardrobe-content').innerHTML=wardrobeList();document.querySelector('#result-count').textContent=`${filteredItems().length} 件单品`;}});
root.addEventListener('change',e=>{if(e.target.dataset.filter){filters[e.target.dataset.filter]=e.target.value;render();}});
root.addEventListener('click',action);dialog.addEventListener('click',action);
root.addEventListener('submit',async e=>{
  if(e.target.id!=='shopping-unlock')return;e.preventDefault();if(unlocking)return;
  const form=e.target,button=form.querySelector('button'),message=form.querySelector('#shopping-error'),version=snapshot.version,epoch=unlockEpoch;
  const password=String(new FormData(form).get('password')||'');unlocking=true;button.disabled=true;message.textContent='正在解锁…';
  try{const next=await decryptShopping(snapshot.shopping,password,version);if(epoch!==unlockEpoch||snapshot.version!==version)return;shopping=next;form.reset();render();}
  catch(error){message.textContent=error.message;}finally{unlocking=false;button.disabled=false;}
});
window.addEventListener('hashchange',()=>{page=location.hash.slice(1)||'wardrobe';if(snapshot)render();});
void load();
