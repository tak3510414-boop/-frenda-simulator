/* Frenda Frontier Ver1.147 - portrait, readable typewriter text, optional dialog blips.
   Updated: 2026-11-03 JST / Ver1.146.
*/
(()=>{'use strict';
 const F=window.FRENDA_FRONTIER;if(!F)return;
 const FX=F.DIALOGUE_FX={enabled:true,delay:38};
 let audio=null,unlocked=false,lastSound=0;
 const portraits={
  player:'frontier-portrait-player-v147.png',traveler:'frontier-portrait-traveler-v147.png',
  nyahoja:'frontier-portrait-nyahoja-happy-v150.png',
  nyahojaHurt:'frontier-portrait-nyahoja-hurt-v150.png',
  nyahojaWorried:'frontier-portrait-nyahoja-worried-v150.png',
  nyahojaResting:'frontier-portrait-nyahoja-resting-v150.png',
  nyahojaRecovered:'frontier-portrait-nyahoja-recovered-v150.png',
  nyahojaHappy:'frontier-portrait-nyahoja-happy-v150.png'};
 FX.portraitFor=who=>{const str=String(who||'');
  if(!str||/^(none|narration|icon)$/i.test(str))return '';
  const mood=str.match(/^nyahoja_(hurt|worried|resting|recovered|happy)$/i);
  if(mood)return portraits['nyahoja'+mood[1][0].toUpperCase()+mood[1].slice(1).toLowerCase()];
  if(/nyahoja|ニャオハ/.test(str))return portraits.nyahoja;
  if(/^(traveler)$/i.test(str)||/旅人|旅の冒険者|ミナ|リオ/.test(str))return portraits.traveler;
  if(/^(player)$/i.test(str)||/ヤマト|主人公|開拓者/.test(str))return portraits.player;
  return '';
 };
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

// Updated: 2026-11-04 18:38 JST / Ver1.148: Yamato dialogue portraits.

// Updated: 2026-11-05 JST / Ver1.150: per-scene emotional faces and narration handling.

// Updated: 2026-11-05 12:32 JST / Ver1.150 (Nyahoja emotion routing and portrait race fix).
// Updated: 2026-11-08 23:56 JST / Ver1.155 distribution bundle; dependency module versions retained.
