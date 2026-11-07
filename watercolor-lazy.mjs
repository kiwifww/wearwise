// Only request illustration files near the viewport. Shared by editor and reader.
export function observeWatercolors(root=document){
 const pending=new Set();
 const load=image=>{const src=image.getAttribute('data-watercolor-src');if(src){image.setAttribute('href',src);image.removeAttribute('data-watercolor-src');}pending.delete(image);};
 const viewport=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){viewport.unobserve(entry.target);load(entry.target);}},{rootMargin:'160px 0px'});
 const scan=node=>{const images=[];if(node.matches?.('image[data-watercolor-src]'))images.push(node);if(node.querySelectorAll)images.push(...node.querySelectorAll('image[data-watercolor-src]'));for(const image of images){if(pending.has(image))continue;if(viewport){pending.add(image);viewport.observe(image);}else load(image);}};
 scan(root);
 const mutations=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)scan(node);for(const image of pending)if(!image.isConnected){viewport?.unobserve(image);pending.delete(image);}});
 mutations.observe(root,{childList:true,subtree:true});
 return ()=>{mutations.disconnect();viewport?.disconnect();pending.clear();};
}
if(typeof document!=='undefined')observeWatercolors(document);
