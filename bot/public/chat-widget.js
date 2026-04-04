(function () {
  const API_URL = document.currentScript?.getAttribute('data-api') || 'http://localhost:3001';
  let sessionId = null, isOpen = false;
  const style = document.createElement('style');
  style.textContent = `
    #dji-chat-btn{position:fixed;bottom:24px;right:24px;z-index:9999;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#2EC4B6,#1A9E92);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(46,196,182,0.4);display:flex;align-items:center;justify-content:center;transition:transform .3s,box-shadow .3s}
    #dji-chat-btn:hover{transform:scale(1.1);box-shadow:0 6px 28px rgba(46,196,182,0.5)}
    #dji-chat-btn svg{width:28px;height:28px;fill:white}
    #dji-chat-window{position:fixed;bottom:96px;right:24px;z-index:9998;width:380px;max-width:calc(100vw - 48px);height:520px;max-height:70vh;background:#0B1426;border:1px solid rgba(46,196,182,0.2);border-radius:16px;display:none;flex-direction:column;box-shadow:0 12px 48px rgba(0,0,0,0.4);overflow:hidden;font-family:'DM Sans',system-ui,sans-serif}
    #dji-chat-window.open{display:flex}
    #dji-chat-header{padding:16px 20px;background:linear-gradient(135deg,#121E36,#1A2A4A);border-bottom:1px solid rgba(46,196,182,0.15);display:flex;align-items:center;gap:12px}
    #dji-chat-header .avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#2EC4B6,#1A9E92);display:flex;align-items:center;justify-content:center;font-size:18px}
    #dji-chat-header .info h4{color:#F8F6F0;font-size:14px;margin:0}
    #dji-chat-header .info span{color:#2EC4B6;font-size:11px}
    #dji-chat-close{margin-left:auto;background:none;border:none;color:#8A8880;font-size:20px;cursor:pointer;padding:4px}
    #dji-chat-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
    #dji-chat-messages::-webkit-scrollbar{width:4px}
    #dji-chat-messages::-webkit-scrollbar-thumb{background:#1A2A4A;border-radius:4px}
    .dji-msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:13.5px;line-height:1.5;color:#F8F6F0;animation:dji-fade .3s ease}
    .dji-msg.bot{align-self:flex-start;background:#1A2A4A;border-bottom-left-radius:4px}
    .dji-msg.user{align-self:flex-end;background:linear-gradient(135deg,#2EC4B6,#1A9E92);color:#0B1426;border-bottom-right-radius:4px}
    .dji-msg.typing{align-self:flex-start;background:#1A2A4A;border-bottom-left-radius:4px}
    .dji-msg.typing .dots span{display:inline-block;width:6px;height:6px;border-radius:50%;background:#2EC4B6;margin:0 2px;animation:dji-bounce 1.4s infinite}
    .dji-msg.typing .dots span:nth-child(2){animation-delay:.2s}
    .dji-msg.typing .dots span:nth-child(3){animation-delay:.4s}
    @keyframes dji-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
    @keyframes dji-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    #dji-chat-input-area{padding:12px 16px;border-top:1px solid rgba(46,196,182,0.1);display:flex;gap:8px;background:#0F1A30}
    #dji-chat-input{flex:1;background:#1A2A4A;border:1px solid rgba(46,196,182,0.15);border-radius:24px;padding:10px 16px;color:#F8F6F0;font-size:13.5px;font-family:inherit;outline:none;transition:border-color .3s}
    #dji-chat-input:focus{border-color:#2EC4B6}
    #dji-chat-input::placeholder{color:#5A5850}
    #dji-chat-send{width:38px;height:38px;border-radius:50%;border:none;background:linear-gradient(135deg,#2EC4B6,#1A9E92);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s}
    #dji-chat-send:hover{transform:scale(1.1)}
    #dji-chat-send:disabled{opacity:0.5;cursor:not-allowed;transform:none}
    #dji-chat-send svg{width:16px;height:16px;fill:#0B1426}`;
  document.head.appendChild(style);
  const container = document.createElement('div');
  container.innerHTML = `
    <button id="dji-chat-btn" aria-label="Chat with us"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg></button>
    <div id="dji-chat-window">
      <div id="dji-chat-header"><div class="avatar">🦷</div><div class="info"><h4>DentalJourney AI</h4><span>● Online</span></div><button id="dji-chat-close">✕</button></div>
      <div id="dji-chat-messages"></div>
      <div id="dji-chat-input-area"><input id="dji-chat-input" type="text" placeholder="Ask about dental treatments in India..." autocomplete="off"/><button id="dji-chat-send" disabled><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div>
    </div>`;
  document.body.appendChild(container);
  const chatBtn=document.getElementById('dji-chat-btn'),chatWindow=document.getElementById('dji-chat-window'),chatClose=document.getElementById('dji-chat-close'),messages=document.getElementById('dji-chat-messages'),input=document.getElementById('dji-chat-input'),sendBtn=document.getElementById('dji-chat-send');
  chatBtn.onclick=async()=>{isOpen=!isOpen;chatWindow.classList.toggle('open',isOpen);if(isOpen&&!sessionId)await startSession();if(isOpen)input.focus()};
  chatClose.onclick=()=>{isOpen=false;chatWindow.classList.remove('open')};
  async function startSession(){try{const r=await fetch(`${API_URL}/api/chat/start`,{method:'POST'});const d=await r.json();sessionId=d.sessionId;addMessage(d.welcome,'bot')}catch{addMessage("Welcome! I'm your dental tourism concierge. How can I help?",'bot')}}
  async function sendMessage(){const text=input.value.trim();if(!text)return;addMessage(text,'user');input.value='';sendBtn.disabled=true;const typing=addTyping();try{const r=await fetch(`${API_URL}/api/chat/message`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId,message:text})});const d=await r.json();typing.remove();addMessage(d.reply,'bot')}catch{typing.remove();addMessage("Sorry, having trouble connecting. Please try again!",'bot')}}
  function addMessage(text,sender){const div=document.createElement('div');div.className=`dji-msg ${sender}`;div.textContent=text;messages.appendChild(div);messages.scrollTop=messages.scrollHeight;return div}
  function addTyping(){const div=document.createElement('div');div.className='dji-msg typing';div.innerHTML='<div class="dots"><span></span><span></span><span></span></div>';messages.appendChild(div);messages.scrollTop=messages.scrollHeight;return div}
  input.oninput=()=>{sendBtn.disabled=!input.value.trim()};
  input.onkeydown=(e)=>{if(e.key==='Enter')sendMessage()};
  sendBtn.onclick=sendMessage;
})();
