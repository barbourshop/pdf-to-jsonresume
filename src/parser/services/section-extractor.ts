import { ParsedSections } from '../types';

export class SectionExtractor {
  private static readonly SECTION_HEADERS = {
    summary: /(?:summary|about|profile)/i,
    experience: /(?:experience|work history|employment|professional experience)/i,
    education: /education/i,
    skills: /(?:skills|technologies|technical skills)/i,
    projects: /projects/i
  };

  static extractSections(text: string): ParsedSections {
    const sections: ParsedSections = {};
    let currentSection = 'header';
    let currentContent: string[] = [];

    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      let foundNewSection = false;
      for (const [section, pattern] of Object.entries(this.SECTION_HEADERS)) {
        if (pattern.test(trimmedLine) && trimmedLine.length < 35) {
          if (currentContent.length > 0) {
            sections[currentSection] = currentContent.join('\n');
          }
          currentSection = section;
          currentContent = [];
          foundNewSection = true;
          break;
        }
      }

      if (!foundNewSection) {
        currentContent.push(trimmedLine);
      }
    }

    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n');
    }

    return sections;
  }
}