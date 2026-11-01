const KEY='wearwise-computer-connection-v1';
let pairingProblem='';
export function connectionProblem(){return pairingProblem;}
export function validateConnection(value){
  let url;try{url=new URL(value?.origin);}catch{throw Error('电脑连接地址无效');}
  if(url.protocol!=='https:'||url.port||url.username||url.password||!url.hostname.endsWith('.ts.net')||url.pathname!=='/'||url.search||url.hash||!/^[A-Za-z0-9_-]{43}$/.test(value?.token||''))throw Error('请使用电脑准备页生成的网站配对码');
  return {origin:url.origin,token:value.token};
}
export function readConnection(){try{const value=localStorage.getItem(KEY);return value?validateConnection(JSON.parse(value)):null;}catch{return null;}}
export function saveConnection(value){const clean=validateConnection(value),encoded=JSON.stringify(clean);try{localStorage.setItem(KEY,encoded);if(localStorage.getItem(KEY)!==encoded)throw Error('not saved');}catch{throw Error('浏览器未能保存配对：请在Safari普通标签页打开网站，允许保存网站数据，再粘贴完整配对链接');}pairingProblem='';return clean;}
export function clearConnection(){localStorage.removeItem(KEY);}
export function connectFromFragment(){
  const values=new URLSearchParams(location.hash.slice(1));if(!values.has('pair'))return false;
  try{saveConnection({origin:values.get('pair'),token:values.get('access')});return true;}finally{history.replaceState(null,'',location.pathname+location.search+'#shopping');}
}
export async function computerAPI(path,body,{fetcher=(...args)=>globalThis.fetch(...args),signal}={}){
  const c=readConnection();if(!c)throw Error('首次请用手机扫描电脑准备页的“网站配对”二维码');
  if(!/^\/api\/(wardrobe|app-status|ai-status|product-jobs(?:\/[a-f0-9-]{36})?|advice-jobs(?:\/[a-f0-9-]{36})?)$/i.test(path))throw Error('此网站不开放电脑管理操作');
  let response;try{response=await fetcher(c.origin+path,{method:body?'POST':'GET',mode:'cors',credentials:'omit',cache:'no-store',signal:signal||AbortSignal.timeout(12000),headers:{'X-WearWise-Network':c.token,...body?{'Content-Type':'application/json'}:{}},...body?{body:JSON.stringify(body)}:{}});}catch{throw Error('未连到电脑：请保持电脑服务及两端Tailscale连接；若浏览器询问本地网络访问，请允许本网站连接电脑');}
  const value=await response.json();if(!response.ok)throw Error(response.status===401?'电脑配对已失效，请重新扫描网站配对码':value.error||'电脑服务暂不可用');return value;
}
export function acceptPairingFragment(){
  if(!new URLSearchParams(location.hash.slice(1)).has('pair'))return false;
  try{connectFromFragment();}catch(e){pairingProblem=e.message;history.replaceState(null,'',location.pathname+location.search+'#information');}
  if(typeof window!=='undefined')window.dispatchEvent(new Event('wearwise-connection-change'));
  return true;
}
if(typeof location!=='undefined'&&typeof history!=='undefined'){
  acceptPairingFragment();
  if(typeof window!=='undefined')window.addEventListener('hashchange',acceptPairingFragment);
}
