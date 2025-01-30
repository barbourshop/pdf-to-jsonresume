import { BasicsParser } from '../services/basics-parser';
import { ParsedSections } from '../types/types';

describe('BasicsParser', () => {
  describe('Happy Path Functionality', () => {
  it('should extract email from text', () => {
    const sections: ParsedSections = {
      header: 'John Doe\njohn.doe@example.com\n(123) 456-7890'
    };
    
    const result = BasicsParser.parseBasics(sections);
    expect(result.email).toBe('john.doe@example.com');
  });

  it('should extract phone number from text', () => {
    const sections: ParsedSections = {
      header: 'John Doe\njohn.doe@example.com\n(123) 456-7890'
    };
    
    const result = BasicsParser.parseBasics(sections);
    expect(result.phone).toBe('(123) 456-7890');
  });

  it('should extract URL from text', () => {
    const sections: ParsedSections = {
      header: 'John Doe\njohn.doe@example.com\n(123) 456-7890\nhttps://johndoe.com'
    };
    
    const result = BasicsParser.parseBasics(sections);
    expect(result.url).toBe('https://johndoe.com');
  });

  it('should extract LinkedIn profile from text', () => {
    const sections: ParsedSections = {
      header: 'John Doe\njohn.doe@example.com\n(123) 456-7890\nhttps://linkedin.com/in/johndoe'
    };
    
    const result = BasicsParser.parseBasics(sections);
    expect(result.profiles).toEqual([
      { network: 'LinkedIn', username: 'johndoe', url: 'https://linkedin.com/in/johndoe' }
    ]);
  });

  it('should extract GitHub profile from text', () => {
    const sections: ParsedSections = {
      header: 'John Doe\njohn.doe@example.com\n(123) 456-7890\nhttps://github.com/johndoe'
    };
    
    const result = BasicsParser.parseBasics(sections);
    expect(result.profiles).toEqual([
      { network: 'GitHub', username: 'johndoe', url: 'https://github.com/johndoe' }
    ]);
  });

  it('should extract Twitter profile from text', () => {
    const sections: ParsedSections = {
      header: 'John Doe\njohn.doe@example.com\n(123) 456-7890\nhttps://twitter.com/johndoe'
    };
    
    const result = BasicsParser.parseBasics(sections);
    expect(result.profiles).toEqual([
      { network: 'Twitter', username: 'johndoe', url: 'https://twitter.com/johndoe' }
    ]);
  });

  it('should extract name from header', () => {
    const sections: ParsedSections = {
      header: 'John Doe\njohn.doe@example.com\n(123) 456-7890'
    };
    
    const result = BasicsParser.parseBasics(sections);
    expect(result.name).toBe('John Doe');
  });

  it('should extract summary from sections', () => {
    const sections: ParsedSections = {
      header: 'John Doe\njohn.doe@example.com\n(123) 456-7890',
      summary: 'Experienced software developer with a passion for creating innovative solutions.'
    };
    
    const result = BasicsParser.parseBasics(sections);
    expect(result.summary).toBe('Experienced software developer with a passion for creating innovative solutions.');
  });
});
describe('Graceful Degredation', () => {
  it('should handle missing email gracefully', () => {
    const sections: ParsedSections = {
      header: 'John Doe\n(123) 456-7890'
    };
    
    const result = BasicsParser.parseBasics(sections);
    expect(result.email).toBe('');
  });

  it('should handle missing phone number gracefully', () => {
    const sections: ParsedSections = {
      header: 'John Doe\njohn.doe@example.com'
    };
    
    const result = BasicsParser.parseBasics(sections);
    expect(result.phone).toBe('');
  });

  it('should handle missing URL gracefully', () => {
    const sections: ParsedSections = {
      header: 'John Doe\njohn.doe@example.com\n(123) 456-7890'
    };
    
    const result = BasicsParser.parseBasics(sections);
    expect(result.url).toBe('');
  });

  it('should handle missing profiles gracefully', () => {
    const sections: ParsedSections = {
      header: 'John Doe\njohn.doe@example.com\n(123) 456-7890'
    };
    
    const result = BasicsParser.parseBasics(sections);
    expect(result.profiles).toEqual([]);
  });

  it('should handle missing name gracefully', () => {
    const sections: ParsedSections = {
      header: 'john.doe@example.com\n(123) 456-7890'
    };
    
    const result = BasicsParser.parseBasics(sections);
    expect(result.name).toBe('');
  });

  it('should handle missing summary gracefully', () => {
    const sections: ParsedSections = {
      header: 'John Doe\njohn.doe@example.com\n(123) 456-7890'
    };
    
    const result = BasicsParser.parseBasics(sections);
    expect(result.summary).toBe('');
  });
});
});