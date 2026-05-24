import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// FIREBASE CONFIG
// ═══════════════════════════════════════════════════════════════
const FB = {
  apiKey:            "AIzaSyDssVMxmF_QuxbephnCyCnemAluc8ia9k4",
  authDomain:        "mathquest-91f61.firebaseapp.com",
  projectId:         "mathquest-91f61",
  storageBucket:     "mathquest-91f61.firebasestorage.app",
  messagingSenderId: "545989558837",
  appId:             "1:545989558837:web:0114ea8ff7b3801efea77c",
};

// ── Firebase Auth REST helpers ────────────────────────────────
const AUTH_BASE = "https://identitytoolkit.googleapis.com/v1";
const FS_BASE   = `https://firestore.googleapis.com/v1/projects/${FB.projectId}/databases/(default)/documents`;

// Sign in with Google using popup (loads Google's SDK dynamically)
async function signInWithGoogle() {
  return new Promise((resolve, reject) => {
    // Load Firebase compat SDK dynamically
    if (window.__fbLoaded) { resolve(window.__fbAuth); return; }
    const s1 = document.createElement("script");
    s1.src = "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js";
    s1.onload = () => {
      const s2 = document.createElement("script");
      s2.src = "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js";
      s2.onload = () => {
        const s3 = document.createElement("script");
        s3.src = "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js";
        s3.onload = () => {
          if (!window.firebase.apps.length) window.firebase.initializeApp(FB);
          window.__fbApp  = window.firebase.app();
          window.__fbAuth = window.firebase.auth();
          window.__fbFs   = window.firebase.firestore();
          window.__fbLoaded = true;
          resolve(window.__fbAuth);
        };
        document.head.appendChild(s3);
      };
      document.head.appendChild(s2);
    };
    s1.onerror = reject;
    document.head.appendChild(s1);
  });
}

async function googleLogin() {
  const auth = await signInWithGoogle();
  const provider = new window.firebase.auth.GoogleAuthProvider();
  const result = await auth.signInWithPopup(provider);
  return result.user;
}

async function logOut() {
  if (window.__fbAuth) await window.__fbAuth.signOut();
}

// ── Firestore helpers ─────────────────────────────────────────
function fsDoc(uid) { return window.__fbFs?.collection("users").doc(uid); }

async function loadProfile(uid) {
  try {
    const snap = await fsDoc(uid).get();
    if (snap.exists) return snap.data();
    return null;
  } catch { return null; }
}

async function saveProfile(uid, data) {
  try {
    await fsDoc(uid).set(data, { merge: true });
  } catch (e) { console.warn("Firestore save failed", e); }
}

// ═══════════════════════════════════════════════════════════════
// CURRICULUM
// ═══════════════════════════════════════════════════════════════
const CURRICULUM = [
  {
    id: 1, emoji: "🌱", color: "#4ade80",
    title:   { sk: "Sčítanie do 5",             en: "Addition up to 5" },
    explain: {
      sk: "Začíname úplne od začiatku! Sčítanie znamená, že spájame veci dokopy. Napríklad: 2 jablká a 3 jablká sú spolu 5 jabĺk. Skús si to predstaviť na prstoch! Keď si pripravený, skús príklady a snaž sa odpovedať čo najrýchlejšie.",
      en: "We start from the very beginning! Addition means putting things together. For example: 2 apples and 3 apples make 5 apples. Try to imagine it on your fingers! When you're ready, try the exercises and answer as fast as you can.",
    },
    tip: { sk: "💡 Počítaj na prstoch – je to normálne a pomáha!", en: "💡 Count on your fingers – it's totally normal and it helps!" },
    ops: ["+"], maxNum: 5, maxResult: 5,
    mastery: { correct: 20, avgTime: 6, minDays: 1 },
  },
  {
    id: 2, emoji: "🌿", color: "#34d399",
    title:   { sk: "Sčítanie do 10",            en: "Addition up to 10" },
    explain: {
      sk: "Výborne! Teraz ideme do 10. Skús si čísla predstaviť ako guľôčky. Napríklad 6+4: predstav si 6 bodov a pridaj 4 — spolu 10! Toto je základ, ktorý musíš vedieť naspamäť.",
      en: "Well done! Now we go up to 10. Try to picture numbers as dots. For example 6+4: picture 6 dots and add 4 more — that's 10! This foundation is important to know by heart.",
    },
    tip: { sk: "💡 Zapamätaj si: 5+5=10, 6+4=10, 7+3=10, 8+2=10, 9+1=10", en: "💡 Memorise: 5+5=10, 6+4=10, 7+3=10, 8+2=10, 9+1=10" },
    ops: ["+"], maxNum: 9, maxResult: 10,
    mastery: { correct: 25, avgTime: 4, minDays: 2 },
  },
  {
    id: 3, emoji: "🍀", color: "#10b981",
    title:   { sk: "Odčítanie do 10",           en: "Subtraction up to 10" },
    explain: {
      sk: "Odčítanie je opak sčítania — berieme preč. Napríklad: mal si 8 sladkostí, zjedol si 3, zostalo ti 5. Ak vieš sčítanie, odčítanie bude ľahké!",
      en: "Subtraction is the opposite of addition — we take away. For example: you had 8 sweets, ate 3, and 5 are left. If you know addition, subtraction will be easy!",
    },
    tip: { sk: "💡 Trik: 8−3 = ? → mysli: 3 + ? = 8 → odpoveď je 5!", en: "💡 Trick: 8−3 = ? → think: 3 + ? = 8 → the answer is 5!" },
    ops: ["-"], maxNum: 10, maxResult: 10,
    mastery: { correct: 25, avgTime: 4, minDays: 2 },
  },
  {
    id: 4, emoji: "🌻", color: "#f59e0b",
    title:   { sk: "Sčítanie a odčítanie do 20", en: "Addition & subtraction up to 20" },
    explain: {
      sk: "Teraz kombinujeme! Kľúčový trik: 13+4 — najprv si pamätaj 13, potom počítaj ďalej: 14, 15, 16, 17. Alebo rozlož: 13+4 = 10+3+4 = 17.",
      en: "Now we combine! Key trick: 13+4 — keep 13 in your head, then count on: 14, 15, 16, 17. Or split: 13+4 = 10+3+4 = 17.",
    },
    tip: { sk: "💡 Rozkladaj: 16+5 = 16+4+1 = 20+1 = 21", en: "💡 Split: 16+5 = 16+4+1 = 20+1 = 21" },
    ops: ["+", "-"], maxNum: 20, maxResult: 20,
    mastery: { correct: 30, avgTime: 5, minDays: 3 },
  },
  {
    id: 5, emoji: "⭐", color: "#eab308",
    title:   { sk: "Násobilka 2, 5, 10",        en: "Times tables 2, 5, 10" },
    explain: {
      sk: "Násobilka je rýchle sčítanie rovnakých čísel! 3×2 = 2+2+2 = 6. Začneme s najľahšími: 2, 5 a 10. Násobilka 10 je super — len pripiš nulu! 7×10=70.",
      en: "Multiplication is fast repeated addition! 3×2 = 2+2+2 = 6. We start with the easiest: 2, 5 and 10. The 10 times table is super easy — just add a zero! 7×10=70.",
    },
    tip: { sk: "💡 Násobilka 5 vždy končí na 0 alebo 5!", en: "💡 The 5 times table always ends in 0 or 5!" },
    ops: ["×"], multOf: [2, 5, 10], maxFactor: 10,
    mastery: { correct: 30, avgTime: 5, minDays: 3 },
  },
  {
    id: 6, emoji: "🚀", color: "#06b6d4",
    title:   { sk: "Násobilka do 10",           en: "Times tables up to 10" },
    explain: {
      sk: "Toto je najdôležitejší level! Celá násobilka 1–10. Trik pre 9: 9×6 = (10×6)−6 = 54. A pamätaj: 3×7 = 7×3!",
      en: "This is the most important level! Full times tables 1–10. Trick for 9: 9×6 = (10×6)−6 = 54. And remember: 3×7 = 7×3!",
    },
    tip: { sk: "💡 9×7 → sklop 7. prst → 6 vľavo, 3 vpravo = 63!", en: "💡 9×7 → fold 7th finger → 6 left, 3 right = 63!" },
    ops: ["×"], maxFactor: 10,
    mastery: { correct: 40, avgTime: 4, minDays: 5 },
  },
  {
    id: 7, emoji: "👑", color: "#a78bfa",
    title:   { sk: "Majster aritmetiky",        en: "Arithmetic Master" },
    explain: {
      sk: "Gratulujeme! Dosiahol si najvyšší level. Tu budeš trénovať všetko spolu — rýchlo a presne. Toto je mentálna matematika!",
      en: "Congratulations! You've reached the top level. Here you'll practise everything together — fast and accurate. This is mental arithmetic!",
    },
    tip: { sk: "💡 Pracuj zľava doprava, rozkladaj čísla!", en: "💡 Work left to right, break numbers apart!" },
    ops: ["+", "-", "×"], maxNum: 20, maxFactor: 10,
    mastery: { correct: 50, avgTime: 3, minDays: 7 },
  },
];

const AVATARS = ["🦊","🐺","🦁","🐯","🐻","🐼","🐨","🦄","🐲","🚀","⭐","🎯"];
const DEFAULT_PIN = "0000";
const DAILY_GOAL  = 15;

function todayStr() { return new Date().toISOString().slice(0, 10); }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }

// ═══════════════════════════════════════════════════════════════
// PROBLEM GENERATOR
// ═══════════════════════════════════════════════════════════════
function genProblem(lvl, prevAnswer = null) {
  const op = lvl.ops[Math.floor(Math.random() * lvl.ops.length)];
  let a, b, answer, display;
  if (op === "×") {
    const pool = lvl.multOf || Array.from({length:(lvl.maxFactor||10)-1},(_,i)=>i+2);
    b = pool[Math.floor(Math.random()*pool.length)];
    a = Math.floor(Math.random()*(lvl.maxFactor||10))+1;
    answer = a*b; display = `${a} × ${b}`;
  } else if (op === "+") {
    a = prevAnswer ?? (Math.floor(Math.random()*(lvl.maxNum-1))+1);
    const maxB = lvl.maxResult ? Math.max(1, Math.min(lvl.maxNum, lvl.maxResult-a)) : lvl.maxNum;
    b = Math.floor(Math.random()*maxB)+1;
    answer = a+b; display = `${a} + ${b}`;
  } else {
    a = prevAnswer ?? (Math.floor(Math.random()*lvl.maxNum)+2);
    b = Math.floor(Math.random()*(a-1))+1;
    answer = a-b; display = `${a} − ${b}`;
  }
  const wrong = new Set();
  let tries=0;
  while(wrong.size<3 && tries++<40){
    const d=Math.floor(Math.random()*4)+1;
    const w=Math.random()<0.5?answer+d:answer-d;
    if(w!==answer&&w>=0) wrong.add(w);
  }
  return { a,b,op,display,answer, choices:[...wrong,answer].sort(()=>Math.random()-0.5) };
}

// ═══════════════════════════════════════════════════════════════
// SPEECH
// ═══════════════════════════════════════════════════════════════
function speak(text, lang="sk") {
  if(!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang==="sk"?"sk-SK":"en-GB"; u.rate=0.92; u.pitch=1.05;
  window.speechSynthesis.speak(u);
}

// ═══════════════════════════════════════════════════════════════
// AI FEEDBACK
// ═══════════════════════════════════════════════════════════════
async function getAIFeedback(problem, userAnswer, isCorrect, rt, lang) {
  const isSk = lang==="sk";
  const prompt = isCorrect
    ? (isSk
        ? `Dieťa (9 rokov) správne vypočítalo ${problem.display} = ${problem.answer} za ${rt.toFixed(1)}s. Pochváľ ho jednou hravou vetou v slovenčine s emoji. Max 12 slov.`
        : `A 9-year-old correctly solved ${problem.display} = ${problem.answer} in ${rt.toFixed(1)}s. One short fun praise in English with emoji. Max 12 words.`)
    : (isSk
        ? `Dieťa odpovedalo ${userAnswer} na ${problem.display}=?. Správne: ${problem.answer}. Vysvetli chybu jemne, 2 vety, slovenčina, emoji.`
        : `Child answered ${userAnswer} for ${problem.display}=?. Correct: ${problem.answer}. Explain gently, 2 sentences, English, emoji.`);
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:100,
        messages:[{role:"user",content:prompt}]}),
    });
    const d = await r.json();
    return d.content?.[0]?.text || (isCorrect?"Skvelé! 🌟":`Správne je ${problem.answer}. 💪`);
  } catch {
    return isCorrect
      ? (isSk?["Výborne! 🌟","Skvelé! 🔥","Úžasné! ⭐"][Math.floor(Math.random()*3)]:["Great! 🌟","Awesome! 🔥","Brilliant! ⭐"][Math.floor(Math.random()*3)])
      : (isSk?`Správna odpoveď je ${problem.answer}. Nevadí! 💪`:`Correct answer is ${problem.answer}. Keep going! 💪`);
  }
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT GAME STATE
// ═══════════════════════════════════════════════════════════════
const DEFAULT_GS = {
  currentLevelId: 1,
  lang: "sk",
  streak: 0,
  lastPlayedDate: null,
  totalDays: 0,
  sessionHistory: [],
  masteryProgress: {},
  unlockedLevels: [1],
  parentPin: DEFAULT_PIN,
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════
function SpeedRing({ elapsed, targetTime, size=72 }) {
  const r=size/2-6, circ=2*Math.PI*r;
  const ratio=clamp(1-elapsed/(targetTime*1.5),0,1);
  const col=ratio>0.55?"#4ade80":ratio>0.25?"#facc15":"#f87171";
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={circ*(1-ratio)} strokeLinecap="round"
        style={{transition:"stroke-dashoffset 0.15s linear,stroke 0.3s"}}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{fill:col,fontSize:15,fontWeight:900,fontFamily:"'Nunito',sans-serif",
          transform:"rotate(90deg)",transformOrigin:`${size/2}px ${size/2}px`}}>
        {Math.max(0,Math.ceil(targetTime*1.5-elapsed))}
      </text>
    </svg>
  );
}

function MasteryBar({ levelId, progress, lang }) {
  const lvl=CURRICULUM.find(l=>l.id===levelId); if(!lvl) return null;
  const p=progress?.[levelId]||{correct:0,times:[],daysPlayed:[]};
  const m=lvl.mastery;
  const avgT=p.times?.length>0?p.times.reduce((a,b)=>a+b,0)/p.times.length:999;
  const rows=[
    [lang==="sk"?"Správne odpovede":"Correct answers", Math.min(1,p.correct/m.correct), `${p.correct}/${m.correct}`, "#4ade80"],
    [lang==="sk"?"Rýchlosť":"Speed", Math.min(1,avgT<=m.avgTime?1:m.avgTime/avgT), avgT<90?`${avgT.toFixed(1)}s / ${m.avgTime}s`:"–", "#06b6d4"],
    [lang==="sk"?"Dni tréningu":"Training days", Math.min(1,(p.daysPlayed?.length||0)/m.minDays), `${p.daysPlayed?.length||0}/${m.minDays}`, "#f59e0b"],
  ];
  const overall=(rows[0][1]+rows[1][1]+rows[2][1])/3;
  return (
    <div style={{marginTop:8}}>
      <div style={{fontSize:12,color:"#94a3b8",marginBottom:6}}>{lang==="sk"?"Postup k zvládnutiu":"Progress to mastery"}</div>
      {rows.map(([label,pct,val,color])=>(
        <div key={label} style={{marginBottom:6}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#cbd5e1",marginBottom:3}}>
            <span>{label}</span><span style={{color}}>{val}</span>
          </div>
          <div style={{height:8,background:"rgba(255,255,255,0.07)",borderRadius:10,overflow:"hidden"}}>
            <div style={{width:`${pct*100}%`,height:"100%",background:color,borderRadius:10,transition:"width 0.5s"}}/>
          </div>
        </div>
      ))}
      <div style={{marginTop:6,fontSize:13,textAlign:"center",color:overall>=1?"#4ade80":"#94a3b8"}}>
        {overall>=1
          ?(lang==="sk"?"✅ Pripravený na schválenie rodiča!":"✅ Ready for parent approval!")
          :`${Math.round(overall*100)}% ${lang==="sk"?"zvládnuté":"mastered"}`}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function MathQuest() {
  // ── auth state ──
  const [authState, setAuthState] = useState("loading"); // loading | loggedout | setup | ready
  const [fbUser, setFbUser]       = useState(null);
  const [authError, setAuthError] = useState("");
  const [fbLoading, setFbLoading] = useState(false);

  // ── profile setup ──
  const [setupNick, setSetupNick]     = useState("");
  const [setupAvatar, setSetupAvatar] = useState(AVATARS[0]);
  const [setupLang, setSetupLang]     = useState("sk");

  // ── game state (synced with Firestore) ──
  const [gs, setGs]         = useState(DEFAULT_GS);
  const [screen, setScreen] = useState("home");
  const [lang, setLang]     = useState("sk");

  // ── session ──
  const [problem, setProblem]           = useState(null);
  const [selected, setSelected]         = useState(null);
  const [aiMsg, setAiMsg]               = useState("");
  const [aiLoading, setAiLoading]       = useState(false);
  const [elapsed, setElapsed]           = useState(0);
  const [shake, setShake]               = useState(false);
  const [celebrate, setCelebrate]       = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal]     = useState(0);
  const [sessionTimes, setSessionTimes]     = useState([]);

  // ── parent ──
  const [pinInput, setPinInput]       = useState("");
  const [pinError, setPinError]       = useState(false);
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [changingPin, setChangingPin] = useState(false);
  const [newPin1, setNewPin1]         = useState("");
  const [newPin2, setNewPin2]         = useState("");
  const [pinChangeMsg, setPinChangeMsg] = useState(null);

  const timerRef = useRef(null);
  const startRef = useRef(null);
  const isSk     = lang === "sk";

  const currentLvl = CURRICULUM.find(l=>l.id===gs.currentLevelId)||CURRICULUM[0];
  const mp = gs.masteryProgress?.[gs.currentLevelId]||{correct:0,times:[],daysPlayed:[]};
  const avgTime = mp.times?.length>4 ? mp.times.slice(-10).reduce((a,b)=>a+b,0)/Math.min(10,mp.times.length) : currentLvl.mastery.avgTime*2.5;
  const dynamicTarget = Math.max(currentLvl.mastery.avgTime*0.8, Math.min(avgTime*0.95, currentLvl.mastery.avgTime*2.5));

  // ── init Firebase auth listener ──
  useEffect(()=>{
    let unsub;
    (async()=>{
      try {
        const auth = await signInWithGoogle(); // loads SDK, doesn't open popup
        unsub = auth.onAuthStateChanged(async user=>{
          if(user){
            setFbUser(user);
            const profile = await loadProfile(user.uid);
            if(!profile || !profile.nickname){
              setAuthState("setup");
            } else {
              const merged = {...DEFAULT_GS, ...profile};
              setGs(merged);
              setLang(merged.lang||"sk");
              setAuthState("ready");
            }
          } else {
            setAuthState("loggedout");
          }
        });
      } catch(e){
        console.warn("Firebase init error",e);
        setAuthState("loggedout");
      }
    })();
    return ()=>{ if(unsub) unsub(); };
  },[]);

  // ── persist gs to Firestore whenever it changes ──
  const saveGs = useCallback(async(newGs)=>{
    if(!fbUser) return;
    await saveProfile(fbUser.uid, newGs);
  },[fbUser]);

  const updateGs = useCallback((updater)=>{
    setGs(prev=>{
      const next = typeof updater==="function"?updater(prev):{...prev,...updater};
      saveGs(next);
      return next;
    });
  },[saveGs]);

  // ── streak on mount ──
  useEffect(()=>{
    if(authState!=="ready") return;
    const today=todayStr();
    if(gs.lastPlayedDate!==today){
      const yesterday=new Date(); yesterday.setDate(yesterday.getDate()-1);
      const yStr=yesterday.toISOString().slice(0,10);
      if(gs.lastPlayedDate!==yStr) updateGs({streak:0});
    }
  },[authState]);

  // ── elapsed timer ──
  useEffect(()=>{
    if(screen!=="game"||selected!==null) return;
    startRef.current = startRef.current||Date.now();
    timerRef.current = setInterval(()=>setElapsed((Date.now()-startRef.current)/1000),100);
    return()=>clearInterval(timerRef.current);
  },[screen,selected,problem]);

  function isMasteryReached(){
    const p=gs.masteryProgress?.[gs.currentLevelId]||{correct:0,times:[],daysPlayed:[]};
    const m=currentLvl.mastery;
    const avg=p.times?.length>0?p.times.reduce((a,b)=>a+b,0)/p.times.length:999;
    return p.correct>=m.correct && avg<=m.avgTime && (p.daysPlayed?.length||0)>=m.minDays;
  }

  function startGame(){
    setProblem(genProblem(currentLvl));
    setSelected(null); setAiMsg(""); setCelebrate(false); setShake(false);
    setSessionCorrect(0); setSessionTotal(0); setSessionTimes([]);
    setElapsed(0); startRef.current=Date.now();
    setScreen("game");
  }

  async function handleAnswer(choice){
    if(selected!==null) return;
    clearInterval(timerRef.current);
    const rt=(Date.now()-startRef.current)/1000;
    const isCorrect=choice===problem.answer;
    setSelected(choice); setAiLoading(true);
    const newSC=sessionCorrect+(isCorrect?1:0);
    const newTimes=[...sessionTimes,rt];
    setSessionCorrect(newSC); setSessionTotal(t=>t+1); setSessionTimes(newTimes);
    if(isCorrect) setCelebrate(true);
    else { setShake(true); setTimeout(()=>setShake(false),600); }

    updateGs(prev=>{
      const mp=prev.masteryProgress?.[prev.currentLevelId]||{correct:0,times:[],daysPlayed:[]};
      const days=new Set(mp.daysPlayed||[]); days.add(todayStr());
      return {
        ...prev,
        masteryProgress:{
          ...prev.masteryProgress,
          [prev.currentLevelId]:{
            correct:mp.correct+(isCorrect?1:0),
            times:[...(mp.times||[]).slice(-49),rt],
            daysPlayed:[...days],
          },
        },
      };
    });

    const msg=await getAIFeedback(problem,choice,isCorrect,rt,lang);
    setAiMsg(msg); setAiLoading(false);
    if(isCorrect) speak(msg.replace(/[\u{1F300}-\u{1FFFF}]/gu,""),lang);
  }

  function nextProblem(){
    if(sessionCorrect>=DAILY_GOAL){ finishSession(); return; }
    setProblem(genProblem(currentLvl,problem?.answer));
    setSelected(null); setAiMsg(""); setCelebrate(false);
    setElapsed(0); startRef.current=Date.now();
  }

  function finishSession(){
    const today=todayStr();
    const avgT=sessionTimes.length>0?sessionTimes.reduce((a,b)=>a+b,0)/sessionTimes.length:0;
    updateGs(prev=>{
      const wasToday=prev.lastPlayedDate===today;
      const yesterday=new Date(); yesterday.setDate(yesterday.getDate()-1);
      const yStr=yesterday.toISOString().slice(0,10);
      const newStreak=wasToday?prev.streak:(prev.lastPlayedDate===yStr?prev.streak+1:1);
      return {
        ...prev, streak:newStreak, lastPlayedDate:today,
        totalDays:prev.totalDays+(wasToday?0:1),
        sessionHistory:[...(prev.sessionHistory||[]).slice(-29),
          {date:today,correct:sessionCorrect,avgTime:avgT,levelId:prev.currentLevelId}],
        pendingApproval:isMasteryReached()?prev.currentLevelId:prev.pendingApproval,
      };
    });
    setScreen("summary");
  }

  // ── STYLES ──
  const C={bg:"#0d0b1e",card:"rgba(255,255,255,0.055)",border:"rgba(255,255,255,0.1)",
    a1:"#f59e0b",a2:"#06b6d4",a3:"#a78bfa",a4:"#4ade80",
    correct:"#4ade80",wrong:"#f87171",text:"#f1f5f9",sub:"#94a3b8"};
  const FF="'Nunito','Segoe UI',Arial,sans-serif";
  const appStyle={minHeight:"100vh",
    background:"linear-gradient(150deg,#0d0b1e 0%,#1a1040 50%,#0d1829 100%)",
    fontFamily:FF,color:C.text,display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 12px"};
  const card={background:C.card,border:`1px solid ${C.border}`,borderRadius:24,
    backdropFilter:"blur(16px)",width:"100%",maxWidth:440,marginBottom:10};
  const btn=(col,full=true)=>({
    background:`linear-gradient(135deg,${col},${col}cc)`,border:"none",borderRadius:18,
    padding:"14px 0",color:"#0d0b1e",fontFamily:FF,fontSize:18,fontWeight:900,cursor:"pointer",
    boxShadow:`0 4px 20px ${col}44`,width:full?"100%":"auto",maxWidth:full?440:"none",
    minWidth:full?0:100,display:"block",textAlign:"center",
  });
  const css=`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    body{margin:0;background:#0d0b1e;font-family:'Nunito','Segoe UI',Arial,sans-serif}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    @keyframes popIn{from{transform:scale(0) rotate(-8deg);opacity:0}80%{transform:scale(1.07)}to{transform:scale(1);opacity:1}}
    @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
    @keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
    @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    button:active{transform:scale(0.93)!important}
    input{font-family:'Nunito','Segoe UI',Arial,sans-serif}
  `;

  const AVATAR_STAGES=[{min:1,e:"🥚"},{min:2,e:"🐣"},{min:3,e:"🐥"},{min:5,e:"🦅"},{min:8,e:"🦄"},{min:12,e:"🐉"}];
  const totalLevel=gs.unlockedLevels?.length||1;
  const avatar=[...AVATAR_STAGES].reverse().find(a=>totalLevel>=a.min)||AVATAR_STAGES[0];

  // ════════════════════════════════════════════════════════════
  // LOADING
  // ════════════════════════════════════════════════════════════
  if(authState==="loading") return (
    <div style={{...appStyle,justifyContent:"center",alignItems:"center"}}>
      <style>{css}</style>
      <div style={{fontSize:64,animation:"spin 1.5s linear infinite"}}>⚙️</div>
      <div style={{color:C.sub,marginTop:16,fontSize:16}}>Načítavam…</div>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // LOGIN
  // ════════════════════════════════════════════════════════════
  if(authState==="loggedout") return (
    <div style={{...appStyle,justifyContent:"center"}}>
      <style>{css}</style>
      <div style={{fontSize:72,animation:"float 3s ease-in-out infinite",marginBottom:8}}>🧙</div>
      <h1 style={{margin:"0 0 4px",fontSize:34,
        background:`linear-gradient(90deg,${C.a1},${C.a2},${C.a3})`,
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        backgroundSize:"200%",animation:"shimmer 4s linear infinite"}}>MathQuest ⚡</h1>
      <p style={{color:C.sub,fontSize:15,textAlign:"center",maxWidth:300,margin:"8px 0 28px",lineHeight:1.6}}>
        Matematika hrou — každý deň o kúsok lepšie!
      </p>
      <div style={{...card,padding:"24px",textAlign:"center"}}>
        <div style={{fontSize:15,color:C.sub,marginBottom:16}}>
          Prihlás sa cez Google účet
        </div>
        {authError && <div style={{color:C.wrong,fontSize:13,marginBottom:12}}>{authError}</div>}
        <button style={{...btn(C.a1),display:"flex",alignItems:"center",justifyContent:"center",gap:10}}
          onClick={async()=>{
            setFbLoading(true); setAuthError("");
            try { await googleLogin(); }
            catch(e){ setAuthError("Prihlásenie zlyhalo. Skús znova."); }
            finally { setFbLoading(false); }
          }}>
          {fbLoading
            ? <span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⏳</span>
            : <><span style={{fontSize:20}}>G</span> Prihlásiť sa cez Google</>}
        </button>
      </div>
      <div style={{color:C.sub,fontSize:12,marginTop:16,textAlign:"center",maxWidth:300,lineHeight:1.5}}>
        Pokrok sa uloží do cloudu a bude dostupný na akomkoľvek zariadení 🌐
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // FIRST-TIME SETUP (nickname + avatar)
  // ════════════════════════════════════════════════════════════
  if(authState==="setup") return (
    <div style={appStyle}>
      <style>{css}</style>
      <div style={{fontSize:64,marginBottom:8,animation:"float 3s ease-in-out infinite"}}>{setupAvatar}</div>
      <h2 style={{margin:"0 0 4px",fontSize:26,
        background:`linear-gradient(90deg,${C.a1},${C.a2})`,
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
        Vitaj v MathQuest!
      </h2>
      <p style={{color:C.sub,fontSize:14,margin:"4px 0 18px",textAlign:"center"}}>
        Nastavíme tvoj profil — potrvá to minútku 🎉
      </p>

      <div style={{...card,padding:"20px 22px"}}>
        {/* Nickname */}
        <div style={{fontSize:14,color:C.sub,marginBottom:8}}>Tvoja prezývka</div>
        <input maxLength={20} placeholder="napr. Matičko, Zuzka..." value={setupNick}
          onChange={e=>setSetupNick(e.target.value)}
          style={{width:"100%",padding:"12px",fontSize:18,
            background:"rgba(255,255,255,0.07)",border:`2px solid ${C.border}`,
            borderRadius:14,color:C.text,outline:"none",marginBottom:16}}/>

        {/* Avatar */}
        <div style={{fontSize:14,color:C.sub,marginBottom:10}}>Vyber si avatara</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:16}}>
          {AVATARS.map(a=>(
            <button key={a} onClick={()=>setSetupAvatar(a)} style={{
              fontSize:28,padding:"8px 0",borderRadius:14,border:"none",cursor:"pointer",
              background:setupAvatar===a?`${C.a1}33`:"rgba(255,255,255,0.05)",
              outline:setupAvatar===a?`2px solid ${C.a1}`:"none",
            }}>{a}</button>
          ))}
        </div>

        {/* Language */}
        <div style={{fontSize:14,color:C.sub,marginBottom:8}}>Jazyk aplikácie</div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {["sk","en"].map(l=>(
            <button key={l} onClick={()=>setSetupLang(l)} style={{
              flex:1,padding:"10px",borderRadius:14,border:"none",cursor:"pointer",fontFamily:FF,fontWeight:900,fontSize:15,
              background:setupLang===l?C.a1:"rgba(255,255,255,0.07)",
              color:setupLang===l?"#0d0b1e":C.sub,
            }}>{l==="sk"?"🇸🇰 Slovenčina":"🇬🇧 English"}</button>
          ))}
        </div>
      </div>

      <button style={btn(C.a1)} onClick={async()=>{
        if(!setupNick.trim()){ alert("Zadaj prezývku!"); return; }
        const profile={...DEFAULT_GS, nickname:setupNick.trim(), avatar:setupAvatar, lang:setupLang,
          email:fbUser.email, displayName:fbUser.displayName};
        await saveProfile(fbUser.uid,profile);
        setGs(profile); setLang(setupLang); setAuthState("ready");
      }}>
        🚀 Začať dobrodružstvo!
      </button>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // EXPLAIN SCREEN
  // ════════════════════════════════════════════════════════════
  if(screen==="explain"){
    const lvl=currentLvl;
    return (
      <div style={appStyle}>
        <style>{css}</style>
        <div style={{display:"flex",gap:8,marginBottom:12,alignSelf:"flex-end",maxWidth:440,width:"100%"}}>
          {["sk","en"].map(l=>(
            <button key={l} onClick={()=>{setLang(l);updateGs({lang:l});}} style={{
              background:lang===l?C.a1:"rgba(255,255,255,0.07)",border:"none",borderRadius:12,
              padding:"6px 16px",color:lang===l?"#0d0b1e":C.sub,fontFamily:FF,cursor:"pointer",fontSize:14,fontWeight:900,
            }}>{l==="sk"?"🇸🇰 SK":"🇬🇧 EN"}</button>
          ))}
        </div>
        <div style={{fontSize:64,margin:"4px 0",animation:"float 3s ease-in-out infinite"}}>{lvl.emoji}</div>
        <h2 style={{margin:"0 0 4px",fontSize:24,textAlign:"center",
          background:`linear-gradient(90deg,${lvl.color},${C.a2})`,
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{lvl.title[lang]}</h2>
        <div style={{fontSize:13,color:C.sub,marginBottom:14}}>Level {lvl.id} / {CURRICULUM.length}</div>
        <div style={{...card,padding:"20px 22px"}}>
          <p style={{margin:0,fontSize:16,lineHeight:1.7,color:C.text}}>{lvl.explain[lang]}</p>
          <div style={{marginTop:12,padding:"10px 14px",background:"rgba(255,255,255,0.04)",borderRadius:14,fontSize:14,color:C.a1}}>
            {lvl.tip[lang]}
          </div>
          <button onClick={()=>speak(lvl.explain[lang]+" "+lvl.tip[lang].replace(/💡/g,""),lang)}
            style={{...btn(C.a3,false),marginTop:14,padding:"10px 22px",fontSize:15,
              display:"flex",alignItems:"center",gap:8,margin:"14px auto 0"}}>
            🔊 {isSk?"Prečítať nahlas":"Read aloud"}
          </button>
        </div>
        <MasteryBar levelId={lvl.id} progress={gs.masteryProgress} lang={lang}/>
        <button style={btn(C.a1)} onClick={startGame}>🚀 {isSk?"Začať tréning!":"Start training!"}</button>
        <button style={{...btn(C.a2),background:"transparent",border:`1px solid ${C.border}`,color:C.sub,boxShadow:"none"}}
          onClick={()=>setScreen("home")}>← {isSk?"Späť":"Back"}</button>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // GAME SCREEN
  // ════════════════════════════════════════════════════════════
  if(screen==="game" && problem){
    const isAnswered=selected!==null;
    const wasCorrect=isAnswered&&selected===problem.answer;
    const progress=Math.min(1,sessionCorrect/DAILY_GOAL);
    return (
      <div style={appStyle}>
        <style>{css}</style>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",maxWidth:440,marginBottom:10}}>
          <button onClick={()=>{clearInterval(timerRef.current);setScreen("home");}}
            style={{background:"none",border:`1px solid ${C.border}`,borderRadius:12,color:C.sub,
              padding:"6px 14px",cursor:"pointer",fontSize:13,fontFamily:FF}}>
            ← {isSk?"Domov":"Home"}
          </button>
          <div style={{fontSize:13,color:C.sub,display:"flex",gap:10,alignItems:"center"}}>
            <span>{gs.avatar||"🦊"} {gs.nickname}</span>
            <span>🔥 {gs.streak}</span>
          </div>
        </div>

        {/* Daily bar */}
        <div style={{...card,padding:"10px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.sub,marginBottom:5}}>
            <span>{isSk?"Dnešný cieľ":"Daily goal"}</span>
            <span style={{color:C.a1}}>{sessionCorrect} / {DAILY_GOAL} ✅</span>
          </div>
          <div style={{height:10,background:"rgba(255,255,255,0.07)",borderRadius:10,overflow:"hidden"}}>
            <div style={{width:`${progress*100}%`,height:"100%",
              background:`linear-gradient(90deg,${C.a1},${C.a4})`,borderRadius:10,transition:"width 0.4s"}}/>
          </div>
        </div>

        {/* Problem */}
        <div style={{display:"flex",alignItems:"center",gap:12,width:"100%",maxWidth:440,marginBottom:10}}>
          <SpeedRing elapsed={elapsed} targetTime={dynamicTarget} size={72}/>
          <div style={{...card,flex:1,margin:0,padding:"20px 16px",textAlign:"center",position:"relative",
            animation:shake?"shake 0.5s ease":"slideUp 0.25s ease",
            border:isAnswered?(wasCorrect?`1px solid ${C.correct}55`:`1px solid ${C.wrong}44`):`1px solid ${C.border}`}}>
            {isAnswered&&wasCorrect&&(
              <div style={{position:"absolute",inset:0,pointerEvents:"none",borderRadius:24,overflow:"hidden"}}>
                {[..."⭐🌟✨"].map((s,i)=>(
                  <span key={i} style={{position:"absolute",left:`${20+i*28}%`,top:"10%",fontSize:18,
                    animation:`popIn 0.6s ease ${i*0.1}s both`}}>{s}</span>
                ))}
              </div>
            )}
            <div style={{fontSize:13,color:C.sub,marginBottom:6}}>{currentLvl.title[lang]}</div>
            <div style={{fontSize:46,fontWeight:900,letterSpacing:1}}>
              {problem.display} = <span style={{color:C.a1}}>?</span>
            </div>
          </div>
        </div>

        {/* Choices */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,width:"100%",maxWidth:440,marginBottom:10}}>
          {problem.choices.map((c,i)=>{
            let bg,border,col;
            if(!isAnswered){bg="rgba(255,255,255,0.05)";border=`2px solid ${C.a2}44`;col=C.text;}
            else if(c===problem.answer){bg=`${C.correct}22`;border=`2px solid ${C.correct}`;col=C.correct;}
            else if(c===selected){bg=`${C.wrong}18`;border=`2px solid ${C.wrong}`;col=C.wrong;}
            else{bg="rgba(255,255,255,0.02)";border=`2px solid ${C.border}`;col=C.sub;}
            return (
              <button key={i} onClick={()=>!isAnswered&&handleAnswer(c)} style={{
                background:bg,border,borderRadius:18,padding:"18px 10px",
                color:col,fontFamily:FF,fontSize:28,fontWeight:900,
                cursor:isAnswered?"default":"pointer",transition:"all 0.12s",
                animation:!isAnswered?`popIn 0.3s ease ${i*0.05}s both`:"none",
              }}>{c===problem.answer&&isAnswered?"✓ ":""}{c}</button>
            );
          })}
        </div>

        {(aiLoading||aiMsg)&&(
          <div style={{...card,padding:"14px 18px",animation:"popIn 0.3s ease",
            borderColor:wasCorrect?`${C.correct}44`:`${C.wrong}33`}}>
            {aiLoading
              ?<div style={{color:C.sub,fontSize:14,textAlign:"center"}}>🤔 {isSk?"Učiteľ premýšľa…":"Teacher is thinking…"}</div>
              :<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <p style={{margin:0,fontSize:15,lineHeight:1.6,color:wasCorrect?C.correct:C.text,flex:1}}>{aiMsg}</p>
                <button onClick={()=>speak(aiMsg.replace(/[^\w\s.,!?áéíóúäôšžčňľŕĺťďÁÉÍÓÚÄÔŠŽČŇĽŔĹŤĎ]/gu,""),lang)}
                  style={{background:"none",border:"none",cursor:"pointer",fontSize:20,flexShrink:0,padding:4}}>🔊</button>
              </div>}
          </div>
        )}

        {isAnswered&&!aiLoading&&(
          <button style={{...btn(wasCorrect?C.a4:C.a2),animation:"popIn 0.3s ease"}} onClick={nextProblem}>
            {sessionCorrect>=DAILY_GOAL
              ?`🏁 ${isSk?"Zobraziť výsledky":"Show results"}!`
              :wasCorrect?`➡ ${isSk?"Ďalší":"Next"} (${sessionCorrect}/${DAILY_GOAL})`
              :`🔄 ${isSk?"Ďalší":"Next"}`}
          </button>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════════════════════════════
  if(screen==="summary"){
    const avgT=sessionTimes.length>0?sessionTimes.reduce((a,b)=>a+b,0)/sessionTimes.length:0;
    const mastered=isMasteryReached();
    return (
      <div style={appStyle}>
        <style>{css}</style>
        <div style={{fontSize:64,animation:"float 3s ease-in-out infinite",marginBottom:8}}>
          {mastered?"🏆":sessionCorrect>=DAILY_GOAL?"🎉":"💪"}
        </div>
        <h2 style={{margin:"0 0 4px",fontSize:26,color:C.a1}}>
          {mastered?(isSk?"Level zvládnutý!":"Level mastered!")
            :sessionCorrect>=DAILY_GOAL?(isSk?"Cieľ splnený!":"Goal done!")
            :(isSk?"Dobrá práca!":"Good work!")}
        </h2>
        <div style={{color:C.sub,fontSize:14,marginBottom:14}}>🔥 {gs.streak} {isSk?"dní za sebou":"day streak"}</div>
        <div style={{...card,padding:"20px 22px"}}>
          {[[isSk?"Správne":"Correct",`${sessionCorrect}/${sessionTotal}`,C.a4],
            [isSk?"Priemerný čas":"Avg time",`${avgT.toFixed(1)}s`,avgT<dynamicTarget?C.a4:C.a1],
            [isSk?"Cieľový čas":"Target",`${dynamicTarget.toFixed(1)}s`,C.a2],
          ].map(([l,v,c])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{color:C.sub,fontSize:15}}>{l}</span>
              <span style={{fontWeight:900,color:c,fontSize:17}}>{v}</span>
            </div>
          ))}
          <div style={{marginTop:14}}>
            <div style={{fontSize:12,color:C.sub,marginBottom:6}}>{isSk?"Časy odpovedí":"Response times"}</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:3,height:40}}>
              {sessionTimes.map((t,i)=>{
                const h=Math.max(8,Math.min(100,(1-t/(dynamicTarget*2))*100));
                const c=t<dynamicTarget*0.7?C.a4:t<dynamicTarget?C.a1:C.wrong;
                return <div key={i} style={{flex:1,height:`${h}%`,background:c,borderRadius:4,minWidth:8,opacity:0.9}}/>;
              })}
            </div>
          </div>
          <MasteryBar levelId={gs.currentLevelId} progress={gs.masteryProgress} lang={lang}/>
        </div>
        {mastered&&(
          <div style={{...card,padding:"16px 20px",borderColor:`${C.a1}55`,textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:6}}>🔓 {isSk?"Pripravený na ďalší level!":"Ready for next level!"}</div>
            <div style={{fontSize:14,color:C.sub}}>
              {isSk?"Požiadaj rodiča o schválenie v sekcii Rodič.":"Ask a parent to approve in the Parent section."}
            </div>
          </div>
        )}
        <button style={btn(C.a1)} onClick={()=>setScreen("explain")}>🔄 {isSk?"Trénovať znova":"Train again"}</button>
        <button style={{...btn(C.a2),background:"transparent",border:`1px solid ${C.border}`,color:C.sub,boxShadow:"none"}}
          onClick={()=>setScreen("home")}>🏠 {isSk?"Domov":"Home"}</button>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // PARENT — PIN
  // ════════════════════════════════════════════════════════════
  if(screen==="parent"&&!parentUnlocked) return (
    <div style={appStyle}>
      <style>{css}</style>
      <div style={{fontSize:56,marginBottom:12}}>🔐</div>
      <h2 style={{margin:"0 0 8px"}}>{isSk?"Rodičovský prístup":"Parent Access"}</h2>
      <p style={{color:C.sub,fontSize:14,textAlign:"center",maxWidth:340,marginBottom:20}}>
        {isSk?"Zadaj PIN pre prístup k nastaveniam.":"Enter PIN to access settings."}
      </p>
      <div style={{...card,padding:"24px",textAlign:"center"}}>
        <input type="password" inputMode="numeric" maxLength={4} value={pinInput}
          onChange={e=>setPinInput(e.target.value)}
          style={{width:"100%",padding:"14px",fontSize:28,textAlign:"center",letterSpacing:12,
            background:"rgba(255,255,255,0.07)",border:`2px solid ${pinError?C.wrong:C.border}`,
            borderRadius:16,color:C.text,outline:"none",marginBottom:12}}/>
        {pinError&&<div style={{color:C.wrong,fontSize:14,marginBottom:8}}>{isSk?"Nesprávny PIN":"Wrong PIN"}</div>}
        <button style={btn(C.a1)} onClick={()=>{
          if(pinInput===(gs.parentPin||DEFAULT_PIN)){setParentUnlocked(true);setPinError(false);}
          else{setPinError(true);setPinInput("");}
        }}>{isSk?"Potvrdiť":"Confirm"}</button>
      </div>
      <button style={{...btn(C.a2),background:"transparent",border:`1px solid ${C.border}`,color:C.sub,boxShadow:"none"}}
        onClick={()=>setScreen("home")}>← {isSk?"Späť":"Back"}</button>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // PARENT — DASHBOARD
  // ════════════════════════════════════════════════════════════
  if(screen==="parent"&&parentUnlocked){
    const mastered=isMasteryReached();
    const nextLvl=CURRICULUM.find(l=>l.id===gs.currentLevelId+1);
    return (
      <div style={appStyle}>
        <style>{css}</style>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",maxWidth:440,marginBottom:14}}>
          <h2 style={{margin:0,fontSize:22}}>👨‍👩‍👧 {isSk?"Rodič / Učiteľ":"Parent / Teacher"}</h2>
          <button style={{...btn(C.wrong,false),padding:"6px 14px",fontSize:13,minWidth:0}}
            onClick={()=>{setParentUnlocked(false);setScreen("home");}}>
            {isSk?"Zavrieť":"Close"}
          </button>
        </div>

        {/* Child info */}
        <div style={{...card,padding:"16px 20px",display:"flex",alignItems:"center",gap:14}}>
          <div style={{fontSize:42}}>{gs.avatar||"🦊"}</div>
          <div>
            <div style={{fontWeight:900,fontSize:18}}>{gs.nickname}</div>
            <div style={{color:C.sub,fontSize:13}}>{fbUser?.email}</div>
          </div>
        </div>

        {/* Mastery */}
        <div style={{...card,padding:"18px 20px"}}>
          <div style={{fontWeight:900,fontSize:15,marginBottom:10}}>
            {isSk?"Aktuálny level:":"Current level:"} {currentLvl.emoji} {currentLvl.title[lang]}
          </div>
          <MasteryBar levelId={gs.currentLevelId} progress={gs.masteryProgress} lang={lang}/>
          {mastered&&nextLvl&&(
            <div style={{marginTop:14}}>
              <div style={{fontSize:14,color:C.a4,marginBottom:10,textAlign:"center"}}>
                ✅ {isSk?"Dieťa splnilo všetky kritériá!":"The child met all criteria!"}
              </div>
              <button style={btn(C.a4)} onClick={()=>{
                updateGs(prev=>({...prev,
                  currentLevelId:prev.currentLevelId+1,
                  unlockedLevels:[...new Set([...(prev.unlockedLevels||[]),prev.currentLevelId+1])],
                  pendingApproval:null,
                }));
                alert(isSk?`Level ${nextLvl.title.sk} odomknutý! 🎉`:`Level ${nextLvl.title.en} unlocked! 🎉`);
              }}>
                🔓 {isSk?"Odomknúť":"Unlock"}: {nextLvl.emoji} {nextLvl.title[lang]}
              </button>
            </div>
          )}
          {!mastered&&<div style={{marginTop:10,padding:"10px",background:"rgba(255,255,255,0.04)",borderRadius:12,fontSize:13,color:C.sub,textAlign:"center"}}>
            {isSk?"Ešte nespĺňa kritériá pre postup.":"Hasn't met the criteria yet."}
          </div>}
        </div>

        {/* History */}
        <div style={{...card,padding:"18px 20px"}}>
          <div style={{fontWeight:900,fontSize:14,marginBottom:10}}>📅 {isSk?"Posledné tréningy":"Recent sessions"}</div>
          {(gs.sessionHistory||[]).length===0
            ?<div style={{color:C.sub,fontSize:14}}>{isSk?"Žiadne záznamy":"No records yet"}</div>
            :[...(gs.sessionHistory||[])].reverse().slice(0,7).map((s,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:14}}>
                <span style={{color:C.sub}}>{s.date}</span>
                <span>✅ {s.correct}</span>
                <span style={{color:s.avgTime<(CURRICULUM.find(l=>l.id===s.levelId)?.mastery.avgTime||5)?C.a4:C.a1}}>
                  ⏱ {s.avgTime.toFixed(1)}s
                </span>
                <span style={{color:C.sub}}>{CURRICULUM.find(l=>l.id===s.levelId)?.emoji}</span>
              </div>
            ))}
        </div>

        {/* Settings */}
        <div style={{...card,padding:"16px 20px"}}>
          <div style={{fontSize:14,color:C.sub,marginBottom:10}}>{isSk?"Nastavenia":"Settings"}</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {["sk","en"].map(l=>(
              <button key={l} onClick={()=>{setLang(l);updateGs({lang:l});}} style={{
                flex:1,padding:"10px",borderRadius:14,border:"none",cursor:"pointer",fontFamily:FF,fontWeight:900,fontSize:14,
                background:lang===l?C.a1:"rgba(255,255,255,0.07)",color:lang===l?"#0d0b1e":C.sub,
              }}>{l==="sk"?"🇸🇰 Slovenčina":"🇬🇧 English"}</button>
            ))}
          </div>

          {/* Change PIN */}
          {!changingPin?(
            <button style={{...btn(C.a2),fontSize:14,marginBottom:10}} onClick={()=>{setChangingPin(true);setNewPin1("");setNewPin2("");setPinChangeMsg(null);}}>
              🔑 {isSk?"Zmeniť PIN":"Change PIN"}
            </button>
          ):(
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:"14px",marginBottom:10}}>
              <div style={{fontSize:14,color:C.sub,marginBottom:8}}>{isSk?"Nový PIN (4 číslice)":"New PIN (4 digits)"}</div>
              <input type="password" inputMode="numeric" maxLength={4} placeholder={isSk?"Nový PIN":"New PIN"}
                value={newPin1} onChange={e=>setNewPin1(e.target.value)}
                style={{width:"100%",padding:"10px",fontSize:22,textAlign:"center",letterSpacing:10,
                  background:"rgba(255,255,255,0.07)",border:`2px solid ${C.border}`,
                  borderRadius:12,color:C.text,outline:"none",marginBottom:8}}/>
              <input type="password" inputMode="numeric" maxLength={4} placeholder={isSk?"Zopakuj PIN":"Repeat PIN"}
                value={newPin2} onChange={e=>setNewPin2(e.target.value)}
                style={{width:"100%",padding:"10px",fontSize:22,textAlign:"center",letterSpacing:10,
                  background:"rgba(255,255,255,0.07)",border:`2px solid ${C.border}`,
                  borderRadius:12,color:C.text,outline:"none",marginBottom:10}}/>
              {pinChangeMsg&&<div style={{fontSize:13,color:pinChangeMsg.ok?C.a4:C.wrong,marginBottom:8,textAlign:"center"}}>{pinChangeMsg.text}</div>}
              <div style={{display:"flex",gap:8}}>
                <button style={{...btn(C.a4,false),flex:1,padding:"10px",fontSize:14}} onClick={()=>{
                  if(newPin1.length!==4||!/^\d{4}$/.test(newPin1)) setPinChangeMsg({ok:false,text:isSk?"PIN musia byť 4 číslice":"PIN must be 4 digits"});
                  else if(newPin1!==newPin2) setPinChangeMsg({ok:false,text:isSk?"PINy sa nezhodujú":"PINs don't match"});
                  else { updateGs(prev=>({...prev,parentPin:newPin1})); setPinChangeMsg({ok:true,text:isSk?"PIN zmenený ✅":"PIN changed ✅"}); setTimeout(()=>{setChangingPin(false);setPinChangeMsg(null);},1500); }
                }}>{isSk?"Uložiť":"Save"}</button>
                <button style={{...btn(C.sub,false),flex:1,padding:"10px",fontSize:14,background:"rgba(255,255,255,0.07)",color:C.sub,boxShadow:"none"}}
                  onClick={()=>{setChangingPin(false);setPinChangeMsg(null);}}>
                  {isSk?"Zrušiť":"Cancel"}
                </button>
              </div>
            </div>
          )}

          {/* Logout */}
          <button style={{...btn(C.a3),fontSize:14,marginBottom:8}} onClick={async()=>{
            await logOut(); setAuthState("loggedout"); setFbUser(null); setGs(DEFAULT_GS); setScreen("home"); setParentUnlocked(false);
          }}>🚪 {isSk?"Odhlásiť sa":"Sign out"}</button>

          <button style={{...btn(C.wrong),fontSize:14}} onClick={()=>{
            if(window.confirm(isSk?"Naozaj vymazať všetok pokrok?":"Really delete all progress?")) {
              const reset={...DEFAULT_GS,nickname:gs.nickname,avatar:gs.avatar,lang:gs.lang,email:gs.email,displayName:gs.displayName};
              saveProfile(fbUser.uid,reset); setGs(reset); setScreen("home"); setParentUnlocked(false);
            }
          }}>🗑️ {isSk?"Vymazať pokrok":"Reset progress"}</button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // HOME
  // ════════════════════════════════════════════════════════════
  const todayPlayed=gs.lastPlayedDate===todayStr();
  const mp2=gs.masteryProgress?.[gs.currentLevelId]||{correct:0,times:[],daysPlayed:[]};
  const masteryPct=Math.round(Math.min(100,(
    Math.min(1,mp2.correct/currentLvl.mastery.correct)+
    Math.min(1,mp2.times?.length>0?(mp2.times.reduce((a,b)=>a+b,0)/mp2.times.length<=currentLvl.mastery.avgTime?1:currentLvl.mastery.avgTime/(mp2.times.reduce((a,b)=>a+b,0)/mp2.times.length)):0)+
    Math.min(1,(mp2.daysPlayed?.length||0)/currentLvl.mastery.minDays)
  )/3*100));

  return (
    <div style={appStyle}>
      <style>{css}</style>

      {/* Top bar */}
      <div style={{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:440,marginBottom:8}}>
        <div style={{display:"flex",gap:6}}>
          {["sk","en"].map(l=>(
            <button key={l} onClick={()=>{setLang(l);updateGs({lang:l});}} style={{
              background:lang===l?C.a1:"rgba(255,255,255,0.07)",border:"none",borderRadius:10,
              padding:"5px 12px",color:lang===l?"#0d0b1e":C.sub,fontFamily:FF,cursor:"pointer",fontSize:13,fontWeight:900,
            }}>{l==="sk"?"🇸🇰":"🇬🇧"}</button>
          ))}
        </div>
        <button onClick={()=>{setParentUnlocked(false);setPinInput("");setScreen("parent");}} style={{
          background:"rgba(255,255,255,0.06)",border:`1px solid ${C.border}`,
          borderRadius:10,padding:"5px 14px",color:C.sub,fontFamily:FF,cursor:"pointer",fontSize:13}}>
          🔐 {isSk?"Rodič":"Parent"}
        </button>
      </div>

      {/* Avatar + greeting */}
      <div style={{fontSize:64,animation:"float 3.5s ease-in-out infinite",lineHeight:1,margin:"4px 0"}}>
        {gs.avatar||avatar.e}
      </div>
      <div style={{fontSize:16,fontWeight:700,marginBottom:2}}>
        {isSk?"Ahoj,":"Hi,"} {gs.nickname||"hráč"}! 👋
      </div>
      <h1 style={{margin:"4px 0 2px",fontSize:30,letterSpacing:1,
        background:`linear-gradient(90deg,${C.a1},${C.a2},${C.a3})`,
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        backgroundSize:"200%",animation:"shimmer 4s linear infinite"}}>MathQuest ⚡</h1>

      {/* Current level badge */}
      <div style={{display:"flex",alignItems:"center",gap:8,margin:"6px 0 14px",
        background:`${currentLvl.color}18`,border:`1px solid ${currentLvl.color}44`,
        borderRadius:14,padding:"6px 16px"}}>
        <span style={{fontSize:20}}>{currentLvl.emoji}</span>
        <span style={{fontWeight:900,color:currentLvl.color,fontSize:15}}>{currentLvl.title[lang]}</span>
      </div>

      {/* Stats */}
      <div style={{...card,padding:"16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-around",marginBottom:12}}>
          {[[`🔥 ${gs.streak}`,isSk?"Séria dní":"Day streak"],
            [`📅 ${gs.totalDays}`,isSk?"Celkom dní":"Total days"],
            [`💪 ${masteryPct}%`,isSk?"Zvládnuté":"Mastered"],
          ].map(([val,lab])=>(
            <div key={lab} style={{textAlign:"center"}}>
              <div style={{fontSize:20,fontWeight:900,color:C.a1}}>{val}</div>
              <div style={{fontSize:11,color:C.sub}}>{lab}</div>
            </div>
          ))}
        </div>
        <div style={{padding:"10px 14px",
          background:todayPlayed?`${C.a4}18`:"rgba(255,255,255,0.04)",
          border:`1px solid ${todayPlayed?C.a4+"44":C.border}`,
          borderRadius:14,textAlign:"center",fontSize:14,
          color:todayPlayed?C.a4:C.sub}}>
          {todayPlayed
            ?(isSk?"✅ Dnes si už trénoval/a! Skvelá práca.":"✅ You trained today! Great work.")
            :(isSk?"📌 Dnes ešte netrénovalo — poďme na to!":"📌 No training today yet — let's go!")}
        </div>
      </div>

      {/* Curriculum */}
      <div style={{...card,padding:"16px 20px"}}>
        <div style={{fontSize:14,color:C.sub,marginBottom:8}}>{isSk?"Osnova":"Curriculum"}</div>
        {CURRICULUM.map(lvl=>{
          const isCurr=lvl.id===gs.currentLevelId;
          const isDone=lvl.id<gs.currentLevelId;
          const isUnlocked=(gs.unlockedLevels||[1]).includes(lvl.id)||lvl.id<=gs.currentLevelId;
          return (
            <div key={lvl.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",
              borderBottom:`1px solid ${C.border}`,opacity:isUnlocked?1:0.3}}>
              <span style={{fontSize:20,filter:!isUnlocked?"grayscale(1)":"none"}}>{lvl.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:isCurr?900:600,color:isDone?C.sub:isCurr?lvl.color:C.text}}>
                  {lvl.title[lang]}
                </div>
                {isCurr&&<div style={{fontSize:11,color:C.sub}}>{isSk?"Aktuálny":"Current"} · {masteryPct}%</div>}
              </div>
              <span style={{fontSize:16}}>{isDone?"✅":isCurr?"▶️":"🔒"}</span>
            </div>
          );
        })}
      </div>

      <button style={btn(C.a1)} onClick={()=>setScreen("explain")}>
        🚀 {isSk?"Trénovať!":"Train!"}
      </button>
    </div>
  );
}
