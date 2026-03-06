/**
 * DealBot AI Widget
 * Embeddable chat widget for any webpage
 */

(function() {
    const API_URL = 'http://localhost:5000';
    const sessionId = 'session-' + Date.now();
    
    // Create widget HTML
    const widgetHTML = `
        <style>
            #dealbot-widget-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                font-family: 'Amazon Ember', Arial, sans-serif;
            }
            
            #dealbot-chat-button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: #FF9900;
                border: none;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                transition: all 0.3s;
            }
            
            #dealbot-chat-button:hover {
                transform: scale(1.1);
                background: #FA8900;
            }
            
            #dealbot-chat-popup {
                display: none;
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 1000px;
                height: 800px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                flex-direction: column;
                overflow: hidden;
                border: 1px solid #D5D9D9;
            }
            
            #dealbot-chat-popup.open {
                display: flex;
                animation: slideUp 0.3s ease-out;
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .dealbot-header {
                background: #232F3E;
                color: white;
                padding: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .dealbot-header-left {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .dealbot-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 700;
            }
            
            .dealbot-minimize {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: background 0.2s;
            }
            
            .dealbot-minimize:hover {
                background: rgba(255,255,255,0.1);
            }
            
            .dealbot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                background: #FFFFFF;
            }
            
            .dealbot-message {
                margin-bottom: 12px;
                display: flex;
                animation: fadeIn 0.3s;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .dealbot-message.user {
                justify-content: flex-end;
            }
            
            .dealbot-message-content {
                max-width: 75%;
                padding: 10px 14px;
                border-radius: 8px;
                word-wrap: break-word;
                line-height: 1.4;
                font-size: 14px;
            }
            
            .dealbot-message.user .dealbot-message-content {
                background: #FF9900;
                color: #232F3E;
                font-weight: 500;
            }
            
            .dealbot-message.agent .dealbot-message-content {
                background: #F7F8F8;
                color: #0F1111;
                border: 1px solid #D5D9D9;
            }
            
            .dealbot-input-container {
                padding: 12px 16px;
                background: #F7F8F8;
                border-top: 1px solid #D5D9D9;
            }
            
            .dealbot-input-form {
                display: flex;
                gap: 8px;
            }
            
            .dealbot-input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #888C8C;
                border-radius: 4px;
                font-size: 14px;
                outline: none;
                background: white;
                color: #0F1111;
            }
            
            .dealbot-input:focus {
                border-color: #FF9900;
                box-shadow: 0 0 0 2px rgba(255, 153, 0, 0.1);
            }
            
            .dealbot-send {
                padding: 8px 16px;
                background: #FF9900;
                color: #0F1111;
                border: 1px solid #FF9900;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .dealbot-send:hover {
                background: #FA8900;
            }
            
            .dealbot-send:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .dealbot-typing {
                display: none;
                padding: 10px 14px;
                background: #F7F8F8;
                border: 1px solid #D5D9D9;
                border-radius: 8px;
                width: fit-content;
            }
            
            .dealbot-typing.active {
                display: block;
            }
            
            .dealbot-typing span {
                display: inline-block;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #FF9900;
                margin: 0 2px;
                animation: typing 1.4s infinite;
            }
            
            .dealbot-typing span:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .dealbot-typing span:nth-child(3) {
                animation-delay: 0.4s;
            }
            
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-8px); }
            }
            
            .dealbot-messages::-webkit-scrollbar {
                width: 6px;
            }
            
            .dealbot-messages::-webkit-scrollbar-track {
                background: #F7F8F8;
            }
            
            .dealbot-messages::-webkit-scrollbar-thumb {
                background: #D5D9D9;
                border-radius: 3px;
            }
            
            /* Mobile responsive */
            @media (max-width: 480px) {
                #dealbot-chat-popup {
                    width: calc(100vw - 40px);
                    height: calc(100vh - 120px);
                    right: 20px;
                    bottom: 90px;
                }
            }
        </style>
        
        <div id="dealbot-widget-container">
            <button id="dealbot-chat-button" aria-label="Open DealBot AI Chat">
                🤝
            </button>
            
            <div id="dealbot-chat-popup">
                <div class="dealbot-header">
                    <div class="dealbot-header-left">
                        <span>🤝</span>
                        <h3>DealBot AI</h3>
                    </div>
                    <button class="dealbot-minimize" id="dealbot-minimize-btn" aria-label="Minimize chat">−</button>
                </div>
                
                <div class="dealbot-messages" id="dealbot-messages">
                    <!-- Messages will be added dynamically -->
                </div>
                
                <div class="dealbot-input-container">
                    <form class="dealbot-input-form" id="dealbot-form">
                        <input 
                            type="text" 
                            class="dealbot-input" 
                            id="dealbot-input" 
                            placeholder="Ask about deals..."
                            autocomplete="off"
                        >
                        <button type="submit" class="dealbot-send" id="dealbot-send">Send</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Initialize widget
    function initWidget() {
        // Inject HTML
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
        
        // Get elements
        const chatButton = document.getElementById('dealbot-chat-button');
        const chatPopup = document.getElementById('dealbot-chat-popup');
        const minimizeBtn = document.getElementById('dealbot-minimize-btn');
        const form = document.getElementById('dealbot-form');
        const input = document.getElementById('dealbot-input');
        const messages = document.getElementById('dealbot-messages');
        const sendBtn = document.getElementById('dealbot-send');
        
        // Flag to track if initial message was sent
        let initialMessageSent = false;
        let greetingShown = false;
        
        // Show greeting message
        function showGreeting() {
            if (greetingShown) return;
            addMessage('🤖 Hi! I\'m DealBot AI\n\nYour smart assistant for finding the best Amazon deals and negotiating prices.\n\nI see you\'re interested in the Amazon Fire HD 10 Tablet. Let me help you get the best possible price! 💰');
            greetingShown = true;
        }
        
        // Toggle chat
        chatButton.addEventListener('click', () => {
            chatPopup.classList.toggle('open');
            if (chatPopup.classList.contains('open')) {
                input.focus();
                // Show greeting first
                showGreeting();
                // Send initial message when opening for the first time
                if (!initialMessageSent) {
                    sendInitialMessage();
                    initialMessageSent = true;
                }
            }
        });
        
        // Minimize chat (keeps messages)
        minimizeBtn.addEventListener('click', () => {
            chatPopup.classList.remove('open');
        });
        
        // Send initial message automatically (silently - don't show user message)
        async function sendInitialMessage() {
            const initialMessage = "I want to negotiate the price for this product: Fire HD 10 Tablet Current Price: $139.99";
            
            // Don't show the user message - send silently
            sendBtn.disabled = true;
            input.disabled = true;
            
            showTyping();
            
            const response = await sendMessage(initialMessage);
            
            hideTyping();
            addMessage(response); // Only show agent's response
            
            sendBtn.disabled = false;
            input.disabled = false;
        }
        
        // Listen for custom event from openDealBot
        document.addEventListener('dealbot-greeting', () => {
            showGreeting();
        });
        
        document.addEventListener('dealbot-opened', () => {
            if (!window.dealbotInitialMessageSent) {
                sendInitialMessage();
                window.dealbotInitialMessageSent = true;
            }
        });
        
        // Toggle chat
        chatButton.addEventListener('click', () => {
            chatPopup.classList.toggle('open');
            if (chatPopup.classList.contains('open')) {
                input.focus();
            }
        });
        
        // Minimize chat (keeps messages)
        minimizeBtn.addEventListener('click', () => {
            chatPopup.classList.remove('open');
        });
        
        // Add message
        function addMessage(content, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `dealbot-message ${isUser ? 'user' : 'agent'}`;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'dealbot-message-content';
            
            // Handle line breaks
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                contentDiv.appendChild(document.createTextNode(line));
                if (index < lines.length - 1) {
                    contentDiv.appendChild(document.createElement('br'));
                }
            });
            
            messageDiv.appendChild(contentDiv);
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }
        
        // Show typing
        function showTyping() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'dealbot-message agent';
            typingDiv.id = 'dealbot-typing-indicator';
            
            const indicator = document.createElement('div');
            indicator.className = 'dealbot-typing active';
            indicator.innerHTML = '<span></span><span></span><span></span>';
            
            typingDiv.appendChild(indicator);
            messages.appendChild(typingDiv);
            messages.scrollTop = messages.scrollHeight;
        }
        
        // Hide typing
        function hideTyping() {
            const typing = document.getElementById('dealbot-typing-indicator');
            if (typing) typing.remove();
        }
        
        // Send message
        async function sendMessage(message) {
            try {
                const response = await fetch(`${API_URL}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: message,
                        session_id: sessionId
                    })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                return data.response;
                
            } catch (error) {
                console.error('DealBot Error:', error);
                return `Error: ${error.message}. Make sure the API server is running.`;
            }
        }
        
        // Handle form submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const message = input.value.trim();
            if (!message) return;
            
            addMessage(message, true);
            input.value = '';
            
            sendBtn.disabled = true;
            input.disabled = true;
            
            showTyping();
            
            const response = await sendMessage(message);
            
            hideTyping();
            addMessage(response);
            
            sendBtn.disabled = false;
            input.disabled = false;
            input.focus();
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }
    
    // Expose global function to open chat
    window.openDealBot = function() {
        const chatPopup = document.getElementById('dealbot-chat-popup');
        const input = document.getElementById('dealbot-input');
        if (chatPopup) {
            const wasOpen = chatPopup.classList.contains('open');
            chatPopup.classList.add('open');
            if (input) input.focus();
            
            // Show greeting first
            if (!wasOpen && !window.dealbotGreetingShown) {
                const event = new CustomEvent('dealbot-greeting');
                document.dispatchEvent(event);
                window.dealbotGreetingShown = true;
            }
            
            // Send initial message when opening for the first time
            if (!wasOpen && !window.dealbotInitialMessageSent) {
                // Trigger the initial message
                const event = new CustomEvent('dealbot-opened');
                document.dispatchEvent(event);
            }
        }
    };
    
    // Expose global function to close chat
    window.closeDealBot = function() {
        const chatPopup = document.getElementById('dealbot-chat-popup');
        if (chatPopup) {
            chatPopup.classList.remove('open');
        }
    };
    
    // Expose global function to toggle chat
    window.toggleDealBot = function() {
        const chatPopup = document.getElementById('dealbot-chat-popup');
        if (chatPopup) {
            if (chatPopup.classList.contains('open')) {
                window.closeDealBot();
            } else {
                window.openDealBot();
            }
        }
    };
})();
