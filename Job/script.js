// Job Data
const jobs = [
    {
        id: 1,
        title: "Frontend Developer (React)",
        company: "Google",
        location: "Bangalore, India",
        type: "Full-time",
        salary: "₹15 - ₹25 LPA",
        logo: "https://logo.clearbit.com/google.com",
        description: "We're looking for a skilled Frontend Developer to join our team. You'll work with React, TypeScript, and modern frontend tools to build amazing user experiences for our millions of users worldwide.",
        requirements: [
            "3+ years of experience with React.js",
            "Strong JavaScript/TypeScript skills",
            "Experience with state management (Redux, Context API)",
            "Knowledge of modern CSS frameworks (Tailwind, Sass)"
        ],
        benefits: [
            "Competitive salary and bonuses",
            "Flexible work arrangements",
            "Health insurance and wellness programs",
            "Continuous learning opportunities"
        ],
        tags: ["React", "JavaScript", "TypeScript", "UI/UX"]
    },
    {
        id: 2,
        title: "Full Stack Developer",
        company: "Zoho",
        location: "Chennai, India",
        type: "Full-time",
        salary: "₹12 - ₹20 LPA",
        logo: "https://logo.clearbit.com/zoho.com",
        description: "Join Zoho's product team to build scalable web applications. We work with Java, React, and our own frameworks. Experience with databases and APIs is a plus. You'll work on products used by millions of businesses globally.",
        requirements: [
            "Strong knowledge of Java and Spring Boot",
            "Experience with React or similar frontend frameworks",
            "Understanding of relational databases",
            "Problem-solving skills"
        ],
        benefits: [
            "Work on impactful products",
            "Great work-life balance",
            "On-campus amenities",
            "Stock options"
        ],
        tags: ["Java", "React", "MySQL", "REST API"]
    },
    {
        id: 3,
        title: "AI Engineer",
        company: "Microsoft",
        location: "Hyderabad, India",
        type: "Full-time",
        salary: "₹20 - ₹35 LPA",
        logo: "https://logo.clearbit.com/microsoft.com",
        description: "Work on cutting-edge AI projects with our research team. You'll develop machine learning models, work with large datasets, and deploy AI solutions at scale that impact millions of users.",
        requirements: [
            "Degree in Computer Science or related field",
            "Experience with Python and ML frameworks",
            "Knowledge of NLP or computer vision",
            "Strong mathematical background"
        ],
        benefits: [
            "Work with world-class researchers",
            "Competitive compensation",
            "Cutting-edge technology stack",
            "Global career opportunities"
        ],
        tags: ["Python", "Machine Learning", "TensorFlow", "NLP"]
    }
];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const jobCards = document.querySelectorAll('.job-card');
const jobModal = document.getElementById('jobModal');
const closeModal = document.getElementById('closeModal');
const modalJobTitle = document.getElementById('modalJobTitle');
const modalCompany = document.getElementById('modalCompany');
const modalLogo = document.getElementById('modalLogo');
const modalJobMeta = document.getElementById('modalJobMeta');
const modalJobDescription = document.getElementById('modalJobDescription');
const modalRequirements = document.getElementById('modalRequirements');
const modalBenefits = document.getElementById('modalBenefits');

// Search Functionality
searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    
    if (searchTerm.length < 2) {
        searchResults.style.display = 'none';
        return;
    }
    
    const filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm) || 
        job.company.toLowerCase().includes(searchTerm) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    
    displaySearchResults(filteredJobs);
});

function displaySearchResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item"><p>No jobs found</p></div>';
        searchResults.style.display = 'block';
        return;
    }
    
    results.forEach(job => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <h4>${job.title}</h4>
            <p>${job.company} • ${job.location}</p>
        `;
        resultItem.addEventListener('click', () => {
            openJobModal(job);
            searchResults.style.display = 'none';
            searchInput.value = '';
        });
        searchResults.appendChild(resultItem);
    });
    
    searchResults.style.display = 'block';
}

// Close search results when clicking outside
document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) ){
        searchResults.style.display = 'none';
    }
});

// Job Modal Functionality
jobCards.forEach(card => {
    card.addEventListener('click', function() {
        const jobId = parseInt(this.getAttribute('data-job-id'));
        const job = jobs.find(j => j.id === jobId);
        openJobModal(job);
    });
});

function openJobModal(job) {
    modalJobTitle.textContent = job.title;
    modalCompany.textContent = job.company;
    modalLogo.src = job.logo;
    modalJobDescription.textContent = job.description;
    
    // Clear previous meta
    modalJobMeta.innerHTML = '';
    
    // Add meta items
    const metaItems = [
        { icon: 'fas fa-map-marker-alt', text: job.location },
        { icon: 'fas fa-briefcase', text: job.type },
        { icon: 'fas fa-money-bill-wave', text: job.salary }
    ];
    
    metaItems.forEach(item => {
        const metaItem = document.createElement('div');
        metaItem.className = 'modal-meta-item';
        metaItem.innerHTML = `<i class="${item.icon}"></i><span>${item.text}</span>`;
        modalJobMeta.appendChild(metaItem);
    });
    
    // Add requirements
    modalRequirements.innerHTML = '';
    job.requirements.forEach(req => {
        const li = document.createElement('li');
        li.textContent = req;
        modalRequirements.appendChild(li);
    });
    
    // Add benefits
    modalBenefits.innerHTML = '';
    job.benefits.forEach(benefit => {
        const li = document.createElement('li');
        li.textContent = benefit;
        modalBenefits.appendChild(li);
    });
    
    // Show modal
    jobModal.classList.add('active');
}

// Close modal
closeModal.addEventListener('click', () => {
    jobModal.classList.remove('active');
});

// Close modal when clicking outside
jobModal.addEventListener('click', (e) => {
    if (e.target === jobModal) {
        jobModal.classList.remove('active');
    }
});