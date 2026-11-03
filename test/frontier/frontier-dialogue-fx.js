/* Frenda Frontier Ver1.147 - portrait, readable typewriter text, optional dialog blips.
   Updated: 2026-11-03 JST / Ver1.146.
*/
(()=>{'use strict';
 const F=window.FRENDA_FRONTIER;if(!F)return;
 const FX=F.DIALOGUE_FX={enabled:true,delay:38};
 let audio=null,unlocked=false,lastSound=0;
 const portraits={
  player:'frontier-portrait-player-v147.png',traveler:'frontier-portrait-traveler-v147.png',
  nyahoja:'frontier-portrait-nyahoja-v146.png'};
 FX.portraitFor=who=>{const str=String(who||'');return /ニャオハ/.test(str)?portraits.nyahoja:/旅人|旅の冒険者|ミナ|リオ/.test(str)?portraits.traveler:/主人公|開拓者/.test(str)?portraits.player:''};
 FX.unlock=()=>{if(!FX.enabled)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!audio)audio=new Audio();if(audio.state==='suspended')audio.resume()?.catch?.(()=>{});unlocked=audio.state==='running'}catch(_){unlocked=false}};
 // Must be triggered by a real tap/click; silent fallback when iOS blocks autoplay.
 document.addEventListener('pointerdown',()=>FX.unlock(),{passive:true});
 FX.tick=(char,index=0)=>{if(!FX.enabled||!unlocked||!audio||index%3!==0||!char||/[\s、。！？…]/.test(char))return;
  const now=audio.currentTime;if(now-lastSound<.048)return;lastSound=now;
  try{const tone=audio.createOscillator(),volume=audio.createGain();tone.type='triangle';tone.frequency.setValueAtTime(460+((index%5)*28),now);volume.gain.setValueAtTime(.0001,now);volume.gain.exponentialRampToValueAtTime(.016,now+.004);volume.gain.exponentialRampToValueAtTime(.0001,now+.025);tone.connect(volume).connect(audio.destination);tone.start(now);tone.stop(now+.03)}catch(_){/* audio must never stop the story */}
 };
 FX.stop=el=>{if(el?._frontierTyping){clearInterval(el._frontierTyping.timer);el._frontierTyping=null}};
 FX.type=(el,message,done=()=>{})=>{if(!el)return()=>{};FX.stop(el);let i=0;const chars=Array.from(String(message||''));el.textContent='';const state={timer:null};el._frontierTyping=state;
  const reveal=()=>{if(!el._frontierTyping)return;FX.stop(el);el.textContent=chars.join('');done()};
  state.timer=setInterval(()=>{if(!el.isConnected){FX.stop(el);return}if(i>=chars.length){FX.stop(el);done();return}const char=chars[i];el.textContent+=char;FX.tick(char,i);i++;if(i>=chars.length){FX.stop(el);done()}},FX.delay);
  return reveal;
 };
 FX.setEnabled=on=>{FX.enabled=!!on;if(on)FX.unlock()};
})();

// Updated: 2026-11-03 21:43 JST / Ver1.146: integrated scene art, portrait dialogues, tick sound.

// Updated: 2026-11-04 07:28 JST / Ver1.147: illustrated protagonist and traveler portraits.
