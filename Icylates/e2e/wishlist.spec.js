import {test,expect} from '@playwright/test';
test('wishlist persists to the account and supports remove and cart actions',async({page})=>{
  await page.goto('/register');
  await page.getByLabel('Name',{exact:true}).fill('Wishlist Customer');
  await page.getByLabel('Email',{exact:true}).fill('wishlist@e2e.test');
  await page.getByLabel('Password',{exact:true}).fill('Wishlist-Password-589');
  await page.getByRole('button',{name:'Sign Up',exact:true}).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/products/classic-pistachio-gelato');
  await page.getByRole('button',{name:'Add to wishlist',exact:true}).click();
  await expect(page.getByRole('button',{name:'Remove from wishlist',exact:true})).toBeVisible();
  await page.goto('/cart');
  for(const width of [390,768,1440]){
    await page.setViewportSize({width,height:900});
    await expect(page.getByRole('link',{name:'Continue shopping',exact:true})).toHaveAttribute('href','/shop');
    await expect(page.getByRole('link',{name:'Check Wishlist',exact:true})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.getByRole('link',{name:'Check Wishlist',exact:true}).click();
  await expect(page).toHaveURL(/\/wishlist$/);
  await expect(page.getByRole('heading',{name:'Classic Pistachio Gelato',exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading',{name:'Classic Pistachio Gelato',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Add Classic Pistachio Gelato to cart',exact:true}).click();
  await expect(page.getByRole('status').filter({hasText:'Added to cart'})).toBeVisible();
  await page.getByRole('button',{name:'Remove Classic Pistachio Gelato from wishlist',exact:true}).click();
  await expect(page.getByText('Your wishlist is empty.',{exact:false})).toBeVisible();
  await page.reload();
  await expect(page.getByText('Your wishlist is empty.',{exact:false})).toBeVisible();
});
