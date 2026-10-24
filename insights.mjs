import { active, seasonList, SEASONS, SCENES } from './core.mjs';

export const UNFILLED='__unfilled';
export function wardrobeInsights(items){
  const all=active(items);
  const count=key=>{
    const totals=new Map();
    for(const item of all){const value=item[key]?.trim()||UNFILLED;totals.set(value,(totals.get(value)||0)+1);}
    return [...totals].map(([value,n])=>({value,label:value===UNFILLED?'未填写':value,n})).sort((a,b)=>b.n-a.n||a.label.localeCompare(b.label,'zh-CN'));
  };
  const categories=count('category');
  const subcategories=categories.map(c=>{
    const totals=new Map();
    for(const item of all.filter(i=>(i.category||UNFILLED)===c.value)){
      const value=item.subcategory||UNFILLED;totals.set(value,(totals.get(value)||0)+1);
    }
    return {...c,rows:[...totals].map(([value,n])=>({value,label:value===UNFILLED?'未分类':value,n})).sort((a,b)=>b.n-a.n)};
  });
  const multi=(labels,getValues)=>{
    const rows=labels.map(value=>({value,label:value,n:all.filter(i=>getValues(i).includes(value)).length}));
    const missing=all.filter(i=>!getValues(i).length).length;
    if(missing)rows.push({value:UNFILLED,label:'未填写',n:missing});
    return rows;
  };
  return {total:all.length,categories,subcategories,brands:count('brand'),colors:count('color'),usages:count('usage'),
    seasons:multi(SEASONS,seasonList),
    scenes:multi([...new Set([...SCENES,...all.flatMap(i=>i.scenes||[])])],i=>i.scenes||[])};
}
