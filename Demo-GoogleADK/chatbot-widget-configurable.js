/**
 * Configurable Chat Widget
 * Can be connected to any API endpoint
 */

(function() {
    window.initChatWidget = function(config = {}) {
        // Default configuration
        const defaults = {
            apiUrl: 'http://localhost:5000',
            chatEndpoint: '/chat',
            sessionEndpoint: '/apps/priceneg/users/root/sessions',
            runEndpoint: '/run',
            appName: 'priceneg',
            userId: 'root',
            title: 'Chat Bot',
            icon: '💬',
            primaryColor: '#FF9900',
            secondaryColor: '#232F3E',
            width: '900px',
            height: '800px',
            placeholder: 'Type your message...',
            initialMessage: null,
            sendInitialMessage: false,
            showInitialMessageInChat: false,
            position: 'bottom-right',
            buttonSize: '60px',
            sessionIdPrefix: 'chat-session',
            apiType: 'standard',
            storageKey: 'chat-widget-session-id'
        };
        
        const cfg = { ...defaults, ...config };
        
        // Generate GUID
        function generateGUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        
        // Get or create session ID
        function getSessionId() {
            let sessionId = localStorage.getItem(cfg.storageKey);
            if (!sessionId) {
                sessionId = generateGUID();
                localStorage.setItem(cfg.storageKey, sessionId);
            }
            return sessionId;
        }
        
        let sessionId = null;
        let sessionCreated = false;
        
        const positions = {
            'bottom-right': { bottom: '20px', right: '20px', top: 'auto', left: 'auto' },
            'bottom-left': { bottom: '20px', left: '20px', top: 'auto', right: 'auto' },
            'top-right': { top: '20px', right: '20px', bottom: 'auto', left: 'auto' },
            'top-left': { top: '20px', left: '20px', bottom: 'auto', right: 'auto' }
        };
        
        const pos = positions[cfg.position] || positions['bottom-right'];
        const popupBottom = cfg.position.startsWith('bottom') ? '90px' : 'auto';
        const popupTop = cfg.position.startsWith('top') ? '90px' : 'auto';

        
        // Create widget HTML
        const widgetHTML = `
            <style>
                #chat-widget-container {
                    position: fixed;
                    bottom: ${pos.bottom};
                    right: ${pos.right};
                    top: ${pos.top};
                    left: ${pos.left};
                    z-index: 9999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                }
                
                #chat-widget-button {
                    width: ${cfg.buttonSize};
                    height: ${cfg.buttonSize};
                    border-radius: 50%;
                    background: ${cfg.primaryColor};
                    border: none;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    transition: all 0.3s;
                }
                
                #chat-widget-button:hover {
                    transform: scale(1.1);
                    filter: brightness(0.95);
                }
                
                #chat-widget-popup {
                    display: none;
                    position: fixed;
                    bottom: ${popupBottom};
                    top: ${popupTop};
                    right: ${pos.right !== 'auto' ? pos.right : 'auto'};
                    left: ${pos.left !== 'auto' ? pos.left : 'auto'};
                    width: ${cfg.width};
                    height: ${cfg.height};
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    flex-direction: column;
                    overflow: hidden;
                    border: 1px solid #D5D9D9;
                }
                
                #chat-widget-popup.open {
                    display: flex;
                    animation: slideUp 0.3s ease-out;
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .chat-widget-header {
                    background: ${cfg.secondaryColor};
                    color: white;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .chat-widget-header-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .chat-widget-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 700;
                }
                
                .chat-widget-minimize {
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
                
                .chat-widget-minimize:hover {
                    background: rgba(255,255,255,0.1);
                }
                
                .chat-widget-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    background: #FFFFFF;
                }
                
                .chat-widget-message {
                    margin-bottom: 12px;
                    display: flex;
                    animation: fadeIn 0.3s;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .chat-widget-message.user {
                    justify-content: flex-end;
                }
                
                .chat-widget-message-content {
                    max-width: 75%;
                    padding: 10px 14px;
                    border-radius: 8px;
                    word-wrap: break-word;
                    line-height: 1.4;
                    font-size: 14px;
                }
                
                .chat-widget-message.user .chat-widget-message-content {
                    background: ${cfg.primaryColor};
                    color: white;
                    font-weight: 500;
                }
                
                .chat-widget-message.agent .chat-widget-message-content {
                    background: #F7F8F8;
                    color: #0F1111;
                    border: 1px solid #D5D9D9;
                }
                
                .chat-widget-input-container {
                    padding: 12px 16px;
                    background: #F7F8F8;
                    border-top: 1px solid #D5D9D9;
                }
                
                .chat-widget-input-form {
                    display: flex;
                    gap: 8px;
                }
                
                .chat-widget-input {
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid #888C8C;
                    border-radius: 4px;
                    font-size: 14px;
                    outline: none;
                    background: white;
                    color: #0F1111;
                }
                
                .chat-widget-input:focus {
                    border-color: ${cfg.primaryColor};
                    box-shadow: 0 0 0 2px ${cfg.primaryColor}33;
                }
                
                .chat-widget-send {
                    padding: 8px 16px;
                    background: ${cfg.primaryColor};
                    color: white;
                    border: 1px solid ${cfg.primaryColor};
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .chat-widget-send:hover {
                    filter: brightness(0.95);
                }
                
                .chat-widget-send:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .chat-widget-typing {
                    display: none;
                    padding: 10px 14px;
                    background: #F7F8F8;
                    border: 1px solid #D5D9D9;
                    border-radius: 8px;
                    width: fit-content;
                }
                
                .chat-widget-typing.active {
                    display: block;
                }
                
                .chat-widget-typing span {
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: ${cfg.primaryColor};
                    margin: 0 2px;
                    animation: typing 1.4s infinite;
                }
                
                .chat-widget-typing span:nth-child(2) {
                    animation-delay: 0.2s;
                }
                
                .chat-widget-typing span:nth-child(3) {
                    animation-delay: 0.4s;
                }
                
                @keyframes typing {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-8px); }
                }
                
                .chat-widget-messages::-webkit-scrollbar {
                    width: 6px;
                }
                
                .chat-widget-messages::-webkit-scrollbar-track {
                    background: #F7F8F8;
                }
                
                .chat-widget-messages::-webkit-scrollbar-thumb {
                    background: #D5D9D9;
                    border-radius: 3px;
                }
                
                @media (max-width: 768px) {
                    #chat-widget-popup {
                        width: calc(100vw - 40px);
                        height: calc(100vh - 120px);
                    }
                }
            </style>
            
            <div id="chat-widget-container">
                <button id="chat-widget-button" aria-label="Open Chat">
                    ${cfg.icon}
                </button>
                
                <div id="chat-widget-popup">
                    <div class="chat-widget-header">
                        <div class="chat-widget-header-left">
                            <span>${cfg.icon}</span>
                            <h3>${cfg.title}</h3>
                        </div>
                        <button class="chat-widget-minimize" id="chat-widget-minimize-btn" aria-label="Minimize chat">−</button>
                    </div>
                    
                    <div class="chat-widget-messages" id="chat-widget-messages">
                    </div>
                    
                    <div class="chat-widget-input-container">
                        <form class="chat-widget-input-form" id="chat-widget-form">
                            <input 
                                type="text" 
                                class="chat-widget-input" 
                                id="chat-widget-input" 
                                placeholder="${cfg.placeholder}"
                                autocomplete="off"
                            >
                            <button type="submit" class="chat-widget-send" id="chat-widget-send">Send</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', widgetHTML);

        
        const chatButton = document.getElementById('chat-widget-button');
        const chatPopup = document.getElementById('chat-widget-popup');
        const minimizeBtn = document.getElementById('chat-widget-minimize-btn');
        const form = document.getElementById('chat-widget-form');
        const input = document.getElementById('chat-widget-input');
        const messages = document.getElementById('chat-widget-messages');
        const sendBtn = document.getElementById('chat-widget-send');
        
        let initialMessageSent = false;
        let greetingShown = false;
        
        // Sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        function playSendSound() {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }
        
        function playReceiveSound() {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 600;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        }
        
        function playCelebrationSound() {
            // Play a joyful ascending melody
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                const startTime = audioContext.currentTime + (index * 0.15);
                gainNode.gain.setValueAtTime(0.3, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.3);
            });
        }
        
        function createFireworks() {
            const fireworksContainer = document.createElement('div');
            fireworksContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 99999;
            `;
            document.body.appendChild(fireworksContainer);
            
            // Create multiple firework bursts
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const x = Math.random() * window.innerWidth;
                    const y = Math.random() * (window.innerHeight / 2);
                    createFireworkBurst(fireworksContainer, x, y);
                }, i * 400);
            }
            
            // Remove container after animation
            setTimeout(() => {
                document.body.removeChild(fireworksContainer);
            }, 3000);
        }
        
        function createFireworkBurst(container, x, y) {
            const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#FF9FF3', '#54A0FF'];
            const particles = 30;
            
            for (let i = 0; i < particles; i++) {
                const particle = document.createElement('div');
                const angle = (Math.PI * 2 * i) / particles;
                const velocity = 100 + Math.random() * 100;
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                particle.style.cssText = `
                    position: absolute;
                    left: ${x}px;
                    top: ${y}px;
                    width: 8px;
                    height: 8px;
                    background: ${color};
                    border-radius: 50%;
                    box-shadow: 0 0 10px ${color};
                `;
                
                container.appendChild(particle);
                
                const dx = Math.cos(angle) * velocity;
                const dy = Math.sin(angle) * velocity;
                
                let posX = x;
                let posY = y;
                let opacity = 1;
                let frame = 0;
                
                const animate = () => {
                    frame++;
                    posX += dx * 0.02;
                    posY += dy * 0.02 + frame * 0.5; // gravity
                    opacity -= 0.02;
                    
                    particle.style.left = posX + 'px';
                    particle.style.top = posY + 'px';
                    particle.style.opacity = opacity;
                    
                    if (opacity > 0) {
                        requestAnimationFrame(animate);
                    } else {
                        container.removeChild(particle);
                    }
                };
                
                requestAnimationFrame(animate);
            }
        }
        
        // Show greeting message
        function showGreeting() {
            if (greetingShown) return;
            addMessage('🤖 Welcome! I\'m DealBot AI\n\nYour smart assistant for finding the best Amazon deals and negotiating prices 💬💰');
            greetingShown = true;
        }
        
        // Create session
        async function createSession() {
            if (sessionCreated) return true;
            
            sessionId = getSessionId();
            console.log('Creating session with ID:', sessionId);
            
            try {
                const response = await fetch(`${cfg.apiUrl}${cfg.sessionEndpoint}/${sessionId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key1: 'value1', key2: 42 })
                });
                
                if (response.ok) {
                    sessionCreated = true;
                    console.log('Session created successfully');
                    return true;
                } else {
                    console.error('Failed to create session:', response.status);
                    return false;
                }
            } catch (error) {
                console.error('Error creating session:', error);
                return false;
            }
        }
        
        // Toggle chat
        chatButton.addEventListener('click', async () => {
            chatPopup.classList.toggle('open');
            if (chatPopup.classList.contains('open')) {
                input.focus();
                
                // Show greeting first
                showGreeting();
                
                if (cfg.apiType === 'custom' && !sessionCreated) {
                    await createSession();
                }
                if (!initialMessageSent && cfg.sendInitialMessage && cfg.initialMessage) {
                    sendInitialMessage();
                    initialMessageSent = true;
                }
            }
        });
        
        minimizeBtn.addEventListener('click', () => {
            chatPopup.classList.remove('open');
        });
        
        async function sendInitialMessage() {
            sendBtn.disabled = true;
            input.disabled = true;
            
            if (cfg.showInitialMessageInChat) {
                addMessage(cfg.initialMessage, true);
            }
            
            showTyping();
            const response = await sendMessage(cfg.initialMessage);
            hideTyping();
            addMessage(response);
            
            sendBtn.disabled = false;
            input.disabled = false;
        }
        
        function addMessage(content, isUser = false, skipCheckoutButton = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-widget-message ${isUser ? 'user' : 'agent'}`;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'chat-widget-message-content';
            
            // Check if message contains "congratulations"
            const isCelebration = !isUser && content.toLowerCase().includes('congratulations');
            
            // Extract price from message (look for $XX.XX or $XXX.XX)
            let extractedPrice = '$129.99'; // default
            if (isCelebration) {
                const priceMatch = content.match(/\$\d+\.?\d*/);
                if (priceMatch) {
                    extractedPrice = priceMatch[0];
                }
            }
            
            if (isCelebration) {
                // Apply celebration styling
                contentDiv.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                contentDiv.style.color = 'white';
                contentDiv.style.fontWeight = 'bold';
                contentDiv.style.fontSize = '16px';
                contentDiv.style.padding = '15px 18px';
                contentDiv.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                contentDiv.style.animation = 'pulse 0.5s ease-in-out';
                
                // Add pulse animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                `;
                if (!document.getElementById('celebration-style')) {
                    style.id = 'celebration-style';
                    document.head.appendChild(style);
                }
            }
            
            // Parse markdown-style bold text (**text**) and preserve line breaks
            if (!isUser && content.includes('**')) {
                const parts = content.split(/(\*\*.*?\*\*)/g);
                parts.forEach(part => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        const boldText = part.slice(2, -2);
                        const strong = document.createElement('strong');
                        strong.textContent = boldText;
                        strong.style.fontWeight = '700';
                        strong.style.color = isCelebration ? '#FFD700' : '#FF9900';
                        contentDiv.appendChild(strong);
                    } else if (part) {
                        // Handle line breaks
                        const lines = part.split('\n');
                        lines.forEach((line, index) => {
                            contentDiv.appendChild(document.createTextNode(line));
                            if (index < lines.length - 1) {
                                contentDiv.appendChild(document.createElement('br'));
                            }
                        });
                    }
                });
            } else {
                // Handle line breaks for plain text
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    contentDiv.appendChild(document.createTextNode(line));
                    if (index < lines.length - 1) {
                        contentDiv.appendChild(document.createElement('br'));
                    }
                });
            }
            
            // Add checkout section if celebration and not skipped
            if (isCelebration && !skipCheckoutButton) {
                const checkoutSection = document.createElement('div');
                checkoutSection.style.cssText = `
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(255,255,255,0.3);
                `;
                
                const checkoutText = document.createElement('div');
                checkoutText.textContent = "Let's checkout this deal and place the order before it expires!";
                checkoutText.style.cssText = `
                    font-size: 14px;
                    margin-bottom: 10px;
                    font-weight: normal;
                `;
                
                const checkoutBtn = document.createElement('button');
                checkoutBtn.innerHTML = '⚡ Instant Checkout';
                checkoutBtn.style.cssText = `
                    background: #FF9900;
                    color: #0F1111;
                    border: 1px solid #FF9900;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.2s;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.15);
                `;
                
                checkoutBtn.onmouseover = () => {
                    checkoutBtn.style.background = '#FA8900';
                    checkoutBtn.style.transform = 'translateY(-2px)';
                    checkoutBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                };
                
                checkoutBtn.onmouseout = () => {
                    checkoutBtn.style.background = '#FF9900';
                    checkoutBtn.style.transform = 'translateY(0)';
                    checkoutBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.15)';
                };
                
                checkoutBtn.onclick = () => showCheckoutPopup(extractedPrice);
                
                checkoutSection.appendChild(checkoutText);
                checkoutSection.appendChild(checkoutBtn);
                contentDiv.appendChild(checkoutSection);
            }
            
            messageDiv.appendChild(contentDiv);
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
            
            // Play sound and trigger celebration
            if (isUser) {
                playSendSound();
            } else if (isCelebration) {
                playCelebrationSound();
                createFireworks();
            } else {
                playReceiveSound();
            }
        }
        
        function showCheckoutPopup(price) {
            // Calculate tax and total
            const priceValue = parseFloat(price.replace('$', ''));
            const taxAmount = 2.50;
            const totalAmount = priceValue + taxAmount;
            const formattedTotal = '$' + totalAmount.toFixed(2);
            // Create overlay
            const overlay = document.createElement('div');
            overlay.id = 'checkout-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                z-index: 99998;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s;
            `;
            
            // Create popup
            const popup = document.createElement('div');
            popup.style.cssText = `
                background: white;
                width: 90%;
                max-width: 500px;
                max-height: 85vh;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                animation: slideIn 0.3s;
                display: flex;
                flex-direction: column;
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            
            popup.innerHTML = `
                <div style="background: #232F3E; color: white; padding: 16px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                    <h3 style="margin: 0; font-size: 18px;">Checkout</h3>
                    <button id="close-checkout" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px;">×</button>
                </div>
                
                <div style="padding: 20px; overflow-y: auto; flex: 1;">
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #0F1111; margin: 0 0 10px 0; font-size: 16px;">Product Details</h4>
                        <div style="background: #F7F8F8; padding: 12px; border-radius: 4px; border: 1px solid #D5D9D9;">
                            <div style="font-weight: 600; color: #0F1111; margin-bottom: 4px;">Amazon Fire HD 10 Tablet</div>
                            <div style="font-size: 14px; color: #565959;">32 GB, Ocean</div>
                            <div style="font-size: 18px; color: #B12704; font-weight: 700; margin-top: 8px;">${price}</div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #0F1111; margin: 0 0 10px 0; font-size: 16px;">Shipping Address</h4>
                        <div style="background: #F7F8F8; padding: 12px; border-radius: 4px; border: 1px solid #D5D9D9;">
                            <input type="text" value="John Smith" placeholder="Full Name" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #888C8C; border-radius: 4px; font-size: 14px; box-sizing: border-box;">
                            <input type="text" value="123 Main Street" placeholder="Address Line 1" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #888C8C; border-radius: 4px; font-size: 14px; box-sizing: border-box;">
                            <input type="text" value="Apt 4B" placeholder="Address Line 2 (Optional)" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #888C8C; border-radius: 4px; font-size: 14px; box-sizing: border-box;">
                            <div style="display: flex; gap: 8px;">
                                <input type="text" value="New York" placeholder="City" style="flex: 1; padding: 8px; border: 1px solid #888C8C; border-radius: 4px; font-size: 14px;">
                                <input type="text" value="NY" placeholder="State" style="width: 80px; padding: 8px; border: 1px solid #888C8C; border-radius: 4px; font-size: 14px;">
                                <input type="text" value="10001" placeholder="ZIP" style="width: 100px; padding: 8px; border: 1px solid #888C8C; border-radius: 4px; font-size: 14px;">
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #0F1111; margin: 0 0 10px 0; font-size: 16px;">Payment Method</h4>
                        <div style="background: #F7F8F8; padding: 12px; border-radius: 4px; border: 1px solid #D5D9D9;">
                            <input type="text" value="•••• •••• •••• 4242" placeholder="Card Number" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #888C8C; border-radius: 4px; font-size: 14px; box-sizing: border-box;">
                            <div style="display: flex; gap: 8px;">
                                <input type="text" value="12/25" placeholder="MM/YY" style="flex: 1; padding: 8px; border: 1px solid #888C8C; border-radius: 4px; font-size: 14px;">
                                <input type="text" value="•••" placeholder="CVV" style="width: 80px; padding: 8px; border: 1px solid #888C8C; border-radius: 4px; font-size: 14px;">
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #F0F2F2; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #565959;">Subtotal:</span>
                            <span style="color: #0F1111; font-weight: 600;">${price}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #565959;">Shipping:</span>
                            <span style="color: #007600; font-weight: 600;">FREE</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #565959;">Tax:</span>
                            <span style="color: #0F1111; font-weight: 600;">$2.50</span>
                        </div>
                        <div style="border-top: 1px solid #D5D9D9; padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between;">
                            <span style="color: #0F1111; font-weight: 700; font-size: 16px;">Order Total:</span>
                            <span style="color: #B12704; font-weight: 700; font-size: 18px;">${formattedTotal}</span>
                        </div>
                    </div>
                </div>
                
                <div style="padding: 16px; background: #F7F8F8; border-top: 1px solid #D5D9D9; flex-shrink: 0;">
                    <button id="place-order-btn" style="width: 100%; background: #FF9900; color: #0F1111; border: 1px solid #FF9900; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                        Place Order
                    </button>
                </div>
            `;
            
            overlay.appendChild(popup);
            document.body.appendChild(overlay);
            
            // Close button
            document.getElementById('close-checkout').onclick = () => {
                document.body.removeChild(overlay);
            };
            
            // Place order button
            const placeOrderBtn = document.getElementById('place-order-btn');
            placeOrderBtn.onmouseover = () => {
                placeOrderBtn.style.background = '#FA8900';
            };
            placeOrderBtn.onmouseout = () => {
                placeOrderBtn.style.background = '#FF9900';
            };
            
            placeOrderBtn.onclick = () => {
                // Show spinner
                placeOrderBtn.innerHTML = '<div style="display: inline-block; width: 20px; height: 20px; border: 3px solid #0F1111; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>';
                placeOrderBtn.disabled = true;
                placeOrderBtn.style.cursor = 'not-allowed';
                
                const spinStyle = document.createElement('style');
                spinStyle.textContent = `
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(spinStyle);
                
                // Simulate order processing
                setTimeout(() => {
                    document.body.removeChild(overlay);
                    
                    // Show success message in chat WITHOUT checkout button
                    addMessage('🎉 Congratulations! Your order has been successfully placed! 🎉\n\nOrder Number: #AMZ-' + Math.random().toString(36).substr(2, 9).toUpperCase() + '\n\nExpected Delivery: 2-3 business days', false, true);
                }, 2000);
            };
        }
        
        function showTyping() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'chat-widget-message agent';
            typingDiv.id = 'chat-widget-typing-indicator';
            
            const indicator = document.createElement('div');
            indicator.className = 'chat-widget-typing active';
            indicator.innerHTML = '<span></span><span></span><span></span>';
            
            typingDiv.appendChild(indicator);
            messages.appendChild(typingDiv);
            messages.scrollTop = messages.scrollHeight;
        }
        
        function hideTyping() {
            const typing = document.getElementById('chat-widget-typing-indicator');
            if (typing) typing.remove();
        }
        
        async function sendMessage(message) {
            try {
                if (cfg.apiType === 'custom') {
                    const response = await fetch(`${cfg.apiUrl}${cfg.runEndpoint}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            appName: cfg.appName,
                            userId: cfg.userId,
                            sessionId: sessionId,
                            newMessage: {
                                role: 'user',
                                parts: [{ text: message }]
                            }
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.error || `API error: ${response.status}`);
                    }
                    
                    if (Array.isArray(data) && data.length > 0) {
                        const firstResponse = data[0];
                        if (firstResponse.content && 
                            firstResponse.content.parts && 
                            Array.isArray(firstResponse.content.parts) && 
                            firstResponse.content.parts.length > 0) {
                            const text = firstResponse.content.parts[0].text;
                            if (text) return text;
                        }
                    }
                    
                    console.warn('Unexpected API response:', data);
                    return 'Sorry, I received an unexpected response format.';
                    
                } else {
                    const response = await fetch(`${cfg.apiUrl}${cfg.chatEndpoint}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: message,
                            session_id: sessionId || cfg.sessionIdPrefix + '-' + Date.now()
                        })
                    });
                    
                    const data = await response.json();
                    if (data.error) throw new Error(data.error);
                    return data.response;
                }
                
            } catch (error) {
                console.error('Chat Widget Error:', error);
                return `Error: ${error.message}. Please check your API connection.`;
            }
        }
        
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
        
        window.openChatWidget = async function() {
            chatPopup.classList.add('open');
            input.focus();
            
            // Show greeting first
            showGreeting();
            
            if (cfg.apiType === 'custom' && !sessionCreated) {
                await createSession();
            }
            if (!initialMessageSent && cfg.sendInitialMessage && cfg.initialMessage) {
                sendInitialMessage();
                initialMessageSent = true;
            }
        };
        
        window.closeChatWidget = function() {
            chatPopup.classList.remove('open');
        };
        
        window.toggleChatWidget = function() {
            if (chatPopup.classList.contains('open')) {
                window.closeChatWidget();
            } else {
                window.openChatWidget();
            }
        };
        
        window.clearChatSession = function() {
            localStorage.removeItem(cfg.storageKey);
            sessionCreated = false;
            sessionId = null;
            console.log('Session cleared');
        };
        
        console.log('Chat widget initialized successfully');
    };
})();
