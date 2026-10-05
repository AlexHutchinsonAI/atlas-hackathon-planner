/* One writer, durable pending snapshots, optimistic revisions, bounded retry. */
(function(root) {
 class CloudQueue {
  constructor({request,persist,status,online=()=>true,delay=600,setTimer=(fn,ms)=>root.setTimeout(fn,ms),clearTimer=id=>root.clearTimeout(id)}) {
   Object.assign(this,{request,persist,status,online,delay,setTimer,clearTimer});
   this.revision=null; this.pending=null; this.saving=false; this.blocked=false;this.timer=null;this.failures=0;this.epoch=0;
  }
  start(revision){this.epoch++;this.clearTimer(this.timer);this.revision=revision;this.pending=null;this.blocked=false;this.failures=0;}
  change(plan){this.pending=JSON.parse(JSON.stringify(plan));this.persist({revision:this.revision,plan:this.pending});this.status(this.online()?'Changes waiting to save':'Offline · changes kept on this device');this.schedule(this.delay);}
  schedule(delay){this.clearTimer(this.timer);this.timer=this.setTimer(()=>this.flush(),delay);}
  async flush(){
   this.clearTimer(this.timer);
   if(this.saving||this.blocked||!this.pending)return;
   if(!this.online()){this.status('Offline · changes kept on this device');return;}
   const snapshot=this.pending,revision=this.revision,epoch=this.epoch;this.pending=null;this.saving=true;this.status('Saving to cloud…');
   try{
    const result=await this.request({plan:snapshot,revision});
    if(epoch!==this.epoch)return;
    this.revision=result.revision;this.failures=0;
    this.persist(this.pending?{revision:this.revision,plan:this.pending}:null);
    this.status(this.pending?'Changes waiting to save':'Saved to cloud');
   }catch(error){
    if(epoch!==this.epoch)return;
    this.pending=this.pending||snapshot;this.persist({revision:this.revision,plan:this.pending});
    if([400,401,403,409].includes(error.status)){this.blocked=true;this.status(error.status===409?'Conflict · your edits are kept. Review the current shared version before retrying.':error.message);}
    else{this.failures++;this.status('Cloud save unavailable · edits kept on this device; retrying');this.schedule(Math.min(30000,1000*2**Math.min(this.failures,5)));}
   }finally{this.saving=false;if(epoch===this.epoch&&this.pending&&!this.blocked&&!this.failures)this.schedule(this.delay);}
  }
  stop(){this.epoch++;this.clearTimer(this.timer);this.pending=null;this.blocked=false;}
 }
 if(typeof module!=='undefined')module.exports=CloudQueue;else root.AtlasCloudQueue=CloudQueue;
})(typeof window==='undefined'?globalThis:window);
