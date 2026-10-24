import {garments,shapes,shade} from './garment-shapes.mjs';
import {COLORS} from './core.mjs';
let serial=0;
const line=(d,c,w=1,o=1,extra='')=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" opacity="${o}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const material={tee:'细棉布',polo:'珠地棉',vest:'运动针织',hoodie:'毛圈棉',cardigan:'绞花针织',bomber:'哑光斜纹',windbreaker:'轻薄织物',puffer:'蓬松绗缝',jeans:'靛蓝丹宁',chinos:'棉质斜纹',joggers:'柔软卫衣布',shorts:'棉麻混纺'};
export function refined(kind,hex,view='0 0 320 300'){
 const id=`r${++serial}`,{d,details:baseDetails}=shapes(kind),dark=shade(hex,-.38),ink=shade(hex,-.55),light=shade(hex,.55);
 const details=kind==='puffer'?baseDetails.replace(/<path d="(M91 [^"]+)" class="detail"/g,`<path d="$1" clip-path="url(#${id}-clip)" class="detail"`):baseDetails;
 const ref=n=>`url(#${id}-${n})`,knit=['cardigan','sweater','shortsweater'].includes(kind),denim=kind==='jeans',puff=kind==='puffer';
 let defs=`<linearGradient id="${id}-wash" x1="0" y1="0" x2="1" y2=".3"><stop stop-color="${shade(hex,-.07)}"/><stop offset=".22" stop-color="${shade(hex,.25)}"/><stop offset=".52" stop-color="${shade(hex,.12)}"/><stop offset=".81" stop-color="${shade(hex,.23)}"/><stop offset="1" stop-color="${shade(hex,-.12)}"/></linearGradient>
 <linearGradient id="${id}-rib"><stop stop-color="${shade(hex,-.17)}"/><stop offset=".5" stop-color="${shade(hex,.14)}"/><stop offset="1" stop-color="${shade(hex,-.2)}"/></linearGradient>
 <radialGradient id="${id}-bloom"><stop stop-color="${light}" stop-opacity=".42"/><stop offset=".7" stop-color="${light}" stop-opacity=".12"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></radialGradient>
 <linearGradient id="${id}-panel" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${dark}" stop-opacity=".20"/><stop offset=".25" stop-color="${light}" stop-opacity=".35"/><stop offset=".7" stop-color="${hex}" stop-opacity="0"/><stop offset="1" stop-color="${dark}" stop-opacity=".26"/></linearGradient>
 <pattern id="${id}-thread" width="${denim?3.4:4.5}" height="${denim?3.4:4.5}" patternUnits="userSpaceOnUse">${line('M-1 1 1-1M0 4 4 0M3 5 5 3',light,denim?.55:.35,denim?.55:.28)}${line('M0 1h4M1 0v4',ink,.25,.12)}</pattern>
 <pattern id="${id}-knit" width="7" height="8" patternUnits="userSpaceOnUse">${line('M.8 0Q.2 3 3.4 6.5Q6.8 3 6.2 0',ink,.7,.32)}${line('M1.8 0Q1.2 3 3.5 5.3M4.2 5.4Q6 3 5.3 1',light,.8,.65)}</pattern>
 <pattern id="${id}-ribs" width="3" height="6" patternUnits="userSpaceOnUse">${line('M1 0v6',ink,.55,.28)}${line('M2 0v6',light,.45,.5)}</pattern>
 <pattern id="${id}-pique" width="4" height="5" patternUnits="userSpaceOnUse"><path d="m1 1 1 1-1 1-1-1Z" fill="${light}" opacity=".3"/>${line('M2 3 3 4',ink,.4,.22)}</pattern>
 <filter id="${id}-pigment" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".48" numOctaves="3" seed="12"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".15"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter>
 <filter id="${id}-pencil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".075" numOctaves="2" seed="4" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale=".7"/></filter>
 <clipPath id="${id}-clip"><path d="${d}"/></clipPath>`;
 let layer=`<path d="${d}" fill="${ref('wash')}" stroke="${ink}" stroke-width="1.15" stroke-linejoin="round"/>`;
 let surface=`<rect width="320" height="300" fill="${ref('thread')}"/><ellipse cx="133" cy="116" rx="74" ry="100" fill="${ref('bloom')}"/><ellipse cx="221" cy="206" rx="43" ry="65" fill="${ref('bloom')}"/>`;
 if(knit){surface+=`<rect width="320" height="300" fill="${ref('knit')}"/>`;for(const x of [115,137,182,204])for(let y=84;y<222;y+=18)surface+=line(`M${x} ${y}c-7 5 7 12 0 18m2-18c7 5-7 12 0 18`,ink,.8,.32)+line(`M${x-1} ${y}c-5 5 7 12 0 18`,light,1,.7);}
 if(kind==='polo'||kind==='vest')surface+=`<rect width="320" height="300" fill="${ref('pique')}"/>`;
 if(puff)for(const y of [76,102,132,162,192,222])surface+=`<path d="M85 ${y}q75 10 150 0v28q-75 12-150 0Z" fill="${ref('panel')}"/>`;
 const folds={
 tee:['M94 126q10 8 22 10','M225 127q-8 13-19 19','M101 202q13-25 7-44','M215 201q-9-15-5-28','M127 214q29-8 52 1','M57 121l23 14'],
 polo:['M95 126q12 6 23 10','M225 126q-8 16-17 22','M101 198q14-21 9-43','M218 202q-11-18-8-33'],
 vest:['M101 132q11 8 17 9','M219 133q-9 7-16 9','M104 219q12-20 7-42','M213 219q-8-18-6-35'],
 hoodie:['M86 149q-13 26-23 30','M233 149q13 26 23 30','M100 146q13 8 22 10','M219 143q-11 9-23 10','M104 217q14-5 26-2','M184 218q22-7 37 0','M46 201l19 5'],
 cardigan:['M93 147q-10 20-22 27','M225 147q10 20 22 27','M100 212q11-4 22-2','M197 212q12-4 24-1'],
 bomber:['M92 152q-12 27-23 30','M226 151q13 23 24 28','M102 206q15-5 29 2','M185 208q18-6 34-2','M61 196l12 4'],
 windbreaker:['M95 158q-10 21-19 28','M222 158q11 23 20 27','M102 236q6-28 8-34','M217 235q-9-30-10-34','M121 138q17 7 29 1','M174 140q17 5 27-2'],
 puffer:['M92 138l15 5','M213 144l16-6','M95 204l13 4','M212 208l17-7'],
 jeans:['M111 100q17 9 32 9','M179 110q17-3 32-9','M115 132q8 36 3 67','M205 132q-8 36-3 67','M111 233l23-4','M185 231l23 4'],
 chinos:['M109 100q17 7 31 7','M180 106q15-3 30-8','M118 141q5 34 1 72','M202 142q-5 32-1 71'],
 joggers:['M105 108q20 10 36 11','M180 119q20-3 35-11','M111 231l25 5','M185 236l25-5','M114 159q9 27 4 47','M206 159q-9 27-4 47'],
 shorts:['M104 142q13 6 32 5','M184 147q18 0 32-7','M107 177l29-2','M183 175l30 2']};
 for(const f of folds[kind]||[])surface+=line(f,dark,3.6,.09)+line(f,dark,1.3,.18)+line(f,light,.8,.55,'transform="translate(-1 -1.7)"');
 if(denim)surface+=`<ellipse cx="128" cy="162" rx="16" ry="55" fill="${ref('bloom')}"/><ellipse cx="194" cy="162" rx="16" ry="55" fill="${ref('bloom')}"/>`;
 layer+=`<g clip-path="${ref('clip')}" filter="${ref('pigment')}">${surface}</g>`;
 layer+=details.replaceAll('class="cloth"',`fill="${ref('wash')}" stroke="${ink}" stroke-width="1.05"`).replaceAll('class="rib"',`fill="${ref('rib')}" stroke="${ink}" stroke-width=".8"`).replaceAll('class="detail"',`fill="none" stroke="${ink}" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round"`).replaceAll('class="stitch"',`fill="none" stroke="${denim?'#c6ad79':ink}" stroke-width=".65" opacity=".65" stroke-dasharray="1.8 1.5"`).replaceAll('class="hardware"',`fill="#c5b693" stroke="${ink}" stroke-width=".65"`);
 for(const match of details.matchAll(/<path d="([^"]+)" class="rib"/g)){const rid=`${id}-band${serial++}`;defs+=`<clipPath id="${rid}"><path d="${match[1]}"/></clipPath>`;layer+=`<rect width="320" height="300" fill="${ref('ribs')}" clip-path="url(#${rid})"/>`;}
 if(kind==='tee'){layer+=line('M182 112h28v25q-13 11-28 1',ink,.65,.55,'stroke-dasharray="1.3 1.5"');for(let x=134;x<188;x+=4)layer+=line(`M${x} ${63+10*Math.sin((x-134)/54*Math.PI)}l-1 3`,ink,.6,.45);}
 if(kind==='hoodie'){layer+=line('M123 173q37 7 74 0M111 205q49 7 98 0',ink,.65,.6,'stroke-dasharray="1.5 1.5"')+line('M133 77q3-23 27-30 24 7 27 30',ink,.6,.5,'stroke-dasharray="1.4 1.5"');for(const x of [145,175])layer+=`<circle cx="${x}" cy="100" r="2.1" fill="${dark}"/><circle cx="${x}" cy="100" r=".9" fill="${light}"/>`+line(`M${x} 102v28`,light,1.4,.9)+line(`M${x} 130v5`,ink,1.8,.8);}
 if(kind==='cardigan'){layer+=line('M110 168h27m46 0h27M110 171h27m46 0h27',light,1.2,.65);for(const y of [139,163,187,211])layer+=line(`M159 ${y-1}l2 2m0-2-2 2`,ink,.6,.85)+line(`M166 ${y}h4`,ink,.9,.7);}
 if(['bomber','puffer'].includes(kind)){for(let y=88;y<(puff?234:228);y+=3)layer+=line(`M158 ${y}h4`,light,.9,.9)+line(`M159 ${y+1}h2`,ink,.65,.7);layer+=`<rect x="157.5" y="79" width="5" height="8" rx="1.5" fill="#c5b693" stroke="${ink}" stroke-width=".65"/><path d="M159 81v3" stroke="${ink}" stroke-width=".7"/>`;}
 if(denim){layer+=line('M110 55q2 31 30 37m70-37q-2 31-30 37M110 112l3 141m97-141-3 141M150 54v44q0 8-7 11','#bda16a',.8,.9,'stroke-dasharray="2 1.5"');for(const [x,y]of[[112,61],[140,88],[208,61],[180,88],[123,66],[135,66]])layer+=`<circle cx="${x}" cy="${y}" r="1.4" fill="#b49a68" stroke="${ink}" stroke-width=".45"/><circle cx="${x-.3}" cy="${y-.4}" r=".4" fill="#f6e4b8"/>`;}
 if(pantsView(kind)&&kind!=='joggers')for(const x of[120,196])layer+=`<path d="M${x} ${kind==='shorts'?78:39}v14h4V${kind==='shorts'?78:39}" fill="${hex}" stroke="${ink}" stroke-width=".65"/>`;
 layer+=line(d,ink,.42,.35,'transform="translate(.8 .65)"')+line(d,light,.55,.35,'transform="translate(-.5 -.4)"');
 return `<svg class="refined-art" viewBox="${view}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${kind==='longtee'?'长袖 T恤':garments.find(g=>g.id===kind).name}，精修手绘"><defs>${defs}</defs><g filter="${ref('pencil')}">${layer}</g></svg>`;
}

function pantsView(k){return ['jeans','chinos','joggers','shorts','jumpsuit'].includes(k);}

// Resolve existing records at display time; never migrate or overwrite wardrobe data.
export function garmentKind(i={}){
 if(i.previewKind&&(i.previewKind==='longtee'||garments.some(g=>g.id===i.previewKind)))return i.previewKind;
 if(i.subcategory==='工装裤')return 'cargo';
 const sub=i.subcategory||'',text=[i.name,i.style,sub].filter(Boolean).join(' ');
 const top=()=>{
  if(/polo/i.test(text))return 'polo';
  if(/羽绒.*(背心|马甲)|(背心|马甲).*羽绒/.test(text))return 'puffer';
  if(/风衣|防晒衣|冲锋衣/.test(text))return 'windbreaker';
  if(/大衣|呢外套/.test(text))return 'coat';
  if(/开衫/.test(text))return /抓绒/.test(text)?'bomber':'cardigan';
  if(sub==='T恤'&&/长袖/.test(text))return 'longtee';
  if(sub==='针织衫'&&/短袖/.test(text))return 'shortsweater';
  if(/连帽|帽衫/.test(text))return 'hoodie';
  return ({'衬衫':'shirt','T恤':'tee','背心':'vest','针织衫':'sweater','卫衣':'sweatshirt','外套':'bomber','西装':'blazer'})[sub]||'tee';
 };
 const exact={'牛仔裤':'jeans','休闲裤':'chinos','西裤':'chinos','运动裤':'joggers','短裤':'shorts','半身裙':'skirt','连衣裙':'dress','连体裤':'jumpsuit','运动鞋':'sneakers','休闲鞋':'sneakers','乐福鞋':'loafers','皮鞋':'loafers','靴子':'boots','凉鞋':'sandals','拖鞋':'slippers','包':'bag','帽子':'hat','围巾':'scarf','腰带':'belt'};
 if(sub==='休闲裤'&&/牛仔/.test(text))return 'jeans';
 if(exact[sub])return exact[sub];
 if(['衬衫','T恤','背心','针织衫','卫衣','外套','西装'].includes(sub))return top();
 const legacy={shirt:'shirt',tee:'tee',vest:'vest',knit:'sweater',jeans:'jeans',trousers:'chinos',coat:'coat',jacket:'blazer',sneakers:'sneakers',loafers:'loafers',dress:'dress',bag:'bag'};
 if(i.category==='下装')return /短裤/.test(text)?'shorts':/裙/.test(text)?'skirt':/牛仔/.test(text)?'jeans':/运动|束脚/.test(text)?'joggers':'chinos';
 if(i.category==='鞋')return /靴/.test(text)?'boots':/凉鞋/.test(text)?'sandals':/拖鞋/.test(text)?'slippers':'sneakers';
 if(i.category==='配饰')return 'accessory';
 if(i.category==='连衣裙/连体装')return /裤/.test(text)?'jumpsuit':'dress';
 if(i.category==='外套')return /风衣/.test(text)?'windbreaker':/大衣/.test(text)?'coat':legacy[i.illustration]||'bomber';
 if(i.category==='上装')return sub==='其他上装'?top():legacy[i.illustration]||top();
 return legacy[i.illustration]||'tee';
}
export function garment(item){
 const kind=garmentKind(item);
 return refined(kind,COLORS[item.color]||COLORS['未知']).replace('class="refined-art"',`class="refined-art" data-garment-kind="${kind}"`);
}
