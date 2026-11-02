/**
 * Messages Page
 * Real-time chat interface
 */

import { authService } from '../api/auth.service.js';
import { socialService } from '../api/social.service.js';
import { escapeHtmlDeep, escapeJsString } from '../utils/html.js';
import { Loading } from '../components/loading.js';

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
                        ${Loading.state('loading', { message: 'Loading conversations', compact: true, count: 2 })}
                    </div>
                </div>

                <!-- Chat Area -->
                <div class="chat-main">
                    <div id="chatHeader" class="chat-header" style="display:none;">
                        <button id="backToInboxBtn" class="btn btn-outline chat-back-button" type="button">Back to inbox</button>
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
    document.getElementById('backToInboxBtn').addEventListener('click', () => {
        document.querySelector('.chat-container').classList.remove('chat-active');
    });
}

async function loadInbox() {
    const list = document.getElementById('inboxList');
    try {
        const response = await socialService.getMyNetwork(); // For MVP using network as inbox source
        const connections = escapeHtmlDeep(response.data);

        if (connections.length === 0) {
            list.innerHTML = Loading.empty('No conversations yet', 'Connect with another citizen to start messaging.', { compact: true });
            return;
        }

        list.innerHTML = connections.map(c => {
            const friend = c.requester._id === authService.getCurrentUser()._id ? c.recipient : c.requester;
            return `
                <div class="inbox-item" onclick="openChat('${escapeJsString(friend._id)}', '${escapeJsString(friend.firstName)}')">
                    <div class="avatar-sm">${friend.firstName[0]}</div>
                    <div class="inbox-details">
                        <span class="inbox-name">${friend.firstName} ${friend.lastName}</span>
                        <span class="inbox-preview">Click to chat</span>
                    </div>
                </div>
             `;
        }).join('');
    } catch (e) {
        list.innerHTML = Loading.error('Inbox unavailable', 'We could not load your conversations.', { compact: true, actionLabel: 'Try again' });
        list.querySelector('[data-state-action="retry"]')?.addEventListener('click', loadInbox);
    }
}

let activeChatId = null;

window.openChat = async (userId, userName) => {
    activeChatId = userId;
    document.getElementById('chatHeader').style.display = 'flex';
    document.getElementById('chatInputArea').style.display = 'flex';
    document.getElementById('chatUserName').innerText = userName;
    document.querySelector('.chat-container').classList.add('chat-active');

    // Select styling
    document.querySelectorAll('.inbox-item').forEach(el => el.classList.remove('active'));
    // (Add active class logic here if needed)

    loadMessages(userId);
};

async function loadMessages(userId) {
    const area = document.getElementById('messagesArea');
    area.innerHTML = Loading.state('loading', { message: 'Loading messages', compact: true, count: 3 });

    try {
        const response = await socialService.getConversation(userId);
        const messages = response.data;
        const currentUserId = authService.getCurrentUser()._id;

        area.innerHTML = messages.length
            ? messages.map(msg => renderMessageMarkup(msg, currentUserId)).join('')
            : Loading.empty('No messages yet', 'Send the first message in this conversation.', { compact: true });

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
        area.innerHTML = Loading.error('Messages unavailable', 'We could not load this conversation.', { compact: true, actionLabel: 'Try again' });
        area.querySelector('[data-state-action="retry"]')?.addEventListener('click', () => loadMessages(userId));
    }
}

export function renderMessageMarkup(rawMessage, currentUserId) {
    const msg = escapeHtmlDeep(rawMessage);
    const isMe = msg.sender?._id === currentUserId || msg.sender === currentUserId;
    return `
        <div class="message-bubble ${isMe ? 'sent' : 'received'}">
            <div class="message-content">${msg.content}</div>
            <div class="message-time">${new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
    `;
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
        window.appFeedback.notify('Failed to send the message.', { type: 'error' });
    }
}
