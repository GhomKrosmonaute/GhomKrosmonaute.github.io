var G=Object.defineProperty;var i=(y,h)=>G(y,"name",{value:h,configurable:!0});import{g as M,c as A}from"./react-spline-BaAnIIkY.js";function R(y,h){for(var d=0;d<h.length;d++){const m=h[d];if(typeof m!="string"&&!Array.isArray(m)){for(const f in m)if(f!=="default"&&!(f in y)){const p=Object.getOwnPropertyDescriptor(m,f);p&&Object.defineProperty(y,f,p.get?p:{enumerable:!0,get:i(()=>m[f],"get")})}}}return Object.freeze(Object.defineProperty(y,Symbol.toStringTag,{value:"Module"}))}i(R,"_mergeNamespaces");var k={};/*! howler.js v2.2.3 | (c) 2013-2020, James Simpson of GoldFire Studios | MIT License | howlerjs.com */(function(y){(function(){var h=i(function(){this.init()},"e");h.prototype={init:i(function(){var e=this||d;return e._counter=1e3,e._html5AudioPool=[],e.html5PoolSize=10,e._codecs={},e._howls=[],e._muted=!1,e._volume=1,e._canPlayEvent="canplaythrough",e._navigator=typeof window<"u"&&window.navigator?window.navigator:null,e.masterGain=null,e.noAudio=!1,e.usingWebAudio=!0,e.autoSuspend=!0,e.ctx=null,e.autoUnlock=!0,e._setup(),e},"init"),volume:i(function(e){var n=this||d;if(e=parseFloat(e),n.ctx||w(),e!==void 0&&e>=0&&e<=1){if(n._volume=e,n._muted)return n;n.usingWebAudio&&n.masterGain.gain.setValueAtTime(e,d.ctx.currentTime);for(var o=0;o<n._howls.length;o++)if(!n._howls[o]._webAudio)for(var t=n._howls[o]._getSoundIds(),r=0;r<t.length;r++){var u=n._howls[o]._soundById(t[r]);u&&u._node&&(u._node.volume=u._volume*e)}return n}return n._volume},"volume"),mute:i(function(e){var n=this||d;n.ctx||w(),n._muted=e,n.usingWebAudio&&n.masterGain.gain.setValueAtTime(e?0:n._volume,d.ctx.currentTime);for(var o=0;o<n._howls.length;o++)if(!n._howls[o]._webAudio)for(var t=n._howls[o]._getSoundIds(),r=0;r<t.length;r++){var u=n._howls[o]._soundById(t[r]);u&&u._node&&(u._node.muted=!!e||u._muted)}return n},"mute"),stop:i(function(){for(var e=this||d,n=0;n<e._howls.length;n++)e._howls[n].stop();return e},"stop"),unload:i(function(){for(var e=this||d,n=e._howls.length-1;n>=0;n--)e._howls[n].unload();return e.usingWebAudio&&e.ctx&&e.ctx.close!==void 0&&(e.ctx.close(),e.ctx=null,w()),e},"unload"),codecs:i(function(e){return(this||d)._codecs[e.replace(/^x-/,"")]},"codecs"),_setup:i(function(){var e=this||d;if(e.state=e.ctx&&e.ctx.state||"suspended",e._autoSuspend(),!e.usingWebAudio)if(typeof Audio<"u")try{var n=new Audio;n.oncanplaythrough===void 0&&(e._canPlayEvent="canplay")}catch{e.noAudio=!0}else e.noAudio=!0;try{var n=new Audio;n.muted&&(e.noAudio=!0)}catch{}return e.noAudio||e._setupCodecs(),e},"_setup"),_setupCodecs:i(function(){var e=this||d,n=null;try{n=typeof Audio<"u"?new Audio:null}catch{return e}if(!n||typeof n.canPlayType!="function")return e;var o=n.canPlayType("audio/mpeg;").replace(/^no$/,""),t=e._navigator?e._navigator.userAgent:"",r=t.match(/OPR\/([0-6].)/g),u=r&&parseInt(r[0].split("/")[1],10)<33,a=t.indexOf("Safari")!==-1&&t.indexOf("Chrome")===-1,_=t.match(/Version\/(.*?) /),s=a&&_&&parseInt(_[1],10)<15;return e._codecs={mp3:!(u||!o&&!n.canPlayType("audio/mp3;").replace(/^no$/,"")),mpeg:!!o,opus:!!n.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,""),ogg:!!n.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),oga:!!n.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),wav:!!(n.canPlayType('audio/wav; codecs="1"')||n.canPlayType("audio/wav")).replace(/^no$/,""),aac:!!n.canPlayType("audio/aac;").replace(/^no$/,""),caf:!!n.canPlayType("audio/x-caf;").replace(/^no$/,""),m4a:!!(n.canPlayType("audio/x-m4a;")||n.canPlayType("audio/m4a;")||n.canPlayType("audio/aac;")).replace(/^no$/,""),m4b:!!(n.canPlayType("audio/x-m4b;")||n.canPlayType("audio/m4b;")||n.canPlayType("audio/aac;")).replace(/^no$/,""),mp4:!!(n.canPlayType("audio/x-mp4;")||n.canPlayType("audio/mp4;")||n.canPlayType("audio/aac;")).replace(/^no$/,""),weba:!(s||!n.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")),webm:!(s||!n.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")),dolby:!!n.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/,""),flac:!!(n.canPlayType("audio/x-flac;")||n.canPlayType("audio/flac;")).replace(/^no$/,"")},e},"_setupCodecs"),_unlockAudio:i(function(){var e=this||d;if(!e._audioUnlocked&&e.ctx){e._audioUnlocked=!1,e.autoUnlock=!1,e._mobileUnloaded||e.ctx.sampleRate===44100||(e._mobileUnloaded=!0,e.unload()),e._scratchBuffer=e.ctx.createBuffer(1,1,22050);var n=i(function(o){for(;e._html5AudioPool.length<e.html5PoolSize;)try{var t=new Audio;t._unlocked=!0,e._releaseHtml5Audio(t)}catch{e.noAudio=!0;break}for(var r=0;r<e._howls.length;r++)if(!e._howls[r]._webAudio)for(var u=e._howls[r]._getSoundIds(),a=0;a<u.length;a++){var _=e._howls[r]._soundById(u[a]);_&&_._node&&!_._node._unlocked&&(_._node._unlocked=!0,_._node.load())}e._autoResume();var s=e.ctx.createBufferSource();s.buffer=e._scratchBuffer,s.connect(e.ctx.destination),s.start===void 0?s.noteOn(0):s.start(0),typeof e.ctx.resume=="function"&&e.ctx.resume(),s.onended=function(){s.disconnect(0),e._audioUnlocked=!0,document.removeEventListener("touchstart",n,!0),document.removeEventListener("touchend",n,!0),document.removeEventListener("click",n,!0),document.removeEventListener("keydown",n,!0);for(var c=0;c<e._howls.length;c++)e._howls[c]._emit("unlock")}},"o");return document.addEventListener("touchstart",n,!0),document.addEventListener("touchend",n,!0),document.addEventListener("click",n,!0),document.addEventListener("keydown",n,!0),e}},"_unlockAudio"),_obtainHtml5Audio:i(function(){var e=this||d;if(e._html5AudioPool.length)return e._html5AudioPool.pop();var n=new Audio().play();return n&&typeof Promise<"u"&&(n instanceof Promise||typeof n.then=="function")&&n.catch(function(){console.warn("HTML5 Audio pool exhausted, returning potentially locked audio object.")}),new Audio},"_obtainHtml5Audio"),_releaseHtml5Audio:i(function(e){var n=this||d;return e._unlocked&&n._html5AudioPool.push(e),n},"_releaseHtml5Audio"),_autoSuspend:i(function(){var e=this;if(e.autoSuspend&&e.ctx&&e.ctx.suspend!==void 0&&d.usingWebAudio){for(var n=0;n<e._howls.length;n++)if(e._howls[n]._webAudio){for(var o=0;o<e._howls[n]._sounds.length;o++)if(!e._howls[n]._sounds[o]._paused)return e}return e._suspendTimer&&clearTimeout(e._suspendTimer),e._suspendTimer=setTimeout(function(){if(e.autoSuspend){e._suspendTimer=null,e.state="suspending";var t=i(function(){e.state="suspended",e._resumeAfterSuspend&&(delete e._resumeAfterSuspend,e._autoResume())},"n");e.ctx.suspend().then(t,t)}},3e4),e}},"_autoSuspend"),_autoResume:i(function(){var e=this;if(e.ctx&&e.ctx.resume!==void 0&&d.usingWebAudio)return e.state==="running"&&e.ctx.state!=="interrupted"&&e._suspendTimer?(clearTimeout(e._suspendTimer),e._suspendTimer=null):e.state==="suspended"||e.state==="running"&&e.ctx.state==="interrupted"?(e.ctx.resume().then(function(){e.state="running";for(var n=0;n<e._howls.length;n++)e._howls[n]._emit("resume")}),e._suspendTimer&&(clearTimeout(e._suspendTimer),e._suspendTimer=null)):e.state==="suspending"&&(e._resumeAfterSuspend=!0),e},"_autoResume")};var d=new h,m=i(function(e){var n=this;if(!e.src||e.src.length===0)return void console.error("An array of source files must be passed with any new Howl.");n.init(e)},"o");m.prototype={init:i(function(e){var n=this;return d.ctx||w(),n._autoplay=e.autoplay||!1,n._format=typeof e.format!="string"?e.format:[e.format],n._html5=e.html5||!1,n._muted=e.mute||!1,n._loop=e.loop||!1,n._pool=e.pool||5,n._preload=typeof e.preload!="boolean"&&e.preload!=="metadata"||e.preload,n._rate=e.rate||1,n._sprite=e.sprite||{},n._src=typeof e.src!="string"?e.src:[e.src],n._volume=e.volume!==void 0?e.volume:1,n._xhr={method:e.xhr&&e.xhr.method?e.xhr.method:"GET",headers:e.xhr&&e.xhr.headers?e.xhr.headers:null,withCredentials:!(!e.xhr||!e.xhr.withCredentials)&&e.xhr.withCredentials},n._duration=0,n._state="unloaded",n._sounds=[],n._endTimers={},n._queue=[],n._playLock=!1,n._onend=e.onend?[{fn:e.onend}]:[],n._onfade=e.onfade?[{fn:e.onfade}]:[],n._onload=e.onload?[{fn:e.onload}]:[],n._onloaderror=e.onloaderror?[{fn:e.onloaderror}]:[],n._onplayerror=e.onplayerror?[{fn:e.onplayerror}]:[],n._onpause=e.onpause?[{fn:e.onpause}]:[],n._onplay=e.onplay?[{fn:e.onplay}]:[],n._onstop=e.onstop?[{fn:e.onstop}]:[],n._onmute=e.onmute?[{fn:e.onmute}]:[],n._onvolume=e.onvolume?[{fn:e.onvolume}]:[],n._onrate=e.onrate?[{fn:e.onrate}]:[],n._onseek=e.onseek?[{fn:e.onseek}]:[],n._onunlock=e.onunlock?[{fn:e.onunlock}]:[],n._onresume=[],n._webAudio=d.usingWebAudio&&!n._html5,d.ctx!==void 0&&d.ctx&&d.autoUnlock&&d._unlockAudio(),d._howls.push(n),n._autoplay&&n._queue.push({event:"play",action:i(function(){n.play()},"action")}),n._preload&&n._preload!=="none"&&n.load(),n},"init"),load:i(function(){var e=this,n=null;if(d.noAudio)return void e._emit("loaderror",null,"No audio support.");typeof e._src=="string"&&(e._src=[e._src]);for(var o=0;o<e._src.length;o++){var t,r;if(e._format&&e._format[o])t=e._format[o];else{if(typeof(r=e._src[o])!="string"){e._emit("loaderror",null,"Non-string found in selected audio sources - ignoring.");continue}t=/^data:audio\/([^;,]+);/i.exec(r),t||(t=/\.([^.]+)$/.exec(r.split("?",1)[0])),t&&(t=t[1].toLowerCase())}if(t||console.warn('No file extension was found. Consider using the "format" property or specify an extension.'),t&&d.codecs(t)){n=e._src[o];break}}return n?(e._src=n,e._state="loading",window.location.protocol==="https:"&&n.slice(0,5)==="http:"&&(e._html5=!0,e._webAudio=!1),new f(e),e._webAudio&&E(e),e):void e._emit("loaderror",null,"No codec support for selected audio sources.")},"load"),play:i(function(e,n){var o=this,t=null;if(typeof e=="number")t=e,e=null;else{if(typeof e=="string"&&o._state==="loaded"&&!o._sprite[e])return null;if(e===void 0&&(e="__default",!o._playLock)){for(var r=0,u=0;u<o._sounds.length;u++)o._sounds[u]._paused&&!o._sounds[u]._ended&&(r++,t=o._sounds[u]._id);r===1?e=null:t=null}}var a=t?o._soundById(t):o._inactiveSound();if(!a)return null;if(t&&!e&&(e=a._sprite||"__default"),o._state!=="loaded"){a._sprite=e,a._ended=!1;var _=a._id;return o._queue.push({event:"play",action:i(function(){o.play(_)},"action")}),_}if(t&&!a._paused)return n||o._loadQueue("play"),a._id;o._webAudio&&d._autoResume();var s=Math.max(0,a._seek>0?a._seek:o._sprite[e][0]/1e3),c=Math.max(0,(o._sprite[e][0]+o._sprite[e][1])/1e3-s),v=1e3*c/Math.abs(a._rate),g=o._sprite[e][0]/1e3,T=(o._sprite[e][0]+o._sprite[e][1])/1e3;a._sprite=e,a._ended=!1;var x=i(function(){a._paused=!1,a._seek=s,a._start=g,a._stop=T,a._loop=!(!a._loop&&!o._sprite[e][2])},"p");if(s>=T)return void o._ended(a);var l=a._node;if(o._webAudio){var P=i(function(){o._playLock=!1,x(),o._refreshBuffer(a);var b=a._muted||o._muted?0:a._volume;l.gain.setValueAtTime(b,d.ctx.currentTime),a._playStart=d.ctx.currentTime,l.bufferSource.start===void 0?a._loop?l.bufferSource.noteGrainOn(0,s,86400):l.bufferSource.noteGrainOn(0,s,c):a._loop?l.bufferSource.start(0,s,86400):l.bufferSource.start(0,s,c),v!==1/0&&(o._endTimers[a._id]=setTimeout(o._ended.bind(o,a),v)),n||setTimeout(function(){o._emit("play",a._id),o._loadQueue()},0)},"v");d.state==="running"&&d.ctx.state!=="interrupted"?P():(o._playLock=!0,o.once("resume",P),o._clearTimer(a._id))}else{var L=i(function(){l.currentTime=s,l.muted=a._muted||o._muted||d._muted||l.muted,l.volume=a._volume*d.volume(),l.playbackRate=a._rate;try{var b=l.play();if(b&&typeof Promise<"u"&&(b instanceof Promise||typeof b.then=="function")?(o._playLock=!0,x(),b.then(function(){o._playLock=!1,l._unlocked=!0,n?o._loadQueue():o._emit("play",a._id)}).catch(function(){o._playLock=!1,o._emit("playerror",a._id,"Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction."),a._ended=!0,a._paused=!0})):n||(o._playLock=!1,x(),o._emit("play",a._id)),l.playbackRate=a._rate,l.paused)return void o._emit("playerror",a._id,"Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");e!=="__default"||a._loop?o._endTimers[a._id]=setTimeout(o._ended.bind(o,a),v):(o._endTimers[a._id]=function(){o._ended(a),l.removeEventListener("ended",o._endTimers[a._id],!1)},l.addEventListener("ended",o._endTimers[a._id],!1))}catch(C){o._emit("playerror",a._id,C)}},"h");l.src==="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"&&(l.src=o._src,l.load());var O=window&&window.ejecta||!l.readyState&&d._navigator.isCocoonJS;if(l.readyState>=3||O)L();else{o._playLock=!0,o._state="loading";var B=i(function(){o._state="loaded",L(),l.removeEventListener(d._canPlayEvent,B,!1)},"g");l.addEventListener(d._canPlayEvent,B,!1),o._clearTimer(a._id)}}return a._id},"play"),pause:i(function(e){var n=this;if(n._state!=="loaded"||n._playLock)return n._queue.push({event:"pause",action:i(function(){n.pause(e)},"action")}),n;for(var o=n._getSoundIds(e),t=0;t<o.length;t++){n._clearTimer(o[t]);var r=n._soundById(o[t]);if(r&&!r._paused&&(r._seek=n.seek(o[t]),r._rateSeek=0,r._paused=!0,n._stopFade(o[t]),r._node))if(n._webAudio){if(!r._node.bufferSource)continue;r._node.bufferSource.stop===void 0?r._node.bufferSource.noteOff(0):r._node.bufferSource.stop(0),n._cleanBuffer(r._node)}else isNaN(r._node.duration)&&r._node.duration!==1/0||r._node.pause();arguments[1]||n._emit("pause",r?r._id:null)}return n},"pause"),stop:i(function(e,n){var o=this;if(o._state!=="loaded"||o._playLock)return o._queue.push({event:"stop",action:i(function(){o.stop(e)},"action")}),o;for(var t=o._getSoundIds(e),r=0;r<t.length;r++){o._clearTimer(t[r]);var u=o._soundById(t[r]);u&&(u._seek=u._start||0,u._rateSeek=0,u._paused=!0,u._ended=!0,o._stopFade(t[r]),u._node&&(o._webAudio?u._node.bufferSource&&(u._node.bufferSource.stop===void 0?u._node.bufferSource.noteOff(0):u._node.bufferSource.stop(0),o._cleanBuffer(u._node)):isNaN(u._node.duration)&&u._node.duration!==1/0||(u._node.currentTime=u._start||0,u._node.pause(),u._node.duration===1/0&&o._clearSound(u._node))),n||o._emit("stop",u._id))}return o},"stop"),mute:i(function(e,n){var o=this;if(o._state!=="loaded"||o._playLock)return o._queue.push({event:"mute",action:i(function(){o.mute(e,n)},"action")}),o;if(n===void 0){if(typeof e!="boolean")return o._muted;o._muted=e}for(var t=o._getSoundIds(n),r=0;r<t.length;r++){var u=o._soundById(t[r]);u&&(u._muted=e,u._interval&&o._stopFade(u._id),o._webAudio&&u._node?u._node.gain.setValueAtTime(e?0:u._volume,d.ctx.currentTime):u._node&&(u._node.muted=!!d._muted||e),o._emit("mute",u._id))}return o},"mute"),volume:i(function(){var e,n,o=this,t=arguments;if(t.length===0)return o._volume;t.length===1||t.length===2&&t[1]===void 0?o._getSoundIds().indexOf(t[0])>=0?n=parseInt(t[0],10):e=parseFloat(t[0]):t.length>=2&&(e=parseFloat(t[0]),n=parseInt(t[1],10));var r;if(!(e!==void 0&&e>=0&&e<=1))return r=n?o._soundById(n):o._sounds[0],r?r._volume:0;if(o._state!=="loaded"||o._playLock)return o._queue.push({event:"volume",action:i(function(){o.volume.apply(o,t)},"action")}),o;n===void 0&&(o._volume=e),n=o._getSoundIds(n);for(var u=0;u<n.length;u++)(r=o._soundById(n[u]))&&(r._volume=e,t[2]||o._stopFade(n[u]),o._webAudio&&r._node&&!r._muted?r._node.gain.setValueAtTime(e,d.ctx.currentTime):r._node&&!r._muted&&(r._node.volume=e*d.volume()),o._emit("volume",r._id));return o},"volume"),fade:i(function(e,n,o,t){var r=this;if(r._state!=="loaded"||r._playLock)return r._queue.push({event:"fade",action:i(function(){r.fade(e,n,o,t)},"action")}),r;e=Math.min(Math.max(0,parseFloat(e)),1),n=Math.min(Math.max(0,parseFloat(n)),1),o=parseFloat(o),r.volume(e,t);for(var u=r._getSoundIds(t),a=0;a<u.length;a++){var _=r._soundById(u[a]);if(_){if(t||r._stopFade(u[a]),r._webAudio&&!_._muted){var s=d.ctx.currentTime,c=s+o/1e3;_._volume=e,_._node.gain.setValueAtTime(e,s),_._node.gain.linearRampToValueAtTime(n,c)}r._startFadeInterval(_,e,n,o,u[a],t===void 0)}}return r},"fade"),_startFadeInterval:i(function(e,n,o,t,r,u){var a=this,_=n,s=o-n,c=Math.abs(s/.01),v=Math.max(4,c>0?t/c:t),g=Date.now();e._fadeTo=o,e._interval=setInterval(function(){var T=(Date.now()-g)/t;g=Date.now(),_+=s*T,_=Math.round(100*_)/100,_=s<0?Math.max(o,_):Math.min(o,_),a._webAudio?e._volume=_:a.volume(_,e._id,!0),u&&(a._volume=_),(o<n&&_<=o||o>n&&_>=o)&&(clearInterval(e._interval),e._interval=null,e._fadeTo=null,a.volume(o,e._id),a._emit("fade",e._id))},v)},"_startFadeInterval"),_stopFade:i(function(e){var n=this,o=n._soundById(e);return o&&o._interval&&(n._webAudio&&o._node.gain.cancelScheduledValues(d.ctx.currentTime),clearInterval(o._interval),o._interval=null,n.volume(o._fadeTo,e),o._fadeTo=null,n._emit("fade",e)),n},"_stopFade"),loop:i(function(){var e,n,o,t=this,r=arguments;if(r.length===0)return t._loop;if(r.length===1){if(typeof r[0]!="boolean")return!!(o=t._soundById(parseInt(r[0],10)))&&o._loop;e=r[0],t._loop=e}else r.length===2&&(e=r[0],n=parseInt(r[1],10));for(var u=t._getSoundIds(n),a=0;a<u.length;a++)(o=t._soundById(u[a]))&&(o._loop=e,t._webAudio&&o._node&&o._node.bufferSource&&(o._node.bufferSource.loop=e,e&&(o._node.bufferSource.loopStart=o._start||0,o._node.bufferSource.loopEnd=o._stop,t.playing(u[a])&&(t.pause(u[a],!0),t.play(u[a],!0)))));return t},"loop"),rate:i(function(){var e,n,o=this,t=arguments;if(t.length===0)n=o._sounds[0]._id;else if(t.length===1){var r=o._getSoundIds(),u=r.indexOf(t[0]);u>=0?n=parseInt(t[0],10):e=parseFloat(t[0])}else t.length===2&&(e=parseFloat(t[0]),n=parseInt(t[1],10));var a;if(typeof e!="number")return a=o._soundById(n),a?a._rate:o._rate;if(o._state!=="loaded"||o._playLock)return o._queue.push({event:"rate",action:i(function(){o.rate.apply(o,t)},"action")}),o;n===void 0&&(o._rate=e),n=o._getSoundIds(n);for(var _=0;_<n.length;_++)if(a=o._soundById(n[_])){o.playing(n[_])&&(a._rateSeek=o.seek(n[_]),a._playStart=o._webAudio?d.ctx.currentTime:a._playStart),a._rate=e,o._webAudio&&a._node&&a._node.bufferSource?a._node.bufferSource.playbackRate.setValueAtTime(e,d.ctx.currentTime):a._node&&(a._node.playbackRate=e);var s=o.seek(n[_]),c=(o._sprite[a._sprite][0]+o._sprite[a._sprite][1])/1e3-s,v=1e3*c/Math.abs(a._rate);!o._endTimers[n[_]]&&a._paused||(o._clearTimer(n[_]),o._endTimers[n[_]]=setTimeout(o._ended.bind(o,a),v)),o._emit("rate",a._id)}return o},"rate"),seek:i(function(){var e,n,o=this,t=arguments;if(t.length===0)o._sounds.length&&(n=o._sounds[0]._id);else if(t.length===1){var r=o._getSoundIds(),u=r.indexOf(t[0]);u>=0?n=parseInt(t[0],10):o._sounds.length&&(n=o._sounds[0]._id,e=parseFloat(t[0]))}else t.length===2&&(e=parseFloat(t[0]),n=parseInt(t[1],10));if(n===void 0)return 0;if(typeof e=="number"&&(o._state!=="loaded"||o._playLock))return o._queue.push({event:"seek",action:i(function(){o.seek.apply(o,t)},"action")}),o;var a=o._soundById(n);if(a){if(!(typeof e=="number"&&e>=0)){if(o._webAudio){var _=o.playing(n)?d.ctx.currentTime-a._playStart:0,s=a._rateSeek?a._rateSeek-a._seek:0;return a._seek+(s+_*Math.abs(a._rate))}return a._node.currentTime}var c=o.playing(n);c&&o.pause(n,!0),a._seek=e,a._ended=!1,o._clearTimer(n),o._webAudio||!a._node||isNaN(a._node.duration)||(a._node.currentTime=e);var v=i(function(){c&&o.play(n,!0),o._emit("seek",n)},"l");if(c&&!o._webAudio){var g=i(function(){o._playLock?setTimeout(g,0):v()},"c");setTimeout(g,0)}else v()}return o},"seek"),playing:i(function(e){var n=this;if(typeof e=="number"){var o=n._soundById(e);return!!o&&!o._paused}for(var t=0;t<n._sounds.length;t++)if(!n._sounds[t]._paused)return!0;return!1},"playing"),duration:i(function(e){var n=this,o=n._duration,t=n._soundById(e);return t&&(o=n._sprite[t._sprite][1]/1e3),o},"duration"),state:i(function(){return this._state},"state"),unload:i(function(){for(var e=this,n=e._sounds,o=0;o<n.length;o++)n[o]._paused||e.stop(n[o]._id),e._webAudio||(e._clearSound(n[o]._node),n[o]._node.removeEventListener("error",n[o]._errorFn,!1),n[o]._node.removeEventListener(d._canPlayEvent,n[o]._loadFn,!1),n[o]._node.removeEventListener("ended",n[o]._endFn,!1),d._releaseHtml5Audio(n[o]._node)),delete n[o]._node,e._clearTimer(n[o]._id);var t=d._howls.indexOf(e);t>=0&&d._howls.splice(t,1);var r=!0;for(o=0;o<d._howls.length;o++)if(d._howls[o]._src===e._src||e._src.indexOf(d._howls[o]._src)>=0){r=!1;break}return p&&r&&delete p[e._src],d.noAudio=!1,e._state="unloaded",e._sounds=[],e=null,null},"unload"),on:i(function(e,n,o,t){var r=this,u=r["_on"+e];return typeof n=="function"&&u.push(t?{id:o,fn:n,once:t}:{id:o,fn:n}),r},"on"),off:i(function(e,n,o){var t=this,r=t["_on"+e],u=0;if(typeof n=="number"&&(o=n,n=null),n||o)for(u=0;u<r.length;u++){var a=o===r[u].id;if(n===r[u].fn&&a||!n&&a){r.splice(u,1);break}}else if(e)t["_on"+e]=[];else{var _=Object.keys(t);for(u=0;u<_.length;u++)_[u].indexOf("_on")===0&&Array.isArray(t[_[u]])&&(t[_[u]]=[])}return t},"off"),once:i(function(e,n,o){var t=this;return t.on(e,n,o,1),t},"once"),_emit:i(function(e,n,o){for(var t=this,r=t["_on"+e],u=r.length-1;u>=0;u--)r[u].id&&r[u].id!==n&&e!=="load"||(setTimeout((function(a){a.call(this,n,o)}).bind(t,r[u].fn),0),r[u].once&&t.off(e,r[u].fn,r[u].id));return t._loadQueue(e),t},"_emit"),_loadQueue:i(function(e){var n=this;if(n._queue.length>0){var o=n._queue[0];o.event===e&&(n._queue.shift(),n._loadQueue()),e||o.action()}return n},"_loadQueue"),_ended:i(function(e){var n=this,o=e._sprite;if(!n._webAudio&&e._node&&!e._node.paused&&!e._node.ended&&e._node.currentTime<e._stop)return setTimeout(n._ended.bind(n,e),100),n;var t=!(!e._loop&&!n._sprite[o][2]);if(n._emit("end",e._id),!n._webAudio&&t&&n.stop(e._id,!0).play(e._id),n._webAudio&&t){n._emit("play",e._id),e._seek=e._start||0,e._rateSeek=0,e._playStart=d.ctx.currentTime;var r=1e3*(e._stop-e._start)/Math.abs(e._rate);n._endTimers[e._id]=setTimeout(n._ended.bind(n,e),r)}return n._webAudio&&!t&&(e._paused=!0,e._ended=!0,e._seek=e._start||0,e._rateSeek=0,n._clearTimer(e._id),n._cleanBuffer(e._node),d._autoSuspend()),n._webAudio||t||n.stop(e._id,!0),n},"_ended"),_clearTimer:i(function(e){var n=this;if(n._endTimers[e]){if(typeof n._endTimers[e]!="function")clearTimeout(n._endTimers[e]);else{var o=n._soundById(e);o&&o._node&&o._node.removeEventListener("ended",n._endTimers[e],!1)}delete n._endTimers[e]}return n},"_clearTimer"),_soundById:i(function(e){for(var n=this,o=0;o<n._sounds.length;o++)if(e===n._sounds[o]._id)return n._sounds[o];return null},"_soundById"),_inactiveSound:i(function(){var e=this;e._drain();for(var n=0;n<e._sounds.length;n++)if(e._sounds[n]._ended)return e._sounds[n].reset();return new f(e)},"_inactiveSound"),_drain:i(function(){var e=this,n=e._pool,o=0,t=0;if(!(e._sounds.length<n)){for(t=0;t<e._sounds.length;t++)e._sounds[t]._ended&&o++;for(t=e._sounds.length-1;t>=0;t--){if(o<=n)return;e._sounds[t]._ended&&(e._webAudio&&e._sounds[t]._node&&e._sounds[t]._node.disconnect(0),e._sounds.splice(t,1),o--)}}},"_drain"),_getSoundIds:i(function(e){var n=this;if(e===void 0){for(var o=[],t=0;t<n._sounds.length;t++)o.push(n._sounds[t]._id);return o}return[e]},"_getSoundIds"),_refreshBuffer:i(function(e){var n=this;return e._node.bufferSource=d.ctx.createBufferSource(),e._node.bufferSource.buffer=p[n._src],e._panner?e._node.bufferSource.connect(e._panner):e._node.bufferSource.connect(e._node),e._node.bufferSource.loop=e._loop,e._loop&&(e._node.bufferSource.loopStart=e._start||0,e._node.bufferSource.loopEnd=e._stop||0),e._node.bufferSource.playbackRate.setValueAtTime(e._rate,d.ctx.currentTime),n},"_refreshBuffer"),_cleanBuffer:i(function(e){var n=this,o=d._navigator&&d._navigator.vendor.indexOf("Apple")>=0;if(d._scratchBuffer&&e.bufferSource&&(e.bufferSource.onended=null,e.bufferSource.disconnect(0),o))try{e.bufferSource.buffer=d._scratchBuffer}catch{}return e.bufferSource=null,n},"_cleanBuffer"),_clearSound:i(function(e){/MSIE |Trident\//.test(d._navigator&&d._navigator.userAgent)||(e.src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA")},"_clearSound")};var f=i(function(e){this._parent=e,this.init()},"t");f.prototype={init:i(function(){var e=this,n=e._parent;return e._muted=n._muted,e._loop=n._loop,e._volume=n._volume,e._rate=n._rate,e._seek=0,e._paused=!0,e._ended=!0,e._sprite="__default",e._id=++d._counter,n._sounds.push(e),e.create(),e},"init"),create:i(function(){var e=this,n=e._parent,o=d._muted||e._muted||e._parent._muted?0:e._volume;return n._webAudio?(e._node=d.ctx.createGain===void 0?d.ctx.createGainNode():d.ctx.createGain(),e._node.gain.setValueAtTime(o,d.ctx.currentTime),e._node.paused=!0,e._node.connect(d.masterGain)):d.noAudio||(e._node=d._obtainHtml5Audio(),e._errorFn=e._errorListener.bind(e),e._node.addEventListener("error",e._errorFn,!1),e._loadFn=e._loadListener.bind(e),e._node.addEventListener(d._canPlayEvent,e._loadFn,!1),e._endFn=e._endListener.bind(e),e._node.addEventListener("ended",e._endFn,!1),e._node.src=n._src,e._node.preload=n._preload===!0?"auto":n._preload,e._node.volume=o*d.volume(),e._node.load()),e},"create"),reset:i(function(){var e=this,n=e._parent;return e._muted=n._muted,e._loop=n._loop,e._volume=n._volume,e._rate=n._rate,e._seek=0,e._rateSeek=0,e._paused=!0,e._ended=!0,e._sprite="__default",e._id=++d._counter,e},"reset"),_errorListener:i(function(){var e=this;e._parent._emit("loaderror",e._id,e._node.error?e._node.error.code:0),e._node.removeEventListener("error",e._errorFn,!1)},"_errorListener"),_loadListener:i(function(){var e=this,n=e._parent;n._duration=Math.ceil(10*e._node.duration)/10,Object.keys(n._sprite).length===0&&(n._sprite={__default:[0,1e3*n._duration]}),n._state!=="loaded"&&(n._state="loaded",n._emit("load"),n._loadQueue()),e._node.removeEventListener(d._canPlayEvent,e._loadFn,!1)},"_loadListener"),_endListener:i(function(){var e=this,n=e._parent;n._duration===1/0&&(n._duration=Math.ceil(10*e._node.duration)/10,n._sprite.__default[1]===1/0&&(n._sprite.__default[1]=1e3*n._duration),n._ended(e)),e._node.removeEventListener("ended",e._endFn,!1)},"_endListener")};var p={},E=i(function(e){var n=e._src;if(p[n])return e._duration=p[n].duration,void I(e);if(/^data:[^;]+;base64,/.test(n)){for(var o=atob(n.split(",")[1]),t=new Uint8Array(o.length),r=0;r<o.length;++r)t[r]=o.charCodeAt(r);S(t.buffer,e)}else{var u=new XMLHttpRequest;u.open(e._xhr.method,n,!0),u.withCredentials=e._xhr.withCredentials,u.responseType="arraybuffer",e._xhr.headers&&Object.keys(e._xhr.headers).forEach(function(a){u.setRequestHeader(a,e._xhr.headers[a])}),u.onload=function(){var a=(u.status+"")[0];if(a!=="0"&&a!=="2"&&a!=="3")return void e._emit("loaderror",null,"Failed loading audio file with status: "+u.status+".");S(u.response,e)},u.onerror=function(){e._webAudio&&(e._html5=!0,e._webAudio=!1,e._sounds=[],delete p[n],e.load())},F(u)}},"a"),F=i(function(e){try{e.send()}catch{e.onerror()}},"u"),S=i(function(e,n){var o=i(function(){n._emit("loaderror",null,"Decoding audio data failed.")},"t"),t=i(function(r){r&&n._sounds.length>0?(p[n._src]=r,I(n,r)):o()},"a");typeof Promise<"u"&&d.ctx.decodeAudioData.length===1?d.ctx.decodeAudioData(e).then(t).catch(o):d.ctx.decodeAudioData(e,t,o)},"d"),I=i(function(e,n){n&&!e._duration&&(e._duration=n.duration),Object.keys(e._sprite).length===0&&(e._sprite={__default:[0,1e3*e._duration]}),e._state!=="loaded"&&(e._state="loaded",e._emit("load"),e._loadQueue())},"i"),w=i(function(){if(d.usingWebAudio){try{typeof AudioContext<"u"?d.ctx=new AudioContext:typeof webkitAudioContext<"u"?d.ctx=new webkitAudioContext:d.usingWebAudio=!1}catch{d.usingWebAudio=!1}d.ctx||(d.usingWebAudio=!1);var e=/iP(hone|od|ad)/.test(d._navigator&&d._navigator.platform),n=d._navigator&&d._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/),o=n?parseInt(n[1],10):null;if(e&&o&&o<9){var t=/safari/.test(d._navigator&&d._navigator.userAgent.toLowerCase());d._navigator&&!t&&(d.usingWebAudio=!1)}d.usingWebAudio&&(d.masterGain=d.ctx.createGain===void 0?d.ctx.createGainNode():d.ctx.createGain(),d.masterGain.gain.setValueAtTime(d._muted?0:d._volume,d.ctx.currentTime),d.masterGain.connect(d.ctx.destination)),d._setup()}},"_");y.Howler=d,y.Howl=m,typeof A<"u"?(A.HowlerGlobal=h,A.Howler=d,A.Howl=m,A.Sound=f):typeof window<"u"&&(window.HowlerGlobal=h,window.Howler=d,window.Howl=m,window.Sound=f)})()})(k);const $=M(k),q=R({__proto__:null,default:$},[k]);export{q as h};
