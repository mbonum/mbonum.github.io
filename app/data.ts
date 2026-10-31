import {
  EXTRACTED_BLOG_POSTS,
  EXTRACTED_EDUCATION,
  EXTRACTED_SKILLS,
  EXTRACTED_WORK_EXPERIENCE,
  PROFILE,
} from "./content";

type Project = {
  name: string;
  description: string;
  link: string;
  video: string;
  id: string;
};

type SocialLink = {
  label: string;
  link: string;
};

export const SUMMARY = PROFILE.summary;
export const PROJECTS: Project[] = [];
export const WORK_EXPERIENCE = EXTRACTED_WORK_EXPERIENCE;
export const EDUCATION = EXTRACTED_EDUCATION;
export const SKILLS = EXTRACTED_SKILLS;
export const BLOG_POSTS = EXTRACTED_BLOG_POSTS;

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "Github",
    link: "https://github.com/mbonum",
  },
  {
    label: "LinkedIn",
    link: "https://www.linkedin.com/in/mgbon/",
  },
];

export const EMAIL = "mu8qqy1h9@mozmail.com";
