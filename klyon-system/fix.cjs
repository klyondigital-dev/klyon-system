const fs = require('fs');
const files = [
  'src/components/CampaignChart.tsx',
  'src/pages/Automations.tsx',
  'src/pages/CampaignsPage.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Finance.tsx',
  'src/pages/LeadsCRM.tsx',
  'src/pages/Reports.tsx'
];
files.forEach(f => {
  if(fs.existsSync(f)){
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/from '\.\/types'/g, "from '../types'");
    // Also fix implicit any for idx in Automations
    c = c.replace(/step, idx/g, 'step: any, idx: number');
    // Also fix 'p is of type unknown' in CampaignChart
    c = c.replace(/acc \+ p.spent/g, 'acc + (p as any).spent');
    c = c.replace(/reduce\(\(acc, p\) =>/g, 'reduce((acc, p: any) =>');
    fs.writeFileSync(f, c);
  }
});
console.log('Fixed paths');
