// Private address is entered locally by its owner, never part of a published snapshot.
export function privateMobileURL(value){
  let u;try{u=new URL(value);}catch{throw Error('请粘贴电脑准备页提供的完整私人功能地址');}
  if(u.protocol!=='https:'||u.port||u.username||u.password||!u.hostname.endsWith('.ts.net')||u.pathname!=='/products'||u.search||!/^#access=[A-Za-z0-9_-]{43}$/.test(u.hash))throw Error('需要准备页提供的HTTPS私人功能地址，包含访问凭证');
  return u.href;
}
export const mobileEntryView=()=>'<mobile-ai-entry></mobile-ai-entry>';
if(typeof customElements!=='undefined'&&!customElements.get('mobile-ai-entry')){
  customElements.define('mobile-ai-entry',class extends HTMLElement{
    connectedCallback(){
      this.innerHTML='<section class="panel space-below"><h2>淘宝读取与AI建议</h2><p class="hint">完整体验请进入统一私人界面，里面可以切换衣柜、统计、购衣建议和设置。电脑和手机需连接Tailscale。首次使用可扫描电脑准备页二维码，或在下方粘贴完整私人功能地址。电脑需要保持开机并登录淘宝。</p><details><summary>设置本次浏览的私人入口</summary><label>私人功能地址<input type="password" autocomplete="off" placeholder="粘贴准备页中的完整HTTPS地址"></label><button type="button" class="btn">保存本次入口</button><button type="button" class="btn soft">清除入口</button></details><p role="status"></p><a class="btn primary" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" hidden>打开完整WearWise：衣柜 · 统计 · 建议</a><p class="hint">地址只保留在本次浏览中，不随衣柜发布。新建议保存在电脑私人服务；主站历史建议仍以最近一次发布为准。</p></section>';
      const key='wearwise-private-mobile-entry',input=this.querySelector('input'),status=this.querySelector('[role=status]'),link=this.querySelector('a'),buttons=this.querySelectorAll('button');
      const show=value=>{link.hidden=!value;link.className=value?'btn primary':'';if(value)link.href=privateMobileURL(value);else link.removeAttribute('href');};
      show('');try{const value=sessionStorage.getItem(key);if(value)show(value);}catch{status.textContent='浏览器未允许保存入口，可以直接扫描电脑二维码使用。';}
      buttons[0].onclick=()=>{try{const url=privateMobileURL(input.value.trim());sessionStorage.setItem(key,url);input.value='';show(url);status.textContent='本次浏览入口已保存，请点击打开。';}catch(e){status.textContent=e.message;}};
      buttons[1].onclick=()=>{try{sessionStorage.removeItem(key);}finally{input.value='';show('');status.textContent='已清除本次入口；如需使旧链接失效，请在电脑准备页撤销。';}};
    }
  });
}
