export interface Location {
    address: string;
    postalCode: string;
    city: string;
    countryCode: string;
    region: string;
  }
  
  export interface Profile {
    network: string;
    username: string;
    url: string;
  }
  
  export interface Basics {
    name: string;
    label: string;
    image: string;
    email: string;
    phone: string;
    url: string;
    summary: string;
    location: Location;
    profiles: Profile[];
  }
  
  export interface Work {
    name: string;
    position: string;
    url: string;
    startDate: string;
    endDate: string;
    summary: string;
    highlights: string[];
  }
  
  export interface Education {
    institution: string;
    url: string;
    area: string;
    studyType: string;
    startDate: string;
    endDate: string;
    score: string;
    courses: string[];
  }
  
  export interface Skill {
    name: string;
    level: string;
    keywords: string[];
  }
  
  export interface Project {
    name: string;
    description: string;
    highlights: string[];
    keywords: string[];
    startDate: string;
    endDate: string;
    url: string;
    roles: string[];
    entity: string;
    type: string;
  }
  
  export interface Resume {
    $schema: string;
    basics: Basics;
    work: Work[];
    volunteer: any[];
    education: Education[];
    awards: any[];
    certificates: any[];
    publications: any[];
    skills: Skill[];
    languages: any[];
    interests: any[];
    references: any[];
    projects: Project[];
  }