import{r as v,j as n,a as p}from"./react-spline-Gm59yu5V.js";import{b as h}from"./sound-DXTyZfX8.js";import{a as le,b as de,c as m,B as _,S as ue,d as U,e as P,u as me,f as pe}from"./index-C2Rwre_m.js";const O=[{name:"Bot.ts",image:"bot.ts.png",description:"TypeScript framework for building Discord bots",detail:"Inclus un CLI pour générer des bots et des fichiers de bot. Actuellement mon projet le plus important.",url:"https://ghom.gitbook.io/bot.ts"},{name:"CRISPR-Crunch",image:"crispr-crunch.png",description:"Puzzle game about gene editing",detail:"Un jeu de puzzle sur l'édition de gènes réalisé avec TypeScript, PixiJS et Booyah avec l'équipe PlayCurious.",url:"https://playcurious.games/our-games/crispr-crunch"},{name:"Portfolio",image:"portfolio.png",description:"My personal portfolio with a card game",detail:"Mon portfolio réalisé avec TypeScript, React, Vite, Tailwind CSS, Zustand et beaucoup de passion"},{name:"Les Labs JS",image:"js-labs.png",description:"A Discord server for JavaScript developers I own and manage",detail:"Le meilleur endroit pour apprendre et partager sur l'écosystème JavaScript",url:"https://discord.gg/3vC2XWK"},{name:"2D Shooter",image:"shooter.png",description:"My first game in TypeScript",detail:"Un simple jeu de tir 2D avec un vaisseau spatial et des ennemis réalisé avec p5.js en TypeScript",url:"https://github.com/GhomKrosmonaute/TypedShooterGame"},{name:"Gario",image:"gario.png",description:"A 2D platformer game for showcase",detail:"Un simple jeu de plateforme 2D avec un système de checkpoint réalisé avec p5.js en TypeScript",url:"https://github.com/GhomKrosmonaute/Gario"},{name:"Booyah",image:"booyah.png",description:"A TypeScript game engine",detail:"Un moteur de jeu puissant utilisant des machines à états réalisé en TypeScript par Jesse Himmelstein et amélioré par Ghom",url:"https://github.com/GhomKrosmonaute/Booyah"},{name:"Nano",image:"nano.png",description:"TypeScript library for building modular Discord bots",detail:"Vous pouvez utiliser cette lib pour construire des bots Discord avec une architecture modulaire et flexible",url:"https://github.com/NanoWorkspace"},{name:"Sea Rescue",image:"sea-rescue.png",description:"3D game about ocean cleaning",detail:"Réalisé avec TypeScript, Three.js et Booyah avec l'équipe PlayCurious.",url:"https://playcurious.games/our-games/sea-rescue/"},{name:"Site Photographe",image:"photo.png",description:"A website for a photographer",detail:"Rélisé avec Next.js, TypeScript, React et Tailwind CSS. Optimisé pour le référencement et les performances. Inclus un CMS."},{name:"RedMetrics",image:"red-metrics.png",description:"Open source web metrics tool",detail:"Réalisé avec TypeScript, React, PostgreSQL et Express chez PlayCurious.",url:"https://github.com/play-curious/RedMetrics2/"},{name:"WakFight",image:"wak-fight.png",description:"RPG fighting Discord bot",detail:"Mon premier bot Discord RPG basé sur l'univers de Wakfu."},{name:"Boat Quest",image:"edenred.png",description:"2D game about ocean cleaning",detail:"Réalisé avec TypeScript, PixiJS et Booyah avec l'équipe PlayCurious pour EdenRed.",url:"https://playcurious.games/our-games/edenred-boat-quest/"},{name:"Survival RPG",image:"survival-rpg.png",description:"Hardcore RPG Discord bot",detail:"Un bot Discord RPG hardcore en rogue-like.",url:"https://discord.gg/7N5pJEY"}],V=[{name:"TypeScript",logo:"ts.png"},{name:"React",logo:"react.webp"},{name:"Tailwind CSS",logo:"tailwind.png"},{name:"NodeJS",logo:"node.png"},{name:"Vercel",logo:"vercel.png"},{name:"Next.js",logo:"nextjs.webp"},{name:"PostgreSQL",logo:"pgsql.png"},{name:"Docker",logo:"docker.webp"},{name:"PixiJS",logo:"pixi.png"},{name:"Three.js",logo:"three.png"},{name:"Gulp",logo:"gulp.webp"},{name:"Knex",logo:"knex.png"},{name:"Git",logo:"git.png"}],F=[{description:"Gagne 10M$",onPlayed:async e=>await e.addMoney(10),type:"action",cost:2},{description:"Gagne 20M$",onPlayed:async e=>await e.addMoney(20),type:"action",cost:4},{description:"Le matin, gagne 10M$. L'après-midi, gagne 2 @energys",onPlayed:async e=>{new Date().getHours()<12?await e.addMoney(10):await e.addEnergy(2)},type:"action",cost:0},{description:"Gagne 10M$ fois le nombre de cartes @action en main",onPlayed:async e=>{await e.addMoney(10*(e.hand.filter(s=>s.effect.type==="action").length-1))},type:"action",cost:4},{description:"Si le dark mode est activé, gagne 20M$",onPlayed:async e=>await e.addMoney(20),condition:()=>localStorage.getItem("theme")==="dark",type:"action",cost:3},{description:"Si la @reputation est inférieur à 5, gagne 20M$",onPlayed:async e=>await e.addMoney(20),condition:e=>e.reputation<5,type:"action",cost:3},{description:"Joue gratuitement la carte la plus à droite de ta main",onPlayed:async e=>await e.play(e.hand[e.hand.length-1],{free:!0}),condition:(e,s)=>e.hand.length>1&&e.hand.indexOf(s)!==e.hand.length-1,type:"action",cost:4},{description:"Pioche une carte",onPlayed:async e=>await e.draw(),condition:e=>e.deck.length>=1,type:"support",cost:1},{description:"Pioche 2 cartes",onPlayed:async e=>await e.draw(2),condition:e=>e.deck.length>=2,type:"support",cost:2},{description:"Si tu as moins de 4 cartes en main, pioche 2 cartes",onPlayed:async e=>await e.draw(2),condition:e=>e.hand.length<4&&e.deck.length>=2,type:"support",cost:1},{description:"Pioche une carte @action",onPlayed:async e=>await e.draw(1,{type:"action"}),condition:e=>e.deck.some(s=>s.effect.type==="action"),type:"support",cost:2},{description:"Si tu n'as pas de carte @action en main, pioche une carte @action",onPlayed:async e=>await e.draw(1,{type:"action"}),condition:e=>e.hand.every(s=>s.effect.type!=="action")&&e.deck.some(s=>s.effect.type==="action"),type:"support",cost:1},{description:"Défausse une carte aléatoire, pioche une carte et gagne 10M$",onPlayed:async e=>{await e.drop(),await e.draw(),await e.addMoney(10)},condition:e=>e.hand.length>=2,type:"support",cost:0},{description:"Renvoie une carte aléatoire dans la pioche, pioche une carte",onPlayed:async e=>{await e.drop({toDeck:!0}),await e.draw()},condition:e=>e.hand.length>=2,type:"support",cost:0},{description:"Défausse toutes les cartes en main, pioche 5 cartes",onPlayed:async e=>{await e.dropAll(),await e.draw(5)},type:"support",cost:0},{description:"Renvoie toutes les cartes en main dans la pioche, pioche 5 cartes",onPlayed:async e=>{await e.dropAll({toDeck:!0}),await e.draw(5)},type:"support",cost:3},{description:"Pioche autant de carte que d'@activitys découvertes",onPlayed:async e=>{await e.draw(e.activities.length)},condition:e=>e.activities.length>0,type:"support",cost:3},{description:"Défausse toutes les cartes @support en main, pioche 2 cartes @action",onPlayed:async e=>{await e.dropAll({type:"support"}),await e.draw(2,{type:"action"})},type:"support",cost:3},{description:"Défausse toutes les cartes @action en main, pioche 3 cartes",onPlayed:async e=>{await e.dropAll({type:"action"}),await e.draw(3)},type:"support",cost:1},{description:"Double l'@energy",onPlayed:async e=>await e.addEnergy(e.energy),type:"action",cost:"10"},{description:"Ajoute 4 @energys",onPlayed:async e=>await e.addEnergy(3),type:"action",cost:"10"},{description:"Si la @reputation est inférieur à 5, ajoute 5 @energys",onPlayed:async e=>await e.addEnergy(5),condition:e=>e.reputation<5,type:"action",cost:"5"},{description:"Remplis la jauge de @reputation",onPlayed:async e=>await e.addReputation(10),type:"action",cost:"100"}],Q=[{name:"Starbucks",description:"Rend @cumul @energy@s par jour",image:"starbucks.png",onTrigger:async(e,s)=>{await e.addEnergy(s.cumul)},cumulable:!0,cost:"20"},{name:"Méditation",description:"Pioche @cumul carte@s par jour",image:"meditation.png",onTrigger:async(e,s)=>{for(let t=0;t<s.cumul;t++)await e.draw()},cumulable:!0,max:3,cost:"20"},{name:"Bourse",description:"Gagne @cumulM$ fois le nombre de cartes en main par jour",image:"bourse.png",onTrigger:async(e,s)=>{await e.addMoney(s.cumul*e.hand.length)},cumulable:!0,cost:"25"},{name:"Recyclage",description:"Place @cumul carte@s aléatoire@s de la défausse dans le deck par jour",image:"recyclage.png",onTrigger:async(e,s)=>{for(let t=0;t<s.cumul;t++)await e.recycle()},cumulable:!0,max:3,cost:"20"},{name:"I.A",description:"Gagne @cumulM$ fois le nombre de carte en défausse par jour",image:"ia.png",onTrigger:async(e,s)=>{await e.addMoney(s.cumul*e.discard.length)},cumulable:!0,cost:"25"}],C=20,ee=8,E=10,z=300;function j(e){return e.replace(/MONEY_TO_REACH/g,String(z)).replace(/MAX_HAND_SIZE/g,String(ee)).replace(/@action([^\s.:,]*)/g,'<span style="color: #2563eb">Action$1</span>').replace(/@reputation([^\s.:,]*)/g,'<span style="color: #d946ef">Réputation$1</span>').replace(/@activity([^\s.:,]*)/g,'<span style="color: #f59e0b">Activité$1</span>').replace(/@support([^\s.:,]*)/g,'<span style="display: inline-block; background-color: hsla(var(--secondary) / 0.5); color: hsl(var(--secondary-foreground)); padding: 0 6px; border-radius: 4px">Support$1</span>').replace(/@energy([^\s.:,]*)/g,'<span style="color: hsl(var(--primary))">Énergie$1</span>').replace(/((?:\d+|<span[^>]*>\d+<\/span>)M\$)/g,'<span style="display: inline-block; background-color: #022c22; color: white; padding: 0 4px;">$1</span>')}function te(e,s){return e.replace(/@cumul/g,`<span style="color: #f59e0b">${s}</span>`).replace(/@s/g,s>1?"s":"")}async function x(e=500){return new Promise(s=>setTimeout(s,e))}function b(e,s=1){for(let t=0;t<s;t++)e.sort(()=>Math.random()-.5);return e}function H(e,s,t,o,i,a=!1){const r=(e-s)/(t-s)*(i-o)+o;return a?o<i?Math.max(Math.min(r,i),o):Math.max(Math.min(r,o),i):r}function k(e){return e.image!==void 0}const B=F.filter(e=>e.type==="support"),q=F.filter(e=>e.type==="action");function W(){const e=V.map((i,a)=>{const r=H(a,0,V.length,0,B.length,!0),c=B[Math.floor(r)];return{...i,logo:`images/techno/${i.logo}`,state:"idle",effect:{...c,description:j(c.description)}}}),s=O.map((i,a)=>{const r=H(a,0,O.length,0,q.length,!0),c=q[Math.floor(r)];return{...i,image:`images/projects/${i.image}`,state:"idle",effect:{...c,description:j(c.description)}}}),t=Q.map(i=>({name:i.name,image:`images/activities/${i.image}`,state:"idle",ephemeral:!i.cumulable,effect:{description:j(`Découvre une @activity. <br/> @activity: ${te(i.description,1)}`),onPlayed:async a=>await a.discover(i.name),type:"action",cost:i.cost}})),o=b([...e,...s,...t],3);return{reason:null,isWon:!1,isGameOver:!1,deck:o.slice(7),hand:o.slice(0,7),discard:[],activities:[],day:1,energy:C,reputation:E,money:0}}const $=le((e,s)=>({...W(),addEnergy:async t=>{h.gain.play(),e(o=>({energy:Math.max(0,Math.min(C,o.energy+t))}))},addReputation:async(t,o)=>{if(t>0?h.gain.play():h.loss.play(),e(a=>({reputation:Math.max(0,Math.min(E,a.reputation+t))})),await x(),o!=null&&o.skipGameOverCheck)return;const i=s();i.isGameOver||i.reputation===0&&(h.defeat.play(),e({isGameOver:!0,isWon:!1,reason:"reputation"}))},addMoney:async t=>{t>0&&h.gain.play(),e(i=>({money:i.money+t})),await x(),s().money>=z&&(h.victory.play(),e({isGameOver:!0,isWon:!0}))},addDay:async(t=1)=>{if(e(o=>({day:o.day+t})),t>0){const o=s();for(let i=0;i<t;i++)await Promise.all(o.activities.slice().map(async(a,r)=>{await x(250*r),await o.triggerActivity(a.name)}))}},discover:async t=>{const o=Q.find(a=>a.name===t);h.discover.play();let i=s();if(i.activities.find(a=>a.name===t)?e(a=>({activities:a.activities.map(r=>r.name===t?{...r,cumul:r.cumul+1}:r)})):e(a=>({activities:[...a.activities,{...o,state:"appear",cumul:1,max:o.cumulable?o.max??1/0:1}]})),o.cumulable&&o.max){i=s();const a=i.activities.find(r=>r.name===t);if(a.cumul===a.max){const r=i.hand.find(c=>c.effect.onPlayed.toString().includes(`discover("${t}")`));e({hand:i.hand.map(c=>c.name===r.name?{...c,state:"played"}:c)}),await x(),e({hand:i.hand.filter(c=>c.name!==r.name)})}}await x(),e(a=>({activities:a.activities.map(r=>r.name===t?{...r,state:"idle"}:r)}))},triggerActivity:async t=>{const o=s(),i=o.activities.find(a=>a.name===t);e(a=>({activities:a.activities.map(r=>r.name===i.name?{...r,state:"triggered"}:r)})),await x(),await i.onTrigger(o,i),await x(),e(a=>({activities:a.activities.map(r=>r.name===i.name?{...r,state:"idle"}:r)}))},draw:async(t=1,o)=>{e(i=>{const a=o!=null&&o.fromDiscardPile?"discard":"deck",r=i.hand.slice(),c=i.discard.slice(),l=i[a].slice().filter(u=>o!=null&&o.type?u.effect.type===o.type:!0),g=[];let y=!1,d=!1;for(let u=0;u<t&&l.length!==0;u++){const f=l.pop();f.state="drawn",g.push(f.name),r.length-1>=ee?(c.push(f),d=!0):(r.push(f),y=!0)}return y?h.draw.play():d&&h.draw.play(),{hand:r,discard:c,[a]:b(i[a].filter(u=>!g.includes(u.name)),2)}}),await x(),e(i=>({hand:i.hand.map(a=>({...a,state:"idle"}))}))},drop:async t=>{const o=t!=null&&t.toDeck?"deck":"discard";h.drop.play();const i=s(),a=i.hand.slice().filter(l=>l.state==="idle"),r=Math.floor(Math.random()*a.length),c=a[r];e({hand:i.hand.map(l=>l.name===c.name?{...l,state:"dropped"}:l)}),await x(),e(l=>({hand:l.hand.filter(g=>g.name!==c.name),[o]:b([{...c,state:null},...l[o]],2)}))},dropAll:async t=>{const o=t!=null&&t.toDeck?"deck":"discard";h.drop.play();const i=s();e({hand:i.hand.map(a=>a.state==="idle"&&(!(t!=null&&t.type)||a.effect.type===t.type)?{...a,state:"dropped"}:a)}),await x(),e(a=>({[o]:b([...a.hand.filter(r=>!(t!=null&&t.type)||r.effect.type===t.type).map(r=>({...r,state:null})),...a[o]],2),hand:a.hand.filter(r=>(t==null?void 0:t.type)&&r.effect.type!==t.type)}))},recycle:async(t=1)=>{h.recycle.play();const o=s(),i=o.discard.slice(),a=o.deck.slice(),r=[];for(let c=0;c<t&&i.length!==0;c++){const l=i.pop();r.push(l.name),a.push(l)}e({deck:b(a),discard:o.discard.filter(c=>!r.includes(c.name))})},play:async(t,o)=>{const i=!!(o!=null&&o.free);let a=s();const r=async()=>{h.unauthorized.play(),e({hand:a.hand.map(d=>d.name===t.name?{...d,state:"unauthorized"}:d)}),await x(),e({hand:a.hand.map(d=>d.name===t.name?{...d,state:"idle"}:d)})};if(t.effect.condition&&!t.effect.condition(a,t)){await r();return}if(!i){const d=typeof t.effect.cost=="number"?"energy":"money",u=Number(t.effect.cost);if(a[d]<u)if(d==="energy"){if(a.reputation+a.energy<u){await r();return}const f=u-a.energy;e({energy:0}),await a.addReputation(-f,{skipGameOverCheck:!0})}else{await r();return}else e({[d]:a[d]-u})}h.play.play();const c=async()=>{e(d=>({hand:d.hand.map(u=>u.name===t.name?{...u,state:"played"}:u)})),await x(),e(d=>({discard:t.ephemeral?d.discard:b([{...t,state:null},...d.discard],3),hand:d.hand.filter(u=>u.name!==t.name)})),t.effect.type==="action"&&await a.addDay()},l=async()=>{/^await state.(draw|play)\(.*?\)$/.test(t.effect.onPlayed.toString())&&await x(),await t.effect.onPlayed(a,t)};if(await Promise.all([c(),l()]),a=s(),a.isGameOver)return;if(a.reputation===0){h.defeat.play(),e({isGameOver:!0,isWon:!1,reason:"reputation"});return}a.hand.length===0&&await a.draw(),a=s();const g=a.deck.length===0&&a.hand.length===0,y=a.hand.every(d=>t.effect.condition&&!t.effect.condition(a,t)||typeof d.effect.cost=="number"&&d.effect.cost>a.energy+a.reputation||typeof d.effect.cost=="string"&&Number(d.effect.cost)>a.money);(g||y)&&e({isGameOver:!0,isWon:!1,reason:g?"mill":"soft-lock"})},reset:()=>{e(W()),h.music.stop(),h.music.play()}})),X={transformStyle:"preserve-3d"},ge=({max:e=20,reverse:s=!1,scale:t=1,perspective:o=1e3,className:i="",children:a,style:r})=>{const c=v.useRef(null),l=de(c),[g,y]=v.useState({}),d=v.useCallback(f=>{if(c.current){const w=c.current.getBoundingClientRect(),S=f.clientX-w.left,M=f.clientY-w.top,L=w.width/2,T=w.height/2,D=(M-T)/T*e,I=(S-L)/L*e;y({...X,transform:`
            perspective(${o}px)
            rotateX(${s?D:-D}deg)
            rotateY(${s?-I:I}deg)
            scale(${t})
          `})}},[e,o,s,t]),u=v.useCallback(()=>{y({...X,transition:"transform 0.5s ease-in-out",transform:"scale(1)"})},[]);return v.useEffect(()=>{const f=c.current;return l?f&&(f.addEventListener("mousemove",d),f.addEventListener("mouseleave",u)):u(),()=>{f&&(f.removeEventListener("mousemove",d),f.removeEventListener("mouseleave",u)),u()}},[e,s,t,o,l]),n.jsx("div",{ref:c,className:m("will-change-transform",i),style:{...g,...r},children:a})},ae=e=>n.jsxs("div",{className:m("relative",e.className),style:e.style,children:[n.jsx("img",{src:e.image,alt:`${e.name} background image`,title:e.name,className:"pointer-events-auto",style:{scale:e.iconScale}}),n.jsx("div",{className:m("absolute top-1/2 left-1/2 font-bold text-[1.8em] text-white pointer-events-none box-content",e.textColor),style:{transform:"translateX(-50%) translateY(-50%) translateZ(5px)"},children:e.value})]}),fe=e=>n.jsx("div",{className:m("text-2xl font-bold border border-white px-1 bg-money text-white",e.className),style:e.style,children:n.jsxs("div",{style:{transform:"translateZ(5px)"},children:[e.value,"M$"]})}),he=e=>{const{handSize:s,isAnyCardAnimated:t,isGameOver:o,play:i,canTriggerEffect:a,haveEnoughResources:r}=$(l=>{const g=typeof e.card.effect.cost=="number"?"energy":"money",y=Number(e.card.effect.cost);return{handSize:l.hand.length,isAnyCardAnimated:l.hand.some(d=>d.state!=="idle")||l.activities.length>0&&l.activities.some(d=>d.state!=="idle"),play:l.play,isGameOver:l.isGameOver,haveEnoughResources:g==="energy"?l.energy+l.reputation>=y:l.money>=y,canTriggerEffect:!e.card.effect.condition||e.card.effect.condition(l,e.card)}}),c=e.position-(s-1)/2;return n.jsx("div",{className:m("game-card","relative w-[calc(630px/3)] h-[calc(880px/3)]","transition-transform hover:-translate-y-14","-mx-3.5 z-10 hover:z-20 cursor-pointer select-none",e.card.state,{"grayscale-75":o||!r||!a,"cursor-not-allowed":t}),onClick:async()=>{!t&&!o&&await i(e.card)},onContextMenu:l=>{l.preventDefault(),k(e.card)&&e.card.url&&window.open(e.card.url,"_blank")},style:{marginBottom:`${20-Math.abs(c)*5}px`,rotate:`${c*2}deg`,transitionDuration:"0.3s",transitionTimingFunction:"ease-in-out"},children:n.jsxs(ge,{scale:1.1,className:m("group/game-card transition-shadow duration-200 ease-in-out","hover:shadow-glow-20","flex flex-col w-full h-full rounded-md","rounded-md *:shrink-0",{"bg-card shadow-primary":e.card.effect.type==="support","shadow-action":e.card.effect.type==="action"}),children:[k(e.card)&&e.card.detail&&n.jsx("div",{className:m("absolute pointer-events-none left-1/2 -top-[10px] -translate-x-1/2 -translate-y-full rounded-2xl bg-card","px-5 py-2 opacity-0 group-hover/game-card:animate-appear text-sm w-max max-w-full text-center shadow shadow-action"),children:e.card.detail}),n.jsxs("div",{className:m("flex justify-start items-center h-10 rounded-t-md",{"bg-action":e.card.effect.type==="action","bg-support":e.card.effect.type==="support"}),style:{transformStyle:"preserve-3d"},children:[n.jsx("div",{className:"font-changa shrink-0 relative",style:{transform:"translateZ(5px) translateX(-15px)",transformStyle:"preserve-3d"},children:typeof e.card.effect.cost=="number"?n.jsx(ae,{name:"Coût en énergie / points d'action",image:"images/energy-background.png",value:e.card.effect.cost,iconScale:"0.75",style:{transform:"translateZ(5px)",transformStyle:"preserve-3d"}}):n.jsx(fe,{value:e.card.effect.cost,style:{transform:"translateZ(10px) rotate(-10deg)",transformStyle:"preserve-3d"}})}),n.jsx("h2",{className:m("whitespace-nowrap overflow-hidden text-ellipsis shrink-0 flex-grow",{"text-sm":e.card.name.length>20,"text-primary-foreground":e.card.effect.type==="action"}),style:{transform:"translateZ(5px)"},children:e.card.name})]}),k(e.card)?n.jsx(ye,{card:e.card}):n.jsx(xe,{card:e.card}),n.jsxs("div",{className:"bg-card flex-grow rounded-b-md",style:{transformStyle:"preserve-3d"},children:[n.jsx("p",{className:"py-[10px] px-[15px] text-center",style:{transform:"translateZ(10px)"},dangerouslySetInnerHTML:{__html:e.card.effect.description}}),e.card.ephemeral&&n.jsx("div",{className:"text-center h-full text-2xl text-muted-foreground/20 font-bold",children:"Éphémère"})]}),n.jsx(_,{groupName:"game-card",appearOnHover:!0,disappearOnCorners:!0}),n.jsx(_,{groupName:"game-card",appearOnHover:!0,disappearOnCorners:!0,opposed:!0})]})})},ye=e=>n.jsxs("div",{className:"group/image",style:{transformStyle:"preserve-3d"},children:[n.jsx("div",{className:m("inset-shadow","relative flex justify-center items-center"),style:{transformStyle:"preserve-3d"},children:n.jsx("img",{src:e.card.image,alt:`Illustration du projet "${e.card.name}"`,className:"w-full aspect-video object-cover",style:{transform:"translateZ(-15px)"}})}),e.card.description&&n.jsx("div",{className:m("transition-opacity duration-1000 group-hover/image:opacity-0","absolute bottom-0 w-full h-1/3 bg-background/50","flex justify-center items-center"),style:{transform:"translateZ(-5px)"},children:n.jsxs("p",{className:"text-sm text-center",children:['"',e.card.description,'"']})})]}),ve=["React","Knex"],xe=e=>n.jsx(n.Fragment,{children:n.jsx("div",{className:"flex justify-center items-center mt-4",style:{transform:"translateZ(20px)"},children:n.jsx("img",{src:e.card.logo,alt:`Logo de la techno "${e.card.name}"`,className:m("w-2/3 object-contain aspect-square",{"group-hover/game-card:animate-spin-forward":ve.includes(e.card.name)})})})}),Z=["Si vous n'avez plus de @reputation, vous perdez la partie.","Si vous ne pouvez plus jouer de carte, vous perdez la partie.","Si vous obtenez MONEY_TO_REACHM$, vous gagnez la partie.","Certaines cartes coutent de l'argent pour être jouées.","Votre pioche est limitée. Jouez prudemment !","Chaque carte @action jouée ajoute un jour à la partie.","Les cartes @action ont une bannière bleue.","Lorsque vous n'avez plus d'@energy, puisez dans la @reputation.","Les cartes éphémères sont détruites après utilisation.","Les effets des @activitys sont cumulables !","Vous ne pouvez pas avoir plus de MAX_HAND_SIZE cartes en main.","Les cartes piochées en trop sont défaussées à la place."];function we(e){return p.createElement("div",{...e,className:m("w-full h-full aspect-square text-foreground",e.className),style:e.style},p.createElement("svg",{stroke:"currentColor",fill:"currentColor","stroke-width":"0",viewBox:"0 0 512 512",height:"100%",width:"100%",xmlns:"http://www.w3.org/2000/svg"},p.createElement("path",{d:"M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm107.244-255.2c0 67.052-72.421 68.084-72.421 92.863V300c0 6.627-5.373 12-12 12h-45.647c-6.627 0-12-5.373-12-12v-8.659c0-35.745 27.1-50.034 47.579-61.516 17.561-9.845 28.324-16.541 28.324-29.579 0-17.246-21.999-28.693-39.784-28.693-23.189 0-33.894 10.977-48.942 29.969-4.057 5.12-11.46 6.071-16.666 2.124l-27.824-21.098c-5.107-3.872-6.251-11.066-2.644-16.363C184.846 131.491 214.94 112 261.794 112c49.071 0 101.45 38.304 101.45 88.8zM298 368c0 23.159-18.841 42-42 42s-42-18.841-42-42 18.841-42 42-42 42 18.841 42 42z"})))}function be(e){return p.createElement("div",{...e,className:m("w-full h-full aspect-square text-foreground",e.className),style:e.style},p.createElement("svg",{stroke:"currentColor",fill:"currentColor","stroke-width":"0",viewBox:"0 0 512 512",height:"100%",width:"100%",xmlns:"http://www.w3.org/2000/svg"},p.createElement("path",{fill:"none",d:"M337.46 240 312 214.54l-56 56-56-56L174.54 240l56 56-56 56L200 377.46l56-56 56 56L337.46 352l-56-56 56-56z"}),p.createElement("path",{fill:"none",d:"M337.46 240 312 214.54l-56 56-56-56L174.54 240l56 56-56 56L200 377.46l56-56 56 56L337.46 352l-56-56 56-56z"}),p.createElement("path",{d:"m64 160 29.74 282.51A24 24 0 0 0 117.61 464h276.78a24 24 0 0 0 23.87-21.49L448 160zm248 217.46-56-56-56 56L174.54 352l56-56-56-56L200 214.54l56 56 56-56L337.46 240l-56 56 56 56z"}),p.createElement("rect",{width:"448",height:"80",x:"32",y:"48",rx:"12",ry:"12"})))}function je(e){return p.createElement("div",{...e,className:m("w-full h-full aspect-square text-foreground",e.className),style:e.style},p.createElement("svg",{stroke:"currentColor",fill:"currentColor","stroke-width":"0",viewBox:"0 0 16 16",height:"100%",width:"100%",xmlns:"http://www.w3.org/2000/svg"},p.createElement("path",{d:"m14.12 10.163 1.715.858c.22.11.22.424 0 .534L8.267 15.34a.6.6 0 0 1-.534 0L.165 11.555a.299.299 0 0 1 0-.534l1.716-.858 5.317 2.659c.505.252 1.1.252 1.604 0l5.317-2.66zM7.733.063a.6.6 0 0 1 .534 0l7.568 3.784a.3.3 0 0 1 0 .535L8.267 8.165a.6.6 0 0 1-.534 0L.165 4.382a.299.299 0 0 1 0-.535z"}),p.createElement("path",{d:"m14.12 6.576 1.715.858c.22.11.22.424 0 .534l-7.568 3.784a.6.6 0 0 1-.534 0L.165 7.968a.299.299 0 0 1 0-.534l1.716-.858 5.317 2.659c.505.252 1.1.252 1.604 0z"})))}function Ne(e){return p.createElement("div",{...e,className:m("w-full h-full aspect-square text-foreground",e.className),style:e.style},p.createElement("svg",{stroke:"currentColor",fill:"currentColor","stroke-width":"0",viewBox:"0 0 512 512",height:"100%",width:"100%",xmlns:"http://www.w3.org/2000/svg"},p.createElement("path",{d:"M225.814 32.316c-3.955-.014-7.922-.01-11.9.007-19.147.089-38.6.592-58.219 1.32l5.676 24.893c20.431-2.31 42.83-4.03 65.227-4.89 12.134-.466 24.194-.712 35.892-.65 35.095.183 66.937 3.13 87.77 11.202l8.908 3.454-3.977 8.685c-29.061 63.485-35.782 124.732-31.228 184.826 2.248-71.318 31.893-134.75 70.81-216.068-52.956-8.8-109.634-12.582-168.959-12.78zm28.034 38.79c-8.74.007-17.65.184-26.559.526-41.672 1.6-83.199 6.49-110.264 12.096 30.233 56.079 54.69 112.287 70.483 167.082a71.934 71.934 0 0 1 5.894.045c4.018.197 7.992.742 11.875 1.59-16.075-51.397-34.385-98.8-57.146-146.131l-5.143-10.694 11.686-2.068c29.356-5.198 59.656-7.21 88.494-7.219 1.922 0 3.84.007 5.748.024 18.324.16 35.984 1.108 52.346 2.535l11.054.965-3.224 10.617c-18.7 61.563-22.363 127.678-11.79 190.582.176.163.354.325.526.49 3.813-1.336 7.38-2.698 10.705-4.154-8.254-67.394-4.597-136.923 26.229-209.201-17.202-4.383-43.425-6.674-72.239-7.034a656.656 656.656 0 0 0-8.675-.05zm144.945 7.385c-30.956 65.556-52.943 118.09-56.547 174.803 20.038-66.802 58.769-126.685 102.904-165.158a602.328 602.328 0 0 0-46.357-9.645zM103.832 97.02c-18.76 3.868-37.086 8.778-54.812 15.562 8.626 7.48 24.22 21.395 43.14 39.889 8.708-8.963 17.589-17.818 26.852-25.87a1067.587 1067.587 0 0 0-15.18-29.581zm142.023 7.482c-13.62-.066-27.562.324-41.554 1.293-1.468 13.682-9.56 26.482-19.225 39.07 15.431 36.469 28.758 73.683 40.756 113.194 18.375 5.42 36.554 11.827 51.28 19.504-5.47-42.458-4.722-85.963 2.38-128.508-12.885-13.31-19.597-28.09-20.135-44.34a621.48 621.48 0 0 0-13.502-.213zm182.018 26.985c-24.73 29.3-46.521 65.997-61.37 105.912 27.264-38.782 60.79-69.032 96.477-90.4a1318.664 1318.664 0 0 0-35.107-15.512zm-300.74 11.959c-14.594 13.188-29.014 29.017-44.031 44.097 32.289 19.191 59.791 41.918 82.226 67.66 1.393-.526 2.8-.999 4.215-1.43-10.498-36.096-24.885-73.033-42.41-110.327zM360.52 268.198c-16.397 19.788-31.834 30.235-53.09 38.57 2.391 9.22-1.16 19.805-9.334 27.901-4.808 4.761-10.85 10.188-19.684 13.715a62.896 62.896 0 0 0 3.9 2.127c12.364 6.17 34.207 4.18 54.5-5.049 20.23-9.2 38.302-25.092 45-41.191 3.357-9.05.96-13.77-4.917-20.692-4.184-4.925-10.295-9.89-16.375-15.38zm-170.079.586c-10.715-.098-21.597 2.994-30.59 9.76-12.79 9.623-22.65 26.784-22.738 55.934v.2l-.01.2c-2.92 61.381 1.6 89.7 10.555 105.065 7.904 13.562 21.05 20.054 40.28 31.994.916-2.406 1.87-5.365 2.765-9.098 2.277-9.499 4.161-22.545 5.355-36.975 2.389-28.858 2.04-63.51-1.955-88.445l-2.111-13.19 13.016 2.995c31.615 7.273 49.7 8.132 60.2 6.28 10.502-1.854 14.061-5.523 20.221-11.624 5.79-5.732 5.682-7.795 4.456-11.021-1.227-3.227-6.149-8.545-14.5-13.633-16.703-10.176-45.085-19.611-71.614-26.647a53.988 53.988 0 0 0-13.33-1.795zm189.1 69.416c-10.013 9.754-22.335 17.761-35.277 23.647-20.983 9.542-44.063 13.907-63.211 7.553-6.76 2.516-10.687 5.407-12.668 7.8-2.718 3.284-2.888 5.7-1.967 9.16.92 3.46 3.665 7.568 7.059 10.524 3.393 2.956 7.426 4.492 8.959 4.564 46.794 2.222 67.046-11.207 92.277-26.783 7.358-4.542 10.174-13.743 9.469-22.931-.353-4.594-1.69-8.911-3.233-11.63a9.009 9.009 0 0 0-1.408-1.904zm-166.187 9.096c2.727 25.068 2.772 54.314.642 80.053-1.247 15.072-3.175 28.779-5.789 39.685-1.137 4.746-2.388 8.954-3.9 12.659l146.697-6.465c-1.656-6.149-3.344-12.324-5.031-18.502a127.004 127.004 0 0 1-17.24 4.424l.044.73-8.316.518c-5.121.614-10.452.953-15.983.992l-83.86 5.21 2.493-11.607c7.947-37.006 8.68-69.589 3.778-105.234a353.433 353.433 0 0 1-13.536-2.463zm31.972 4.684c3.948 31.933 3.473 62.41-2.406 95.2l19.264-1.196a39.44 39.44 0 0 1-6.1-14.778c-1.296-6.88-.575-14.538 3.926-20.87.199-.281.414-.55.627-.821-5.246-4.845-9.628-11.062-11.614-18.524-2.114-7.944-.794-17.67 5.497-25.27 2.079-2.51 4.592-4.776 7.543-6.816-2.61-2.08-4.898-4.285-6.874-6.582-3.064.021-6.345-.093-9.863-.343zm132.666 41.785c-23.456 14.253-49.81 27.876-96.41 25.664a26.402 26.402 0 0 1-4.518-.615c-1.233.553-1.891 1.256-2.382 1.947-.963 1.355-1.532 3.8-.909 7.113 1.248 6.627 7.525 13.889 13.37 14.569 41.385 4.813 69.979-8.726 87.341-24.477 8-7.258 8.068-11.9 6.89-16.951-.59-2.523-1.89-4.969-3.382-7.25zm-6.683 49.062a114.657 114.657 0 0 1-8.547 4.86c1.65 6.051 3.304 12.102 4.937 18.154l19.92-3.572c-5.14-4.387-9.162-8.954-12.39-13.496-1.442-2.029-2.713-4.001-3.92-5.946z"})))}function Se(e){return p.createElement("div",{...e,className:m("w-full h-full aspect-square text-foreground",e.className),style:e.style},p.createElement("svg",{stroke:"currentColor",fill:"currentColor","stroke-width":"0",viewBox:"0 0 512 512",height:"100%",width:"100%",xmlns:"http://www.w3.org/2000/svg"},p.createElement("path",{d:"M32 456a24 24 0 0 0 24 24h400a24 24 0 0 0 24-24V176H32zm80-238.86a9.14 9.14 0 0 1 9.14-9.14h109.72a9.14 9.14 0 0 1 9.14 9.14v109.72a9.14 9.14 0 0 1-9.14 9.14H121.14a9.14 9.14 0 0 1-9.14-9.14zM456 64h-55.92V32h-48v32H159.92V32h-48v32H56a23.8 23.8 0 0 0-24 23.77V144h448V87.77A23.8 23.8 0 0 0 456 64z"})))}function Me(e,s=[]){let t=[];function o(a,r){const c=v.createContext(r),l=t.length;t=[...t,r];function g(d){const{scope:u,children:f,...w}=d,S=(u==null?void 0:u[e][l])||c,M=v.useMemo(()=>w,Object.values(w));return n.jsx(S.Provider,{value:M,children:f})}function y(d,u){const f=(u==null?void 0:u[e][l])||c,w=v.useContext(f);if(w)return w;if(r!==void 0)return r;throw new Error(`\`${d}\` must be used within \`${a}\``)}return g.displayName=a+"Provider",[g,y]}const i=()=>{const a=t.map(r=>v.createContext(r));return function(c){const l=(c==null?void 0:c[e])||a;return v.useMemo(()=>({[`__scope${e}`]:{...c,[e]:l}}),[c,l])}};return i.scopeName=e,[o,Pe(i,...s)]}function Pe(...e){const s=e[0];if(e.length===1)return s;const t=()=>{const o=e.map(i=>({useScope:i(),scopeName:i.scopeName}));return function(a){const r=o.reduce((c,{useScope:l,scopeName:g})=>{const d=l(a)[`__scope${g}`];return{...c,...d}},{});return v.useMemo(()=>({[`__scope${s.scopeName}`]:r}),[r])}};return t.scopeName=s.scopeName,t}var ke=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","span","svg","ul"],ne=ke.reduce((e,s)=>{const t=v.forwardRef((o,i)=>{const{asChild:a,...r}=o,c=a?ue:s;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),n.jsx(c,{...r,ref:i})});return t.displayName=`Primitive.${s}`,{...e,[s]:t}},{}),R="Progress",A=100,[Ce,Ve]=Me(R),[Ee,ze]=Ce(R),re=v.forwardRef((e,s)=>{const{__scopeProgress:t,value:o=null,max:i,getValueLabel:a=$e,...r}=e;(i||i===0)&&!J(i)&&console.error(Re(`${i}`,"Progress"));const c=J(i)?i:A;o!==null&&!Y(o,c)&&console.error(Ae(`${o}`,"Progress"));const l=Y(o,c)?o:null,g=N(l)?a(l,c):void 0;return n.jsx(Ee,{scope:t,value:l,max:c,children:n.jsx(ne.div,{"aria-valuemax":c,"aria-valuemin":0,"aria-valuenow":N(l)?l:void 0,"aria-valuetext":g,role:"progressbar","data-state":oe(l,c),"data-value":l??void 0,"data-max":c,...r,ref:s})})});re.displayName=R;var se="ProgressIndicator",ie=v.forwardRef((e,s)=>{const{__scopeProgress:t,...o}=e,i=ze(se,t);return n.jsx(ne.div,{"data-state":oe(i.value,i.max),"data-value":i.value??void 0,"data-max":i.max,...o,ref:s})});ie.displayName=se;function $e(e,s){return`${Math.round(e/s*100)}%`}function oe(e,s){return e==null?"indeterminate":e===s?"complete":"loading"}function N(e){return typeof e=="number"}function J(e){return N(e)&&!isNaN(e)&&e>0}function Y(e,s){return N(e)&&!isNaN(e)&&e<=s&&e>=0}function Re(e,s){return`Invalid prop \`max\` of value \`${e}\` supplied to \`${s}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${A}\`.`}function Ae(e,s){return`Invalid prop \`value\` of value \`${e}\` supplied to \`${s}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${A} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`}var ce=re,Ge=ie;const G=v.forwardRef(({barColor:e,className:s,value:t,...o},i)=>n.jsx(ce,{ref:i,className:m("relative h-4 w-full overflow-hidden rounded-full bg-secondary",s),...o,children:n.jsx(Ge,{className:m("h-full w-full flex-1 transition-all",e,{"bg-primary":!e}),style:{transform:`translateX(-${100-(t||0)}%)`}})}));G.displayName=ce.displayName;const K=e=>n.jsxs("div",{className:"flex items-center h-7 w-[250px]",children:[n.jsx(ae,{name:e.name,image:e.image,value:e.value,iconScale:e.iconScale,textColor:e.textColor,className:"absolute -translate-x-1/2 z-50 scale-50"}),n.jsx(G,{barColor:e.barColor,className:e.className,value:e.value/e.max*100})]}),Le=[{name:"ฟ- ק𝖆†/⑳ -ж",score:38120},{name:"Ghom",score:37980},{name:"Xibalba",score:24050}],Te=()=>n.jsxs("div",{className:"pt-5 space-y-3 pointer-events-auto opacity-50 hover:opacity-100 transition-opacity duration-500",children:[n.jsx("div",{className:"text-2xl",children:"Scoreboard"}),n.jsx("table",{children:Le.sort((e,s)=>s.score-e.score).map((e,s)=>n.jsxs("tr",{className:m({"text-activity":s===0,"text-zinc-400":s===1,"text-orange-600":s===2}),children:[n.jsxs("th",{children:["# ",s+1]}),n.jsx("th",{className:"text-left",children:e.name}),n.jsxs("td",{children:[e.score.toLocaleString()," pts"]})]},s))}),n.jsx("p",{className:"text-muted-foreground text-sm bg-muted py-1 px-2 rounded-md",children:"Si vous avez un meilleur score, vous pouvez me le soumettre en me contactant sur Discord ou LinkedIn !"})]}),De=()=>{const e=$(),s=U(),[t,o]=p.useState(0),[i,a]=p.useState(!1);return n.jsxs("div",{className:"w-[300px] ml-10 mt-4 space-y-2",children:[n.jsx("code",{children:"CardGame v0.6-beta [WIP]"}),n.jsx(K,{name:"Energie / Points d'action",image:"images/energy-background.png",value:e.energy,max:C}),n.jsx(K,{name:"Réputation",image:"images/reputation-background.png",value:e.reputation,max:E,barColor:"bg-pink-500"}),n.jsxs("div",{className:"*:flex *:items-center *:gap-2 *:whitespace-nowrap space-y-2",children:[n.jsxs("div",{children:[n.jsx(Ne,{className:"w-6"})," ",n.jsx("span",{dangerouslySetInnerHTML:{__html:j(`Argent: ${e.money}M$ sur ${z}M$`)}})]}),n.jsxs("div",{children:[n.jsx(Se,{className:"w-6"})," Jour: ",e.day]}),n.jsxs("div",{children:[n.jsx(je,{className:"w-6"})," Deck: ",e.deck.length]}),n.jsxs("div",{children:[n.jsx(be,{className:"w-6"})," Défausse: ",e.discard.length]})]}),n.jsx("div",{className:"grid grid-cols-3 p-2 gap-5 relative shrink-0 w-max",children:e.activities.map((r,c)=>n.jsxs("div",{className:"group/activity shrink-0",children:[n.jsx("img",{src:`images/activities/${r.image}`,alt:r.name,className:m("block object-cover w-16 h-16 aspect-square rounded-full pointer-events-auto cursor-pointer mx-auto ring-activity ring-4",{"animate-trigger":r.state==="triggered"})}),n.jsx("div",{className:"h-6 relative",children:n.jsxs("div",{className:"relative",children:[r.max!==1/0&&n.jsx(G,{className:"absolute -translate-y-2 w-full",barColor:"bg-activity",value:r.cumul/r.max*100}),n.jsx("div",{className:"absolute text-center font-changa left-0 -translate-y-3 aspect-square h-6 rounded-full bg-activity shadow shadow-black",children:r.cumul})]})}),n.jsxs("div",{className:"hidden group-hover/activity:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-3",children:[n.jsxs("h3",{className:"text-lg",children:[r.name," ",n.jsxs("span",{className:"text-activity font-changa",children:[r.cumul," ",r.max!==1/0?`/ ${r.max}`:""]})]}),n.jsx("p",{dangerouslySetInnerHTML:{__html:j(te(r.description,r.cumul))}})]})]},c))}),e.isGameOver&&n.jsxs("div",{className:"absolute top-0 left-0 w-screen h-screen flex flex-col items-center justify-center gap-7 bg-background/90 z-50 pointer-events-auto",children:[n.jsxs("div",{className:"*:text-6xl *:whitespace-nowrap",children:[e.isWon&&n.jsx("h1",{className:"text-green-500",children:"Vous avez gagné !"}),!e.isWon&&n.jsx("h1",{className:"text-red-500",children:"Vous avez perdu !"})]}),e.reason&&n.jsx("p",{className:"text-4xl",children:{reputation:"Vous avez utilisé toute votre jauge de réputation...",mill:"Vous n'avez plus de carte...","soft-lock":"Votre main est injouable..."}[e.reason]}),e.isWon&&n.jsxs("p",{className:"text-center text-2xl",children:["Vous avez gagné en"," ",n.jsx("span",{className:"text-activity",children:e.day})," jours avec"," ",n.jsxs("span",{className:"inline-block bg-money text-white px-1",children:[e.money,"M$"]})," ","et ",n.jsx("span",{className:"text-reputation",children:e.reputation})," ","points de réputation ! ",n.jsx("br",{}),n.jsxs("span",{className:"block text-4xl mt-5",children:["Score:"," ",n.jsxs("span",{className:"text-activity font-changa",children:[Math.max(0,e.reputation*50+e.money*100+e.activities.reduce((r,c)=>r+c.cumul,0)*10+e.energy*10-e.day*10).toLocaleString()," ","pts"]})]})]}),n.jsxs("div",{className:"flex gap-4",children:[n.jsx(P,{onClick:()=>s("/"),children:"Quitter"}),n.jsx(P,{onClick:()=>e.reset(),variant:"cta",size:"cta",children:"Recommencer"})]})]}),n.jsxs("div",{className:"flex gap-2 items-center justify-start",children:[n.jsx(P,{onClick:()=>{e.reset()},variant:"default",size:"cta",children:"Recommencer"}),n.jsxs("div",{className:"flex items-center gap-2 pointer-events-auto",onMouseEnter:()=>o((t+1)%Z.length),children:[n.jsx(we,{className:"h-6 cursor-pointer",onClick:()=>a(!i)}),i&&n.jsx("span",{className:"whitespace-nowrap",dangerouslySetInnerHTML:{__html:j(Z[t])}})]})]}),n.jsx(Te,{})]})},He=e=>{const s=$(),t=U(),o=me(a=>a.setCardGameVisibility),i=pe("(width >= 768px) and (height >= 768px)");return o(!!e.show),p.useEffect(()=>{i||t("/")},[i,t]),n.jsxs(n.Fragment,{children:[n.jsx("div",{className:m("absolute w-full transition-[left] ease-in-out duration-500 pointer-events-none",e.show?"left-0":"-left-full"),children:n.jsx(De,{})}),n.jsx("div",{className:m("absolute flex items-center -translate-x-1/2 max-w-[100vw]","left-[50vw] transition-[bottom] ease-in-out duration-1000",e.show?"bottom-[-50px]":"-bottom-full"),children:s.hand.sort((a,r)=>{const c=a.effect.type==="action"?1:0,l=r.effect.type==="action"?1:0,g=typeof a.effect.cost=="string"?1:0,y=typeof r.effect.cost=="string"?1:0,d=Number(a.effect.cost),u=Number(r.effect.cost);return c-l||g-y||d-u}).map((a,r)=>n.jsx(he,{card:a,position:r},r))})]})};export{He as Game};
