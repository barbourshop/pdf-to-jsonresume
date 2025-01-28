import * as core from '@actions/core';
import * as fs from 'fs/promises';
import pdf from 'pdf-parse';
import * as jsonresume from 'resume-schema';
import { Resume, Work, Education, Project, Skill } from 'resume-schema';

class ResumeParser {
  private text: string = '';
  private lines: string[] = [];
  private parsed: Resume;

  constructor() {
    this.parsed = this.createEmptySchema();
  }

  private createEmptySchema(): Resume {
    return {
      $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
      basics: {
        name: '',
        label: '',
        image: '',
        email: '',
        phone: '',
        url: '',
        summary: '',
        location: {
          address: '',
          postalCode: '',
          city: '',
          countryCode: '',
          region: ''
        },
        profiles: []
      },
      work: [],
      volunteer: [],
      education: [],
      awards: [],
      certificates: [],
      publications: [],
      skills: [],
      languages: [],
      interests: [],
      references: [],
      projects: []
    };
  }

  private extractBasics(text: string): void {
    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      this.parsed.basics.email = emailMatch[0];
    }

    // Extract phone
    const phoneRegex = /(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?/;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      this.parsed.basics.phone = phoneMatch[0];
    }

    // Extract URLs
    const urlRegex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g;
    const urls = text.match(urlRegex);
    if (urls && urls.length > 0) {
      this.parsed.basics.url = urls[0];
      
      // Extract profiles from URLs
      urls.forEach(url => {
        const networkMatch = url.match(/(?:www\.)?(linkedin|github|twitter)\.com/i);
        if (networkMatch) {
          const network = networkMatch[1];
          const username = url.split('/').pop() || '';
          this.parsed.basics.profiles.push({
            network: network.charAt(0).toUpperCase() + network.slice(1),
            username,
            url
          });
        }
      });
    }

    // Extract name (usually in the first few lines)
    const potentialNames = this.lines.slice(0, 3)
      .map(line => line.trim())
      .filter(line => line && !line.includes('@') && !line.includes('http'));
    
    if (potentialNames.length > 0) {
      this.parsed.basics.name = potentialNames[0];
    }

    // Extract summary
    const summaryMatch = text.match(/(?:Summary|About|Profile)\s*(?:\n|\r\n?)([\s\S]*?)(?=\n(?:Experience|Education|Skills|Work|Projects))/i);
    if (summaryMatch) {
      this.parsed.basics.summary = summaryMatch[1].trim();
    }
  }

  private extractWork(text: string): void {
    const workSection = this.extractSection(text, 'experience|work history');
    if (!workSection) return;

    const entries = workSection.split(/\n(?=[A-Z])/);
    
    entries.forEach((entry: string) => {
      const lines = entry.split('\n').map((line: string) => line.trim());
      if (lines.length < 2) return;

      const dateRegex = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*)?(?:\d{4})\s*(?:-|–|to)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*)?(?:\d{4}|Present)/i;
      const dateMatch = entry.match(dateRegex);

      const work: Work = {
        name: lines[0], // Company name
        position: lines[1], // Job title
        url: '',
        startDate: '',
        endDate: '',
        summary: '',
        highlights: []
      };

      if (dateMatch) {
        const dates = dateMatch[0].split(/\s*(?:-|–|to)\s*/);
        work.startDate = this.parseDate(dates[0]);
        work.endDate = this.parseDate(dates[1]);
      }

      // Extract highlights (bullet points)
      const bulletPoints = lines
        .filter((line: string) => line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))
        .map((line: string) => line.replace(/^[•\-*]\s*/, '').trim());
      
      work.highlights = bulletPoints;

      // Everything else goes into summary
      const summary = lines
        .filter((line: string) => !line.match(dateRegex) && !bulletPoints.includes(line))
        .join(' ')
        .trim();
      
      if (summary) {
        work.summary = summary;
      }

      this.parsed.work.push(work);
    });
  }

  private extractEducation(text: string): void {
    const educationSection = this.extractSection(text, 'education');
    if (!educationSection) return;

    const entries = educationSection.split(/\n(?=[A-Z])/);
    
    entries.forEach((entry: string) => {
      const lines = entry.split('\n').map((line: string) => line.trim());
      if (lines.length < 2) return;

      const education: Education = {
        institution: lines[0],
        url: '',
        area: '',
        studyType: '',
        startDate: '',
        endDate: '',
        score: '',
        courses: []
      };

      // Extract degree (study type) and area
      const degreeMatch = entry.match(/(?:Bachelor|Master|PhD|B\.?S\.?|M\.?S\.?|Ph\.?D\.?)[^,\n]*(?:of|in)?\s*([^,\n]*)/i);
      if (degreeMatch) {
        education.studyType = degreeMatch[0].split(' of ')[0].split(' in ')[0].trim();
        education.area = degreeMatch[1].trim();
      }

      // Extract dates
      const dateRegex = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*)?(?:\d{4})\s*(?:-|–|to)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*)?(?:\d{4}|Present)/i;
      const dateMatch = entry.match(dateRegex);
      if (dateMatch) {
        const dates = dateMatch[0].split(/\s*(?:-|–|to)\s*/);
        education.startDate = this.parseDate(dates[0]);
        education.endDate = this.parseDate(dates[1]);
      }

      // Extract GPA/score
      const gpaMatch = entry.match(/GPA:?\s*([\d.]+)/i);
      if (gpaMatch) {
        education.score = gpaMatch[1];
      }

      // Extract courses
      const coursesMatch = entry.match(/Courses?:([^]*)(?=\n\n|\n[A-Z]|$)/i);
      if (coursesMatch) {
        education.courses = coursesMatch[1]
          .split(/[,;]/)
          .map((course: string) => course.trim())
          .filter(Boolean);
      }

      this.parsed.education.push(education);
    });
  }

  private extractSkills(text: string): void {
    const skillsSection = this.extractSection(text, 'skills|technologies|technical skills');
    if (!skillsSection) return;

    // Try to identify skill categories
    const categories = skillsSection.split(/\n(?=[A-Z][^:]*:)/);
    
    categories.forEach((category: string) => {
      const [categoryName, skillsList] = category.split(':');
      
      if (skillsList) {
        // Category with explicit skills list
        const skill: Skill = {
          name: categoryName.trim(),
          level: '',
          keywords: skillsList
            .split(/[,•]/)
            .map((skill: string) => skill.trim())
            .filter(Boolean)
        };
        this.parsed.skills.push(skill);
      } else {
        // No explicit category, treat all as keywords
        const skills = category
          .split(/[,•\n]/)
          .map((skill: string) => skill.trim())
          .filter(Boolean);
        
        if (skills.length > 0) {
          const skill: Skill = {
            name: 'Technical Skills',
            level: '',
            keywords: skills
          };
          this.parsed.skills.push(skill);
        }
      }
    });
  }

  private extractProjects(text: string): void {
    const projectsSection = this.extractSection(text, 'projects');
    if (!projectsSection) return;

    const entries = projectsSection.split(/\n(?=[A-Z])/);
    
    entries.forEach((entry: string) => {
      const lines = entry.split('\n').map((line: string) => line.trim());
      if (lines.length < 2) return;

      const project: Project = {
        name: lines[0],
        description: '',
        highlights: [],
        keywords: [],
        startDate: '',
        endDate: '',
        url: '',
        roles: [],
        entity: '',
        type: ''
      };

      // Extract URL if present
      const urlMatch = entry.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        project.url = urlMatch[0];
      }

      // Extract dates
      const dateRegex = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*)?(?:\d{4})\s*(?:-|–|to)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*)?(?:\d{4}|Present)/i;
      const dateMatch = entry.match(dateRegex);
      if (dateMatch) {
        const dates = dateMatch[0].split(/\s*(?:-|–|to)\s*/);
        project.startDate = this.parseDate(dates[0]);
        project.endDate = this.parseDate(dates[1]);
      }

      // Extract highlights (bullet points)
      const bulletPoints = lines
        .filter((line: string) => line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))
        .map((line: string) => line.replace(/^[•\-*]\s*/, '').trim());
      
      project.highlights = bulletPoints;

      // Everything else goes into description
      const description = lines
        .filter((line: string) => !line.match(dateRegex) && !bulletPoints.includes(line) && !line.includes(project.url))
        .join(' ')
        .trim();
      
      if (description) {
        project.description = description;
      }

      this.parsed.projects.push(project);
    });
  }

  private extractSection(text: string, sectionName: string): string {
    const sectionRegex = new RegExp(`(?:${sectionName}).*?(?=\\n(?:${Object.keys(this.parsed).join('|')})|$)`, 'is');
    const match = text.match(sectionRegex);
    return match ? match[0].split('\n').slice(1).join('\n').trim() : '';
  }

  private parseDate(dateStr: string): string {
    if (!dateStr) return '';
    if (dateStr.toLowerCase() === 'present') return new Date().toISOString().split('T')[0];

    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return dateStr;
  }

  async parse(pdfPath: string): Promise<Resume> {
    try {
      const dataBuffer = await fs.readFile(pdfPath);
      const { text } = await pdf(dataBuffer);
      
      this.text = text;
      this.lines = text.split('\n').map(line => line.trim()).filter(Boolean);

      // Extract all sections
      this.extractBasics(text);
      this.extractWork(text);
      this.extractEducation(text);
      this.extractSkills(text);
      this.extractProjects(text);

      // Validate against JSON Resume schema
      const { valid, errors } = await this.validateResume();
      if (!valid) {
        core.warning(`Resume validation warnings: ${JSON.stringify(errors)}`);
      }

      return this.parsed;
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async validateResume(): Promise<{ valid: boolean; errors: any[] }> {
    return new Promise((resolve) => {
      jsonresume.validate(this.parsed, (err: any, valid: boolean) => {
        if (err) {
          resolve({ valid: false, errors: err });
        } else {
          resolve({ valid: true, errors: [] });
        }
      });
    });
  }
}

async function run(): Promise<void> {
  try {
    // const pdfPath = core.getInput('pdf_path', { required: true });
    // const outputPath = core.getInput('output_path', { required: true });
    const args = process.argv.slice(2);
    const pdfPath = args[0];
    const outputPath = args[1];

    const parser = new ResumeParser();
    const parsedData = await parser.parse(pdfPath);

    await fs.writeFile(outputPath, JSON.stringify(parsedData, null, 2));
    
    core.setOutput('json_data', JSON.stringify(parsedData));
  } catch (error) {
    core.setFailed(`Action failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

run();