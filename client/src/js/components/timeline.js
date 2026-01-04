/**
 * Complaint Status Timeline Component
 * Visual timeline showing complaint journey from submission to resolution
 */

/**
 * Render timeline for complaint status history
 * @param {Array} statusHistory - Array of status objects with {status, timestamp, note}
 * @returns {string} HTML string for timeline
 */
export function renderTimeline(statusHistory = []) {
    const statuses = [
        { key: 'submitted', label: 'Submitted', icon: '📝', color: '#3b82f6' },
        { key: 'acknowledged', label: 'Acknowledged', icon: '✓', color: '#10b981' },
        { key: 'in_progress', label: 'In Progress', icon: '⏳', color: '#f59e0b' },
        { key: 'resolved', label: 'Resolved', icon: '✅', color: '#10b981' },
        { key: 'closed', label: 'Closed', icon: '🔒', color: '#6b7280' }
    ];

    // Find current status index
    const currentStatusIndex = statusHistory.length > 0 ? statusHistory.length - 1 : 0;

    return `
        <div class="timeline">
            ${statuses.map((status, index) => {
        const historyItem = statusHistory.find(h => h.status === status.key);
        const isCompleted = historyItem !== undefined;
        const isActive = index === currentStatusIndex && isCompleted;
        const isFuture = index > currentStatusIndex;

        return `
                    <div class="timeline-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isFuture ? 'future' : ''}">
                        <div class="timeline-marker" style="--marker-color: ${status.color}">
                            <span class="timeline-icon">${status.icon}</span>
                        </div>
                        <div class="timeline-content">
                            <h4 class="timeline-title">${status.label}</h4>
                            ${historyItem ? `
                                <p class="timeline-date">${formatDate(historyItem.timestamp)}</p>
                                ${historyItem.note ? `<p class="timeline-note">${historyItem.note}</p>` : ''}
                                ${historyItem.updatedBy ? `<p class="timeline-user">by ${historyItem.updatedBy}</p>` : ''}
                            ` : `
                                <p class="timeline-pending">Pending</p>
                            `}
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

/**
 * Format date for timeline
 */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        }
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
}

/**
 * Compact timeline for card view
 */
export function renderCompactTimeline(currentStatus) {
    const statusConfig = {
        submitted: { label: 'Submitted', color: '#3b82f6', progress: 20 },
        acknowledged: { label: 'Acknowledged', color: '#10b981', progress: 40 },
        in_progress: { label: 'In Progress', color: '#f59e0b', progress: 60 },
        resolved: { label: 'Resolved', color: '#10b981', progress: 80 },
        closed: { label: 'Closed', color: '#6b7280', progress: 100 }
    };

    const config = statusConfig[currentStatus] || statusConfig.submitted;

    return `
        <div class="compact-timeline">
            <div class="timeline-progress-bar">
                <div class="timeline-progress-fill" style="width: ${config.progress}%; background: ${config.color}"></div>
            </div>
            <div class="timeline-status-label" style="color: ${config.color}">
                ${config.label}
            </div>
        </div>
    `;
}

export default {
    renderTimeline,
    renderCompactTimeline
};
