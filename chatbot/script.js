document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const authModal = document.getElementById('authModal');
    const closeModal = document.getElementById('closeModal');
    const authForm = document.getElementById('authForm');
    const modalTitle = document.getElementById('modalTitle');
    const submitAuth = document.getElementById('submitAuth');
    const toggleAuth = document.getElementById('toggleAuth');
    const toggleText = document.getElementById('toggleText');
    const confirmPasswordField = document.getElementById('confirmPasswordField');
    const authBtn = document.getElementById('authBtn');
    const mobileAuthBtn = document.getElementById('mobileAuthBtn');
    const themeToggle = document.getElementById('themeToggle');
    const menuToggle = document.getElementById('menuToggle');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const sidebar = document.getElementById('sidebar');
    const promptInput = document.getElementById('prompt');
    const submitBtn = document.getElementById('submit');
    const quickPromptBtns = document.querySelectorAll('.quick-prompt-btn');
    const chatMessages = document.querySelector('.chat-messages');
    
    // State
    let isLoginMode = true;
    let currentUser = localStorage.getItem('currentUser');
    let chatHistory = [];

    // API Keys
    const GEMINI_API_KEY = 'AIzaSyDX2mK2IyG50Pl2cGpvz7vLm0refBgjorM';
    const YOUTUBE_API_KEY = 'AIzaSyD0Rpp2PJGzn1zSwARYWcAyiDyykKhc4hQ';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

    // Knowledge base for quick explanations
    const knowledgeBase = {
        "what is an array": "An array is a linear data structure that stores elements of the same type in contiguous memory locations. It allows random access to elements using indices.",
        "what is a linked list": "A linked list is a linear data structure where elements are stored in nodes, and each node points to the next node using pointers.",
        "what is javascript": "JavaScript is a scripting language used to create and control dynamic website content like animations, interactive forms, and responsive interfaces.",
        "what is react": "React is a JavaScript library for building user interfaces, particularly single-page applications with reusable UI components."
    };

    // Initialize UI
    function initUI() {
        if (currentUser) {
            updateAuthButtons(currentUser);
        }
        
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
            themeToggle.innerHTML = `<i class="uil uil-sun"></i><span>Light mode</span>`;
        }
    }

    // Update auth buttons with username
    function updateAuthButtons(username) {
        const userHtml = `<i class="uil uil-user"></i><span>Welcome, ${username}</span>`;
        authBtn.innerHTML = userHtml;
        mobileAuthBtn.innerHTML = userHtml;
    }

    // Toggle between login and register
    function toggleAuthMode() {
        isLoginMode = !isLoginMode;
        
        if (isLoginMode) {
            modalTitle.textContent = 'Login';
            submitAuth.textContent = 'Login';
            toggleText.textContent = "Don't have an account? ";
            toggleAuth.textContent = 'Register';
            confirmPasswordField.classList.add('hidden');
        } else {
            modalTitle.textContent = 'Register';
            submitAuth.textContent = 'Register';
            toggleText.textContent = "Already have an account? ";
            toggleAuth.textContent = 'Login';
            confirmPasswordField.classList.remove('hidden');
        }
    }

    // Handle auth form submission
    function handleAuthSubmit(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!isLoginMode) {
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (password !== confirmPassword) {
                alert("Passwords don't match!");
                return;
            }
        }
        
        currentUser = username;
        localStorage.setItem('currentUser', username);
        updateAuthButtons(username);
        authModal.classList.add('hidden');
        authForm.reset();
    }

    // Open auth modal
    function openAuthModal() {
        if (!isLoginMode) toggleAuthMode();
        authModal.classList.remove('hidden');
    }

    // Close auth modal
    function closeAuthModal() {
        authModal.classList.add('hidden');
        authForm.reset();
    }

    // Toggle dark/light theme
    function toggleTheme() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', isDark);
        
        if (isDark) {
            themeToggle.innerHTML = `<i class="uil uil-sun"></i><span>Light mode</span>`;
        } else {
            themeToggle.innerHTML = `<i class="uil uil-moon"></i><span>Dark mode</span>`;
        }
    }

    // Toggle sidebar on mobile
    function toggleSidebar() {
        sidebar.classList.toggle('-translate-x-full');
        mobileOverlay.classList.toggle('hidden');
        document.body.classList.toggle('overflow-hidden');
    }

    // Get simple explanation from knowledge base
    function getSimpleExplanation(query) {
        const lowerQuery = query.toLowerCase();
        for (const [key, value] of Object.entries(knowledgeBase)) {
            if (lowerQuery.includes(key)) {
                return value;
            }
        }
        return null;
    }

    // Fetch YouTube videos related to query
    async function fetchYouTubeVideos(query) {
        try {
            const response = await fetch(`${YOUTUBE_API_URL}?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${YOUTUBE_API_KEY}&type=video&maxResults=3`);
            
            if (!response.ok) {
                throw new Error(`YouTube API request failed with status ${response.status}`);
            }

            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error("Error fetching YouTube videos:", error);
            return getFallbackVideos(query);
        }
    }

    // Fallback videos if API fails
    function getFallbackVideos(query) {
        const fallbackVideos = {
            "array": [
                {
                    id: { videoId: "NptnmWvke9U" },
                    snippet: {
                        title: "Arrays in One Shot | C++ | College Wallah",
                        channelTitle: "Apna College",
                        thumbnails: {
                            medium: {
                                url: "https://i.ytimg.com/vi/NptnmWvke9U/mqdefault.jpg"
                            }
                        }
                    }
                },
                {
                    id: { videoId: "RBSGKlAvoiM" },
                    snippet: {
                        title: "Complete Array Data Structure | Lecture 1",
                        channelTitle: "take U forward",
                        thumbnails: {
                            medium: {
                                url: "https://i.ytimg.com/vi/RBSGKlAvoiM/mqdefault.jpg"
                            }
                        }
                    }
                }
            ],
            "linked list": [
                // Similar structure for linked list videos
            ]
        };

        const lowerQuery = query.toLowerCase();
        for (const [key, videos] of Object.entries(fallbackVideos)) {
            if (lowerQuery.includes(key)) {
                return videos;
            }
        }
        return [];
    }

    // Display YouTube videos in chat
    function displayYouTubeVideos(videos) {
        if (videos.length === 0) return;

        const videosContainer = document.createElement('div');
        videosContainer.className = 'flex justify-start mb-4';
        
        let videosHTML = `
            <div class="max-w-[80%] rounded-lg p-4 bg-gray-200 dark:bg-gray-700">
                <h3 class="font-semibold mb-2">Recommended Videos:</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        `;

        videos.forEach(video => {
            videosHTML += `
                <a href="https://youtube.com/watch?v=${video.id.videoId}" target="_blank" class="block hover:opacity-90">
                    <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}" class="rounded-lg w-full">
                    <p class="text-sm mt-1 line-clamp-2">${video.snippet.title}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">${video.snippet.channelTitle}</p>
                </a>
            `;
        });

        videosHTML += `</div></div>`;
        videosContainer.innerHTML = videosHTML;
        chatMessages.appendChild(videosContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send message to Gemini API
    async function sendToGemini(message) {
        try {
            chatHistory.push({
                role: "user",
                parts: [{ text: message }]
            });

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: chatHistory,
                    generationConfig: {
                        maxOutputTokens: 1000
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error(errorData.error?.message || "API request failed");
            }

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;

            chatHistory.push({
                role: "model",
                parts: [{ text: aiResponse }]
            });

            return aiResponse;
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            return "I'm having trouble responding right now. Please try again later.";
        }
    }

    // Send message function
    async function sendMessage() {
        const message = promptInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            promptInput.value = '';
            
            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'flex justify-start mb-4';
            typingIndicator.innerHTML = `
                <div class="max-w-[80%] rounded-lg p-4 bg-gray-200 dark:bg-gray-700">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // First try to get simple explanation
            const simpleExplanation = getSimpleExplanation(message);
            
            if (simpleExplanation) {
                // Remove typing indicator
                chatMessages.removeChild(typingIndicator);
                
                // Add explanation
                addMessage(simpleExplanation, 'ai');
                
                // Fetch and show YouTube videos
                const videos = await fetchYouTubeVideos(message);
                displayYouTubeVideos(videos);
            } else {
                // Get response from Gemini
                const response = await sendToGemini(message);
                
                // Remove typing indicator
                chatMessages.removeChild(typingIndicator);
                
                // Add Gemini's response
                addMessage(response, 'ai');
                
                // Still try to show YouTube videos for programming topics
                if (message.toLowerCase().includes('what is') || 
                    message.toLowerCase().includes('explain') ||
                    message.toLowerCase().includes('programming') ||
                    message.toLowerCase().includes('code')) {
                    const videos = await fetchYouTubeVideos(message);
                    displayYouTubeVideos(videos);
                }
            }
        }
    }

    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex justify-${sender === 'user' ? 'end' : 'start'} mb-4`;
        messageDiv.innerHTML = `
            <div class="max-w-[80%] rounded-lg p-4 ${
                sender === 'user' 
                    ? 'bg-primary-light dark:bg-primary-dark text-white' 
                    : 'bg-gray-200 dark:bg-gray-700'
            }">
                ${text}
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Add typing indicator CSS
    const style = document.createElement('style');
    style.textContent = `
        .typing-indicator {
            display: inline-flex;
            gap: 4px;
        }
        .typing-indicator span {
            height: 8px;
            width: 8px;
            background: #6b7280;
            border-radius: 50%;
            display: inline-block;
            animation: bounce 1.5s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
        }
        @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-5px); }
        }
    `;
    document.head.appendChild(style);

    // Event Listeners
    authBtn.addEventListener('click', openAuthModal);
    mobileAuthBtn.addEventListener('click', openAuthModal);
    closeModal.addEventListener('click', closeAuthModal);
    authModal.addEventListener('click', function(e) {
        if (e.target === authModal) closeAuthModal();
    });
    toggleAuth.addEventListener('click', toggleAuthMode);
    authForm.addEventListener('submit', handleAuthSubmit);
    themeToggle.addEventListener('click', toggleTheme);
    menuToggle.addEventListener('click', toggleSidebar);
    mobileOverlay.addEventListener('click', toggleSidebar);
    submitBtn.addEventListener('click', sendMessage);
    promptInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
    
    quickPromptBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            promptInput.value = this.textContent.trim();
            sendMessage();
        });
    });

    // Initialize
    initUI();
});