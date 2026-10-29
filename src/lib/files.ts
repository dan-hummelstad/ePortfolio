// The whole site: five drawers, twenty-three files. Every file renders as the same
// dot-matrix stationery, so a file is just a list of sections on the paper.

export type Row = [label: string, value: string, href?: string]

export type Section =
  | { kind: 'fields', rows: Row[] }                                 // label at col 0, value at col 17
  | { kind: 'table', title: string, head: string[], rows: string[][], totals?: Row[] }
  | { kind: 'status', label: string, value: string }                // C U R R E N T
  | { kind: 'figures', title: string, rows: Row[] }                 // right-aligned numbers between rules
  | { kind: 'prose', title: string, paras: string[] }
  | { kind: 'leaders', rows: Row[] }                                // label ........ value
  | { kind: 'attachment', name: string, src: string }               // photo, paper-clipped on top

export type File = {
  slug: string
  title: string
  short: string        // folder tab / back tab
  sub?: string         // second line in drawer lists
  record: string       // letterhead line 2
  contact?: string     // letterhead line 4
  sections: Section[]
  signoff?: string
}

export type Group = { label: string, files: File[] }
export type Drawer = { slug: string, label: string, color: string, dark: string, years: string, groups: Group[] }

const pending = (what: string): Section =>
  ({ kind: 'prose', title: 'Record Pending', paras: [`${what} has not been filed yet. Check back soon, or ask: daniel@hummelstad.me`] })

export const drawers: Drawer[] = [
  {
    slug: 'work', label: 'work', color: '#DBEAFE', dark: '#435C82', years: '2019 —',
    groups: [
      {
        label: 'locatrix', files: [
          {
            slug: 'senior-swe', title: 'Senior Software Engineer & Technical Product Lead, PlanSafe', short: 'senior swe', sub: 'Locatrix', record: 'Senior Software Engineer',
            sections: [
              { kind: 'fields', rows: [['Record Of:', ''], ['Locatrix Pty Ltd', ''], ['Brisbane, QLD, Australia', ''], ['Engagement:', 'Full time, 9-engineer team'], ['Commenced:', 'Jul 2021']] },
              { kind: 'fields', rows: [['Position No.:', 'SSE-2024-01'], ['Concurrent:', 'Technical Product Lead, PlanSafe'], ['Record Period:', 'Jul 2021 — Present']] },
              {
                kind: 'table', title: 'Duties SSE-2024-01', head: ['#', 'Code', 'Description', 'Since', 'Weight'], rows: [
                  ['1', '110', 'Product direction, PlanSafe LMS', '2024', 'Primary'],
                  ['2', '210', 'ASP.NET 4.8 to React / TypeScript', '2022', 'Primary'],
                  ['3', '240', 'SVG CAD workflow overhaul', '2023', 'Primary'],
                  ['4', '310', 'Docker and CI/CD, production', '2022', 'Secondary'],
                  ['5', '420', 'Production support, triage', '2021', 'Ongoing'],
                  ['6', '510', 'Mentoring, review, architecture', '2023', 'Ongoing'],
                ], totals: [['Duties on file', '6'], ['Primary duties', '3'], ['Record complete', 'Yes']],
              },
              { kind: 'status', label: 'Record Status:', value: 'CURRENT' },
              { kind: 'figures', title: 'Output To Date', rows: [['Commits authored', '1,700+'], ['Features delivered', '400+'], ['Products in scope', '4'], ['Users served', '~200,000'], ['Uptime maintained', '99.9%']] },
              {
                kind: 'table', title: 'Career Progression', head: ['Date', 'Role', 'Employer'], rows: [
                  ['Dec 2019', 'Plan Drafter', 'Concept Safety Systems'],
                  ['Jul 2021', 'Software QA Engineer', 'Locatrix'],
                  ['Nov 2021', 'Full-Stack Developer', 'Locatrix'],
                  ['Mar 2024', 'Senior Software Engineer', 'Locatrix'],
                  ['Feb 2026', '+ Technical Product Lead', 'Locatrix / PlanSafe'],
                ],
              },
              { kind: 'fields', rows: [['Languages:', 'TypeScript, JavaScript, C#, Python, SQL'], ['Frameworks:', 'React, .NET, ASP.NET, Node'], ['Infrastructure:', 'Docker, Azure, Jenkins, TeamCity, Octopus']] },
              { kind: 'attachment', name: 'plansafe-evacuation.jpg', src: '/plansafe.jpg' },
            ],
          },
          {
            slug: 'full-stack', title: 'Full-Stack Developer', short: 'full-stack', sub: 'Locatrix · 2021 — 2024', record: 'Employment Record',
            sections: [
              { kind: 'fields', rows: [['Employer:', 'Locatrix Pty Ltd'], ['Position:', 'Full-Stack Developer'], ['Period:', 'Nov 2021 — Mar 2024']] },
              {
                kind: 'prose', title: 'Summary', paras: [
                  'Promoted from QA into the full product stack of a nine-engineer team: front end, back end and the microservices joining PlanStudio, PlanSafe and M2M.',
                  'Began the AI integration in PlanStudio: a convolutional U-Net and computer vision pipeline that converts any rasterised floorplan into an SVG plan.',
                ],
              },
              { kind: 'figures', title: 'Output', rows: [['Features per product', '100+'], ['Products', '3']] },
              { kind: 'status', label: 'Record Status:', value: 'SUPERSEDED' },
              { kind: 'attachment', name: 'planstudio.jpg', src: '/planstudio.jpg' },
            ],
          },
          {
            slug: 'qa-engineer', title: 'Software QA Engineer', short: 'qa', sub: 'Locatrix · 2021', record: 'Employment Record',
            sections: [
              { kind: 'fields', rows: [['Employer:', 'Locatrix Pty Ltd'], ['Position:', 'Software QA Engineer'], ['Period:', 'Jul 2021 — Nov 2021']] },
              {
                kind: 'prose', title: 'Summary', paras: [
                  "Built the foundation of the team's quality program: a continuous integration pipeline, integration tests and a broader smoke test, so basic bugs were caught before any product deployed.",
                ],
              },
              { kind: 'status', label: 'Record Status:', value: 'SUPERSEDED' },
              { kind: 'attachment', name: 'test-run.jpeg', src: '/test-img.jpeg' },
            ],
          },
        ],
      },
      {
        label: 'before', files: [
          {
            slug: 'plan-drafter', title: 'Plan Drafter — Concept Safety Systems', short: 'drafter', sub: 'Concept Safety Systems · 2019', record: 'Employment Record',
            sections: [
              { kind: 'fields', rows: [['Employer:', 'Concept Safety Systems'], ['', 'A Locatrix subsidiary'], ['Position:', 'Plan Drafter'], ['Commenced:', 'Dec 2019']] },
              {
                kind: 'prose', title: 'Summary', paras: [
                  'Drafted fire and emergency evacuation plans for buildings. An unusual door into software: by the time I was writing code for compliance, I already knew what the people using it do all day.',
                ],
              },
              { kind: 'status', label: 'Record Status:', value: 'CLOSED' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'projects', label: 'projects', color: '#EDE9FE', dark: '#564C86', years: '2020 —',
    groups: [
      {
        label: 'at work', files: [
          {
            slug: 'plansafe', title: 'PlanSafe — compliance LMS', short: 'plansafe', sub: 'Learning management for fire compliance', record: 'Project Record', contact: 'github.com/dan-hummelstad',
            sections: [
              { kind: 'fields', rows: [['Project:', 'PlanSafe'], ['', 'Fire and emergency compliance LMS'], ['Role:', 'Technical Product Lead'], ['Platform:', 'Web']] },
              {
                kind: 'prose', title: 'Summary', paras: [
                  'A highly customisable learning management system that keeps buildings and their occupants compliant with fire and emergency planning requirements.',
                ],
              },
              { kind: 'status', label: 'Project Status:', value: 'SHIPPED' },
              { kind: 'attachment', name: 'plansafe.jpg', src: '/plansafe.jpg' },
            ],
          },
          {
            slug: 'planstudio', title: 'PlanStudio — SVG CAD tool', short: 'planstudio', sub: 'SVG CAD for emergency planners', record: 'Project Record', contact: 'github.com/dan-hummelstad',
            sections: [
              { kind: 'fields', rows: [['Project:', ''], ['PlanStudio', ''], ['SVG CAD tooling for fire certifiers and emergency planners', ''], ['Locatrix Pty Ltd, Brisbane, Australia', ''], ['Shipped:', '2022 — ongoing']] },
              { kind: 'fields', rows: [['Project No.:', 'PRJ-PS-002'], ['Role:', 'Full-stack engineer'], ['Platform:', 'Web and iPad']] },
              {
                kind: 'table', title: 'Build Log PRJ-PS-002', head: ['#', 'Area', 'Description', 'Year', 'Status'], rows: [
                  ['1', 'FE-01', 'SVG canvas, direct manipulation', '2022', 'Shipped'],
                  ['2', 'FE-02', 'React component system rebuild', '2023', 'Shipped'],
                  ['3', 'AI-01', 'CNN bitmap-to-SVG conversion', '2024', 'Shipped'],
                  ['4', 'AI-02', 'Bitmap thinning pre-processor', '2024', 'Shipped'],
                  ['5', 'BE-01', 'Plan storage and versioning', '2023', 'Shipped'],
                  ['6', 'UX-01', 'Figma-driven workflow overhaul', '2023', 'Shipped'],
                ], totals: [['Items shipped', '6'], ['Items open', '0'], ['Build complete', 'Yes']],
              },
              { kind: 'status', label: 'Project Status:', value: 'SHIPPED' },
              { kind: 'figures', title: 'Measured Result', rows: [['Drafting speed vs traditional CAD', '700%'], ['Further gain, bitmap-to-SVG automation', '60%'], ['Products the service feeds', '3'], ['Status', 'In production']] },
              { kind: 'fields', rows: [['Front end:', 'React, TypeScript, SVG, Canvas'], ['Back end:', '.NET, C#, SQL'], ['Vision:', 'CNN (U-Net), OpenCV, bitmap thinning'], ['Delivery:', 'Docker, Azure, Octopus Deploy']] },
              { kind: 'leaders', rows: [['Repository', 'private, Locatrix'], ['Live', 'locatrix.com/planstudio', 'https://locatrix.com/planstudio']] },
              { kind: 'attachment', name: 'planstudio-map-view.jpg', src: '/planstudio.jpg' },
            ],
          },
          {
            slug: 'emergency-services', title: 'Emergency Services Platform', short: 'esp', sub: 'Locatrix', record: 'Project Record', contact: 'github.com/dan-hummelstad',
            sections: [{ kind: 'fields', rows: [['Project:', 'Emergency Services Platform'], ['Employer:', 'Locatrix Pty Ltd']] }, pending('This project')],
          },
        ],
      },
      {
        label: 'personal', files: [
          {
            slug: 'thock', title: 'thock.io', short: 'thock.io', sub: 'Personal project', record: 'Project Record', contact: 'github.com/dan-hummelstad',
            sections: [{ kind: 'leaders', rows: [['Live', 'thock.io', 'https://thock.io']] }, pending('This project')],
          },
          {
            slug: '2b4', title: 'app.2b4.net', short: '2b4', sub: 'Personal project', record: 'Project Record', contact: 'github.com/dan-hummelstad',
            sections: [{ kind: 'leaders', rows: [['Live', 'app.2b4.net', 'https://app.2b4.net']] }, pending('This project')],
          },
        ],
      },
    ],
  },
  {
    slug: 'education', label: 'education', color: '#FEE2E2', dark: '#7A4E50', years: '2016 — 2024',
    groups: [
      {
        label: 'formal', files: [
          {
            slug: 'griffith', title: 'Bachelor of Computer Science', short: 'griffith', sub: 'Griffith University · 2024', record: 'Education Record',
            sections: [
              { kind: 'fields', rows: [['Institution:', 'Griffith University'], ['', 'Gold Coast, QLD, Australia'], ['Award:', 'Bachelor of Computer Science'], ['Major:', 'Software Development'], ['Conferred:', '2024']] },
              {
                kind: 'prose', title: 'Why This Degree', paras: [
                  'Computing has been a lifelong passion. When it came time to choose a pathway, Computer Science majoring in Software Development was the obvious one: the fundamental logic underneath computers, and the engineering process for building on it.',
                  'Two career objectives sit behind it: become a senior engineer who manages products, and start a technology company. Both need the foundations this program lays.',
                ],
              },
              {
                kind: 'prose', title: 'Assessment Of Note', paras: [
                  'Software Engineering Fundamentals: as a group, recreate Pac-Man inside a strict time limit. Design and propose, develop and integrate, then test and release. I led communication, planning and the full development of the software.',
                ],
              },
              { kind: 'status', label: 'Record Status:', value: 'CONFERRED' },
              { kind: 'attachment', name: 'griffith-assessment.png', src: '/griffith-assessment.png' },
            ],
          },
          {
            slug: 'southport', title: 'The Southport School', short: 'southport', sub: '2012 — 2018', record: 'Education Record',
            sections: [
              { kind: 'fields', rows: [['Institution:', 'The Southport School'], ['', 'Southport, QLD, Australia'], ['Attended:', '2012 — 2018']] },
              {
                kind: 'table', title: 'Activities', head: ['#', 'Activity', 'Year', 'Result'], rows: [
                  ['1', 'CyberPatriots Competitor', '2017', '58th world'],
                  ['2', 'CyberPatriots Competitor', '2018', '94th world'],
                  ['3', "Mayor's Telstra Tech Competition", '2018', 'Runner up'],
                ], totals: [['Entries on file', '3']],
              },
              {
                kind: 'leaders', rows: [
                  ['CyberPatriots 2017', 'tss.qld.edu.au', 'https://www.tss.qld.edu.au/cyberpatriots-battled-for-australia/'],
                  ['CyberPatriots 2018', 'tss.qld.edu.au', 'https://www.tss.qld.edu.au/2017/2018-tss-cyber-defenders-aug23-2018/'],
                  ['Telstra Awards 2018', 'tss.qld.edu.au', 'https://www.tss.qld.edu.au/the-mayors-telstra-technology-awards-2018/'],
                ],
              },
              { kind: 'status', label: 'Record Status:', value: 'COMPLETE' },
            ],
          },
        ],
      },
      {
        label: 'certifications', files: [
          {
            slug: 'repl', title: "Remote Pilot's Licence (RePL)", short: 'repl', sub: 'CASA', record: 'Certification Record',
            sections: [
              { kind: 'fields', rows: [['Issuer:', 'Civil Aviation Safety Authority'], ['Licence:', 'Remote Pilot Licence (RePL)']] },
              {
                kind: 'prose', title: 'Scope', paras: [
                  'Licensed to fly as a remote pilot for an operator holding a ReOC, and to fly aircraft between 25 kg and 150 kg over your own land.',
                  'Undertaken to research LiDAR-enabled autonomous flight for mapping, as part of a Locatrix investigation into blending indoor and outdoor mapping in a geospatial environment.',
                ],
              },
              { kind: 'status', label: 'Licence Status:', value: 'HELD' },
              { kind: 'attachment', name: 'drone.jpg', src: '/drone.jpg' },
            ],
          },
          {
            slug: 'business', title: 'Diploma of Business Management', short: 'dip bus', sub: 'BSB50215 · Prestige Service Training', record: 'Certification Record',
            sections: [
              { kind: 'fields', rows: [['Provider:', 'Prestige Service Training'], ['Code:', 'BSB50215'], ['Award:', 'Diploma of Business']] },
              {
                kind: 'prose', title: 'Why', paras: [
                  'To understand the business and management operations needed to run an organisation, which would otherwise have stayed a black box as my career moved into software.',
                ],
              },
              { kind: 'status', label: 'Record Status:', value: 'COMPLETE' },
            ],
          },
          {
            slug: 'fire-safety', title: 'Fire Safety Advisor + RSA/RSG', short: 'fsa + rsa', sub: 'QFES', record: 'Certification Record',
            sections: [
              { kind: 'fields', rows: [['Fire Safety:', 'Fire Safety Advisor (QFES)'], ['Hospitality:', 'RSA, RSG']] },
              {
                kind: 'prose', title: 'Why', paras: [
                  'Fire Safety Advisor certification was a requirement of plan drafting at Concept Safety Systems. It qualified me to advise clients on fire safety and emergency planning, which is the domain every product I have built since serves.',
                ],
              },
              { kind: 'status', label: 'Record Status:', value: 'HELD' },
            ],
          },
        ],
      },
      {
        label: 'competitions', files: [
          {
            slug: 'cyberpatriots', title: 'CyberPatriots — Team AusHak', short: 'cyberpat', sub: '58th of 3,000 teams worldwide', record: 'Competition Record',
            sections: [
              { kind: 'fields', rows: [['Competition:', 'CyberPatriot'], ['Team:', 'AusHak'], ['Year:', '2017']] },
              {
                kind: 'prose', title: 'The Competition', paras: [
                  'A capture-the-flag style cybersecurity tournament: each vulnerability resolved in a round reveals a flag and scores points.',
                  "We were the school's first entry and the only Australian team to place as high, finishing 58th out of 3,000 teams worldwide.",
                ],
              },
              { kind: 'figures', title: 'Result', rows: [['Teams entered', '3,000'], ['Final placing', '58th']] },
              { kind: 'attachment', name: 'cyberpatriots.png', src: '/cyberpatriots.png' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'life', label: 'life', color: '#E7FCDC', dark: '#4C7148', years: 'ongoing',
    groups: [
      {
        label: 'life', files: [
          {
            slug: 'about-me', title: 'About Me', short: 'about me', record: 'Personal Record',
            sections: [
              { kind: 'fields', rows: [['Subject:', ''], ['Daniel Hummelstad', ''], ['Gold Coast, Queensland, Australia', ''], ['Degree:', 'BCompSci, Griffith University, 2024'], ['Occupation:', 'Senior Software Engineer']] },
              { kind: 'fields', rows: [['Record No.:', 'PER-0401'], ['Drawer:', 'life'], ['Disposition:', 'Open to interesting problems']] },
              {
                kind: 'prose', title: 'The Short Version', paras: [
                  'I came into software through plan drafting, which is an unusual door. It meant that by the time I was writing code for fire and emergency compliance I already knew what the people using it do all day, and what it costs them when it is wrong.',
                  'That has shaped everything since. I like systems that are operationally deployed and quietly load-bearing, where reliability is the feature and nobody notices them working.',
                ],
              },
              { kind: 'status', label: 'Record Status:', value: 'OPEN' },
              { kind: 'fields', rows: [['Languages:', 'English, workable Japanese'], ['Licences:', 'RePL (CASA), Fire Safety Advisor (QFES)'], ['Home:', 'Gold Coast, Queensland'], ['Reachable:', 'daniel@hummelstad.me', 'mailto:daniel@hummelstad.me']] },
              { kind: 'attachment', name: 'daniel-hummelstad.jpg', src: '/me.jpeg' },
            ],
            signoff: 'Personal record. No references supplied.',
          },
          {
            slug: 'skills', title: 'Skills & Capabilities', short: 'skills', record: 'Personal Record',
            sections: [
              {
                kind: 'table', title: 'Capabilities', head: ['#', 'Area', 'Detail'], rows: [
                  ['1', 'Languages', 'TypeScript, JavaScript, C#, C/C++, Python'],
                  ['2', 'Frameworks', 'React, .NET'],
                  ['3', 'Algorithms', 'Computer vision, efficiency'],
                  ['4', 'AI', 'CNN (U-Net), OpenCV'],
                  ['5', 'Security', 'Competitions, pen-test audits'],
                  ['6', 'Business', 'Diploma of Business Management'],
                ], totals: [['Entries on file', '6']],
              },
              {
                kind: 'prose', title: 'Personal Attributes', paras: [
                  'Open minded, courteous, respectful, and a go-getter. Those values make for a healthy team and high-value work.',
                ],
              },
            ],
          },
          {
            slug: 'niseko', title: 'A Season in Niseko', short: 'niseko', sub: 'Dec 2024 — Feb 2025', record: 'Personal Record',
            sections: [
              {
                kind: 'prose', title: 'A Season In Niseko', paras: [
                  'Dec 2024 to Feb 2025. Front desk at Niseko Management Services, Hokkaido. Three months of early starts, passable Japanese and more skiing than is strictly defensible. Filed under life and not work, because that is what it was.',
                ],
              },
              { kind: 'status', label: 'Record Status:', value: 'CLOSED' },
            ],
          },
          {
            slug: 'off-the-clock', title: 'Off the Clock', short: 'off clock', record: 'Personal Record',
            sections: [
              {
                kind: 'table', title: 'Off The Clock', head: ['#', 'Pursuit', 'Since', 'Standard'], rows: [
                  ['1', 'Skiing', '2010', 'Competent'],
                  ['2', 'Golf', '2016', 'Optimistic'],
                  ['3', 'Side projects', '2019', 'Compulsive'],
                  ['4', 'Drone flying, RePL', '2021', 'Licensed'],
                ], totals: [['Entries on file', '4']],
              },
              { kind: 'status', label: 'Record Status:', value: 'OPEN' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'other', label: 'other', color: '#FDF6E3', dark: '#7D6E48', years: '2024 —',
    groups: [
      {
        label: 'other', files: [
          { slug: 'now', title: "Now — what I'm on", short: 'now', record: 'Personal Record', sections: [pending('The now page')] },
          {
            slug: 'resume', title: 'Résumé (PDF)', short: 'résumé', record: 'Résumé',
            sections: [{ kind: 'leaders', rows: [['Résumé', 'resume.pdf', '/resume.pdf']] }],
          },
          {
            slug: 'colophon', title: 'Colophon — how this is built', short: 'colophon', record: 'Colophon', contact: 'github.com/dan-hummelstad',
            sections: [
              {
                kind: 'prose', title: 'The Short Version', paras: [
                  'The cabinet is drawn; the files are printed. The cabinet is a WebGL scene under a locked orthographic camera. Every file is real HTML at its own URL, set on continuous-feed stationery.',
                ],
              },
              { kind: 'fields', rows: [['Framework:', 'React 19, Vite'], ['Styling:', 'Tailwind 4'], ['Scene:', 'three.js, R3F, drei'], ['Paper type:', 'Courier Prime'], ['Interface:', 'IBM Plex Mono']] },
            ],
          },
          {
            slug: 'contact', title: 'Contact', short: 'contact', record: 'Contact Record',
            sections: [{ kind: 'leaders', rows: [['Email', 'daniel@hummelstad.me', 'mailto:daniel@hummelstad.me'], ['GitHub', 'github.com/dan-hummelstad', 'https://github.com/dan-hummelstad']] }],
          },
        ],
      },
    ],
  },
]

export const filesOf = (d: Drawer) => d.groups.flatMap((g) => g.files)
