import { promises as fs } from 'fs';
import path from 'path';
import { ResumeParser } from '../index';

// Mock the pdf-parse module
jest.mock('pdf-parse', () => {
  return jest.fn().mockImplementation((buffer) => {
    return Promise.resolve({
      text: mockResumeText,
      numpages: 1,
      info: {},
      metadata: {},
      version: null,
    });
  });
});

// Sample resume text for testing
const mockResumeText = `
John Doe
Software Engineer
john.doe@email.com
(555) 123-4567
https://linkedin.com/in/johndoe
https://github.com/johndoe

Summary
Experienced software engineer with a passion for building scalable applications

Experience
Senior Software Engineer
Amazing Tech Corp
Jan 2020 - Present
• Led development of microservices architecture
• Implemented CI/CD pipeline using GitHub Actions
• Mentored junior developers

Software Engineer
Tech Startup Inc
Jun 2018 - Dec 2019
• Developed REST APIs using Node.js
• Implemented user authentication system

Education
University of Technology
Bachelor of Science in Computer Science
2014 - 2018
GPA: 3.8
Courses: Data Structures, Algorithms, Database Systems

Skills
Programming: JavaScript, TypeScript, Python, Java
Frameworks: React, Node.js, Express
Tools: Git, Docker, Kubernetes

Projects
Personal Website
https://johndoe.com
2023
• Built using React and Next.js
• Implemented responsive design
• Integrated with headless CMS
`;

describe('ResumeParser', () => {
  let parser: ResumeParser;
  const testPdfPath = path.join(__dirname, 'fixtures', 'test-resume.pdf');

  beforeEach(() => {
    parser = new ResumeParser();
  });

  beforeAll(async () => {
    // Create test PDF file
    await fs.mkdir(path.join(__dirname, 'fixtures'), { recursive: true });
    await fs.writeFile(testPdfPath, 'dummy pdf content');
  });

  afterAll(async () => {
    // Cleanup test PDF file
    await fs.unlink(testPdfPath);
    await fs.rmdir(path.join(__dirname, 'fixtures'));
  });

  describe('parse', () => {
    it('should parse basic information correctly', async () => {
      const result = await parser.parse(testPdfPath);
      
      expect(result.basics).toEqual({
        name: 'John Doe',
        label: '',
        image: '',
        email: 'john.doe@email.com',
        phone: '(555) 123-4567',
        url: 'https://linkedin.com/in/johndoe',
        summary: 'Experienced software engineer with a passion for building scalable applications',
        location: {
          address: '',
          postalCode: '',
          city: '',
          countryCode: '',
          region: ''
        },
        profiles: [
          {
            network: 'Linkedin',
            username: 'johndoe',
            url: 'https://linkedin.com/in/johndoe'
          },
          {
            network: 'Github',
            username: 'johndoe',
            url: 'https://github.com/johndoe'
          }
        ]
      });
    });

    it('should parse work experience correctly', async () => {
      const result = await parser.parse(testPdfPath);
      
      expect(result.work).toHaveLength(2);
      expect(result.work[0]).toMatchObject({
        name: 'Amazing Tech Corp',
        position: 'Senior Software Engineer',
        startDate: '2020-01',
        endDate: expect.any(String), // Present date will vary
        highlights: [
          'Led development of microservices architecture',
          'Implemented CI/CD pipeline using GitHub Actions',
          'Mentored junior developers'
        ]
      });
    });

    it('should parse education correctly', async () => {
      const result = await parser.parse(testPdfPath);
      
      expect(result.education).toHaveLength(1);
      expect(result.education[0]).toMatchObject({
        institution: 'University of Technology',
        area: 'Computer Science',
        studyType: 'Bachelor of Science',
        startDate: '2014',
        endDate: '2018',
        score: '3.8',
        courses: ['Data Structures', 'Algorithms', 'Database Systems']
      });
    });

    it('should parse skills correctly', async () => {
      const result = await parser.parse(testPdfPath);
      
      expect(result.skills).toHaveLength(3);
      expect(result.skills).toEqual(expect.arrayContaining([
        {
          name: 'Programming',
          level: '',
          keywords: ['JavaScript', 'TypeScript', 'Python', 'Java']
        },
        {
          name: 'Frameworks',
          level: '',
          keywords: ['React', 'Node.js', 'Express']
        },
        {
          name: 'Tools',
          level: '',
          keywords: ['Git', 'Docker', 'Kubernetes']
        }
      ]));
    });

    it('should parse projects correctly', async () => {
      const result = await parser.parse(testPdfPath);
      
      expect(result.projects).toHaveLength(1);
      expect(result.projects[0]).toMatchObject({
        name: 'Personal Website',
        url: 'https://johndoe.com',
        highlights: [
          'Built using React and Next.js',
          'Implemented responsive design',
          'Integrated with headless CMS'
        ]
      });
    });

    it('should handle missing sections gracefully', async () => {
      // Mock pdf-parse with minimal resume text
      const pdfParse = require('pdf-parse');
      pdfParse.mockImplementationOnce(() => ({
        text: 'John Doe\njohn.doe@email.com',
        numpages: 1,
        info: {},
        metadata: {},
        version: null,
      }));

      const result = await parser.parse(testPdfPath);
      
      expect(result.basics.name).toBe('John Doe');
      expect(result.basics.email).toBe('john.doe@email.com');
      expect(result.work).toHaveLength(0);
      expect(result.education).toHaveLength(0);
      expect(result.skills).toHaveLength(0);
      expect(result.projects).toHaveLength(0);
    });

    it('should throw error for invalid PDF', async () => {
      const pdfParse = require('pdf-parse');
      pdfParse.mockRejectedValueOnce(new Error('Invalid PDF'));

      await expect(parser.parse(testPdfPath)).rejects.toThrow('Failed to parse PDF');
    });
  });
});