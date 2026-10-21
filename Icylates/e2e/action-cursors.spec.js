import {test,expect} from '@playwright/test';
import {expectActionCursors} from './cursor-helper';

test('storefront and admin actions have pointer cursors',async({page})=>{
  for(const route of ['/','/shop','/cart','/wishlist','/checkout','/our-team','/admin/login']){
    await page.goto(route);
    await expectActionCursors(page);
  }
  await page.getByLabel('Email').fill('admin@e2e.test');
  await page.getByLabel('Password').fill('Admin-Password-589');
  await page.getByRole('button',{name:'Sign In'}).click();
  await expect(page).toHaveURL(/\/admin$/);
  for(const route of ['/admin','/admin/products','/admin/orders','/admin/users','/admin/messages']){
    await page.goto(route);
    await expectActionCursors(page);
  }
  await page.goto('/admin/products');
  await page.getByRole('button',{name:'+ Add Product'}).click();
  await expectActionCursors(page);
  const upload=page.locator('label').filter({has:page.locator('input[type="file"]')});
  await expect(upload).toHaveCSS('cursor','pointer');
  await page.locator('input[type="file"]').evaluate(el=>{el.disabled=true;});
  await expect(upload).not.toHaveCSS('cursor','pointer');
});
