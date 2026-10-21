// Recover only referenced originals into a new folder; never restore over user deletions.
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const names = ['contactlocation.png', 'contactmobile.png', 'contactpage-email.png',
  'shippingTruck.png', 'uniquePackaging.png', 'moneyBack.png', 'fastDelivery.png',
  'thankyou-image.png', 'limitedOfferbg.png', 'fourColumnFirstcard.png',
  'fourColumnSecondCard.png', 'fourColumnThirdCard.png', 'fourColumnForthCard.png',
  'fourColumnFifthCard.png', 'fourColumnSixthCard.png', 'fourColumnSeventhCard.png', 'fourColumnEighthCard.png'];
const destination = path.join(root, 'public/images/figma/recovered');
fs.mkdirSync(destination, {recursive: true});
for (const name of names) {
  const target = path.join(destination, name);
  if (fs.existsSync(target)) continue;
  const data = execFileSync('git', ['show', `HEAD:public/images/${name}`], {cwd: root, maxBuffer: 20 * 1024 * 1024});
  fs.writeFileSync(target, data, {flag: 'wx'});
  console.log(`${name}: ${data.length} bytes recovered from HEAD`);
}
