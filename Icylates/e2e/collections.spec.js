import {expect, test} from '@playwright/test';

test('Figma collections load MongoDB products and preserve mobile navigation', async ({page}, testInfo) => {
  await page.goto('/home-2');
  await expect(page.getByRole('heading', {name:'Vegan Ice Cream Delights'})).toBeVisible();
  await expect(page.getByRole('heading', {name:'Coconut Milk Chocolate Chip'}).first()).toBeAttached();
  await page.getByRole('link', {name:'Explore Our Vegan Flavors'}).click();
  await expect(page).toHaveURL(/category=Vegan/);
  await expect(page.getByRole('heading', {name:'Coconut Milk Chocolate Chip'})).toBeVisible();
  await expect(page.getByRole('heading', {name:'Classic Pistachio Gelato'})).toHaveCount(0);
  await page.getByRole('heading', {name:'Coconut Milk Chocolate Chip'}).getByRole('link').click();
  await expect(page.getByRole('button', {name:'View image 1'})).toBeVisible();
  await page.getByRole('button', {name:'Add to Cart', exact:true}).click();
  await expect(page.getByRole('status').filter({hasText:'Added to cart.'})).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  await page.goto('/home-3');
  await expect(page.getByRole('heading', {name:'Artisan Gelato Shop'})).toBeVisible();
  await expect(page.getByRole('heading', {name:'Classic Pistachio Gelato'}).first()).toBeAttached();
  await page.getByRole('button', {name:'Toggle menu'}).click();
  await page.locator('#mobile-navigation').getByRole('button', {name:'Home',exact:true}).click();
  await page.locator('#mobile-navigation').getByRole('link', {name:'Home 2',exact:true}).click();
  await expect(page).toHaveURL(/home-2$/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath('vegan-mobile.png'),fullPage:true});
});
