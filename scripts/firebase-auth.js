/* Firebase owns credentials; this adapter exposes only authenticated tokens to planner APIs. */
(() => {
 let auth, sdk, appSdk, ready, dialog;
 async function init(config,verifiedEditors=false){
  if(ready)return ready;
  ready=(async()=>{
   [appSdk,sdk]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js')]);
   const app=appSdk.initializeApp(config,'atlas-planner');auth=sdk.getAuth(app);
   await auth.authStateReady();
   dialog=document.createElement('dialog');dialog.className='atlas-login';dialog.setAttribute('aria-label','Sign in to Atlas');
   dialog.innerHTML=`<form method="dialog"><button aria-label="Close sign-in" value="close">Close</button></form><h2>Sign in to Atlas</h2><p>${verifiedEditors?'Anyone who signs in with a verified email can view, edit and save the shared planner.':'Anyone with a verified email can view the shared planner. Only the owner can edit and save.'}</p><button type="button" data-google>Continue with Google</button><p>Or use your email and password:</p><form data-email-form><label>Email <input name="email" type="email" autocomplete="email" required></label><label>Password <input name="password" type="password" autocomplete="current-password" minlength="8" required></label><button type="submit">Sign in</button><button type="button" data-register>Create account</button><button type="button" data-reset>Reset password</button></form><div data-verification hidden><p>Check your inbox and verify your email before opening the shared plan.</p><button type="button" data-send-verification>Send verification email</button><button type="button" data-verified>I verified my email</button></div><p role="status" data-auth-status></p>`;
   const style=document.createElement('style');style.textContent='.atlas-login{max-width:460px;width:calc(100% - 40px);border:1px solid #94bce7;border-radius:16px;padding:24px;color:#153652;background:#fff}.atlas-login::backdrop{background:#13243d99}.atlas-login label{display:block;margin:12px 0}.atlas-login input{display:block;width:100%;box-sizing:border-box;padding:10px}.atlas-login button{margin:5px;padding:10px}.atlas-login [hidden]{display:none!important}';document.head.append(style);document.body.append(dialog);
   const message=text=>{dialog.querySelector('[data-auth-status]').textContent=text;};
   const verification=()=>{dialog.querySelector('[data-verification]').hidden=Boolean(!auth.currentUser||auth.currentUser.emailVerified);};
   const email=()=>dialog.querySelector('[name=email]').value.trim();
   const password=()=>dialog.querySelector('[name=password]').value;
   async function finish(){verification();if(auth.currentUser?.emailVerified){dialog.close();dialog.querySelector('[name=password]').value='';}else{message('Verify your email to continue.');}}
   async function run(action){
    const buttons=[...dialog.querySelectorAll('button:not([value=close])')];buttons.forEach(b=>b.disabled=true);message('Working…');
    let timeout;
    try{await Promise.race([action(),new Promise((_,reject)=>{timeout=setTimeout(()=>reject({code:'auth/popup-timeout'}),45000);})]);}
    catch(e){message(['auth/popup-blocked','auth/popup-timeout'].includes(e.code)?'Sign-in did not open or finish. Check for a blocked popup, allow this planner’s popup, then retry or use email sign-in.':e.code==='auth/popup-closed-by-user'?'Sign-in was cancelled. You can try again.':'Sign-in did not complete. Check your details, verify your email, or try again.');}
    finally{clearTimeout(timeout);buttons.forEach(b=>b.disabled=false);}
   }
   dialog.querySelector('[data-google]').onclick=()=>run(async()=>{await sdk.signInWithPopup(auth,new sdk.GoogleAuthProvider());await finish();});
   dialog.querySelector('[data-email-form]').onsubmit=e=>{e.preventDefault();run(async()=>{await sdk.signInWithEmailAndPassword(auth,email(),password());await finish();});};
   dialog.querySelector('[data-register]').onclick=()=>run(async()=>{const form=dialog.querySelector('[data-email-form]');if(!form.reportValidity())return;await sdk.createUserWithEmailAndPassword(auth,email(),password());await sdk.sendEmailVerification(auth.currentUser,{url:location.origin+'/workspace.html'});message('Verification email sent. Check your inbox.');verification();dialog.querySelector('[name=password]').value='';});
   dialog.querySelector('[data-reset]').onclick=()=>run(async()=>{if(!dialog.querySelector('[name=email]').reportValidity())return;await sdk.sendPasswordResetEmail(auth,email(),{url:location.origin+'/workspace.html'});message('If this email has an account, password-reset instructions will arrive shortly.');});
   dialog.querySelector('[data-send-verification]').onclick=()=>run(async()=>{if(auth.currentUser&&!auth.currentUser.emailVerified)await sdk.sendEmailVerification(auth.currentUser,{url:location.origin+'/workspace.html'});message('Verification email sent. Check your inbox.');});
   dialog.querySelector('[data-verified]').onclick=()=>run(async()=>{if(auth.currentUser){await sdk.reload(auth.currentUser);await auth.currentUser.getIdToken(true);await finish();}});
   verification();
  })();
  try{await ready;}catch(e){ready=null;throw e;}
 }
 function show(){if(!dialog.open)dialog.showModal();dialog.querySelector('[data-verification]').hidden=Boolean(!auth.currentUser||auth.currentUser.emailVerified);}
 window.AtlasFirebaseAuth={
  init,
  profile(){const user=auth?.currentUser;return user?{email:user.email||'',name:user.displayName||'',photo:user.photoURL||'',verified:Boolean(user.emailVerified)}:null;},
  async ensureSignedIn(){await ready;if(auth.currentUser?.emailVerified)return true;show();return false;},
  async token(){return auth.currentUser?.getIdToken();},
  listen(fn){return sdk.onIdTokenChanged(auth,user=>fn({id:user?.uid?'firebase:'+user.uid:null,verified:Boolean(user?.emailVerified)}));},
  async signOut(){await sdk.signOut(auth);},
 };
})();
