import { NextResponse } from 'next/server';
import docxWasm from 'docx-wasm';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.json();

    const docxBuffer = await generateDocxBuffer(formData);

    await docxWasm.init();

    const pdfBuffer = await docxWasm.convertToPdf(docxBuffer);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=document.pdf',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error converting document to PDF' },
      { status: 500 }
    );
  }
}

async function generateDocxBuffer(formData) {
  const templatePath = path.join(process.cwd(), 'templates', 'template.docx');
  const content = fs.readFileSync(templatePath, 'binary');

  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.setData(formData);

  try {
    doc.render();
  } catch (error) {
    throw new Error('Error generating document');
  }

  const buffer = doc.getZip().generate({ type: 'nodebuffer' });
  return buffer;
}
