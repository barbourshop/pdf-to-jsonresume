import { Resume } from '../types/resume-schema';
import { ParsedSections, BasicsData } from '../types/types';

export class BasicsParser {
  private static readonly EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  private static readonly PHONE_REGEX = /(?:(?:\+?\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4})|(?:\+?\d{1,3}[-. ]?\d{9,10})/;
  private static readonly URL_REGEX = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;

  static parseBasics(sections: ParsedSections): BasicsData {
    const basics: BasicsData = {
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
    };

    const fullText = Object.values(sections).join('\n');

    // Extract email
    const emailMatch = fullText.match(this.EMAIL_REGEX);
    if (emailMatch) {
      basics.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = fullText.match(this.PHONE_REGEX);
    if (phoneMatch) {
      basics.phone = phoneMatch[0];
    }

    // Extract URLs and profiles
    const urls = fullText.match(this.URL_REGEX) || [];
    if (urls.length > 0) {
      basics.url = urls[0] || '';
      this.parseProfiles(urls, basics);
    }

    // Extract name
    if (sections.header) {
      basics.name = this.extractName(sections.header);
    }

    // Extract summary
    if (sections.summary) {
      basics.summary = sections.summary.trim();
    }

    return basics;
  }

  private static parseProfiles(urls: string[], basics: BasicsData): void {
    const profilePatterns = {
      LinkedIn: /linkedin\.com\/in\/([^\/\s]+)/i,
      GitHub: /github\.com\/([^\/\s]+)/i,
      Twitter: /twitter\.com\/([^\/\s]+)/i
    };

    urls.forEach(url => {
      for (const [network, pattern] of Object.entries(profilePatterns)) {
        const match = url.match(pattern);
        if (match) {
          basics.profiles.push({
            network,
            username: match[1],
            url
          });
        }
      }
    });
  }

  private static extractName(headerText: string): string {
    const headerLines = headerText.split('\n');
    const potentialNames = headerLines
      .filter(line => {
        const words = line.trim().split(/\s+/);
        return (
          words.length >= 2 &&
          words.length <= 4 &&
          !line.includes('@') &&
          !line.match(/https?:\/\//) &&
          !line.match(/\d{3}[-.)]\s*\d{3}[-.]?\d{4}/)
        );
      });

    return potentialNames[0]?.trim() || '';
  }
}