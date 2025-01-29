import { Resume, Work, Education, Project, Skill } from '../types/resume-schema';

export class ResumeParser {
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

  // Keep all the existing extract methods, but remove PDF-specific code
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
        // console.log('Work section extracted:', workSection);
        if (!workSection) return;
    
        const entries = workSection.split(/\n(?=[A-Z])/);
        // console.log('Entries found:', entries);
        
        entries.forEach((entry: string) => {
          let lines = entry.split('\n').map((line: string) => line.trim());
          // If there is only one line, split it into position and company + dates
          if (lines.length === 1) {
            lines = lines[0].split(/ at |, /);  // Split on ' at ' or ', ' depending on the format
          }
    
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
    
          // Format 1: Position at Company Start Date - End Date
          if (lines[0] && lines[1] && lines[1].match(/(?:\d{4})\s*[-–to]*\s*(?:\d{4}|Present)/)) {
            work.position = lines[0];
            work.name = lines[1].split(' ')[0];  // Assume first part is the company name
            const dateMatch = lines[1].match(/(\d{4})\s*[-–to]*\s*(\d{4}|Present)/);
            if (dateMatch) {
              work.startDate = dateMatch[1];
              work.endDate = dateMatch[2];
            }
          }

          // Format 2: Company Position - Start Date to End Date
          else if (lines[0] && lines[1] && lines[0].match(/(?:\d{4})\s*[-–to]*\s*(?:\d{4}|Present)/)) {
            const positionStartIndex = lines[1].lastIndexOf(' '); // Find the last space (position and company are separated by a space before the year)
            work.name = lines[0].trim();
            work.position = lines[1].substring(0, positionStartIndex).trim(); // Everything before the last space is the position
            const dateMatch = lines[1].match(/(\d{4})\s*[-–to]*\s*(\d{4}|Present)/);
            if (dateMatch) {
              work.startDate = dateMatch[1];
              work.endDate = dateMatch[2];
            }
          }

          // Format 3: Position, Company Start Date - End Date
          else if (lines[0] && lines[1] && lines[1].match(/(?:\d{4})\s*[-–to]*\s*(?:\d{4}|Present)/)) {
            work.position = lines[0];
            work.name = lines[1].split(' ')[0];  // Assume first part is the company name
            const dateMatch = lines[1].match(/(\d{4})\s*[-–to]*\s*(\d{4}|Present)/);
            if (dateMatch) {
              work.startDate = dateMatch[1];
              work.endDate = dateMatch[2];
            }
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
        console.log('Education section extracted:', educationSection);
        if (!educationSection) return;
        const entries = educationSection.split(/\n(?=[A-Z])/);
        console.log('Entries found:', entries);
        
        entries.forEach((entry: string) => {
          // console.log('&&&&&Entry&&&&&', entry);
          let lines = entry.split('\n').map((line: string) => line.trim());
          if (lines.length === 1) {
            lines = lines[0].split(',');  // Split on , depending on the format
          }
          const education: Education = {
            institution: lines[1].trim(),
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
            console.log('Degree Match found:', degreeMatch);
            education.area = degreeMatch[0].trim();
          }
          
          // Look for dates
          const dateRegex = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*)?(?:\d{4})\s*(?:-|–|to)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*)?(?:\d{4}|Present)/i;
          const dateMatch = entry.match(dateRegex);
          if (dateMatch){
            console.log('Date Match found:', dateMatch);
             const edDateMatch=dateMatch[0].split('-');
             console.log('ed date Match found:', edDateMatch);
              
             education.startDate = edDateMatch[0].trim();
             education.endDate = edDateMatch[1].trim();
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
    console.log('Section regex:', sectionRegex);
    const match = text.match(sectionRegex);
    console.log('Section match:', match);
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

  parse(text: string): Resume {
    try {
      this.text = text;
      this.lines = text.split('\n').map(line => line.trim()).filter(Boolean);

      // Extract all sections
      this.extractBasics(text);
      this.extractWork(text);
      this.extractEducation(text);
      this.extractSkills(text);
      this.extractProjects(text);

      return this.parsed;
    } catch (error) {
      throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}