import {test,expect} from '@playwright/test';

for(const [route,width] of [['/',390],['/',768],['/',1440],['/about',1440],['/review',1440]]) test(`carousel loops without pause controls on ${route} at ${width}px`,async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error' && /hydrat/i.test(message.text()))errors.push(message.text());});
  await page.setViewportSize({width,height:1000});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto(route);
  const slides=page.locator('.swiper');
  await expect(slides).toHaveCount(route==='/' ? 3 : 1);
  await expect(slides.first()).toBeVisible();
  if(route==='/'){
    const favorites=slides.first();
    await expect(favorites.locator('article')).toHaveCount(5);
    await expect.poll(()=>favorites.evaluate(el=>el.swiper.params.slidesPerView)).toBe(width>=1280 ? 4 : width>=640 ? 2 : 1);
    await favorites.scrollIntoViewIfNeeded();
    await expect.poll(()=>favorites.locator('article img').evaluateAll(images=>images.every(img=>img.complete && img.naturalWidth>0))).toBe(true);
    const links=await favorites.locator('article h3 a, article a:has(h3)').evaluateAll(elements=>elements.map(el=>el.href));
    expect(new Set(links).size).toBe(5);
  }
  await expect.poll(()=>slides.evaluateAll(elements=>elements.every(el=>el.swiper?.autoplay?.running))).toBe(true);
  const before=await slides.evaluateAll(elements=>elements.map(el=>el.swiper.realIndex));
  await expect.poll(()=>slides.evaluateAll(elements=>elements.map(el=>el.swiper.realIndex)),{timeout:9000}).not.toEqual(before);
  await slides.first().hover();
  await expect.poll(()=>slides.first().evaluate(el=>el.swiper.autoplay.running)).toBe(true);
  await page.mouse.move(0,0);
  await expect.poll(()=>slides.first().evaluate(el=>el.swiper.autoplay.running)).toBe(true);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>slides.evaluateAll(elements=>elements.every(el=>!el.swiper.autoplay.running))).toBe(true);
  await expect(page.getByRole('button',{name:/slideshow|autoplay off/i})).toHaveCount(0);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await expect.poll(()=>slides.evaluateAll(elements=>elements.every(el=>el.swiper.autoplay.running))).toBe(true);
  const slider=slides.first();
  expect(await slider.evaluate(el=>el.swiper.params.loop)).toBe(true);
  const dots=slider.locator('.swiper-pagination-bullet');
  const last=(await dots.count())-1;
  await dots.last().click();
  await expect.poll(()=>slider.evaluate(el=>el.swiper.realIndex)).toBe(last);
  await expect.poll(()=>slider.evaluate(el=>el.swiper.realIndex),{timeout:7000}).toBe(0);
  await expect(dots.first()).toHaveClass(/swiper-pagination-bullet-active/);
  await expect.poll(()=>slider.evaluate(el=>el.swiper.realIndex),{timeout:7000}).toBe(1);
  const heights=await page.locator('.swiper').first().locator('article').evaluateAll(cards=>cards.map(card=>Math.round(card.getBoundingClientRect().height)));
  if(heights.length) expect(new Set(heights).size).toBe(1);
  expect(errors).toEqual([]);
});
