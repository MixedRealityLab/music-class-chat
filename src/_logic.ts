import type * as t from './_types'

export function isEnabled(rewards: t.UserReward[], ifall: string[], andnot: string[]) : boolean {
  for (let reward of rewards) {
    if (reward.got && andnot && andnot.indexOf(reward._id) >= 0)
      return false;
    else if (!reward.got && ifall && ifall.indexOf(reward._id) >= 0)
      return false;
  }
  return true;
}

export interface NextStep {
  do?: t.MessageDef,
  waitfor?: string[],
  after?: number,
  error?: string,
  done?:boolean,
}
export function getNextStep(user: t.UUser, userchat: t.UserChat, chatdef: t.ChatDef, waiting: number, userinput: string) : NextStep {
  let nextstep: NextStep = { waitfor: [] };
  if (userchat.nextix<0 || userchat.nextix >= chatdef.messages.length) {
    console.log(`invalid or out of range nextix, ${userchat.nextix} / ${chatdef.messages.length}`);
    return nextstep;
  }
  for(let ix=userchat.nextix; ix<chatdef.messages.length; ix++) {
    let mdef = chatdef.messages[ix];
    if (!mdef) {
      console.log(`message def ${userchat.nextix} / ${chatdef.messages.length} not found`);
      return nextstep;
    }
    // rewards OK?
    if (isEnabled(user.rewards, mdef.ifall, mdef.andnot)) {
      // time delay OK?
      if (!mdef.after || waiting >= mdef.after) {
        // user input OK?
        if (!mdef.waitfor || mdef.waitfor == userinput) {
           return { do: mdef };
  	} 
	if (mdef.waitfor) {
	  nextstep.waitfor.push(mdef.waitfor);
	}
      } else {
	if (nextstep.after === undefined || nextstep.after === null
	    || nextstep.after > mdef.after - waiting) {
          nextstep.after = mdef.after - waiting;
        }    
      }
    }
    if (!mdef.ornext)
      break;
  }
  return nextstep;
}

