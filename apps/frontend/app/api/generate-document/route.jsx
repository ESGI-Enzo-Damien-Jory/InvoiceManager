import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import HTMLtoDOCX from 'html-to-docx';
import { getInvoiceStyles } from '@/styles/_templates/getInvoiceStyles';

function increaseFontSizesBy(css, increment) {
  return css.replace(/font-size:\s*(\d+)px;/g, (_, size) => {
    return `font-size: ${parseInt(size) + increment}px;`;
  });
}

export async function POST(req) {
  const { html, format } = await req.json();

  const invoiceStyles = getInvoiceStyles();
  const updatedSCSS = increaseFontSizesBy(invoiceStyles, 4);

  const styledHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
        body {
          font-family: "SF Pro Display", sans-serif;
          background-color: #1f1f23;
          color: #fff;
          padding: 20px;
        }
          ${updatedSCSS}
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

  try {
    if (format === 'pdf') {
      const browser = await puppeteer.launch({
        headless: 'new',
      });
      const page = await browser.newPage();

      await page.setViewport({ width: 640, height: 480 });
      await page.setContent(styledHTML, {
        waitUntil: 'networkidle0',
      });

      const pdf = await page.pdf({
        format: 'letter',
        printBackground: true,
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
        },
      });

      await browser.close();

      return new NextResponse(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=invoice-${Date.now()}.pdf`,
        },
      });
    } else if (format === 'docx') {
      const docx = await HTMLtoDOCX(styledHTML, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
        font: 'Arial',
      });

      return new NextResponse(docx, {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename=invoice-${Date.now()}.docx`,
        },
      });
    }
  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    );
  }
}
