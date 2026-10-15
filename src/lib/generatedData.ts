import { Person, ExhibitorStats, Product } from '../types';

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Kabir', 'Saanvi', 'Aanya', 'Aadhya', 'Aaradhya', 'Ananya', 'Pari', 'Anika', 'Navya', 'Avni', 'Diya', 'Shruti', 'Neha', 'Rohan', 'Vikram', 'Priya', 'Kavya', 'Siddharth', 'Amit', 'Sunita', 'Rajesh', 'Pooja', 'Deepak', 'Sneha', 'Rahul', 'Nisha', 'Ravi', 'Ritu', 'Akash', 'Kiran', 'Tarun', 'Manoj', 'Prakash', 'Gaurav', 'Vinay', 'Ashok', 'Sanjay', 'Geeta', 'Sita', 'Anita', 'Sunil', 'Anil', 'Naveen', 'Vijay', 'Vikas', 'Ajay'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Bansal', 'Agarwal', 'Singh', 'Kumar', 'Das', 'Bose', 'Chatterjee', 'Sengupta', 'Patil', 'Deshmukh', 'Joshi', 'Kulkarni', 'Reddy', 'Rao', 'Naidu', 'Chowdary', 'Menon', 'Nair', 'Pillai', 'Iyer', 'Iyengar', 'Natarajan', 'Gowda', 'Hegde', 'Shenoy', 'Prabhu', 'Mehta', 'Shah', 'Patel', 'Desai', 'Parekh', 'Gandhi', 'Chauhan', 'Rajput', 'Yadav', 'Ahir', 'Bhatt', 'Trivedi', 'Vyas', 'Mukherjee', 'Banerjee', 'Ganguly', 'Kaur', 'Gill', 'Dhillon', 'Sandhu'];

const companies = ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant', 'Accenture', 'IBM', 'Capgemini', 'Oracle', 'Microsoft', 'Google', 'Amazon', 'Flipkart', 'Zoho', 'Freshworks', 'Paytm', 'Zomato', 'Swiggy', 'Ola', 'Uber', 'Intel', 'AMD', 'NVIDIA', 'Qualcomm', 'Cisco', 'Juniper', 'VMware', 'Red Hat', 'SAP', 'Salesforce', 'Adobe', 'Intuit', 'Atlassian', 'ThoughtWorks', 'Mindtree', 'L&T Infotech', 'Mphasis', 'Hexaware', 'Cyient', 'Tata Elxsi', 'KPIT', 'Zensar', 'Persistent', 'Coforge', 'Birlasoft', 'Sonata', 'Mastek', 'Datamatics', 'Ramco'];

const designations = ['Software Engineer', 'Senior Software Engineer', 'Tech Lead', 'Engineering Manager', 'Director of Engineering', 'VP of Engineering', 'CTO', 'Product Manager', 'Senior Product Manager', 'Group Product Manager', 'Director of Product', 'VP of Product', 'CPO', 'Data Scientist', 'Senior Data Scientist', 'Lead Data Scientist', 'AI/ML Engineer', 'Data Engineer', 'Cloud Architect', 'Solutions Architect', 'DevOps Engineer', 'SRE', 'Security Engineer', 'UX Designer', 'UI Designer', 'Product Designer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer'];

const interestsList = ['Artificial Intelligence', 'Machine Learning', 'Cloud Computing', 'Data Science', 'Web Development', 'Mobile Development', 'DevOps', 'Cybersecurity', 'Blockchain', 'IoT', 'AR/VR', 'Quantum Computing', 'SaaS', 'Fintech', 'Healthtech', 'Edtech', 'E-commerce', 'Enterprise Software', 'Open Source', 'UI/UX Design', 'Product Management', 'Agile Methodologies', 'Startup Ecosystem', 'Venture Capital', 'Angel Investing'];

// Use a simple seeded PRNG so it's consistent across hot reloads
function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
const rng = mulberry32(42);

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function generateAttendees(count: number): Person[] {
  const attendees: Person[] = [];
  for (let i = 0; i < count; i++) {
    const fn = randomElement(firstNames);
    const ln = randomElement(lastNames);
    const name = `${fn} ${ln}`;
    const company = randomElement(companies);
    const designation = randomElement(designations);
    const score = (i < 20) ? Math.floor(rng() * 20) + 80 : Math.floor(rng() * 100);
    const numInterests = Math.floor(rng() * 3) + 2;
    const interests: string[] = [];
    for (let j = 0; j < numInterests; j++) {
      const interest = randomElement(interestsList);
      if (!interests.includes(interest)) {
        interests.push(interest);
      }
    }
    
    attendees.push({
      id: `gen-att-${i}`,
      name: name,
      designation: designation,
      company: company,
      avatar: `https://i.pravatar.cc/150?u=${fn}+${ln}`,
      interests: interests,
      relevanceScore: score,
      bio: `Professional at ${company} focusing on ${interests[0] || 'technology'}.`,
      skills: interests,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
      mobile: '+91 98765 43210',
      linkedin: `linkedin.com/in/${fn.toLowerCase()}${ln.toLowerCase()}`,
      privacy: {
        shareEmail: true,
        sharePhone: false,
        shareLinkedIn: true,
        preset: 'Connections Only'
      },
      checkedIn: i < 1115,
      registrationId: `#${String(1000 + i).padStart(4, '0')}`,
      ticketType: (i % 12 === 0 ? 'VIP' : i % 8 === 0 ? 'Exhibitor' : 'Delegate'),
      role: (i % 12 === 0 ? 'vip' : i % 8 === 0 ? 'exhibitor_staff' : 'delegate'),
    });
  }
  return attendees;
}

export const GENERATED_EXHIBITORS: ExhibitorStats[] = [
  {
    "id": "exh-1",
    "company": "MPSEDC",
    "logo": "/images/exhibitors/mpsedc.png",
    "booth": "Hall 1 · A-01",
    "category": "State Nodal Agency",
    "visits": 980,
    "leads": 340,
    "enquiries": 185,
    "teamSize": 16,
    "status": "Active"
  },
  {
    "id": "exh-2",
    "company": "Truechip Solutions",
    "logo": "/images/exhibitors/truechip.png",
    "booth": "Hall 1 · A-02",
    "category": "Verification IP & EDA",
    "visits": 760,
    "leads": 290,
    "enquiries": 140,
    "teamSize": 14,
    "status": "Active"
  },
  {
    "id": "exh-3",
    "company": "TrueSilicon",
    "logo": "/images/exhibitors/truesilicon.png",
    "booth": "Hall 1 · A-03",
    "category": "Semiconductor Design",
    "visits": 540,
    "leads": 195,
    "enquiries": 88,
    "teamSize": 10,
    "status": "Active"
  },
  {
    "id": "exh-4",
    "company": "Stemrobo",
    "logo": "/images/exhibitors/stemrobo.png",
    "booth": "Hall 1 · A-04",
    "category": "EdTech & Robotics",
    "visits": 620,
    "leads": 210,
    "enquiries": 95,
    "teamSize": 8,
    "status": "Active"
  },
  {
    "id": "exh-5",
    "company": "CDAC",
    "logo": "/images/exhibitors/cdac.png",
    "booth": "Hall 1 · A-05",
    "category": "R&D & Computing",
    "visits": 890,
    "leads": 320,
    "enquiries": 160,
    "teamSize": 15,
    "status": "Active"
  },
  {
    "id": "exh-6",
    "company": "AndGate Informatics",
    "logo": "/images/exhibitors/andgate.png",
    "booth": "Hall 1 · A-06",
    "category": "Embedded Systems",
    "visits": 430,
    "leads": 140,
    "enquiries": 62,
    "teamSize": 6,
    "status": "Active"
  },
  {
    "id": "exh-7",
    "company": "SCL Mohali",
    "logo": "/images/exhibitors/scl.png",
    "booth": "Hall 1 · A-07",
    "category": "Semiconductor Fabrication",
    "visits": 920,
    "leads": 310,
    "enquiries": 175,
    "teamSize": 12,
    "status": "Active"
  },
  {
    "id": "exh-8",
    "company": "Nanodroits Technology",
    "logo": "/images/exhibitors/nanodroits.png",
    "booth": "Hall 1 · A-08",
    "category": "Nanotechnology",
    "visits": 410,
    "leads": 130,
    "enquiries": 58,
    "teamSize": 7,
    "status": "Active"
  },
  {
    "id": "exh-9",
    "company": "MCTE",
    "logo": "/images/exhibitors/mcte.png",
    "booth": "Hall 1 · A-09",
    "category": "Defense Tech & Academia",
    "visits": 580,
    "leads": 180,
    "enquiries": 84,
    "teamSize": 10,
    "status": "Active"
  },
  {
    "id": "exh-10",
    "company": "RackBank Datacenters Pvt Ltd",
    "logo": "/images/exhibitors/rackbank.png",
    "booth": "Hall 1 · A-10",
    "category": "Data Centers & Cloud",
    "visits": 710,
    "leads": 245,
    "enquiries": 110,
    "teamSize": 11,
    "status": "Active"
  },
  {
    "id": "exh-11",
    "company": "TULSHREE",
    "logo": "/images/exhibitors/tulshree.png",
    "booth": "Hall 1 · B-01",
    "category": "Electronics Manufacturing",
    "visits": 490,
    "leads": 160,
    "enquiries": 72,
    "teamSize": 8,
    "status": "Active"
  },
  {
    "id": "exh-12",
    "company": "HLBS",
    "logo": "/images/exhibitors/hlbs.png",
    "booth": "Hall 1 · B-02",
    "category": "Hardware Manufacturing",
    "visits": 640,
    "leads": 220,
    "enquiries": 98,
    "teamSize": 9,
    "status": "Active"
  },
  {
    "id": "exh-13",
    "company": "Spintronics AI",
    "logo": "/images/exhibitors/spintronics.png",
    "booth": "Hall 1 · B-03",
    "category": "AI Hardware & Spintronics",
    "visits": 530,
    "leads": 190,
    "enquiries": 85,
    "teamSize": 6,
    "status": "Active"
  },
  {
    "id": "exh-14",
    "company": "SVVV Indore",
    "logo": "/images/exhibitors/svvv.png",
    "booth": "Hall 1 · B-04",
    "category": "Academic & Research",
    "visits": 470,
    "leads": 145,
    "enquiries": 65,
    "teamSize": 8,
    "status": "Active"
  },
  {
    "id": "exh-15",
    "company": "VLSI Experts",
    "logo": "/images/exhibitors/vlsiexperts.png",
    "booth": "Hall 1 · B-05",
    "category": "VLSI Training & Consulting",
    "visits": 680,
    "leads": 260,
    "enquiries": 125,
    "teamSize": 10,
    "status": "Active"
  },
  {
    "id": "exh-16",
    "company": "VLSI for all Private Ltd.",
    "logo": "/images/exhibitors/vlsiforall.png",
    "booth": "Hall 1 · B-06",
    "category": "VLSI Education & EDA",
    "visits": 590,
    "leads": 215,
    "enquiries": 92,
    "teamSize": 8,
    "status": "Active"
  },
  {
    "id": "exh-17",
    "company": "Siliciom Semiconductors",
    "logo": "/images/exhibitors/siliciom.png",
    "booth": "Hall 1 · B-07",
    "category": "Silicon Engineering",
    "visits": 510,
    "leads": 175,
    "enquiries": 78,
    "teamSize": 7,
    "status": "Active"
  },
  {
    "id": "exh-18",
    "company": "TRIVENI Semiconductor India",
    "logo": "/images/exhibitors/triveni.png",
    "booth": "Hall 1 · B-08",
    "category": "Semiconductor Assembly & Test",
    "visits": 630,
    "leads": 230,
    "enquiries": 105,
    "teamSize": 11,
    "status": "Active"
  },
  {
    "id": "exh-19",
    "company": "Paras Semi",
    "logo": "/images/exhibitors/paras.png",
    "booth": "Hall 1 · B-09",
    "category": "Power Semiconductors",
    "visits": 480,
    "leads": 155,
    "enquiries": 68,
    "teamSize": 7,
    "status": "Active"
  },
  {
    "id": "exh-20",
    "company": "DigiComm Semi",
    "logo": "/images/exhibitors/digicomm.png",
    "booth": "Hall 1 · B-10",
    "category": "RF & Wireless ICs",
    "visits": 520,
    "leads": 185,
    "enquiries": 80,
    "teamSize": 8,
    "status": "Active"
  },
  {
    "id": "exh-21",
    "company": "VIT Bhopal",
    "logo": "/images/exhibitors/vitbhopal.png",
    "booth": "Hall 1 · C-01",
    "category": "Academic & Research",
    "visits": 560,
    "leads": 170,
    "enquiries": 75,
    "teamSize": 10,
    "status": "Active"
  },
  {
    "id": "exh-22",
    "company": "MANIT Bhopal",
    "logo": "/images/exhibitors/manit.png",
    "booth": "Hall 1 · C-02",
    "category": "Academic & Research",
    "visits": 610,
    "leads": 195,
    "enquiries": 85,
    "teamSize": 9,
    "status": "Active"
  },
  {
    "id": "exh-23",
    "company": "Medicaps",
    "logo": "/images/exhibitors/medicaps.png",
    "booth": "Hall 1 · C-03",
    "category": "Academic & Research",
    "visits": 450,
    "leads": 135,
    "enquiries": 60,
    "teamSize": 8,
    "status": "Active"
  },
  {
    "id": "exh-24",
    "company": "SGSITS Indore",
    "logo": "/images/exhibitors/sgsits.png",
    "booth": "Hall 1 · C-04",
    "category": "Academic & Research",
    "visits": 670,
    "leads": 225,
    "enquiries": 95,
    "teamSize": 12,
    "status": "Active"
  },
  {
    "id": "exh-25",
    "company": "ABV-IIITM Gwalior",
    "logo": "/images/exhibitors/iiitmgwalior.png",
    "booth": "Hall 1 · C-05",
    "category": "Academic & Research",
    "visits": 580,
    "leads": 180,
    "enquiries": 80,
    "teamSize": 8,
    "status": "Active"
  },
  {
    "id": "exh-26",
    "company": "Jetwave",
    "logo": "/images/exhibitors/jetwave.png",
    "booth": "Hall 2 · D-01",
    "category": "RF & High-Speed Hardware",
    "visits": 440,
    "leads": 140,
    "enquiries": 60,
    "teamSize": 6,
    "status": "Active"
  },
  {
    "id": "exh-27",
    "company": "NIELIT",
    "logo": "/images/exhibitors/nielit.png",
    "booth": "Hall 2 · D-02",
    "category": "Govt Skill & Certification",
    "visits": 590,
    "leads": 210,
    "enquiries": 90,
    "teamSize": 9,
    "status": "Active"
  },
  {
    "id": "exh-28",
    "company": "Bio Line India",
    "logo": "/images/exhibitors/bioline.png",
    "booth": "Hall 2 · D-03",
    "category": "Instrumentation & Sensors",
    "visits": 420,
    "leads": 130,
    "enquiries": 55,
    "teamSize": 6,
    "status": "Active"
  },
  {
    "id": "exh-29",
    "company": "CraftifAI",
    "logo": "/images/exhibitors/craftifai.png",
    "booth": "Hall 2 · D-04",
    "category": "AI Acceleration",
    "visits": 610,
    "leads": 220,
    "enquiries": 98,
    "teamSize": 7,
    "status": "Active"
  },
  {
    "id": "exh-30",
    "company": "RRCAT",
    "logo": "/images/exhibitors/rrcat.png",
    "booth": "Hall 2 · D-05",
    "category": "Govt Research & Lasers",
    "visits": 830,
    "leads": 280,
    "enquiries": 140,
    "teamSize": 14,
    "status": "Active"
  },
  {
    "id": "exh-31",
    "company": "NEW AGE INSTRUMENTS & MATERIALS Pvt Ltd",
    "logo": "/images/exhibitors/newage.png",
    "booth": "Hall 2 · D-06",
    "category": "Materials & Instruments",
    "visits": 460,
    "leads": 150,
    "enquiries": 65,
    "teamSize": 8,
    "status": "Active"
  },
  {
    "id": "exh-32",
    "company": "Acropolis Institute of tecnology and Research, Indore",
    "logo": "/images/exhibitors/acropolis.png",
    "booth": "Hall 2 · D-07",
    "category": "Academic & Research",
    "visits": 520,
    "leads": 165,
    "enquiries": 70,
    "teamSize": 9,
    "status": "Active"
  },
  {
    "id": "exh-33",
    "company": "Sagar Group of Institutions, SISTec, Bhopal",
    "logo": "/images/exhibitors/sistec.png",
    "booth": "Hall 2 · D-08",
    "category": "Academic & Research",
    "visits": 490,
    "leads": 155,
    "enquiries": 66,
    "teamSize": 8,
    "status": "Active"
  },
  {
    "id": "exh-34",
    "company": "Setu Manufacturing Solutions",
    "logo": "/images/exhibitors/setu.png",
    "booth": "Hall 2 · E-01",
    "category": "Precision Manufacturing",
    "visits": 430,
    "leads": 140,
    "enquiries": 58,
    "teamSize": 6,
    "status": "Active"
  },
  {
    "id": "exh-35",
    "company": "HTL Co India Pvt Ltd",
    "logo": "/images/exhibitors/htl.png",
    "booth": "Hall 2 · E-02",
    "category": "Semiconductor Equipment",
    "visits": 540,
    "leads": 180,
    "enquiries": 82,
    "teamSize": 7,
    "status": "Active"
  },
  {
    "id": "exh-36",
    "company": "Indiesemic Private Limited",
    "logo": "/images/exhibitors/indiesemic.png",
    "booth": "Hall 2 · E-03",
    "category": "Fabless Semiconductor",
    "visits": 690,
    "leads": 260,
    "enquiries": 115,
    "teamSize": 11,
    "status": "Active"
  },
  {
    "id": "exh-37",
    "company": "Laxmishri printed circuit boad",
    "logo": "/images/exhibitors/laxmishri.png",
    "booth": "Hall 2 · E-04",
    "category": "PCB Manufacturing",
    "visits": 470,
    "leads": 155,
    "enquiries": 64,
    "teamSize": 8,
    "status": "Active"
  },
  {
    "id": "exh-38",
    "company": "SAGE University Indore",
    "logo": "/images/exhibitors/sage.png",
    "booth": "Hall 2 · E-05",
    "category": "Academic & Research",
    "visits": 480,
    "leads": 150,
    "enquiries": 62,
    "teamSize": 8,
    "status": "Active"
  },
  {
    "id": "exh-39",
    "company": "CSIR CEERI PIlani",
    "logo": "/images/exhibitors/ceeri.png",
    "booth": "Hall 2 · E-06",
    "category": "R&D Institution",
    "visits": 780,
    "leads": 270,
    "enquiries": 130,
    "teamSize": 12,
    "status": "Active"
  },
  {
    "id": "exh-40",
    "company": "Teradyne",
    "logo": "/images/exhibitors/teradyne.png",
    "booth": "Hall 2 · E-07",
    "category": "ATE & Testing Solutions",
    "visits": 840,
    "leads": 305,
    "enquiries": 150,
    "teamSize": 12,
    "status": "Active"
  },
  {
    "id": "exh-41",
    "company": "Prestige PIEMR",
    "logo": "/images/exhibitors/piemr.png",
    "booth": "Hall 2 · E-08",
    "category": "Academic & Research",
    "visits": 460,
    "leads": 145,
    "enquiries": 60,
    "teamSize": 8,
    "status": "Active"
  },
  {
    "id": "exh-42",
    "company": "IITI DRISHTI CPS FOUNDATION",
    "logo": "/images/exhibitors/drishticps.png",
    "booth": "Hall 2 · F-01",
    "category": "DeepTech Innovation Hub",
    "visits": 720,
    "leads": 250,
    "enquiries": 120,
    "teamSize": 10,
    "status": "Active"
  },
  {
    "id": "exh-43",
    "company": "IISER Bhopal",
    "logo": "/images/exhibitors/iiser.png",
    "booth": "Hall 2 · F-02",
    "category": "Academic & Research",
    "visits": 630,
    "leads": 210,
    "enquiries": 95,
    "teamSize": 9,
    "status": "Active"
  },
  {
    "id": "exh-44",
    "company": "PinE Training Academy",
    "logo": "/images/exhibitors/pine.png",
    "booth": "Hall 2 · F-03",
    "category": "VLSI Training Academy",
    "visits": 640,
    "leads": 235,
    "enquiries": 105,
    "teamSize": 8,
    "status": "Active"
  },
  {
    "id": "exh-45",
    "company": "NSDCS LAB IIT Indore",
    "logo": "/images/exhibitors/nsdcs.png",
    "booth": "Hall 2 · F-04",
    "category": "Research Laboratory",
    "visits": 660,
    "leads": 220,
    "enquiries": 100,
    "teamSize": 9,
    "status": "Active"
  },
  {
    "id": "exh-46",
    "company": "LeadSoc Technologies",
    "logo": "/images/exhibitors/leadsoc.png",
    "booth": "Hall 2 · F-05",
    "category": "Semiconductor Services",
    "visits": 570,
    "leads": 195,
    "enquiries": 85,
    "teamSize": 9,
    "status": "Active"
  },
  {
    "id": "exh-47",
    "company": "Daksh instruments pvt ltd",
    "logo": "/images/exhibitors/daksh.png",
    "booth": "Hall 2 · F-06",
    "category": "Test & Measurement",
    "visits": 450,
    "leads": 140,
    "enquiries": 62,
    "teamSize": 6,
    "status": "Active"
  },
  {
    "id": "exh-48",
    "company": "IET-DAVV Indore",
    "logo": "/images/exhibitors/ietdavv.png",
    "booth": "Hall 2 · F-07",
    "category": "Academic & Research",
    "visits": 580,
    "leads": 190,
    "enquiries": 80,
    "teamSize": 9,
    "status": "Active"
  },
  {
    "id": "exh-49",
    "company": "IET University Bhopal",
    "logo": "/images/exhibitors/ietbhopal.png",
    "booth": "Hall 2 · F-08",
    "category": "Academic & Research",
    "visits": 470,
    "leads": 150,
    "enquiries": 65,
    "teamSize": 8,
    "status": "Active"
  },
  {
    "id": "exh-50",
    "company": "Analog Devices",
    "logo": "/images/exhibitors/analogdevices.png",
    "booth": "Hall 1 · G-01",
    "category": "Analog & Mixed-Signal ICs",
    "visits": 950,
    "leads": 350,
    "enquiries": 190,
    "teamSize": 16,
    "status": "Active"
  },
  {
    "id": "exh-51",
    "company": "Nirji Semicon",
    "logo": "/images/exhibitors/nirji.png",
    "booth": "Hall 1 · G-02",
    "category": "Semiconductor Solutions",
    "visits": 510,
    "leads": 170,
    "enquiries": 76,
    "teamSize": 7,
    "status": "Active"
  }
];

export const GENERATED_PRODUCTS: Product[] = [
  {
    "id": "prod-mpsedc-1",
    "name": "MP Semiconductor & Fab Policy Incentives",
    "tagline": "State Policy Support for Semiconductor Units",
    "company": "MPSEDC",
    "category": "State Policy & Grants",
    "booth": "Hall 1 · A-01",
    "image": "/images/exhibitors/mpsedc.png",
    "views": 890,
    "enquiries": 68,
    "interestedVisitorsCount": 142,
    "overview": "State-level capital subsidy, subsidized land, dedicated power, and stamp duty exemptions for chip design, OSAT, and fab units in MP.",
    "features": [
      "Capital Subsidy up to 50%",
      "Plug-and-play Incubation at Indore",
      "Single-window Approvals"
    ],
    "benefits": [
      "Faster Time to Market",
      "Significant CAPEX reduction",
      "State-backed infrastructure"
    ],
    "useCases": [
      "Semiconductor Startups",
      "OSAT Facilities",
      "Fabless Design Houses"
    ],
    "resources": {
      "websiteUrl": "https://mpsedc.mp.gov.in"
    }
  },
  {
    "id": "prod-mpsedc-2",
    "name": "Indore ESDM Innovation & Testing Facility",
    "tagline": "Shared Testing & Characterization Labs",
    "company": "MPSEDC",
    "category": "Infrastructure",
    "booth": "Hall 1 · A-01",
    "image": "/images/exhibitors/mpsedc.png",
    "views": 710,
    "enquiries": 45,
    "interestedVisitorsCount": 98,
    "overview": "World-class shared testing, EMC/EMI validation, and prototyping infrastructure for semiconductor and electronic manufacturers.",
    "features": [
      "Shared Cleanroom Facilities",
      "Advanced Measurement Instruments",
      "Technical Mentorship"
    ],
    "benefits": [
      "Lower barrier to prototype",
      "Certified compliance",
      "Local ecosystem access"
    ],
    "useCases": [
      "MSMEs",
      "University Spin-offs",
      "Electronic Manufacturers"
    ],
    "resources": {
      "websiteUrl": "https://mpsedc.mp.gov.in"
    }
  },
  {
    "id": "prod-truechip-1",
    "name": "PCIe Gen 6 / Gen 7 Verification IP",
    "tagline": "Next-Gen PCI Express Verification Suite",
    "company": "Truechip Solutions",
    "category": "Verification IP & EDA",
    "booth": "Hall 1 · A-02",
    "image": "/images/exhibitors/truechip.png",
    "views": 840,
    "enquiries": 65,
    "interestedVisitorsCount": 138,
    "overview": "Industry-standard Verification IP for PCI Express Gen 6 and Gen 7 with full PAM4 signaling, FLIT mode, SRIS, and compliance checkers.",
    "features": [
      "PAM4 Signaling & 64/128 GT/s FLIT Mode",
      "SystemVerilog / UVM Native Architecture",
      "Advanced Error Injection & Protocol Assertions"
    ],
    "benefits": [
      "Drastically cuts verification cycle times",
      "Zero protocol ambiguity with full compliance",
      "Proven across 100+ silicon tapeouts"
    ],
    "useCases": [
      "High Performance Compute (HPC)",
      "AI/ML Accelerators",
      "Data Center & Cloud SoCs"
    ],
    "resources": {
      "websiteUrl": "https://www.truechip.net/product/verification-ip"
    }
  },
  {
    "id": "prod-truechip-2",
    "name": "UCIe (Universal Chiplet Interconnect) VIP",
    "tagline": "Turnkey Die-to-Die Chiplet Verification",
    "company": "Truechip Solutions",
    "category": "Verification IP & EDA",
    "booth": "Hall 1 · A-02",
    "image": "/images/exhibitors/truechip.png",
    "views": 790,
    "enquiries": 58,
    "interestedVisitorsCount": 124,
    "overview": "Comprehensive Die-to-Die (D2D) chiplet verification supporting standard and advanced package architectures, D2D adapter, and physical layers.",
    "features": [
      "UCIe 1.0 & 1.1 Multi-die Interconnect Support",
      "D2D Adapter & Protocol Layer Verification",
      "Sideband & Mainband Channel Modeling"
    ],
    "benefits": [
      "Ensures inter-chiplet interoperability",
      "Rapid integration in standard UVM testbenches",
      "Reduces physical prototyping risks"
    ],
    "useCases": [
      "Heterogeneous AI Chiplets",
      "Modular Server Processors",
      "Multi-Die Automotive SoCs"
    ],
    "resources": {
      "websiteUrl": "https://www.truechip.net/product/verification-ip"
    }
  },
  {
    "id": "prod-truechip-3",
    "name": "CXL 3.1 / 3.0 (Compute Express Link) VIP",
    "tagline": "High-Bandwidth Coherent Interconnect Verification",
    "company": "Truechip Solutions",
    "category": "Verification IP & EDA",
    "booth": "Hall 1 · A-02",
    "image": "/images/exhibitors/truechip.png",
    "views": 720,
    "enquiries": 49,
    "interestedVisitorsCount": 112,
    "overview": "Complete Verification IP for CXL.io, CXL.cache, and CXL.mem protocols, enabling verification of memory expansion, accelerators, and pooled memory.",
    "features": [
      "CXL.io, CXL.cache, and CXL.mem Support",
      "Coherent Memory Fabric Verification",
      "Multi-Logical Device (MLD) Modeling"
    ],
    "benefits": [
      "Guarantees cache coherency validation",
      "Shortens verification schedule for complex memory architectures",
      "Built-in compliance checking test suites"
    ],
    "useCases": [
      "Disaggregated Cloud Memory",
      "Accelerated Computing Clusters",
      "Enterprise Storage Systems"
    ],
    "resources": {
      "websiteUrl": "https://www.truechip.net/product/verification-ip"
    }
  },
  {
    "id": "prod-truechip-4",
    "name": "USB4 & USB-PD 3.1 Verification IP",
    "tagline": "High-Speed Multi-Protocol Tunneling Verification",
    "company": "Truechip Solutions",
    "category": "Verification IP & EDA",
    "booth": "Hall 1 · A-02",
    "image": "/images/exhibitors/truechip.png",
    "views": 680,
    "enquiries": 44,
    "interestedVisitorsCount": 98,
    "overview": "Complete USB4 router, adapter layer, and Type-C Power Delivery 3.1 verification IP supporting up to 80 Gbps tunneling of PCIe and DisplayPort.",
    "features": [
      "USB4 v2.0 / Gen 4 80 Gbps PAM3 Support",
      "Full USB Type-C and Power Delivery 3.1",
      "Simultaneous PCIe & DisplayPort Tunneling"
    ],
    "benefits": [
      "Exhaustive test suite for corner cases",
      "Plug-and-play SystemVerilog UVM environment",
      "Field-tested compliance test sequences"
    ],
    "useCases": [
      "Consumer Electronics SoCs",
      "Smartphones & Laptops",
      "Automotive Infotainment Hubs"
    ],
    "resources": {
      "websiteUrl": "https://www.truechip.net/product/verification-ip"
    }
  },
  {
    "id": "prod-truechip-5",
    "name": "HBM3 / LPDDR5X Memory VIP",
    "tagline": "High-Bandwidth Memory Protocol Verification",
    "company": "Truechip Solutions",
    "category": "Verification IP & EDA",
    "booth": "Hall 1 · A-02",
    "image": "/images/exhibitors/truechip.png",
    "views": 650,
    "enquiries": 42,
    "interestedVisitorsCount": 92,
    "overview": "Turnkey memory verification IP for next-generation AI and mobile memory subsystems, verifying physical and link layers seamlessly.",
    "features": [
      "Multi-die HBM3 & LPDDR5X Support",
      "Real-time Timing Assertions & JEDEC Checks",
      "Dynamic Frequency Scaling Verification"
    ],
    "benefits": [
      "First-pass silicon success",
      "Fast debugging with visual wave tracking",
      "Multi-simulator vendor support"
    ],
    "useCases": [
      "Edge AI Chips",
      "Mobile 5G Processors",
      "Graphics & Neural Processing Units"
    ],
    "resources": {
      "websiteUrl": "https://www.truechip.net/product/verification-ip"
    }
  },
  {
    "id": "prod-truechip-6",
    "name": "RISC-V Verification Suite & TileLink VIP",
    "tagline": "Comprehensive Open-Architecture Core Verification",
    "company": "Truechip Solutions",
    "category": "Verification IP & EDA",
    "booth": "Hall 1 · A-02",
    "image": "/images/exhibitors/truechip.png",
    "views": 610,
    "enquiries": 38,
    "interestedVisitorsCount": 85,
    "overview": "End-to-end RISC-V processor testbenches covering TileLink cache coherency, JTAG DTM, PLIC/CLINT interrupt controllers, and custom ISA extensions.",
    "features": [
      "TileLink TL-UL, TL-UH, and TL-C Support",
      "Custom Instruction & Extension Checkers",
      "Automated Test Generator for Core Pipelines"
    ],
    "benefits": [
      "Accelerates indigenous silicon design cycles",
      "Validates full processor coherency",
      "Seamless integration with open-source tools"
    ],
    "useCases": [
      "Indigenous Indian Microprocessors",
      "IoT & Edge Controllers",
      "Custom AI Silicon"
    ],
    "resources": {
      "websiteUrl": "https://www.truechip.net/product/verification-ip"
    }
  },
  {
    "id": "prod-truechip-7",
    "name": "TruEye GUI Protocol Debug & Automation",
    "tagline": "Intelligent Visual Protocol Analyzer & Debugger",
    "company": "Truechip Solutions",
    "category": "Verification IP & EDA",
    "booth": "Hall 1 · A-02",
    "image": "/images/exhibitors/truechip.png",
    "views": 590,
    "enquiries": 36,
    "interestedVisitorsCount": 78,
    "overview": "Proprietary GUI-based protocol debug environment providing transaction-level visualization, performance analytics, and automated packet tracing.",
    "features": [
      "Transaction-Level Waveform & Packet Viewer",
      "Real-time Bandwidth & Latency Analytics",
      "Automated Protocol Bug Diagnosis"
    ],
    "benefits": [
      "Reduces debug cycles by up to 60%",
      "Intuitive graphical trace timeline",
      "Cross-platform support for major EDA tools"
    ],
    "useCases": [
      "SoC Verification Engineers",
      "Firmware Development Teams",
      "Post-Silicon Validation"
    ],
    "resources": {
      "websiteUrl": "https://www.truechip.net/automation-products.php"
    }
  },
  {
    "id": "prod-cdac-1",
    "name": "VEGA RISC-V Microprocessor Ecosystem",
    "tagline": "Indigenous Open-Architecture Processors",
    "company": "CDAC",
    "category": "R&D & Computing",
    "booth": "Hall 1 · A-05",
    "image": "/images/exhibitors/cdac.png",
    "views": 820,
    "enquiries": 74,
    "interestedVisitorsCount": 165,
    "overview": "India's indigenous 32-bit and 64-bit RISC-V processor family designed by C-DAC under the Microprocessor Development Programme (MDP).",
    "features": [
      "Single & Dual Core Variants",
      "Linux & RTOS Support",
      "Integrated Security Blocks"
    ],
    "benefits": [
      "Sovereign silicon trust",
      "No proprietary architecture royalties",
      "Ideal for strategic electronics"
    ],
    "useCases": [
      "Smart Energy Meters",
      "Industrial Automation",
      "Strategic Systems"
    ],
    "resources": {
      "websiteUrl": "https://cdac.in"
    }
  },
  {
    "id": "prod-scl-1",
    "name": "180nm CMOS Foundry Fabrication",
    "tagline": "Sovereign Silicon Wafer Fab Services",
    "company": "SCL Mohali",
    "category": "Semiconductor Fabrication",
    "booth": "Hall 1 · A-07",
    "image": "/images/exhibitors/scl.png",
    "views": 930,
    "enquiries": 88,
    "interestedVisitorsCount": 190,
    "overview": "Full turnkey 180nm CMOS and MEMS wafer fabrication services for strategic, aerospace, and commercial multi-project wafer (MPW) runs.",
    "features": [
      "8-inch Wafer Capability",
      "Radiation-Hardened Library",
      "In-house Testing & Packaging"
    ],
    "benefits": [
      "Domestic fabrication",
      "Space and defense qualified",
      "Regular MPW shuttle runs"
    ],
    "useCases": [
      "ISRO Satellite Payloads",
      "Defense Microelectronics",
      "Academic MPW Shuttles"
    ],
    "resources": {
      "websiteUrl": "https://scl.gov.in"
    }
  },
  {
    "id": "prod-analog-1",
    "name": "AD9361 High-Performance RF Agile Transceiver",
    "tagline": "Complete SDR Transceiver 70 MHz to 6.0 GHz",
    "company": "Analog Devices",
    "category": "Analog & Mixed-Signal ICs",
    "booth": "Hall 1 · G-01",
    "image": "/images/exhibitors/analogdevices.png",
    "views": 940,
    "enquiries": 92,
    "interestedVisitorsCount": 180,
    "overview": "Highly integrated radio frequency (RF) transceiver capable of wideband communications, point-to-point communication systems, and defense electronics.",
    "features": [
      "Dual 12-bit DACs and ADCs",
      "Tunable RF bandwidth 200 kHz to 56 MHz",
      "FDD and TDD Operation"
    ],
    "benefits": [
      "Compact footprint",
      "Massive BOM reduction",
      "Extensive reference designs"
    ],
    "useCases": [
      "5G Telecom Infrastructure",
      "Software-Defined Radios",
      "Defense Comms"
    ],
    "resources": {
      "websiteUrl": "https://analog.com"
    }
  },
  {
    "id": "prod-analog-2",
    "name": "LTC6811 Multi-Cell Battery Monitor IC",
    "tagline": "Automotive Precision BMS Silicon",
    "company": "Analog Devices",
    "category": "Analog & Mixed-Signal ICs",
    "booth": "Hall 1 · G-01",
    "image": "/images/exhibitors/analogdevices.png",
    "views": 810,
    "enquiries": 65,
    "interestedVisitorsCount": 130,
    "overview": "Measures up to 12 series connected battery cells with total measurement error under 1.2mV. IsoSPI isolated serial interface enables high-voltage EV packs.",
    "features": [
      "AEC-Q100 Qualified",
      "Built-in IsoSPI Isolated Comms",
      "Passive Cell Balancing"
    ],
    "benefits": [
      "Highest cell voltage accuracy",
      "Maximized EV battery life",
      "ASIL-D compliant design"
    ],
    "useCases": [
      "Electric Vehicles (2W/3W/4W)",
      "Grid Energy Storage",
      "High-Voltage Industrial Battery Systems"
    ],
    "resources": {
      "websiteUrl": "https://analog.com"
    }
  },
  {
    "id": "prod-teradyne-1",
    "name": "UltraFLEXplus Advanced Test Platform",
    "tagline": "Industry-Leading Semiconductor ATE System",
    "company": "Teradyne",
    "category": "ATE & Testing Solutions",
    "booth": "Hall 2 · E-07",
    "image": "/images/exhibitors/teradyne.png",
    "views": 790,
    "enquiries": 60,
    "interestedVisitorsCount": 140,
    "overview": "Delivers maximum throughput and lowest cost-of-test for high-complexity AI processors, mobile APs, and automotive automotive radar devices.",
    "features": [
      "PACE Multi-Site Architecture",
      "Extreme Pin-Count Density",
      "Ultra-Fast RF Instrumentation"
    ],
    "benefits": [
      "Fastest yield learning",
      "Reduced test time per device",
      "Proven worldwide production footprint"
    ],
    "useCases": [
      "OSAT Production Testing",
      "AI Processor Validation",
      "Automotive MCU Screening"
    ],
    "resources": {
      "websiteUrl": "https://teradyne.com"
    }
  },
  {
    "id": "prod-indiesemic-1",
    "name": "Automotive Radar & Sensor Fusion SoC",
    "tagline": "Next-Gen 77GHz Radar Processor",
    "company": "Indiesemic Private Limited",
    "category": "Fabless Semiconductor",
    "booth": "Hall 2 · E-03",
    "image": "/images/exhibitors/indiesemic.png",
    "views": 660,
    "enquiries": 48,
    "interestedVisitorsCount": 115,
    "overview": "Integrated fabless chip combining multi-channel FMCW radar processing, DSP algorithms, and CAN-FD interface for ADAS safety systems.",
    "features": [
      "AEC-Q100 Grade 1",
      "Hardware Radar FFT Accelerator",
      "Integrated Power Management"
    ],
    "benefits": [
      "Direct sensor-to-ECU telemetry",
      "Compact sensor head design",
      "Optimized power dissipation"
    ],
    "useCases": [
      "Automotive ADAS",
      "Autonomous Industrial AGVs",
      "Perimeter Surveillance"
    ],
    "resources": {
      "websiteUrl": "https://indiesemic.com"
    }
  },
  {
    "id": "prod-rackbank-1",
    "name": "Green AI GPU Cloud & Datacenter Facility",
    "tagline": "Sustainable Computing for Chip EDA Workloads",
    "company": "RackBank Datacenters Pvt Ltd",
    "category": "Data Centers & Cloud",
    "booth": "Hall 1 · A-10",
    "image": "/images/exhibitors/rackbank.png",
    "views": 740,
    "enquiries": 58,
    "interestedVisitorsCount": 125,
    "overview": "Tier-3 green datacenter campus located in Indore, Madhya Pradesh offering high-density liquid cooling for massive silicon simulation and EDA regressions.",
    "features": [
      "100% Green Energy Pledges",
      "Liquid-Cooled GPU Racks",
      "Ultra-Low Latency Fiber Ring"
    ],
    "benefits": [
      "Lower operational costs for EDA compute",
      "Secure sovereign Indian cloud hosting",
      "Zero water-waste cooling"
    ],
    "useCases": [
      "Semiconductor Simulation",
      "AI Model Fine-tuning",
      "Fabless Design R&D Teams"
    ],
    "resources": {
      "websiteUrl": "https://rackbank.com"
    }
  },
  {
    "id": "prod-pine-1",
    "name": "Semiconductor Tapeout & STA Certification",
    "tagline": "Hands-on VLSI Physical Design Masterclass",
    "company": "PinE Training Academy",
    "category": "VLSI Training Academy",
    "booth": "Hall 2 · F-03",
    "image": "/images/exhibitors/pine.png",
    "views": 630,
    "enquiries": 50,
    "interestedVisitorsCount": 112,
    "overview": "Intensive training program tailored for engineering graduates and VLSI professionals covering advanced synthesis, PnR, Static Timing Analysis, and DRC/LVS.",
    "features": [
      "Real PDKs and EDA Tool Flow",
      "Mentorship from Silicon Veterans",
      "100% Placement Record"
    ],
    "benefits": [
      "Job-ready silicon engineers",
      "Bridges academia-industry gap",
      "Hands-on chip tapeout experience"
    ],
    "useCases": [
      "Engineering Colleges",
      "Early-career VLSI Engineers",
      "Workforce Skilling Initiatives"
    ],
    "resources": {
      "websiteUrl": "https://pinetrainingacademy.com"
    }
  }
];

export const GENERATED_ATTENDEES = generateAttendees(2389);
