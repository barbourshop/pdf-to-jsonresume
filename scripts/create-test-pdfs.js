const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create a document
const doc = new PDFDocument();

// Pipe its output somewhere, like to a file
doc.pipe(fs.createWriteStream(path.join(__dirname, '../src/__tests__/fixtures/sample-resume.pdf')));

// Add the content
doc
  .fontSize(16)
  .text('John Doe', { align: 'center' })
  .fontSize(12)
  .text('Software Engineer', { align: 'center' })
  .moveDown()
  .text('john.doe@email.com')
  .text('(555) 123-4567')
  .text('https://linkedin.com/in/johndoe')
  .text('https://github.com/johndoe')
  .moveDown()
  .fontSize(14)
  .text('Summary')
  .fontSize(12)
  .text('Experienced software engineer with a passion for building scalable applications')
  .moveDown()
  .fontSize(14)
  .text('Experience')
  .fontSize(12)
  .text('Senior Software Engineer')
  .text('Amazing Tech Corp')
  .text('Jan 2020 - Present')
  .list([
    'Led development of microservices architecture',
    'Implemented CI/CD pipeline using GitHub Actions',
    'Mentored junior developers'
  ])
  .moveDown()
  .text('Software Engineer')
  .text('Tech Startup Inc')
  .text('Jun 2018 - Dec 2019')
  .list([
    'Developed REST APIs using Node.js',
    'Implemented user authentication system'
  ])
  .moveDown()
  .fontSize(14)
  .text('Education')
  .fontSize(12)
  .text('University of Technology')
  .text('Bachelor of Science in Computer Science')
  .text('2014 - 2018')
  .text('GPA: 3.8')
  .text('Courses: Data Structures, Algorithms, Database Systems')
  .moveDown()
  .fontSize(14)
  .text('Skills')
  .fontSize(12)
  .text('Programming: JavaScript, TypeScript, Python, Java')
  .text('Frameworks: React, Node.js, Express')
  .text('Tools: Git, Docker, Kubernetes')
  .moveDown()
  .fontSize(14)
  .text('Projects')
  .fontSize(12)
  .text('Personal Website')
  .text('https://johndoe.com')
  .text('2023')
  .list([
    'Built using React and Next.js',
    'Implemented responsive design',
    'Integrated with headless CMS'
  ]);

// Finalize PDF file
doc.end();