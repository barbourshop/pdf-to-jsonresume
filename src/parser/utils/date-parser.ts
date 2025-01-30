export class DateParser {
    static parseDate(dateStr: string): string {
      if (!dateStr) return '';
      if (dateStr.toLowerCase() === 'present') return new Date().toISOString().split('T')[0];
  
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      return dateStr;
    }
  
    static extractDateRange(text: string): { startDate: string; endDate: string } {
      const dateRegex = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*)?(?:\d{4})\s*(?:-|–|to)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*)?(?:\d{4}|Present)/i;
      const dateMatch = text.match(dateRegex);
      
      if (dateMatch) {
        const [startDate, endDate] = dateMatch[0].split(/\s*(?:-|–|to)\s*/);
        return {
          startDate: this.parseDate(startDate),
          endDate: this.parseDate(endDate)
        };
      }
      
      return { startDate: '', endDate: '' };
    }
  }