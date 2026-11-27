'use strict';

const PDFDocument = require('pdfkit');
const { Parser }  = require('json2csv');

/**
 * Generate a PDF report buffer.
 * @param {Object[]} rows - Array of data objects
 * @param {string}   title - Report title
 * @param {string[]} columns - Column names (keys of row objects)
 * @returns {Promise<Buffer>}
 */
const generatePDF = (rows, title, columns) => {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];

    doc.on('data',  (c) => chunks.push(c));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.rect(0, 0, doc.page.width, 60).fill('#1a237e');
    doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text(title, 40, 20, { align: 'center' });
    doc.fillColor('#cccccc').fontSize(9).text(`Generated: ${new Date().toLocaleString()}`, 40, 42, { align: 'center' });

    // Table Header
    const colWidth  = (doc.page.width - 80) / columns.length;
    let y = 80;

    doc.rect(40, y, doc.page.width - 80, 20).fill('#e8eaf6');
    doc.fillColor('#1a237e').fontSize(9).font('Helvetica-Bold');
    columns.forEach((col, i) => {
      doc.text(col, 40 + i * colWidth + 4, y + 5, { width: colWidth - 8, ellipsis: true });
    });
    y += 20;

    // Table Rows
    doc.font('Helvetica').fontSize(8).fillColor('#333333');
    rows.forEach((row, ri) => {
      if (y > doc.page.height - 60) {
        doc.addPage();
        y = 40;
      }
      if (ri % 2 === 0) {
        doc.rect(40, y, doc.page.width - 80, 18).fill('#f9f9f9');
      }
      doc.fillColor('#333333');
      columns.forEach((col, i) => {
        const val = row[col] !== undefined && row[col] !== null ? String(row[col]) : '';
        doc.text(val, 40 + i * colWidth + 4, y + 4, { width: colWidth - 8, ellipsis: true });
      });
      y += 18;
    });

    // Footer
    doc.fontSize(8).fillColor('#aaaaaa')
      .text(`Total Records: ${rows.length}`, 40, doc.page.height - 30, { align: 'left' });

    doc.end();
  });
};

/**
 * Generate a CSV string from data rows.
 * @param {Object[]} rows
 * @param {string[]} fields - Field names to include
 * @returns {string}
 */
const generateCSV = (rows, fields) => {
  if (!rows || rows.length === 0) return '';
  const parser = new Parser({ fields });
  return parser.parse(rows);
};

module.exports = { generatePDF, generateCSV };
