import {seasonList} from './core.mjs';
import {garmentKind} from './garment-art.mjs';

export const PUBLIC_FIELDS=Object.freeze({
  id:'记录编号',name:'名称',category:'一级品类',subcategory:'二级品类',color:'颜色',
  fabric:'面料',fit:'版型',seasons:'季节',usage:'使用情况',previewKind:'预览图款式',
});
export const OPTIONAL_FIELDS=Object.freeze({brand:'品牌',size:'尺码',scenes:'场景',care:'洗护',thickness:'厚度'});
const text=value=>typeof value==='string'?value.trim().slice(0,500):'';
export const snapshotContent=snapshot=>JSON.stringify({example:snapshot.example,fields:snapshot.fields,items:snapshot.items});

// Construct from an allowlist. Never spread a private record into a public one.
export function createPublicSnapshot(source,{fields=[],publishedAt=new Date().toISOString(),version=globalThis.crypto.randomUUID()}={}){
  if(!source||!Array.isArray(source.items))throw new Error('没有可发布的衣橱');
  if(!Array.isArray(fields)||fields.some(f=>!Object.hasOwn(OPTIONAL_FIELDS,f)))throw new Error('公开字段无效');
  if(!Number.isFinite(Date.parse(publishedAt))||!text(version))throw new Error('发布版本无效');
  const optional=Object.keys(OPTIONAL_FIELDS).filter(f=>fields.includes(f));
  const items=source.items.filter(i=>i.status==='在用').sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||''))).map(i=>{
    const result={};
    for(const key of Object.keys(PUBLIC_FIELDS))result[key]=key==='seasons'?seasonList(i):text(i[key]);
    result.previewKind=garmentKind(i);
    if(!result.id||!result.name)throw new Error('在用衣物缺少编号或名称，请先补全');
    for(const key of optional)result[key]=key==='scenes'?[...new Set((Array.isArray(i.scenes)?i.scenes:[]).map(text).filter(Boolean))].slice(0,30):text(i[key]);
    return result;
  });
  if(new Set(items.map(i=>i.id)).size!==items.length)throw new Error('衣物编号重复，不能发布');
  return {format:'wearwise-public',schemaVersion:1,version:text(version),publishedAt:new Date(publishedAt).toISOString(),example:source.demo===true,fields:[...Object.keys(PUBLIC_FIELDS),...optional],items};
}

export function validatePublicSnapshot(value){
  if(!value||value.format!=='wearwise-public'||value.schemaVersion!==1||!Array.isArray(value.items)||value.items.length>10000||!Array.isArray(value.fields)||typeof value.example!=='boolean')throw new Error('查询快照格式无效');
  const reconstructed=createPublicSnapshot({demo:value.example,items:value.items.map(i=>({...i,status:'在用'}))},{fields:value.fields.filter(f=>Object.hasOwn(OPTIONAL_FIELDS,f)),publishedAt:value.publishedAt,version:value.version});
  // Reject unexpected/private fields, even when called independently of the editor.
  const canonical=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
  if(canonical(value)!==canonical(reconstructed))throw new Error('快照包含未允许的字段或无效值，请重新生成');
  return reconstructed;
}
