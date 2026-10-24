const garments=[
 {id:'cargo',name:'工装裤'},
 ...Object.entries({shirt:'衬衫',shortsweater:'短袖针织衫',sweater:'圆领针织衫',sweatshirt:'圆领卫衣',blazer:'西装',coat:'大衣',skirt:'半身裙',dress:'连衣裙',jumpsuit:'连体裤',sneakers:'运动鞋',loafers:'乐福鞋',boots:'靴子',sandals:'凉鞋',slippers:'拖鞋',bag:'包',hat:'帽子',scarf:'围巾',belt:'腰带',accessory:'配饰'}).map(([id,name])=>({id,name})),
 {id:'tee',name:'口袋 T恤',sub:'短袖 · 圆领 · 胸袋',color:'#7791a1'},
 {id:'polo',name:'翻领 Polo',sub:'翻领 · 短门襟 · 开衩',color:'#c6aa6e'},
 {id:'vest',name:'运动背心',sub:'无袖 · 包边 · 宽肩带',color:'#4b5b63'},
 {id:'hoodie',name:'连帽卫衣',sub:'落肩 · 袋鼠口袋 · 罗纹',color:'#8d9d80'},
 {id:'cardigan',name:'针织开衫',sub:'V领 · 纽扣 · 针织纹理',color:'#bb969a'},
 {id:'bomber',name:'棒球夹克',sub:'立领 · 拉链 · 收口',color:'#566775'},
 {id:'windbreaker',name:'轻薄风衣',sub:'连帽 · 挡风门襟 · 肩线',color:'#a3a98b'},
 {id:'puffer',name:'羽绒马甲',sub:'立领 · 绗缝 · 拉链袋',color:'#b89a74'},
 {id:'jeans',name:'直筒牛仔裤',sub:'五袋 · 撞色缝线 · 直筒',color:'#697f97'},
 {id:'chinos',name:'休闲长裤',sub:'斜插袋 · 裤褶 · 九分',color:'#b7a98c'},
 {id:'joggers',name:'束脚运动裤',sub:'松紧腰 · 抽绳 · 束脚',color:'#9d9e9a'},
 {id:'shorts',name:'休闲短裤',sub:'斜插袋 · 双裤腿 · 卷边',color:'#b795a9'}
];
function shade(hex,t){const rgb=hex.match(/[\da-f]{2}/gi).map(v=>parseInt(v,16));return '#'+rgb.map(v=>Math.round(t>0?v+(255-v)*t:v*(1+t)).toString(16).padStart(2,'0')).join('');}
const path=(d,cls='detail',extra='')=>`<path d="${d}" class="${cls}" ${extra}/>`;
const button=(x,y,r=2)=>`<circle cx="${x}" cy="${y}" r="${r}" class="hardware"/>`;
const hem=(y,x1=91,x2=229)=>path(`M${x1} ${y}Q160 ${y+6} ${x2} ${y}`,'stitch');
function shapes(kind){
 let d='',details='',extra='';
 if(kind==='cargo'){
  const base=shapes('chinos');
  return {...base,details:base.details+path('M106 131h32v38h-30ZM182 131h32l-2 38h-30ZM106 131l16 9 16-9M182 131l16 9 16-9')};
 }
 if(kind==='longtee'){
  const shape=shapes('sweatshirt');
  return {...shape,details:path('M128 55Q160 91 192 55M132 58Q160 86 188 58')+path('M94 225q66 9 132 0m-181-19 24 9m182 0 24-9','stitch')};
 }
 if(kind==='shortsweater'){
  d=shapes('tee').d;
  details=path('M128 55Q160 91 192 55L189 62Q160 96 131 62Z','rib')+path('M90 207q70 12 140 0v10q-70 12-140 0Z','rib')+path('m44 120 29 25 6-7-29-25Zm199 18 6 7 29-25-6-7Z','rib');
  return {d,details,extra:'knit'};
 }
 if(['shirt','sweater','sweatshirt','blazer','coat'].includes(kind)){
  const long=kind==='coat',bottom=long?259:232;
  d=`M128 55 94 67 42 208 70 221 94 155 92 ${bottom}Q160 ${bottom+10} 228 ${bottom}L226 155 250 221 278 208 226 67 192 55Q160 74 128 55Z`;
  details=path(`M96 ${bottom-8}q64 9 128 0`,'stitch')+path('M96 77 104 131m120-54-8 54','stitch')+path('m43 204 29 11-4 13-30-12Zm205 11 29-11 5 12-30 12Z','rib');
  if(kind==='shirt')details+=path('M129 55 118 77 142 94 160 72 178 94 202 77 191 55 160 72Z','rib')+path(`M156 78v${bottom-78}h8V78Z`,'rib')+path('M180 108h30v28q-15 9-30 0Z')+[96,121,146,171,196,221].map(y=>button(160,y,1.6)).join('');
  else if(['blazer','coat'].includes(kind))details+=path(`M129 55 118 87 136 98 127 109 157 149 181 102 202 87 191 55 160 110Z`,'rib')+path(`M157 149v${bottom-149}`)+path('M105 179h31m48 0h31M183 109h26')+button(163,167,2.5)+button(163,198,2.5);
  else{details+=path('M128 55Q160 91 192 55L189 62Q160 96 131 62Z','rib')+path(`M92 ${bottom-12}q68 10 136 0v12q-68 10-136 0Z`,'rib');if(kind==='sweater')extra='knit';}
  return {d,details,extra};
 }
 if(['dress','skirt','jumpsuit'].includes(kind)){
  d=kind==='skirt'?'M119 69h82l40 177q-81 20-162 0Z':kind==='dress'?'M130 43h13q17 20 34 0h13l16 65-24 22 54 127q-76 19-152 0l54-127-24-22Z':'M130 40h15q15 17 30 0h15l24 63-25 19 32 133-48 0-13-99-13 99h-48l32-133-25-19Z';
  const waist=kind==='skirt'?80:130;
  details=path(`M${kind==='skirt'?118:138} ${waist}h${kind==='skirt'?84:44}`,'rib')+path(kind==='skirt'?'M123 94 105 239m39-145-5 148m38-148 5 148m15-148 18 145M84 239q76 19 152 0':'M139 136 111 249m70-113 28 113M143 44q17 27 34 0','stitch');
  return {d,details,extra};
 }
 if(['sneakers','loafers','boots','sandals','slippers'].includes(kind)){
  const boot=kind==='boots',open=['sandals','slippers'].includes(kind);
  d=boot?'M91 55h84l-3 110 60 21q24 10 24 34v16H65v-35l21-33Z':open?'M81 124q17-23 42-9l104 65q27 18 17 44-12 20-45 11L71 180q-28-17-13-38Z':'M78 105q20 23 43 8l34 46 70 18q29 9 30 38v19H65q-20-4-15-24Z';
  details=path(open?'M67 166 206 227q26 12 39-9':'M53 214q94 13 200 0v15H65q-15-2-12-15Z','rib');
  if(kind==='sneakers')details+=path('M117 123 100 169l53 9M113 134l24 5m-28 6 36 7m-39 4 46 8','detail')+path('M81 124 69 191m107-24-7 42M72 201h155','stitch');
  if(kind==='loafers')details+=path('M87 126q19 18 39 7l26 40-54-5Z','rib')+path('M157 177q47-3 70 25M92 174l-12 29','stitch');
  if(boot)details+=path('M92 64h73M94 72l-5 99m78-91-3 91M91 179q25 10 28 30','stitch')+path('M81 218h60v15H79Z','rib');
  if(open)details+=path('M79 133 164 173 153 191 68 151Z','rib')+(kind==='sandals'?path('M161 177 208 198 197 216 150 195Z','rib'):'');
  return {d,details,extra};
 }
 const accessories={
  bag:['M82 117h156l-5 124q-73 15-146 0Z',path('M116 119V87q0-43 44-43t44 43v32','detail','stroke-width="7"')+path('M92 129h136v101H92Z','stitch')+path('M148 156h24v13h-24Z','rib')],
  hat:['M99 156q-2-84 61-84t61 84l39 42q-100 35-200 0Z',path('M100 153q60 19 120 0M82 192q78 27 156 0','stitch')+path('M160 78v84')],
  scarf:['M105 58q57-15 104 10l-23 57 31 110-45 15-28-121-30 119-41-12 31-117Z',path('M112 64q10 46 74 61M111 85l43 45M91 227l25 6m61 4 26-8','stitch')+path('M82 237l-3 17m13-14-2 17m13-14-2 16m12-14-2 15m66-15 3 15m9-19 3 15m8-19 4 15')],
  belt:['M55 122h210v45H55Z',path('M64 128h190v33H64Z','stitch')+path('M75 121h40v48H75Z','rib')+path('M82 129h25v32H82Z')+[165,184,203,222].map(x=>button(x,144,1.6)).join('')],
  accessory:['M115 91q45-30 90 0v115q-45 30-90 0Z',path('M130 102q30-17 60 0v91q-30 17-60 0Z','stitch')]
 };
 if(accessories[kind])return {d:accessories[kind][0],details:accessories[kind][1],extra};
 if(['tee','polo'].includes(kind)){
  d='M126 55 91 66 42 122 73 149 91 126 89 217Q160 228 231 217L229 126 247 149 278 122 229 66 194 55Q160 77 126 55Z';
  details=hem(210)+path('m48 120 27 22m170 0 27-22M92 76l-1 46m138-46v46','stitch');
  if(kind==='tee')details+=path('M126 55Q160 91 194 55M131 57Q160 83 189 57')+path('M180 108h32v31q-16 12-32 0Z')+path('M184 112h24','stitch');
  else details+=path('M128 54 116 76 142 95 160 73 178 95 204 76 192 54 178 59 160 73 142 59Z','rib')+path('M155 77v40h10V77')+button(160,91,1.6)+button(160,105,1.6)+path('M89 199v18m142-18v18');
 }else if(kind==='vest'){
  d='M113 54h25Q160 94 182 54h25Q202 99 225 125L229 230Q160 242 91 230L95 125Q118 99 113 54Z';
  details=path('M138 54Q160 109 182 54M114 56Q120 102 95 127M206 56Q200 102 225 127','detail','stroke-width="4"')+hem(223,93,227)+path('M100 132 99 219m122-87 1 87','stitch');
 }else if(kind==='hoodie'){
  d='M121 68 83 79 35 209 66 224 88 162 85 237Q160 248 235 237L232 162 254 224 285 209 237 79 199 68Z';
  details=path('M84 226q76 11 152 0l-1 13q-75 11-150 0Z','rib')+path('m36 207 31 12-5 14-31-12Zm217 12 31-12 5 14-31 12Z','rib')+path('M121 68Q122 37 160 35q38 2 39 33l-17 34h-44Z','cloth')+path('M139 92q-6-31 21-40 27 9 21 40l-21 11Z','rib')+path('M145 97v37m30-37v37')+path('M119 169q41 9 82 0l15 39q-56 9-112 0Z')+path('m119 171-12 29m94-29 12 29M85 83l18 57m132-57-18 57','stitch')+button(145,132,1.3)+button(175,132,1.3);
 }else if(kind==='cardigan'){
  d='M127 55 92 68 40 213 70 225 94 151 91 233Q160 241 229 233L226 151 250 225 280 213 228 68 193 55 160 123Z';
  details=path('M126 55 155 124v112h11V124l28-69-10 4-24 53-24-53Z','rib')+path('M92 222q68 8 136 0v13q-68 8-136 0Z','rib')+path('m40 212 31 11-4 12-31-12Zm209 11 31-11 4 12-31 12Z','rib')+path('M108 166h31v34h-31Zm73 0h31v34h-31Z')+[139,163,187,211].map(y=>button(160,y)).join('')+path('M99 86 94 150m127-64 5 64','stitch');
  extra='knit';
 }else if(kind==='bomber'){
  d='M131 60 91 71 37 210 69 224 94 155 91 230Q160 242 229 230L226 155 251 224 283 210 229 71 189 60Z';
  details=path('M130 60q30 18 60 0l-7-19q-23 12-46 0Z','rib')+path('M91 220q69 12 138 0v15q-69 11-138 0Z','rib')+path('m38 209 31 11-5 13-31-12Zm213 11 31-11 5 12-31 12Z','rib')+path('M156 68v163h8V68Z','rib')+path('M101 165l29 23m89-23-29 23')+path('m99 170 27 22m95-22-27 22M93 74l12 63m122-63-12 63','stitch')+path('M61 135 74 141 62 169 49 163Z')+button(160,78,2.5);
 }else if(kind==='windbreaker'){
  d='M123 66 91 78 44 215 72 227 97 158 88 247Q160 257 232 247L223 158 248 227 276 215 229 78 197 66Z';
  details=path('M123 66Q122 32 160 33q38-1 37 33l-18 30h-38Z','cloth')+path('M141 84q-8-26 19-38 27 12 19 38l-19 12Z','rib')+path('M155 93v157h13V93Z','rib')+path('M94 111q66 21 132 0M105 175l29 17m81-17-29 17')+path('M145 93v26m31-26v26M94 240q66 10 132 0','stitch')+button(161,113)+button(161,152)+button(161,196)+path('M70 218l-24-9m226 0-24 9','stitch');
 }else if(kind==='puffer'){
  d='M129 59 101 68q7 40-17 59l3 105q73 17 146 0l3-105q-24-19-17-59l-28-9Z';
  details=path('M129 59V36q31 14 62 0v23l-31 20Z','cloth')+path('M154 72v168h12V72Z','rib')+path('M102 70q10 36-15 60m131-60q-10 36 15 60','detail','stroke-width="3"')+[98,128,158,188,218].map(y=>path(`M91 ${y}q29 8 62 2m14 0q33 6 62-2`)).join('')+path('M105 164l21 28m89-28-21 28')+button(160,81,2.8);
 }else{
  const short=kind==='shorts',jog=kind==='joggers',chino=kind==='chinos';const bottom=short?195:chino?250:262;
  d=short?'M108 79h104l13 115-58 3-7-66-7 66-58-3Z':jog?'M109 41h102l12 71-11 138-37 4-15-116-15 116-37-4-11-138Z':`M107 40h106l11 78-8 ${bottom-118}-43 0-13-118-13 118h-43l-8-${bottom-118}Z`;
  details=path(`M109 ${short?90:52}h102M160 ${short?91:53}v50l-8 9M${short?99:105} ${bottom-9}h${short?53:41}m${short?25:28} 0h${short?53:41}`,'stitch');
  if(kind==='jeans')details+=path('M110 58q2 29 30 31m70-31q-2 29-30 31M120 61h15v14h-12M113 48h8m34 0h8m34 0h8','stitch')+path('M154 53v46q0 10-8 12','detail')+button(160,46)+path('M113 111 116 244m90-133-2 133','stitch');
  else details+=path(short?'M110 94l-9 40m109-40 9 40':`M109 62l-9 38m111-38 9 38M125 112l-1 ${bottom-128}m71-${bottom-128} 1 ${bottom-128}`,'stitch');
  if(jog)details+=path('M109 42q51-8 102 0v15q-51-8-102 0Z','rib')+path('M109 244h36l-2 20h-33Zm66 0h36l-1 20h-33Z','rib')+path('M156 52q-15 3-11 11 12 4 15-11 15 3 11 11-11 4-11-11m-4 6-5 30m12-30 6 30');
  else details+=path(`M${short?108:107} ${short?79:40}h105v12H${short?108:107}Z`,'rib')+button(160,short?85:46);
  if(short)details+=path('M96 185l58 3-1 10-58-3Zm71 3 58-3 1 10-58 3Z','rib');
  if(kind==='jeans')extra='denim';
 }
 return {d,details,extra};
}

export {garments,shapes,shade};
