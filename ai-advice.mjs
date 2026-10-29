// Explicit private AI-result schema. This module is shared by editor and reader.
const fail=()=>{throw new Error('AI建议数据格式无效');};
const text=(v,n,empty=false)=>typeof v==='string'&&v.length<=n&&(empty||v.length)?v:fail();
const list=(v,n,fn)=>Array.isArray(v)&&v.length<=n?v.map(fn):fail();
const integer=(v,n)=>Number.isSafeInteger(v)&&v>=0&&v<=n?v:fail();
export function normalizeAiAdvice(value){
  if(!value||typeof value!=='object'||!value.product||!value.advice)fail();
  const id=text(value.id,100);if(!/^[a-zA-Z0-9_-]+$/.test(id))fail();
  const at=text(value.at,50);if(!Number.isFinite(Date.parse(at)))fail();
  const p=value.product,a=value.advice;let url;try{url=new URL(p.url);}catch{fail();}
  if(url.protocol!=='https:'||url.username||url.password||url.port||!['item.taobao.com','detail.tmall.com'].includes(url.hostname)||url.pathname!=='/item.htm'||!/^\d+$/.test(url.searchParams.get('id')||''))fail();
  const safeUrl=new URL(url.origin+'/item.htm');safeUrl.searchParams.set('id',url.searchParams.get('id'));if(/^\d+$/.test(url.searchParams.get('skuId')||''))safeUrl.searchParams.set('skuId',url.searchParams.get('skuId'));
  if(!['推荐考虑','暂不建议','信息不足'].includes(a.verdict))fail();
  const product={url:safeUrl.href,title:text(p.title,300),variant:text(p.variant||'',500,true),skuVerified:p.skuVerified===true};
  if(p.selectedOptions!==undefined){product.selectedOptions=list(p.selectedOptions,8,o=>({group:text(o.group,60),label:text(o.label,120)}));product.selectionVerified=p.selectionVerified===true;}
  const advice={verdict:a.verdict,summary:text(a.summary,2500),reasons:list(a.reasons,8,s=>text(s,2500)),missing:list(a.missing,8,s=>text(s,2500)),combos:list(a.combos,3,c=>{
    const ids=list(c.ids,5,id=>text(id,500)),names=list(c.names,5,name=>text(name,500,true));if(!ids.length||ids.length!==names.length||new Set(ids).size!==ids.length)fail();
    return {ids,names,reason:text(c.reason,2500)};
  })};
  return {id,at,model:text(value.model,100),promptVersion:text(value.promptVersion||'未记录',100),source:'DeepSeek API · 已保存建议',contextRevision:Number.isSafeInteger(value.contextRevision)?value.contextRevision:null,count:integer(value.count,5000),product,advice};
}
export function normalizeAiAdviceList(value){
  const records=list(value,30,normalizeAiAdvice);if(new Set(records.map(r=>r.id)).size!==records.length)fail();return records;
}
export function attachAiAdvice(state,value){
  const record=normalizeAiAdvice(value),items=new Map(state.items.filter(i=>i.status==='在用'&&i.match!==false).map(i=>[i.id,i]));
  if(record.advice.combos.some(c=>c.ids.some(id=>!items.has(id))))throw new Error('建议引用不属于这份已发布衣柜，请先更新衣柜再发布');
  const records=normalizeAiAdviceList(state.aiAdvice||[]),existing=records.find(r=>r.id===record.id);
  if(existing&&JSON.stringify(existing)!==JSON.stringify(record))throw new Error('同一建议编号的内容发生冲突');
  return {...structuredClone(state),aiAdvice:existing?records:[...records,record].slice(-30)};
}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function aiAdviceView(state){
  const records=normalizeAiAdviceList(state.aiAdvice||[]);if(!records.length)return '';
  const current=new Set(state.items.filter(i=>i.status==='在用'&&i.match!==false).map(i=>i.id));
  return `<section aria-label="已保存的AI建议" class="space-below"><div class="section-heading"><h2>AI购衣建议 <span>${records.length} 条</span></h2><span class="subtle">电脑生成 · 发布时保存</span></div>${[...records].reverse().map(r=>`<article class="panel space-below"><div class="eyebrow">${esc(r.source)} · ${esc(new Date(r.at).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false}))}</div><h3>${esc(r.product.title)}</h3><div class="verdict ${r.advice.verdict==='暂不建议'?'negative':r.advice.verdict==='信息不足'?'caution':''}"><strong>${esc(r.advice.verdict)}</strong><p>${esc(r.advice.summary)}</p></div><p class="hint">根据生成时的 ${r.count} 件在用衣物提供参考。商品或衣柜变化后，这份历史建议不会自动更新。</p>${r.product.selectedOptions?.length?`<p>生成时选中：${r.product.selectedOptions.map(o=>esc(o.group+' '+o.label)).join(' / ')}</p>`:''}<h4>建议依据</h4><ul class="reference-list">${r.advice.reasons.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><h4>已有衣物搭配</h4>${r.advice.combos.length?r.advice.combos.map(c=>`<div class="note-box"><strong>${c.names.map((name,i)=>esc(name||'未命名衣物')+(current.has(c.ids[i])?'':'（当前未参与搭配）')).join(' ＋ ')}</strong><p>${esc(c.reason)}</p></div>`).join(''):'<p>未提供可验证的搭配。</p>'}${r.advice.missing.length?`<h4>买前仍需确认</h4><ul class="reference-list">${r.advice.missing.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:''}<p class="hint">${r.product.skuVerified?'':'SKU对应关系未独立验证；'}展示价不保证为结算价。性能描述来自商家，未做实物测试。</p></article>`).join('')}</section>`;
}
