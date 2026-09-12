const fs = require('fs');
let content = fs.readFileSync('src/pages/Index.tsx', 'utf-8');

// Avoid bold text unless necessary (never use 700 or 800)
content = content.replace(/font-bold/g, 'font-semibold');
content = content.replace(/font-extrabold/g, 'font-semibold');
content = content.replace(/font-black/g, 'font-semibold');
content = content.replace(/font-\[700\]/g, 'font-semibold');
content = content.replace(/font-\[800\]/g, 'font-semibold');
content = content.replace(/font-\[900\]/g, 'font-semibold');

// Headings in Index might need adjustments for letter-spacing
// It's using text-4xl, text-5xl etc. Tailwind usually has its own letter-spacing, but we can append global styles.
// Since we set `h1`, `h2` in global CSS, it will inherit weight 600 and tight letter-spacing unless overridden by Tailwind `tracking-*`.
// So let's strip `tracking-tight` or `tracking-tighter` from headings so our global CSS letter spacing (-0.05em, etc.) takes effect.
content = content.replace(/tracking-tighter/g, '');
content = content.replace(/tracking-tight/g, '');
content = content.replace(/tracking-normal/g, '');

// Also let's check uppercase headings and remove uppercase
content = content.replace(/uppercase/g, ''); 

fs.writeFileSync('src/pages/Index.tsx', content);
