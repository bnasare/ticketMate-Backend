const fs = require('fs');
const path = require('path');
const swaggerSpec = require('../src/config/swagger');

// Create docs directory if it doesn't exist
const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir);
}

// Write the OpenAPI spec as JSON
fs.writeFileSync(
  path.join(docsDir, 'swagger.json'), 
  JSON.stringify(swaggerSpec, null, 2)
);

// Write the OpenAPI spec as YAML
const yaml = require('js-yaml');
fs.writeFileSync(
  path.join(docsDir, 'swagger.yaml'), 
  yaml.dump(swaggerSpec)
);

console.log('✅ API documentation exported to:');
console.log('  - docs/swagger.json');
console.log('  - docs/swagger.yaml');
console.log('\nYou can now share these files or import them into API testing tools.');