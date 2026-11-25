import {
  EXTRACTED_BLOG_POSTS,
  EXTRACTED_EDUCATION,
  EXTRACTED_SKILLS,
  EXTRACTED_WORK_EXPERIENCE,
  PROFILE,
} from "./content";

type Project = {
  name: string
  description: string
  link: string
  video: string
  id: string
}

type SocialLink = {
  label: string;
  link: string;
};

export const PROJECTS: Project[] = [
  {
    name: 'Microgrid Simulation',
    description:
      'Interactive microgrid simulation: prosumers, batteries, and peer-to-peer energy trading with live KPIs (SimPy, FastAPI, React).',
    link: 'https://github.com/mbonum/microgrid-simulation',
    video:
      'https://public/microgrid-sim.png',
    id: 'project1',
  },
  // {
  //   name: 'Motion Primitives',
  //   description: 'UI kit to make beautiful, animated interfaces.',
  //   link: 'https://motion-primitives.com/',
  //   video:
  //     'https://res.cloudinary.com/read-cv/video/upload/t_v_b/v1/1/profileItems/W2azTw5BVbMXfj7F53G92hMVIn32/XSfIvT7BUWbPRXhrbLed/ee6871c9-8400-49d2-8be9-e32675eabf7e.mp4?_a=DATAdtAAZAA0',
  //   id: 'project2',
  // },
]

export const SUMMARY = PROFILE.summary;
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
