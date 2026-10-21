import {test,expect} from '@playwright/test';
test('hero and navbar CTA dimensions stay stable on hover and focus',async({page})=>{
  for(const width of [390,768,1440]){
    await page.setViewportSize({width,height:1000});
    await page.goto('/');
    const targets=[page.getByRole('link',{name:'Browse Our Classic Flavors'})];
    if(width>=1280)targets.push(page.locator('header').getByRole('link',{name:'Contact Us',exact:true}));
    for(const target of targets){
      const before=await target.boundingBox();
      await target.hover();
      await page.waitForTimeout(350);
      await target.focus();
      const after=await target.boundingBox();
      expect(after.width).toBeCloseTo(before.width,1);
      expect(after.height).toBeCloseTo(before.height,1);
      expect(await target.evaluate(el=>getComputedStyle(el).transform)).toBe('none');
    }
  }
});
