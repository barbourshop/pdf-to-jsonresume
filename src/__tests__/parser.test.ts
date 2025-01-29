import { ResumeParser } from '../lib/parser';

describe('ResumeParser', () => {
  let parser: ResumeParser;

  beforeEach(() => {
    parser = new ResumeParser();
  });

  test('should initialize with an empty resume schema', () => {
    const parsedResume = parser['parsed']; // Access private member for testing
    expect(parsedResume).toBeDefined();
    expect(parsedResume.basics).toBeDefined();
    expect(parsedResume.basics.name).toBe('');
  });

  describe('Basic Details Parsing', () => {
      test('should correctly parse a simple name from text', () => {
        parser['text'] = 'John Doe';
        parser['lines'] = ['John Doe'];
        // Assuming there's a method like extractBasics() that extracts name
        if (parser['extractBasics']) {
          parser['extractBasics'](parser['text']);
          expect(parser['parsed'].basics.name).toBe('John Doe');
        } else {
          fail('extractBasics method not found');
        }
      });

      test('should correctly parse an empth name from text', () => {
        parser['text'] = '';
        parser['lines'] = [''];
        // Assuming there's a method like extractBasics() that extracts name
        if (parser['extractBasics']) {
          parser['extractBasics'](parser['text']);
          expect(parser['parsed'].basics.name).toBe('');
        } else {
          fail('extractBasics method not found');
        }
      });
  });
  describe('Work Experience Entry Format Parsing', () => {
    test.each([
      ['experience\nSoftware Engineer at TechCorp 2018 - 2022', 'Software Engineer', 'TechCorp', '2018', '2022'],
      ['experience\nSoftware Engineer, TechCorp 2018 - 2022', 'Software Engineer', 'TechCorp', '2018', '2022'],
      // ['experience\nTechCorp, Software Engineer - 2018 to 2022', 'Software Engineer', 'TechCorp', '2018', '2022'],
      // Add more permutations here
    ])(
      'should correctly parse work experience entry: %s',
      (inputText, expectedPosition, expectedCompany, expectedStartDate, expectedEndDate) => {
        parser['text'] = inputText;
        parser['extractWork'](parser['text']);
  
        // Validate parsing logic
        expect(parser['parsed'].work).toHaveLength(1);
        expect(parser['parsed'].work[0].position).toBe(expectedPosition);
        expect(parser['parsed'].work[0].name).toBe(expectedCompany);
        expect(parser['parsed'].work[0].startDate).toBe(expectedStartDate);
        expect(parser['parsed'].work[0].endDate).toBe(expectedEndDate);
      }
    );
  });

  describe('Education Entry Format Parsing', () => {
    test.each([
      ['education\nBS-EE, California State College, 1999 - 2004', 'BS-EE', 'California State College', '1999', '2004'],
      // ['education\nBS in EE, California State College, Blergsville, CA 1999 - 2004', 'BS-EE', 'California State College', '1999', '2004'],
      // Add more permutations here
    ])(
      'should correctly parse work experience entry: %s',
      (inputText, expectedArea, expectedInstitution, expectedStartDate, expectedEndDate) => {
        parser['text'] = inputText;
        parser['extractEducation'](parser['text']);
  
        // Validate parsing logic
        expect(parser['parsed'].education).toHaveLength(1);
        expect(parser['parsed'].education[0].area).toBe(expectedArea);
        expect(parser['parsed'].education[0].institution).toBe(expectedInstitution);
        expect(parser['parsed'].education[0].startDate).toBe(expectedStartDate);
        expect(parser['parsed'].education[0].endDate).toBe(expectedEndDate);
      }
    );
  });
});
