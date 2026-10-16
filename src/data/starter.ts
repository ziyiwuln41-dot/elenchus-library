// Candidate starter sources per theme. Each is checked against Open Library,
// OpenAlex or The Guardian before it reaches anyone's shelf; unmatched items are dropped.
// Format: "Title|Author surname". News entries are search topics.
// For "requireInTitle", a paper result is only kept if its title contains that word.

export type StarterTheme = {
  books: string[];
  papers: string[];
  news: string[];
  requireInTitle?: string;
};

export const STARTER: Record<string, StarterTheme> = {
  "science-technology": {
    books: [
      "The Anxious Generation|Haidt", "The Age of Surveillance Capitalism|Zuboff", "Amusing Ourselves to Death|Postman",
      "The Shallows|Carr", "Weapons of Math Destruction|O'Neil", "The Coming Wave|Suleyman", "Superintelligence|Bostrom",
      "Stolen Focus|Hari", "Alone Together|Turkle", "Homo Deus|Harari", "The Second Machine Age|Brynjolfsson", "Atlas of AI|Crawford",
    ],
    papers: [
      "The spread of true and false news online|Vosoughi",
      "The association between adolescent well-being and digital technology use|Orben",
      "Increases in depressive symptoms, suicide-related outcomes, and suicide rates among U.S. adolescents after 2010|Twenge",
      "The future of employment: How susceptible are jobs to computerisation|Frey",
      "Robots and Jobs: Evidence from US Labor Markets|Acemoglu",
      "Generative AI at Work|Brynjolfsson",
      "Experimental evidence on the productivity effects of generative artificial intelligence|Noy",
      "The Welfare Effects of Social Media|Allcott",
      "Google Effects on Memory: Cognitive Consequences of Having Information at Our Fingertips|Sparrow",
      "AI Tools in Society: Impacts on Cognitive Offloading and the Future of Critical Thinking|Gerlich",
      "Brain Drain: The Mere Presence of One's Own Smartphone Reduces Available Cognitive Capacity|Ward",
      "Exposure to ideologically diverse news and opinion on Facebook|Bakshy",
    ],
    news: ["artificial intelligence jobs", "social media ban children", "AI chatbots students", "facial recognition surveillance", "smartphone ban schools", "deepfakes election"],
  },
  "media-information": {
    books: [
      "Manufacturing Consent|Herman", "The Death of Expertise|Nichols", "The Filter Bubble|Pariser", "Trust Me, I'm Lying|Holiday",
      "Post-Truth|McIntyre", "The Chaos Machine|Fisher", "Network Propaganda|Benkler", "Merchants of Doubt|Oreskes",
      "This Is Not Propaganda|Pomerantsev", "Public Opinion|Lippmann", "The Attention Merchants|Wu", "Breaking News|Rusbridger",
    ],
    papers: [
      "The science of fake news|Lazer", "Social Media and Fake News in the 2016 Election|Allcott",
      "Prior exposure increases perceived accuracy of fake news|Pennycook",
      "Lazy, not biased: Susceptibility to partisan fake news is better explained by lack of reasoning than by motivated reasoning|Pennycook",
      "The echo chamber effect on social media|Cinelli", "Fake news on Twitter during the 2016 U.S. presidential election|Grinberg",
      "Shifting attention to accuracy can reduce misinformation online|Pennycook",
      "Psychological inoculation improves resilience against misinformation on social media|Roozenbeek",
      "Less than you think: Prevalence and predictors of fake news dissemination on Facebook|Guess",
      "The Agenda-Setting Function of Mass Media|McCombs", "How social media shapes polarization|Van Bavel",
      "Political Polarization on Twitter|Conover",
    ],
    news: ["misinformation social media", "press freedom journalists", "local newspapers closing", "AI generated news", "young people news TikTok", "online safety act"],
  },
  "politics-governance": {
    books: [
      "How Democracies Die|Levitsky", "Why Nations Fail|Acemoglu", "The People vs. Democracy|Mounk", "On Tyranny|Snyder",
      "The Origins of Political Order|Fukuyama", "The End of History and the Last Man|Fukuyama", "Against Elections|Reybrouck",
      "Democracy in America|Tocqueville", "On Liberty|Mill", "The Road to Serfdom|Hayek", "The Narrow Corridor|Acemoglu", "Twilight of Democracy|Applebaum",
    ],
    papers: [
      "The Danger of Deconsolidation|Foa", "On Democratic Backsliding|Bermeo",
      "Testing Theories of American Politics: Elites, Interest Groups, and Average Citizens|Gilens",
      "Modernization: Theories and Facts|Przeworski", "Some Social Requisites of Democracy|Lipset",
      "Social Pressure and Voter Turnout: Evidence from a Large-Scale Field Experiment|Gerber",
      "Democracy Does Cause Growth|Acemoglu", "The Rise of Competitive Authoritarianism|Levitsky",
      "Trump, Brexit, and the Rise of Populism: Economic Have-Nots and Cultural Backlash|Inglehart",
      "The Populist Zeitgeist|Mudde", "The Origins and Consequences of Affective Polarization in the United States|Iyengar",
      "What Democracy Is... and Is Not|Schmitter",
    ],
    news: ["democracy decline elections", "populism Europe", "young voters turnout", "freedom of speech protest", "trust in government", "AI regulation law"],
  },
  "international-relations": {
    books: [
      "The Tragedy of Great Power Politics|Mearsheimer", "The World Is Flat|Friedman", "Destined for War|Allison",
      "The Clash of Civilizations and the Remaking of World Order|Huntington", "World Order|Kissinger", "Prisoners of Geography|Marshall",
      "The Lexus and the Olive Tree|Friedman", "Globalization and Its Discontents|Stiglitz", "The Post-American World|Zakaria",
      "The Better Angels of Our Nature|Pinker", "Chip War|Miller", "The Silk Roads|Frankopan",
    ],
    papers: [
      "Cooperation Under the Security Dilemma|Jervis", "Anarchy is what states make of it|Wendt",
      "Back to the Future: Instability in Europe after the Cold War|Mearsheimer", "Kant, Liberal Legacies, and Foreign Affairs|Doyle",
      "Soft Power|Nye", "The End of History?|Fukuyama", "Rationalist explanations for war|Fearon",
      "Weaponized Interdependence: How Global Economic Networks Shape State Coercion|Farrell",
      "The China Shock: Learning from Labor-Market Adjustment to Large Changes in Trade|Autor",
      "Lilliputians' Dilemmas: Small States in International Politics|Keohane", "The Long Peace: Elements of Stability in the Postwar International System|Gaddis",
      "Why the Ukraine Crisis Is the West's Fault|Mearsheimer",
    ],
    news: ["US China rivalry", "Ukraine war", "Middle East conflict ceasefire", "United Nations reform", "tariffs trade war", "COP climate summit diplomacy"],
  },
  "society-culture": {
    books: [
      "Bowling Alone|Putnam", "This Is What Inequality Looks Like|Teo", "The Lonely Century|Hertz", "The Spirit Level|Wilkinson",
      "Strangers in Their Own Land|Hochschild", "Identity: The Demand for Dignity|Fukuyama", "The Righteous Mind|Haidt", "Evicted|Desmond",
      "The Coddling of the American Mind|Lukianoff", "Invisible Women|Criado Perez", "The Status Game|Storr", "Sapiens|Harari",
    ],
    papers: [
      "Social Relationships and Mortality Risk: A Meta-analytic Review|Holt-Lunstad", "The Strength of Weak Ties|Granovetter",
      "Bowling Alone: America's Declining Social Capital|Putnam", "The fading American dream: Trends in absolute income mobility since 1940|Chetty",
      "Where is the Land of Opportunity? The Geography of Intergenerational Mobility in the United States|Chetty",
      "Social capital I: measurement and associations with economic mobility|Chetty", "Income inequality and social dysfunction|Wilkinson",
      "Loneliness Matters: A Theoretical and Empirical Review of Consequences and Mechanisms|Hawkley",
      "The happiness-income paradox revisited|Easterlin", "High income improves evaluation of life but not emotional well-being|Kahneman",
      "A meta-analytic test of intergroup contact theory|Pettigrew",
      "Generational differences in young adults' life goals, concern for others, and civic orientation|Twenge",
    ],
    news: ["loneliness epidemic", "ageing population care", "gender pay gap", "housing young people cost of living", "falling birth rates", "social mobility class"],
  },
  "economics-work": {
    books: [
      "Poor Economics|Banerjee", "Capital in the Twenty-First Century|Piketty", "The Great Escape|Deaton", "Thinking, Fast and Slow|Kahneman",
      "Doughnut Economics|Raworth", "The Entrepreneurial State|Mazzucato", "Bullshit Jobs|Graeber", "Nudge|Thaler",
      "Freakonomics|Levitt", "The Undercover Economist|Harford", "Deaths of Despair and the Future of Capitalism|Case", "Good Economics for Hard Times|Banerjee",
    ],
    papers: [
      "The China Syndrome: Local Labor Market Effects of Import Competition in the United States|Autor",
      "Why Are There Still So Many Jobs? The History and Future of Workplace Automation|Autor",
      "The Race between Man and Machine: Implications of Technology for Growth, Factor Shares, and Employment|Acemoglu",
      "Rising morbidity and mortality in midlife among white non-Hispanic Americans in the 21st century|Case",
      "Minimum Wages and Employment: A Case Study of the Fast-Food Industry in New Jersey and Pennsylvania|Card",
      "Income Inequality in the United States, 1913-1998|Piketty", "Universal Basic Income in the United States and Advanced Countries|Hoynes",
      "Does Working from Home Work? Evidence from a Chinese Experiment|Bloom",
      "The Rise and Nature of Alternative Work Arrangements in the United States, 1995-2015|Katz",
      "The Gender Wage Gap: Extent, Trends, and Explanations|Blau", "Libertarian Paternalism|Thaler",
      "Prospect Theory: An Analysis of Decision under Risk|Kahneman",
    ],
    news: ["four day working week", "gig economy workers rights", "minimum wage", "cost of living inflation", "youth unemployment", "universal basic income"],
  },
  environment: {
    books: [
      "Silent Spring|Carson", "The Uninhabitable Earth|Wallace-Wells", "How to Avoid a Climate Disaster|Gates", "This Changes Everything|Klein",
      "The Sixth Extinction|Kolbert", "Drawdown|Hawken", "Not the End of the World|Ritchie", "Collapse|Diamond",
      "The Ministry for the Future|Robinson", "Braiding Sweetgrass|Kimmerer", "The Great Derangement|Ghosh", "Under a White Sky|Kolbert",
    ],
    papers: [
      "The Tragedy of the Commons|Hardin", "Planetary boundaries: Guiding human development on a changing planet|Steffen",
      "A safe operating space for humanity|Rockström", "Trajectories of the Earth System in the Anthropocene|Steffen",
      "Reducing food's environmental impacts through producers and consumers|Poore",
      "A review of intervention studies aimed at household energy conservation|Abrahamse",
      "The Anthropocene: Are Humans Now Overwhelming the Great Forces of Nature|Steffen", "Greening of the Earth and its drivers|Zhu",
      "Global Consequences of Land Use|Foley", "Coral Reefs Under Rapid Climate Change and Ocean Acidification|Hoegh-Guldberg",
      "Biodiversity loss and its impact on humanity|Cardinale", "The 2023 report of the Lancet Countdown on health and climate change|Romanello",
    ],
    news: ["hottest year on record climate", "COP climate summit", "renewable energy solar", "carbon tax", "biodiversity loss", "plastic pollution treaty"],
  },
  education: {
    books: [
      "The Tyranny of Merit|Sandel", "The Case Against Education|Caplan", "Creative Schools|Robinson", "Pedagogy of the Oppressed|Freire",
      "Mindset|Dweck", "Why Don't Students Like School?|Willingham", "Educated|Westover", "Range|Epstein",
      "Excellent Sheep|Deresiewicz", "The Meritocracy Trap|Markovits", "Cleverlands|Crehan", "Deschooling Society|Illich",
    ],
    papers: [
      "Matthew Effects in Reading|Stanovich", "Grit: Perseverance and passion for long-term goals|Duckworth",
      "The Power of Feedback|Hattie", "Teaching the science of learning|Weinstein",
      "Improving Students' Learning With Effective Learning Techniques|Dunlosky", "Test-Enhanced Learning|Roediger",
      "A national experiment reveals where a growth mindset improves achievement|Yeager",
      "Measuring the Impacts of Teachers II: Teacher Value-Added and Student Outcomes in Adulthood|Chetty",
      "Skill Formation and the Economics of Investing in Disadvantaged Children|Heckman",
      "Experimental Estimates of Education Production Functions|Krueger", "Generative AI can harm learning|Bastani",
      "Shadow Education: Private Supplementary Tutoring and Its Implications|Bray",
    ],
    news: ["AI in schools ChatGPT", "exam stress students", "elite universities meritocracy", "university tuition fees", "PISA results", "teacher shortage"],
  },
  "arts-culture-language": {
    books: [
      "Ways of Seeing|Berger", "The Story of Art|Gombrich", "What Is Art?|Tolstoy", "Art as Experience|Dewey",
      "Illuminations|Benjamin", "Orientalism|Said", "Culture and Imperialism|Said", "The Language Instinct|Pinker",
      "Through the Language Glass|Deutscher", "Steal Like an Artist|Kleon", "The Uses of Literacy|Hoggart", "Mythologies|Barthes",
    ],
    papers: [
      "Does Language Shape Thought?: Mandarin and English Speakers' Conceptions of Time|Boroditsky",
      "What is the evidence on the role of the arts in improving health and well-being? A scoping review|Fancourt",
      "Reading Literary Fiction Improves Theory of Mind|Kidd",
      "The art of life and death: 14 year follow-up analyses of associations between arts engagement and mortality|Fancourt",
      "Global distribution and drivers of language extinction risk|Amano", "Music and spatial task performance|Rauscher",
      "Bilingualism: consequences for mind and brain|Bialystok", "Music Lessons Enhance IQ|Schellenberg",
      "Changing Highbrow Taste: From Snob to Omnivore|Peterson",
      "Cultural Capital and School Success: The Impact of Status Culture Participation on the Grades of U.S. High School Students|DiMaggio",
      "The Standard Definition of Creativity|Runco",
    ],
    news: ["arts funding cuts", "AI art copyright artists", "endangered languages", "museum artefacts returned", "musicians streaming royalties", "books banned libraries"],
  },
  "health-ethics": {
    books: [
      "Being Mortal|Gawande", "Justice: What's the Right Thing to Do?|Sandel", "The Emperor of All Maladies|Mukherjee", "The Gene|Mukherjee",
      "The Immortal Life of Henrietta Lacks|Skloot", "Practical Ethics|Singer", "Why We Sleep|Walker", "Mountains Beyond Mountains|Kidder",
      "Bad Pharma|Goldacre", "Spillover|Quammen", "The Life You Can Save|Singer", "Principles of Biomedical Ethics|Beauchamp",
    ],
    papers: [
      "Famine, Affluence, and Morality|Singer", "The Trolley Problem|Thomson", "Why Most Published Research Findings Are False|Ioannidis",
      "Once-Weekly Semaglutide in Adults with Overweight or Obesity|Wilding",
      "Global burden of bacterial antimicrobial resistance in 2019: a systematic analysis|Murray",
      "Vaccine hesitancy: Definition, scope and determinants|MacDonald",
      "A Programmable Dual-RNA-Guided DNA Endonuclease in Adaptive Bacterial Immunity|Jinek",
      "Social determinants of health inequalities|Marmot", "The Moral Machine experiment|Awad",
      "Worldwide trends in underweight and obesity from 1990 to 2022|",
    ],
    news: ["weight loss drugs GLP-1", "antimicrobial resistance superbugs", "assisted dying law", "gene editing ethics", "healthcare costs ageing", "young people mental health services"],
  },
  "sport-leisure": {
    books: [
      "The Sports Gene|Epstein", "Bounce|Syed", "Open|Agassi", "Moneyball|Lewis", "Soccernomics|Kuper", "Born to Run|McDougall",
      "The Inner Game of Tennis|Gallwey", "Homo Ludens|Huizinga", "Four Thousand Weeks|Burkeman", "The Burnout Society|Han",
      "Leisure: The Basis of Culture|Pieper", "The Tourist Gaze|Urry",
    ],
    papers: [
      "The role of deliberate practice in the acquisition of expert performance|Ericsson",
      "Deliberate Practice and Performance in Music, Games, Sports, Education, and Professions: A Meta-Analysis|Macnamara",
      "Effect of physical inactivity on major non-communicable diseases worldwide|Lee",
      "Going for the Gold: The Economics of the Olympics|Baade",
      "Chronic Traumatic Encephalopathy in a National Football League Player|Omalu",
      "Doping in Two Elite Athletics Competitions Assessed by Randomized-Response Surveys|Ulrich",
      "Violent video game effects on aggression, empathy, and prosocial behavior in Eastern and Western countries|Anderson",
      "Spending at least 120 minutes a week in nature is associated with good health and wellbeing|White",
      "Exercise as medicine – evidence for prescribing exercise as therapy in 26 different chronic diseases|Pedersen",
    ],
    news: ["Olympics cost host city", "women's sport pay", "esports", "doping scandal", "overtourism", "screen time leisure"],
  },
  singapore: {
    books: [
      "From Third World to First|Lee", "The Singapore Story: Memoirs of Lee Kuan Yew|Lee", "Can Singapore Survive?|Mahbubani",
      "The Great Convergence|Mahbubani", "Has China Won?|Mahbubani", "Lee Kuan Yew: The Grand Master's Insights on China, the United States, and the World|Allison",
      "Living with Myths in Singapore|Loh", "Singapore's Foreign Policy: Coping with Vulnerability|Leifer",
      "The Singapore Water Story|Tortajada", "Singapore: Wealth, Power and the Culture of Control|Trocki",
      "The Lion City|Mahbubani", "Singapore: A Biography|Frost",
    ],
    papers: [
      "Singapore meritocracy", "Singapore public housing", "Singapore small state foreign policy", "Singapore water security",
      "Singapore multiracialism", "Singapore ageing population", "Singapore smart nation", "Singapore education system",
      "Singapore fertility", "Singapore Central Provident Fund", "Singapore sea level rise", "Singapore bilingual language policy",
    ],
    news: ["Singapore election", "Singapore birth rate", "Singapore heat climate", "Singapore housing", "Singapore artificial intelligence", "Singapore death penalty"],
    requireInTitle: "singapore",
  },
};
