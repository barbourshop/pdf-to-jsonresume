import { Resume } from './types/resume-schema';
import { ParsedSections } from './types';
import { SectionExtractor } from './services/section-extractor';
import { BasicsParser } from './services/basics-parser';

export class ResumeParser {
  private parsed: Resume;
  private sections: ParsedSections = {};

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

  parse(text: string): Resume {
    try {
      // Extract sections
      this.sections = SectionExtractor.extractSections(text);

      // Parse each section
      this.parsed.basics = BasicsParser.parseBasics(this.sections);
      
      // TODO: Add other parsers when implemented
      // this.parsed.work = WorkParser.parseWork(this.sections.experience || '');
      // this.parsed.education = EducationParser.parseEducation(this.sections.education || '');
      // this.parsed.skills = SkillsParser.parseSkills(this.sections.skills || '');
      // this.parsed.projects = ProjectsParser.parseProjects(this.sections.projects || '');

      return this.parsed;
    } catch (error) {
      throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}