export const CATEGORY_TREE = {
  '上装':['T恤','衬衫','背心','针织衫','开衫','卫衣','薄外套','厚外套','西装','其他上装'],
  '下装':['牛仔裤','休闲裤','西裤','运动裤','工装裤','短裤','半身裙','其他下装'],
  '连衣裙/连体装':['连衣裙','连体裤','其他连体装'],
  '鞋':['运动鞋','休闲鞋','乐福鞋','皮鞋','靴子','凉鞋','拖鞋','其他鞋'],
  '配饰':['包','帽子','围巾','腰带','其他配饰']
};
export const CATEGORIES = Object.keys(CATEGORY_TREE);
export const COLORS = { '未知':'#c9cac6', '白色':'#f6f3ea', '米白':'#e8dfcd', '黑色':'#333532', '灰色':'#9d9f9a', '深蓝':'#3c526b', '蓝色':'#8eaec2', '棕色':'#98745b', '卡其':'#b8a583', '绿色':'#82927b', '粉色':'#d2a7a8', '红色':'#ac554c', '橙色':'#d78c52', '紫色':'#a193b4', '黄色':'#d8bd70' };
export const SCENES = ['日常', '通勤', '正式', '运动', '旅行'];
export const SEASONS = ['春季', '夏季', '秋季', '冬季'];
export const USAGES = ['未填写', '常穿', '偶尔穿', '闲置'];
export const stamp = () => new Date().toISOString();
export const uid = () => globalThis.crypto.randomUUID();
export const active = items => items.filter(x => x.status === '在用');
export const eligible = items => active(items).filter(x => x.match !== false);
export const emptyState = () => ({ schemaVersion:2, demo:false, revision:0, items:[], candidates:[], plans:[], prefs:{ scenes:['日常'], budget:'', currency:'CNY', likedColors:[], avoidedColors:[], noDryClean:false, pureCotton:false, notes:'' } });
export function seasonList(item) {
  if(Array.isArray(item.seasons))return SEASONS.filter(s=>item.seasons.includes(s));
  if(item.season==='四季')return [...SEASONS];
  return SEASONS.filter(s=>typeof item.season==='string'&&item.season.includes(s));
}
export const seasonLabel = item => seasonList(item).join(' / ')||'未填写';
export const categoryRole = item => item.category==='外套'||item.category==='上装'&&['外套','薄外套','厚外套','开衫','西装'].includes(item.subcategory)?'外套':item.category;
export function normalizeItem(item) {
  const r={...item};
  if(r.category==='外套'){r.category='上装';r.subcategory='外套';}
  if(!r.subcategory){
    const inferred={'shirt':'衬衫','tee':'T恤','knit':'针织衫','jeans':'牛仔裤','trousers':r.name?.includes('西裤')?'西裤':'休闲裤','coat':'外套','jacket':'外套','sneakers':'运动鞋','loafers':'乐福鞋','dress':'连衣裙','bag':'包'}[r.illustration];
    r.subcategory=CATEGORY_TREE[r.category]?.includes(inferred)||r.category==='上装'&&inferred==='外套'?inferred:'';
  }
  r.seasons=seasonList(r);r.season=seasonLabel(r);
  if(r.location&&!['主','次'].includes(r.location)){
    r.legacyLocation=r.location;
    r.location=/^主/.test(r.location)?'主':/^次/.test(r.location)?'次':'';
  }
  return r;
}
export function migrateState(value) {
  const next=structuredClone(value);
  next.items=next.items.map(normalizeItem);next.candidates=next.candidates.map(normalizeItem);
  for(const p of next.plans)if(p.category==='外套'){p.category='上装';p.subcategory='外套';}
  next.schemaVersion=2;return next;
}
export function itemRecord(o = {}) {
  const result = { id:uid(), name:'', category:'', subcategory:'', color:'未知', fit:'常规', style:'', fabric:'', care:'可机洗', thickness:'未知', scenes:[], season:'未填写', size:'', brand:'', price:'', currency:'CNY', location:'主', usage:'常穿', condition:'未填写', status:'在用', match:true, photos:[], notes:'', feedback:[], createdAt:stamp(), updatedAt:stamp(), ...o };
  result.name ||= [result.color === '未知' ? '' : result.color, result.category || '未命名单品'].filter(Boolean).join('');
  return normalizeItem(result);
}
export function demoState() {
  const s = emptyState(); s.demo = true;
  const seedAt=stamp();
  const rows = [
    ['米白色棉质衬衫','上装','米白','宽松 · 简约','100%棉',['日常','通勤'],'春季','常穿','shirt'],
    ['深蓝直筒牛仔裤','下装','深蓝','直筒 · 休闲','棉98% 氨纶2%',['日常','通勤','旅行'],'四季','常穿','jeans'],
    ['轻薄卡其风衣','外套','卡其','中长款 · 简约','棉60% 聚酯纤维40%',['通勤','日常'],'秋季','常穿','coat'],
    ['白色低帮运动鞋','鞋','白色','休闲 · 低帮','织物鞋面',['日常','旅行'],'四季','常穿','sneakers'],
    ['灰色圆领针织衫','上装','灰色','常规版 · 简约','羊毛30% 腈纶70%',['通勤','日常'],'秋季','偶尔穿','knit'],
    ['黑色直筒西裤','下装','黑色','直筒 · 商务','聚酯纤维80% 粘胶20%',['通勤','正式'],'春季','常穿','trousers'],
    ['橄榄绿工装外套','外套','绿色','宽松 · 工装','100%棉',['日常','旅行'],'秋季','偶尔穿','jacket'],
    ['浅蓝色牛津衬衫','上装','蓝色','常规版 · 简约','100%棉',['通勤','日常'],'春季','常穿','shirt'],
    ['棕色皮革乐福鞋','鞋','棕色','简约 · 低帮','牛皮',['通勤','正式'],'四季','偶尔穿','loafers'],
    ['米白色休闲长裤','下装','米白','宽松 · 休闲','棉70% 亚麻30%',['日常','旅行'],'夏季','偶尔穿','trousers'],
    ['黑色基础圆领 T 恤','上装','黑色','常规版 · 休闲','100%棉',['日常','旅行'],'夏季','常穿','tee'],
    ['粉色短袖针织衫','上装','粉色','修身 · 简约','粘胶70% 锦纶30%',['日常'],'夏季','闲置','knit']
  ];
  s.items = rows.map((r,i)=>itemRecord({id:`demo-${i+1}`,name:r[0],category:r[1],color:r[2],style:r[3],fabric:r[4],scenes:r[5],season:r[6],usage:r[7],illustration:r[8],location:i<8?'主卧衣柜':'换季收纳箱',condition:i===5?'有磨损':'完好',care:i===4?'仅干洗':'可水洗',price:[299,399,899,499,359,399,599,299,699,329,129,259][i],match:i!==11,createdAt:seedAt,updatedAt:seedAt,feedback:i===11?[{id:uid(),text:'肩部偏紧，穿着不够自在。',date:stamp()}]:[]}));
  const plan = { id:uid(), title:'秋季通勤长裤', scene:'通勤', season:'秋季', category:'下装', purpose:'替换磨损衣物', budget:500,currency:'CNY',priority:'优先考虑',status:'计划中',completeness:'不确定',reason:'现有黑色西裤有磨损，想找一条方便日常打理的替换。',createdAt:stamp(),updatedAt:stamp(),history:[] };
  s.plans=[plan];
  s.candidates=[itemRecord({id:'candidate-1',name:'深灰直筒通勤长裤',category:'下装',color:'灰色',style:'直筒 · 简约',fabric:'聚酯纤维65% 粘胶32% 氨纶3%',care:'可水洗',scenes:['通勤'],season:'秋季',price:429,status:'考虑中',planId:plan.id,illustration:'trousers',history:[]}),itemRecord({id:'candidate-2',name:'米白色宽松衬衫',category:'上装',color:'米白',style:'宽松 · 简约',fabric:'100%棉',care:'可水洗',scenes:['日常','通勤'],price:369,status:'考虑中',illustration:'shirt',history:[]})];
  return s;
}
function sceneFit(item, scene) { return !scene || !item.scenes?.length || item.scenes.includes(scene); }
function colorReason(a,b) {
  if (a==='未知'||b==='未知') return '颜色信息未齐，建议确认实物颜色后试搭';
  if (a===b) return '同色系组合，可以通过材质和深浅区分层次';
  if (['黑色','白色','米白','灰色','卡其'].includes(a)||['黑色','白色','米白','灰色','卡其'].includes(b)) return '其中包含中性色，可先尝试组合，实物效果仍需确认';
  return '颜色组合需要试搭确认，可先检查明暗与饱和度是否协调';
}
export function combinations(candidate, items, scene='') {
  const wardrobe=eligible(items).filter(x=>sceneFit(x,scene));
  const map={'上装':['下装','鞋'],'下装':['上装','鞋'],'连衣裙/连体装':['鞋','外套'],'外套':['上装','下装','鞋'],'鞋':['上装','下装'],'配饰':['上装','下装']};
  const types=map[categoryRole(candidate)]||[];
  const pools=types.map(type=>wardrobe.filter(i=>categoryRole(i)===type).sort((a,b)=>Number(b.scenes.includes(scene))-Number(a.scenes.includes(scene))));
  const first=pools.findIndex(p=>p.length); if(first<0) return [];
  return pools[first].slice(0,3).map(primary=>{
    const selected=pools.map((p,i)=>i===first?primary:p[0]).filter(Boolean);
    return { ids:selected.map(i=>i.id), names:selected.map(i=>i.name), partial:types.some((_,i)=>!pools[i].length), reason:colorReason(candidate.color,primary.color)+(selected.some(x=>!x.scenes.length)?'；部分衣物场景尚未填写':'') };
  });
}
function cottonStatus(fabric) {
  if (!fabric) return 'unknown';
  if (/纯棉|全棉|(?:100\s*%\s*棉)|(?:棉\s*100\s*%)/i.test(fabric) && !/(?:聚酯|氨纶|锦纶|羊毛|亚麻|粘胶|腈纶)/.test(fabric)) return 'yes';
  if (/(混纺|聚酯|氨纶|锦纶|羊毛|亚麻|粘胶|腈纶)/.test(fabric)) return 'no';
  return 'unknown';
}
export function evaluate(candidate, state, context={}) {
  const prefs={...state.prefs,...context}; const scene=Object.hasOwn(context,'scene')?context.scene:candidate.scenes?.[0]||state.prefs.scenes?.[0]||'';
  const constraints=[], missing=[];
  if(prefs.noDryClean) { if(candidate.care==='仅干洗') constraints.push('已确认仅可干洗，与你“不接受干洗”的要求冲突'); else if(!candidate.care||candidate.care==='未知') missing.push('确认洗护方式是否需要干洗'); }
  if(prefs.pureCotton) { const cotton=cottonStatus(candidate.fabric); if(cotton==='no') constraints.push('已知成分并非纯棉，与你“只考虑纯棉”的要求冲突'); else if(cotton==='unknown') missing.push('查看完整吊牌成分，确认是否为纯棉'); }
  if(prefs.budget!==''&&prefs.budget!=null&&candidate.price!==''&&candidate.price!=null&&candidate.currency===prefs.currency&&Number(candidate.price)>Number(prefs.budget)) constraints.push(`已知价格 ${candidate.price} ${candidate.currency} 超出本次预算 ${prefs.budget} ${prefs.currency}`);
  if(!candidate.category) missing.push('补充品类后才能分析搭配');
  const combos=combinations(candidate,state.items,scene);
  const similar=active(state.items).filter(i=>categoryRole(i)===categoryRole(candidate)&&(!i.subcategory||!candidate.subcategory||i.subcategory===candidate.subcategory)&&i.color!=='未知'&&i.color===candidate.color).map(i=>({id:i.id,name:i.name,excluded:i.match===false,reason:`同属${i.subcategory||i.category}，主色均为${i.color}${i.fit&&candidate.fit&&i.fit===candidate.fit?'，版型标签也相同':''}`}));
  const feedback=active(state.items).filter(i=>(i.category===candidate.category||i.fabric&&candidate.fabric&&i.fabric===candidate.fabric)&&i.feedback?.length).flatMap(i=>i.feedback.map(f=>({id:i.id,name:i.name,text:f.text}))).slice(0,3);
  const incomplete=[]; if(!candidate.fabric) incomplete.push('面料成分'); if(candidate.color==='未知') incomplete.push('实际颜色'); if(!candidate.fit) incomplete.push('版型与试穿感受');
  const avoided=prefs.avoidedColors?.includes(candidate.color);
  const sceneMismatch=scene&&candidate.scenes?.length&&!candidate.scenes.includes(scene);
  let verdict='推荐考虑';
  if(constraints.length) verdict='暂不建议';
  else if(missing.length||!candidate.fabric&&candidate.color==='未知'&&!candidate.fit) verdict='信息不足';
  else if(similar.length||!combos.length||incomplete.length||avoided||sceneMismatch) verdict='有条件考虑';
  const summary=constraints[0]||missing[0]||(avoided?`你曾将${candidate.color}设为尽量避开的颜色，建议先确认本次是否仍然喜欢`:sceneMismatch?`已填场景未包含${scene}，建议确认本次用途`:similar.length?'已有用途可能接近的衣服，先比较版型、状态与替换需求':combos.length?`在当前已记录衣物中找到 ${combos.length} 组可试搭组合，购买前再确认试穿与洗护`:'当前没有足够的互补衣物资料，建议补充衣橱或确认用途');
  const dimensions=[
    {name:'面料',status:candidate.fabric?'已知成分':'信息不足',text:candidate.fabric?`记录成分：${candidate.fabric}。${candidate.care&&candidate.care!=='未知'?`洗护：${candidate.care}。`:''}厚薄、弹性和实际肤感仍需确认，成分不代表完整穿着体验。`:'尚未填写成分。建议查看吊牌；照片不能确认面料、保暖或耐用程度。'},
    {name:'颜色',status:candidate.color==='未知'?'信息不足':avoided?'偏好提醒':'可参考',text:candidate.color==='未知'?'请在自然光下确认主色，再和已有衣物比较。':`${candidate.color}。${avoided?'与你尽量避开的颜色一致。':combos.length?colorReason(candidate.color,state.items.find(i=>i.id===combos[0].ids[0])?.color||'未知'): '当前缺少可比较的互补衣物。'}照片光线可能影响颜色。`},
    {name:'款式',status:candidate.fit?'可参考':'信息不足',text:candidate.fit?`已填：${candidate.fit}。${similar.length?`有 ${similar.length} 件同品类、同主色衣物，需比较具体差别。`:'是否合身、活动是否方便，需要试穿确认。'}`:'未填写版型与试穿感受，暂不判断合身或比例效果。'},
    {name:'场景',status:sceneMismatch?'待确认':scene?'围绕用途':'信息不足',text:scene?`本次用途：${scene}。${sceneMismatch?'商品已填场景与本次用途不同，请确认。':'现有组合按已填场景匹配；未填场景的衣物需自行核实。'}${candidate.season&&candidate.season!=='未填写'?`季节标签：${candidate.season}。`:''}`:'未指定本次用途，建议先选择使用场景。'}
  ];
  if(prefs.budget!==''&&candidate.price!==''&&candidate.currency!==prefs.currency) incomplete.push('价格与预算币种不同，未判断是否超预算');
  return { id:uid(),at:stamp(),revision:state.revision,verdict,summary,dimensions,combos,similar,feedback,constraints,missing:[...missing,...incomplete.map(x=>`确认${x}`)],count:eligible(state.items).length,scene,source:'基础规则',candidateSnapshot:{name:candidate.name,color:candidate.color,category:candidate.category},context:{scene,budget:prefs.budget,currency:prefs.currency,noDryClean:prefs.noDryClean,pureCotton:prefs.pureCotton} };
}
export function direction(state, request) {
  if(!request.scene&&!request.title?.trim()) throw new Error('请先填写购买用途或选择使用场景');
  const pool=eligible(state.items).filter(i=>sceneFit(i,request.scene)&&(!request.season||request.season==='未填写'||seasonList(i).includes(request.season)||!seasonList(i).length));
  const known=pool.filter(i=>i.scenes.includes(request.scene));
  const hasOutfit=known.some(i=>categoryRole(i)==='上装')&&known.some(i=>categoryRole(i)==='下装')&&known.some(i=>i.category==='鞋')||known.some(i=>i.category==='连衣裙/连体装')&&known.some(i=>i.category==='鞋');
  const replacement=request.purpose==='替换磨损衣物';
  const category=request.category||(!pool.some(i=>i.category==='下装')?'下装':!pool.some(i=>i.category==='上装')?'上装':!pool.some(i=>i.category==='鞋')?'鞋':'上装');
  const complete=request.completeness==='已录全';
  const covered=hasOutfit&&!replacement&&!request.category&&request.purpose!=='尝试新风格';
  const same=pool.filter(i=>i.category===category);
  const actions=covered?['先用已记录的上装、下装或连衣裙与鞋试搭，确认场景和天气是否适用。','如果现有搭配够用，暂缓购买；发现具体问题后再更新需求。']:replacement?['先找出需要替换的旧衣，核对磨损、合身和使用频率。','按原有用途选一件替代候选，试穿并核对预算后再决定。']:same.length?[`先比较现有的 ${same.length} 件${category}，确认具体缺的是季节、用途还是版型。`,'能用现有衣物解决就暂缓购买；仍有明确差别再添加候选评估。']:['先确认相关衣物是否录全，核实实际缺口。','按下方条件选择候选，结合现有衣物试搭，再决定是否购买。'];
  const refs=pool.filter(i=>i.category!==category).slice(0,3).map(i=>({id:i.id,name:i.name}));
  return {at:stamp(),revision:state.revision,count:pool.length,covered,category,refs,actions,title:covered?'可以先穿好已有的':replacement?`优先核对需要替换的${category}`:same.length?`先比较已有的 ${same.length} 件${category}`:`先核实${category}是否需要补充`,reason:covered?'已记录的场景与季节标签中，有上装、下装与鞋（或连衣裙与鞋）可以先试搭。具体天气、合身和穿着状态仍需确认，不必急着新增。':replacement?'以你明确提出的替换用途为依据，先核对原衣物的磨损状态、实际需要和不满意之处。':same.length?`已有相关${category}记录，数量本身不代表够用或需要添置；先确认现有单品为何不能满足本次需求。`:`当前记录中可以进一步核对${category}是否需要补充；这只是围绕本次用途的可选方向。`,conditions:[`颜色：先尝试黑、米白、灰或与你现有单品接近的颜色，最终以个人喜好为准`, `款式：${request.scene==='正式'?'先确认着装要求，再比较简洁、合身的款式':'优先试穿活动方便的版型，结合现有单品比较'}`,`面料：核对成分、厚薄与洗护${state.prefs.noDryClean?'；避开仅干洗款':''}${state.prefs.pureCotton?'；确认纯棉成分':''}`,`预算：${request.budget!==''&&request.budget!=null?`将 ${request.budget} ${request.currency||'CNY'} 作为筛选上限，尚无商品价格可核对`:'未设定，不评价价格适合度'}`],limitation:complete?'分析仍只覆盖已记录的属性，不能保证实际需求已被完全覆盖。':'相关衣物未确认录全；请先核对是否已拥有相近单品，未记录不等于没有。',priority:replacement?'优先考虑':'按需考虑'};
}
export function purchase(state,candidateId) {
  const c=state.candidates.find(x=>x.id===candidateId); if(!c) throw new Error('未找到待购单品');
  const existing=state.items.find(x=>x.sourceCandidateId===candidateId); if(existing) return existing;
  const {history,planId,...fields}=c;
  const owned=itemRecord({...fields,id:uid(),status:'在用',sourceCandidateId:candidateId,usage:'常穿',feedback:[],createdAt:stamp(),updatedAt:stamp()});
  state.items.push(owned); c.status='已购买'; c.ownedId=owned.id; c.updatedAt=stamp(); return owned;
}
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
const text=x=>typeof x==='string';
const validAmount=x=>x===''||x==null||typeof x==='number'&&Number.isFinite(x)&&x>=0;
const strings=x=>Array.isArray(x)&&x.every(text);
function validHistory(h){
  return plain(h)&&text(h.id)&&text(h.at)&&text(h.verdict)&&text(h.summary)&&Array.isArray(h.dimensions)&&h.dimensions.every(d=>plain(d)&&text(d.name)&&text(d.status)&&text(d.text))&&Array.isArray(h.combos)&&h.combos.every(c=>plain(c)&&strings(c.ids)&&strings(c.names)&&c.ids.length===c.names.length&&text(c.reason))&&Array.isArray(h.similar)&&h.similar.every(s=>plain(s)&&text(s.id)&&text(s.name)&&text(s.reason))&&Array.isArray(h.feedback)&&h.feedback.every(f=>plain(f)&&text(f.id)&&text(f.name)&&text(f.text))&&strings(h.missing)&&plain(h.context)&&validAmount(h.context.budget)&&(!h.candidateSnapshot||plain(h.candidateSnapshot)&&text(h.candidateSnapshot.name)&&text(h.candidateSnapshot.color));
}
export function validateBackup(value) {
  if(!plain(value)||![1,2].includes(value.schemaVersion)||!Array.isArray(value.items)||!Array.isArray(value.candidates)||!Array.isArray(value.plans)||!plain(value.prefs)) throw new Error('备份格式或版本不受支持');
  if(value.items.length>5000||value.candidates.length>5000||value.plans.length>5000) throw new Error('备份记录数量超出范围');
  if(!Number.isSafeInteger(value.revision)||value.revision<0||typeof value.demo!=='boolean')throw new Error('备份元数据无效');
  const ids=new Set();
  for(const [group,list] of [['items',value.items],['candidates',value.candidates]]) for(const item of list) {
    if(!plain(item)||typeof item.id!=='string'||!item.id||ids.has(item.id)||typeof item.name!=='string'||![...CATEGORIES,...(value.schemaVersion===1?['外套']:[])].includes(item.category)&&!(item.status==='草稿'&&item.category==='')||!Object.hasOwn(COLORS,item.color)||!Array.isArray(item.scenes)||!Array.isArray(item.photos)||!Array.isArray(item.feedback)||!['在用','草稿','已移出', '考虑中','已购买','不再考虑'].includes(item.status)) throw new Error('衣物记录无效或存在重复标识');
    if(value.schemaVersion===2&&(!Array.isArray(item.seasons)||item.seasons.some(s=>!SEASONS.includes(s))||new Set(item.seasons).size!==item.seasons.length||typeof item.subcategory!=='string'||item.subcategory&&!CATEGORY_TREE[item.category]?.includes(item.subcategory)&&!(item.category==='上装'&&item.subcategory==='外套')||!['主','次',''].includes(item.location)))throw new Error('细分类、季节或收纳位置无效');
    if(item.fit!=null&&typeof item.fit!=='string'||item.styleTags!=null&&(!Array.isArray(item.styleTags)||!item.styleTags.every(s=>typeof s==='string')))throw new Error('版型或风格字段无效');
    if(group==='items'&&!['在用','草稿','已移出'].includes(item.status)||group==='candidates'&&!['考虑中','已购买','不再考虑'].includes(item.status)) throw new Error('衣物状态与记录类型不符');
    ids.add(item.id);
    if(!text(item.updatedAt)||!Number.isFinite(Date.parse(item.updatedAt))||!text(item.createdAt)||!Number.isFinite(Date.parse(item.createdAt)))throw new Error('记录时间无效');
    if(item.photos.length>3||item.photos.some(p=>typeof p!=='string'||p.length>10000000||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p))) throw new Error('图片格式无效');
    for(const key of ['style','fabric','care','thickness','season','size','brand','currency','location','usage','condition','notes','sourceCandidateId','planId','url','previewKind','originalName']) if(item[key]!=null&&typeof item[key]!=='string') throw new Error('衣物字段类型无效');
    if(item.scenes.some(s=>typeof s!=='string')||item.feedback.some(f=>!plain(f)||typeof f.id!=='string'||typeof f.text!=='string'||typeof f.date!=='string')) throw new Error('场景或反馈记录无效');
    if(!validAmount(item.price)) throw new Error('价格无效');
    if(item.history!=null&&(!Array.isArray(item.history)||!item.history.every(validHistory))) throw new Error('历史记录格式无效');
  }
  for(const p of value.plans) {
    if(!plain(p)||!text(p.id)||!p.id||ids.has(p.id)||!text(p.title)||!['计划中','已完成','已取消'].includes(p.status)||!validAmount(p.budget)) throw new Error('购衣计划记录无效');
    for(const key of ['scene','season','category','purpose','currency','priority','reason','createdAt','updatedAt','completeness'])if(p[key]!=null&&!text(p[key]))throw new Error('购衣计划字段无效');
    if(p.history!=null&&(!Array.isArray(p.history)||p.history.some(h=>!plain(h)||!text(h.at)||!text(h.title)||!Array.isArray(h.refs)||h.refs.some(r=>!plain(r)||!text(r.id)||!text(r.name)))))throw new Error('方向分析历史无效');
    ids.add(p.id);
  }
  if(!Array.isArray(value.prefs.scenes)||!Array.isArray(value.prefs.likedColors)||!Array.isArray(value.prefs.avoidedColors)) throw new Error('偏好格式无效');
  if(!strings(value.prefs.scenes)||!strings(value.prefs.likedColors)||!strings(value.prefs.avoidedColors)||!validAmount(value.prefs.budget)||!text(value.prefs.currency)||!text(value.prefs.notes)||typeof value.prefs.noDryClean!=='boolean'||typeof value.prefs.pureCotton!=='boolean')throw new Error('偏好字段无效');
  for(const c of value.candidates) if(c.planId&&!value.plans.some(p=>p.id===c.planId)) throw new Error('候选关联的购衣计划不存在');
  return migrateState(value);
}
