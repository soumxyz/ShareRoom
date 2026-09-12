const fs = require('fs');

let cssContent = fs.readFileSync('src/index.css', 'utf-8');

const typographyRules = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

@layer base {
  body {
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    font-weight: 400;
    color: #1D1D1F;
    letter-spacing: -0.01em;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  h1 {
    font-weight: 600;
    letter-spacing: -0.05em;
    line-height: 0.95;
    color: #1D1D1F;
  }
  h2 {
    font-weight: 600;
    letter-spacing: -0.04em;
    line-height: 1.05;
    color: #1D1D1F;
  }
  h3 {
    font-weight: 600;
    letter-spacing: -0.03em;
    color: #1D1D1F;
  }
  input, textarea {
    font-weight: 400;
    letter-spacing: -0.02em;
  }
  input::placeholder, textarea::placeholder {
    color: #8E8E93 !important;
  }
}

.apple-secondary-text {
  font-weight: 400;
  color: #6E6E73;
  letter-spacing: -0.01em;
}

.apple-label {
  font-weight: 500;
  letter-spacing: -0.01em;
  color: #6E6E73;
}

.apple-btn-primary {
  font-weight: 500;
  letter-spacing: -0.02em;
}

.apple-btn-secondary {
  font-weight: 500;
  letter-spacing: -0.01em;
}
`;

if (!cssContent.includes('family=Inter')) {
  // Prepend to file
  cssContent = typographyRules + '\n' + cssContent;
  fs.writeFileSync('src/index.css', cssContent);
}
