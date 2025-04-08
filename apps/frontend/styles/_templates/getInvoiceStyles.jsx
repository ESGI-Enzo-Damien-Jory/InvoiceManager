import fs from 'fs';
import path from 'path';

export function getInvoiceStyles() {
  const stylesPath = path.resolve(
    process.cwd(),
    './styles/_templates/InvoiceStyles.scss'
  );
  return fs.readFileSync(stylesPath, 'utf8');
}
