/**
 * Messages Page
 * Real-time chat interface
 */

import { authService } from '../api/auth.service.js';
import { socialService } from '../api/social.service.js';

export async function renderMessagesPage() {
    const app = document.getElementById('app');
    const user = authService.getCurrentUser();

    if (!user) {
        window.router.navigate('/login');
        return;
    }

    app.innerHTML = `
        <div class="dashboard-layout full-height">
             <header class="dashboard-header glass-card">
                <div class="header-left">
                    <div class="logo">Meri Shikayat</div>
                    <span class="badge">Messaging</span>
                </div>
                <div class="header-right">
                    <button class="btn btn-outline" onclick="window.router.navigate('/community')">Back</button>
                </div>
            </header>

            <div class="chat-container glass-card">
                <!-- Sidebar -->
                <div class="chat-sidebar">
                    <div class="chat-sidebar-header">
                        <h3>Inbox</h3>
                    </div>
                    <div id="inboxList" class="inbox-list">
                        <div class="loading-spinner"></div>
                    </div>
                </div>

                <!-- Chat Area -->
                <div class="chat-main">
                    <div id="chatHeader" class="chat-header" style="display:none;">
                        <h3 id="chatUserName">Select a conversation</h3>
                    </div>
                    
                    <div id="messagesArea" class="messages-area">
                        <div class="empty-chat-state">
                            <i class="icon-chat-large">💬</i>
                            <p>Select a contact to start chatting</p>
                        </div>
                    </div>

                    <div id="chatInputArea" class="chat-input-area" style="display:none;">
                        <input type="text" id="messageInput" placeholder="Type a message...">
                        <button id="sendMsgBtn" class="btn btn-primary">Send</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadInbox();
}

async function loadInbox() {
    const list = document.getElementById('inboxList');
    try {
        const response = await socialService.getMyNetwork(); // For MVP using network as inbox source
        const connections = response.data;

        list.innerHTML = connections.map(c => {
            const friend = c.requester._id === authService.getCurrentUser()._id ? c.recipient : c.requester;
            return `
                <div class="inbox-item" onclick="openChat('${friend._id}', '${friend.firstName}')">
                    <div class="avatar-sm">${friend.firstName[0]}</div>
                    <div class="inbox-details">
                        <span class="inbox-name">${friend.firstName} ${friend.lastName}</span>
                        <span class="inbox-preview">Click to chat</span>
                    </div>
                </div>
             `;
        }).join('');
    } catch (e) {
        list.innerHTML = 'Failed to load contacts.';
    }
}

let activeChatId = null;

window.openChat = async (userId, userName) => {
    activeChatId = userId;
    document.getElementById('chatHeader').style.display = 'flex';
    document.getElementById('chatInputArea').style.display = 'flex';
    document.getElementById('chatUserName').innerText = userName;

    // Select styling
    document.querySelectorAll('.inbox-item').forEach(el => el.classList.remove('active'));
    // (Add active class logic here if needed)

    loadMessages(userId);
};

async function loadMessages(userId) {
    const area = document.getElementById('messagesArea');
    area.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const response = await socialService.getConversation(userId);
        const messages = response.data;
        const currentUserId = authService.getCurrentUser()._id;

        area.innerHTML = messages.map(msg => {
            const isMe = msg.sender._id === currentUserId || msg.sender === currentUserId;
            return `
                <div class="message-bubble ${isMe ? 'sent' : 'received'}">
                    <div class="message-content">${msg.content}</div>
                    <div class="message-time">${new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            `;
        }).join('');

        // Scroll to bottom
        area.scrollTop = area.scrollHeight;

        // Setup send button
        const btn = document.getElementById('sendMsgBtn');
        const input = document.getElementById('messageInput');

        // Remove old listeners to prevent dupes
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => sendMessage());
        input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

    } catch (e) {
        area.innerHTML = 'Failed to load messages.';
    }
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    if (!content || !activeChatId) return;

    try {
        await socialService.sendMessage(activeChatId, content);
        input.value = '';
        loadMessages(activeChatId); // Refresh (Polling style for MVP)
    } catch (e) {
        alert('Failed to send');
    }
}
