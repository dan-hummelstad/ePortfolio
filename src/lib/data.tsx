
export type Content = {
    title: string
    content: JSX.Element
    images?: JSX.Element
}

export const contentArray: Content[] = [
    {
        title: "Education",
        content: 
        <>
            <p className="text-xs">
                I am currently undertaking a Bachelor's of Computer Science, majoring in Software Development.
                This program teaches the fundamental principles underpinning computer science and practical software technology development skills
                for many different platforms and applications. This includes software engineering skills, artificial intelligence, and big data analysis.
            </p>
            <p className="text-xs">
                I have also undertaken other certificates which include further passions of mine. This includes the Remote Pilot's License (RePL),
                A Diploma of Business Management, Fire Saferty Advisor Certification, and the Responsible Service of Alcohol and Gambling (RSA, RSG).
                I purused these certifications to increase my knowledge base of fields I was not familiar with and to further entice employers to my competencies.
            </p>
            <p className="text-xs">
                I attended The Southport School for my primary and secondary educations.
                Activities and societies: Cyberpatriots Competitor - 2016 - 2017 (placed 58th in the world)
                https://www.tss.qld.edu.au/cyberpatriots-battled-for-australia/

                Cyberpatriots Competitor - 2017 - 2018 (placed 94th in the world)
                https://www.tss.qld.edu.au/2017/2018-tss-cyber-defenders-aug23-2018/

                Gold Coast Mayor's Telstra Technology Competition Runner Up - 2018
                https://www.tss.qld.edu.au/the-mayors-telstra-technology-awards-2018/
            </p>
        </>,
        
    },
    {
        title: "Bachelor of Computer Science - Griffith",
        content: 
        <>
            <p className="text-xs">
                I've undertaken the Bachelor's of Computer Science, majoring in Software Development because it is my passion.
                I love computers and the fundamental logic that underpins them. To further this passion for my career, I chose 
                Software Engineering as the major to increase my understanding of the Software Engineering process.
                Calculatively designing and building solutions and products to complex problems and scenarios. This is my bread and butter.
            </p>
            <p className="text-xs">
                I have 2 primary career objectives: (1) Become a Senior Software Engineer & Manage Products, (2) Start a technology company.

                To achieve both of these career objectives, I must pursue the Computer Science program as it will lay the foundations for these objectives and more.
                These objectives also relate back to my study as, in pursuing them, I continuously improve my knowledge base.
                This allows the transfer of learning back to my studies where I can apply real world experience to new environments.
            </p>
        </>,
        images:
        <>
            <img src="griffith-assessment.png" />
        </>
    },
    {
        title: "Extra Certifications",
        content: 
        <>
            <p className="text-xs">
                Diploma of Business Management - BSB50215
                This qualification reflects the role of individuals with substantial experience in a range of settings who are seeking to further develop their skills across a wide range of business functions.
                This qualification is also suited to the needs of individuals with little or no vocational experience, but who possess sound theoretical business skills and knowledge that they would like to develop in order to create further educational and employment opportunities.
            </p>
            <p className="text-xs">
                Remote Pilots License - CASA (RePL)
            </p>
            <p className="text-xs">
                Fire Safety Advisor Certification - QFES
            </p>
            <p className="text-xs">
                Responsible Service of Alcohol & Gambling (RSA, RSG)
            </p>
        </>
    },
    {
        title: "My Experiences",
        content: 
        <>
            <p className="text-xs">
                During the pursuit of my career, I've contributed to multiple hackathons and comeptitions to increase my 
                knowledge and understanding of my chosen field. Such competitions range from minor hackathons,
                all the way to major cybersecurity competitions sponsored by the US Air & Space Force.
                I've also furthered my career by seeking employment in the industry as an Undergraduate Software Engineer.
            </p>
            <p className="text-xs">
                In 2017, I alongside my team AusHak, participated in the cybersecurity tournament; Cyberpatriots.
                In which, we competed against 3000 teams from all around the globe.
                The competition involved a Capture the Flag style points system where each vulnerability resolved in a round would contribute to points.
                After completeing the competition, my team managed to place 58th in the world.
            </p>
            <p className="text-xs">
                During my studies of Computer Science, I was fortunate to locate a position at a technology organisation, Locatrix.
                During my tenure as a Undergraduate Software Engineer, I contributed to the software team's quality program.
                I built the foundation for a rigorous testing pipeline to ensure before any product's deployment, basic bugs and issues would be captured.
                This included a Continuous Integration pipline, Integration testing, and a much broader Smoke test for final checks.
            </p>
            <p className="text-xs">
                My personal hobbies also include: Skiing, Golfing, & Programming (side projects)
            </p>
        </>,
        images:
        <>
            <img src="/cyberpatriots.png" />
        </>
    },
    {
        title: "Junior Software Enginer - Locatrix",
        content: 
        <>
            <p className="text-xs">
                Following my employment as a Undergraduate Software Engineer, Locatrix promoted me to a Junior Software Engineer which is the role I have today.
                After the promotion, my responsibilities increased to include working on features and issues in our entire product stack.
                This allowed me to increase my multi-disciplinary skillset, increasing my; Front-end Design and Development, Back-end Design and Development, and team work.
                Since I had fully joined the team of 9 Software Engineers within the organisation, I enjoyed a new level of team work and challenge.
            </p>
            <p className="text-xs">
                My contributions to Locatrix accross the product are upwards of 100 feature contributions to each product.
                Locatrix has three products, PlanStudio, PlanSafe, and M2M. Each of these products is also interconnected with a microservices back-end architecture.
                Planstudio is an advanced Scaling Vector Graphics (SVG) drawing tool which increased the productivity of plan drafters by 700% over traditional CAD tools.
                Plansafe is a highly customisable Learning Management System, designed to ensure the fire and emergency planning, & compliance of buildings and employees.
            </p>
            <p className="text-xs">
                As of recently, I have embarked on the process to integrate PlanStudio with Artificial Intelligence to further increase productivity within the application.
                Utilizing a Convolutional U-Net Neural Network model alongside advanced computer vision algorithms, I've successfully implemented a feature which can convert
                any rasterized floorplan into an SVG plan.
                Once this feature has shipped, it is projected to increase productivity of plan drafters by another 60%.
            </p>
        </>,
        images:
        <>
            <img src="/planstudio.jpg" />
            <img src="/plansafe.jpg" />
        </>
    },
    {
        title: "My Skills",
        content: 
        <>
            <p className="text-xl">
                Disciplinary Skills:
            </p>
            <p className="text-xs">
                Within my discipline, my skillset includes multiple multiple programming languages including: Typescript/Javscript, C#, C/C++, and Python.
                Alongside these languages I have also progressed my advanced algorithms prowess with computer vision and efficiency algorithms.
                I've also demonstrated a broad Fullstack capability, tackling both front-end and back-end development. This also includes Artificial Intelligence.
                This is evidenced from my experiences within my workplace and in my university program.
            </p>
            <p className="text-xl">
                Technical Skills:
            </p>
            <p className="text-xs">
                My technical skills include vast experience with multiple frameworks such as React & Dotnet. Due to my competitive nature, I've also 
                increased my Cybersecurity skillset via competitions and regular company audits from penetration testing organisations.
                This is evidenced via my experience at Locatrix.
            </p>
            <p className="text-xl">
                Transferable Skills:
            </p>
            <p className="text-xs">
                I possess Business Management skills from my study of the Diploma of Business Management.
            </p>
            <p className="text-xl">
                Personal Attributes:
            </p>
            <p className="text-xs">
                My nature as a person is to be open minded, courteous, respectful, and a go getter.
                I believe in these values strongly as they allow me to work in a healthy environemnt whilst also providing high value productivity.
            </p>
        </>
    },
    {
        title: "About Me",
        content: 
        <>
            <p className="text-xs">
                I'm Daniel Hummelstad, a Junior Software Engineer with over 4 years of experience in the software industry.
                The goal of this ePortfolio is to introduce myself to you, provide insight to my experiences and skillset in an interesting
                and thoughtful medium.
            </p>
            <p className="text-xs">
                This web site acts as a storage cabinet so I can progressively update and share my experience and skillset.
                Each folder within the cabinet is a chapter in my career, starting humbly as a Plan Drafter and Progressing towards more senior software engineering positions.
                The ePortfolio is also a testament to my software engineering capabilities as it was entirely Designed, Programmed, and Deployed by myself.
                No web site builders or static web frameworks were utilized.
            </p>
            <p className="text-xs">
            </p>
        </>,
        images: 
        <>
            <img src="/me.jpeg"/>
        </>
    }
]
// export const contentArray: Content[] = [
//     {
//         title: "Remote Pilot's License (RePL)",
//         content: (
//         <>
//             <p className="text-xs">
//                 A Remote Pilots License (RePL) is certified by the Civil Aviation Safety Authority (CASA).
//                 This license allows the holder to be a remote pilot for an individual or business that holds a remotely piloted aircraft operator's certificate (ReOC).
//                 It also allows the licensee to fly a drone or remotely piloted aircraft (RPA) that weighs more than 25 kg but less than 150 kg over your own land.
//             </p>
//             <p className="text-xs">
//                 I undertook the RePL licensing course to further my knowledge and understanding of the expanding remote control aircrafts industy.
//                 This allowed me to research and assess the market fit for LiDAR enable autonomous flying for mapping purposes.
//                 This research was, in particular, undertaken for Locatrix in an investigation to how outdoor and indoor mapping could blend
//                 in a geospatial enable environment.
//             </p>
//         </>
//         ),
//         images: (
//             <>
//                 <img src="/drone.jpg"/>
//             </>
//         )
//     },
//     {
//         title: "Fire Safety Advisor",
//         content: (
//         <>
//             <p className="text-xs">
//                 I undertook the Fire Safety Advisor courses as a requirement for performing my Plan Drafting role in Locatrix.
//                 This certification enabled me to advise clients on Fire Safety and Emergency planning.
//             </p>
//             <p className="text-xs">
//                 Occupational Health and Safety Advisers develop, implement and evaluate risk management policies and programs,
//                 train employees in occupational health and safety procedures, monitor and audit the workplace,
//                 and record and investigate incidents to ensure safe and healthy working conditions.
//             </p>
//         </>
//         ),
//         images: (
//             <>
//             </>
//         )
//     },
//     {
//         title: "Cyberpatriots Cybersecurity Competition",
//         content: (
//         <>
//             <p className="text-xs">
//                 The CyberPatriot Competition is designed to be accessible to any high school or middle school student, provides a path from high school to college/workforce, and benefits all national CyberPatriot partners.
//                 The program increases the awareness of cybersecurity by delivering a basic education in a competitive format that enhances leadership, communication, and cooperation skills among its competitors.
//             </p>
//             <p className="text-xs">
//                 I joined the Cyberpatriots competition in Grade 11 (2017) of Highschool where our team (AusHak) scored 58th out of 3000 participating teams.
//                 We were the only team out of Australia to compete and place as high. This was also the first time the school participated in such a competition.
//                 During the competition we solved various Cybersecurity vulnerabilities, in which we played a game of Capture the Flag for scoring purposes.
//                 As each vulnerability was resolved, the flag would be shown which would contribute to our final score.
//             </p>
//         </>
//         ),
//         images: (
//             <>
//                 <img src="/cyberpatriots.png"></img>
//             </>
//         )
//     },
//     {
//         title: "The Southport School",
//         content: (
//         <>
//             <p className="text-xs">
//                 Activities and societies: Cyberpatriots Competitor - 2016 - 2017 (placed 58th in the world)
//                 https://www.tss.qld.edu.au/cyberpatriots-battled-for-australia/

//                 Cyberpatriots Competitor - 2017 - 2018 (placed 94th in the world)
//                 https://www.tss.qld.edu.au/2017/2018-tss-cyber-defenders-aug23-2018/

//                 Gold Coast Mayor's Telstra Technology Competition Runner Up - 2018
//                 https://www.tss.qld.edu.au/the-mayors-telstra-technology-awards-2018/
//             </p>
//             <p className="text-xs">
//             The Southport School is an independent, Anglican, day and boarding school for boys, located in Southport, a suburb on the Gold Coast of Queensland, Australia.
//             </p>
//         </>
//         ),
//         images: (
//             <>
//             </>
//         )
//     },
//     {
//         title: "Prestige Service Training",
//         content: (
//         <>
//             <p className="text-xs">
//             Diploma of Business - BSB50215
//             </p>
//             <p className="text-xs">
//             I undertook the Diploma of Business Mangement to increase my knowledge of the surrounding business and management operations
//             required to run an organisation. This expanded my understanding of the business processes that would've otherwise been a blackbox
//             to myself as I continued my career into the software industry.
//             </p>
//             <p className="text-xs">
//             This qualification reflects the role of individuals with substantial experience in a range of settings who are seeking to further develop their skills across a wide range of business functions.
//             This qualification is also suited to the needs of individuals with little or no vocational experience,
//             but who possess sound theoretical business skills and knowledge that they would like to develop in order to create further educational and employment opportunities.
//             </p>
//         </>
//         ),
//         images: (
//             <>
//             </>
//         )
//     },
//     {
//         title: "Bachelor of Computer Science (Griffith University)",
//         content: (
//         <>
//             <p className="text-xs">
//                 Computing & computers have been a life long passion of mine, when it came time to choose a career and educational pathway,
//                 it was a no brainer to choose the Bachelor of Computer Science.
//                 During my educational journey in Computer Science, many assessments tested my Mathematical, Problem Solving, Programming, and Communicational
//                 skills. Of which, I mention below:
//             </p>
//             <p className='text-xs'>
//                 One such assessment which tested all of these skills was a part of a Software Engineering Fundamentals subject where,
//                 as a group, we were tasked to recreate pacman.
//                 Within this team, I spearheaded communication, planning, and the full development of the software.
//                 This assessment was extremely challenging as we had to design & propose, develop & integrate, then test & release within a strict time limit.
//                 It was also extremely challenging to keep communication clear and concise to give all group members the appropriate information for each task.
//             </p>
//         </>
//         ),
//         images: (
//             <>
//                 <img src="/griffith-assessment.png"></img>
//             </>
//         )
//     },
//     {
//         title: "Concept Safety Systems - Drafter",
//         content: (
//         <>
//             <p className="text-xs">
//             </p>
//         </>
//         ),
//         images: (
//             <>
//             </>
//         )
//     },
//     {
//         title: "Locatrix - Software Quality Assurance Engineer",
//         content: (
//         <>
//             <p className="text-xs">
//             </p>
//         </>
//         ),
//         images: (
//             <>
//                 <img src="/test-img.jpeg"></img>
//             </>
//         )
//     },
//     {
//         title: "Locatrix - Junior Software Engineer",
//         content: (
//         <>
//             <p className="text-xs">
//             </p>
//         </>
//         ),
//         images: (
//             <>
//                 <img src="/planstudio.jpg"></img>
//                 <img src="/plansafe.jpg"></img>
//             </>
//         )
//     },
//     {
//         title: "About Me",
//         content: (
//         <>
//             <p className="text-xs">
//             With over 4 years of experience in the technology industry,
//             I am currently fostering innovation and nurturing growth as a Junior Software Engineer at Locatrix.
//             My journey has seen me evolving through roles like Software Quality Assurance Engineer and Drafter at Concept Safety Systems, a subsidiary of Locatrix.
//             These roles have not only equipped me with a deep understanding of complex systems but have amplified my prowess in quality assurance and process optimization.
//             </p>
//             <p className="text-xs">
//             As I advance my academic journey pursuing a Bachelor's degree in Computer Science at Griffith University,
//             I have honed my ability to collect, organize, analyze, and communicate statistical information, especially through my rigorous engagement with statistics subjects.
//             This acquired skill set plays a pivotal role in complementing my practical experience,
//             enabling a rich understanding of data and aiding in deriving actionable insights from complex sets of information.
//             Whether it's discerning patterns or predicting trends, my educational pathway has fortified my capacity to work with statistical data proficiently.
//             </p>
//         </>
//         ),
//         images: (
//             <>
//                 <img src="/me.jpeg"></img>
//             </>
//         )
//     }
// ]