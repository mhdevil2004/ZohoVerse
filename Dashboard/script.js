document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Chatbot Toggle
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const chatbotWindow = document.querySelector('.chatbot-window');
    const closeChatbot = document.querySelector('.close-chatbot');
    
    chatbotToggle.addEventListener('click', function() {
        chatbotWindow.classList.toggle('active');
    });
    
    closeChatbot.addEventListener('click', function() {
        chatbotWindow.classList.remove('active');
    });
    
    // Simulate chatbot interaction
    const chatbotInput = document.querySelector('.chatbot-input input');
    const chatbotMessages = document.querySelector('.chatbot-messages');
    
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim() !== '') {
            // Add user message
            const userMessage = document.createElement('div');
            userMessage.className = 'message user';
            userMessage.innerHTML = `
                <div class="message-content">
                    <p>${this.value}</p>
                </div>
                <div class="message-time">Just now</div>
            `;
            chatbotMessages.appendChild(userMessage);
            
            // Simulate AI response
            setTimeout(() => {
                const aiMessage = document.createElement('div');
                aiMessage.className = 'message ai';
                aiMessage.innerHTML = `
                    <div class="message-content">
                        <p>I'm an AI assistant and I received your message: "${this.value}". How can I help you further?</p>
                    </div>
                    <div class="message-time">Just now</div>
                `;
                chatbotMessages.appendChild(aiMessage);
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            }, 1000);
            
            this.value = '';
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
    });
    
    // Mobile sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Simulate chart data loading
    setTimeout(() => {
        // In a real implementation, this would be replaced with actual chart library initialization
        console.log('Charts loaded with sample data');
    }, 500);
    
    // Sample notification dropdown (would be implemented fully in a real app)
    const notificationBtn = document.querySelector('.notification');
    notificationBtn.addEventListener('click', function() {
        alert('Notifications would appear here in a full implementation');
    });
    
    // Sample profile dropdown (would be implemented fully in a real app)
    const profileDropdown = document.querySelector('.profile-dropdown');
    profileDropdown.addEventListener('click', function() {
        alert('Profile dropdown menu would appear here in a full implementation');
    });
});