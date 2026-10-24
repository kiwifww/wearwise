import {emptyState,validateBackup,seasonList} from './core.mjs';
import {garmentKind} from './garment-art.mjs';
const ITERATIONS=600000,encoder=new TextEncoder();
const base64=bytes=>{let text='';for(const byte of bytes)text+=String.fromCharCode(byte);return btoa(text);};
const bytes=text=>Uint8Array.from(atob(text),c=>c.charCodeAt(0));
const canonical=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);

export function shoppingState(source){
  const original=validateBackup(source),result=emptyState();
  result.demo=original.demo===true;result.revision=original.revision||0;
  const keys=['id','name','category','subcategory','color','fabric','fit','style','styleTags','usage','brand','size','scenes','care','thickness','match','status','condition','createdAt','updatedAt'];
  const record=(item,candidate=false)=>{
    const value=Object.fromEntries(keys.filter(k=>Object.hasOwn(item,k)).map(k=>[k,structuredClone(item[k])]));
    Object.assign(value,{seasons:seasonList(item),season:seasonList(item).join(' / ')||'未填写',previewKind:garmentKind(item),photos:[],feedback:structuredClone(item.feedback||[]),notes:candidate?String(item.notes||''):'',location:''});
    if(candidate)for(const key of ['price','currency','planId','ownedId','url'])if(Object.hasOwn(item,key))value[key]=item[key];
    return value;
  };
  result.items=original.items.map(i=>record(i));result.candidates=original.candidates.map(i=>record(i,true));
  const planKeys=['id','title','status','budget','scene','season','category','subcategory','purpose','currency','priority','reason','completeness','createdAt','updatedAt'];
  result.plans=original.plans.map(p=>Object.fromEntries(planKeys.filter(k=>Object.hasOwn(p,k)).map(k=>[k,p[k]])));
  result.prefs=Object.fromEntries(Object.keys(result.prefs).map(k=>[k,structuredClone(original.prefs[k]??result.prefs[k])]));
  return validateBackup(result);
}
export function validateShoppingEnvelope(value){
  if(!value||value.format!=='wearwise-shopping-encrypted'||value.schemaVersion!==1||value.algorithm!=='AES-GCM'||value.kdf!=='PBKDF2-SHA256'||value.iterations!==ITERATIONS||typeof value.publicationVersion!=='string'||!value.publicationVersion||value.publicationVersion.length>500)throw new Error('购衣页加密数据格式无效');
  const keys=['format','schemaVersion','algorithm','kdf','iterations','publicationVersion','salt','iv','ciphertext'];
  if(Object.keys(value).length!==keys.length||Object.keys(value).some(k=>!keys.includes(k)))throw new Error('加密数据包含未允许字段');
  for(const field of ['salt','iv','ciphertext'])if(typeof value[field]!=='string'||value[field].length>6*1024*1024||!/^[A-Za-z0-9+/]+={0,2}$/.test(value[field]))throw new Error('加密数据内容无效');
  if(bytes(value.salt).length!==16||bytes(value.iv).length!==12||bytes(value.ciphertext).length<17)throw new Error('加密数据长度无效');
  return structuredClone(value);
}
async function key(password,salt,usages){
  if(typeof password!=='string'||password.length<4||password.length>256)throw new Error('密码请使用4至256位字符');
  const material=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,usages);
}
async function seal(value,password,publicationVersion){
  const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode('WearWise shopping v1|'+publicationVersion),tagLength:128},await key(password,salt,['encrypt']),encoder.encode(JSON.stringify(value)));
  return {format:'wearwise-shopping-encrypted',schemaVersion:1,algorithm:'AES-GCM',kdf:'PBKDF2-SHA256',iterations:ITERATIONS,publicationVersion,salt:base64(salt),iv:base64(iv),ciphertext:base64(new Uint8Array(cipher))};
}
async function unseal(envelope,password,expectedVersion){
  const value=validateShoppingEnvelope(envelope);
  if(value.publicationVersion!==expectedVersion)throw new Error('购衣数据与衣橱版本不一致，请刷新后重新解锁');
  try{
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(value.iv),additionalData:encoder.encode('WearWise shopping v1|'+expectedVersion),tagLength:128},await key(password,bytes(value.salt),['decrypt']),bytes(value.ciphertext));
    return JSON.parse(new TextDecoder().decode(plain));
  }catch{throw new Error('密码不正确，或加密数据已损坏');}
}
export async function encryptShopping(source,password,version){return seal(shoppingState(source),password,version);}
export async function decryptShopping(envelope,password,version){
  const plain=await unseal(envelope,password,version),safe=shoppingState(plain);
  if(canonical(plain)!==canonical(safe))throw new Error('购衣页内容不符合数据范围');
  return safe;
}
export async function passwordCheck(password){return seal({check:'wearwise-shopping-password'},password,'local-password-check');}
export async function verifyPassword(check,password){const value=await unseal(check,password,'local-password-check');if(value.check!=='wearwise-shopping-password')throw new Error('密码验证失败');return true;}
