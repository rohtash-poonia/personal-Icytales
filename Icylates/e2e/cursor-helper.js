import {expect} from '@playwright/test';

export async function expectActionCursors(page){
  const failures=await page.locator('a[href], button, select, summary, [role="button"], [role="tab"], input[type="checkbox"], input[type="radio"]').evaluateAll(elements=>elements.filter(el=>{
    if(!el.getClientRects().length || getComputedStyle(el).visibility==='hidden' || el.closest('[inert]'))return false;
    const disabled=el.matches(':disabled') || el.closest('[aria-disabled="true"]');
    const pointer=getComputedStyle(el).cursor==='pointer';
    return disabled ? pointer : !pointer;
  }).map(el=>({tag:el.tagName,text:el.textContent?.trim().slice(0,70),cursor:getComputedStyle(el).cursor})));
  expect(failures).toEqual([]);
}
