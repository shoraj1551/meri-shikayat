/**
 * Skeleton Loading Components
 * Provides placeholder UI during data loading
 */

/**
 * Skeleton Card - Generic card placeholder
 */
export const SkeletonCard = () => `
    <div class="skeleton-card">
        <div class="skeleton-header">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-lines">
                <div class="skeleton-line skeleton-title"></div>
                <div class="skeleton-line skeleton-subtitle"></div>
            </div>
        </div>
        <div class="skeleton-body">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
        </div>
    </div>
`;

/**
 * Skeleton List - Multiple cards
 */
export const SkeletonList = (count = 3) => {
    return Array(count).fill(SkeletonCard()).join('');
};

/**
 * Skeleton Complaint Card
 */
export const SkeletonComplaintCard = () => `
    <div class="skeleton-complaint-card">
        <div class="skeleton-complaint-header">
            <div class="skeleton-line skeleton-complaint-id"></div>
            <div class="skeleton-badge"></div>
        </div>
        <div class="skeleton-complaint-body">
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
        </div>
        <div class="skeleton-complaint-footer">
            <div class="skeleton-line skeleton-date"></div>
            <div class="skeleton-line skeleton-category"></div>
        </div>
    </div>
`;

/**
 * Skeleton Table Row
 */
export const SkeletonTableRow = () => `
    <tr class="skeleton-table-row">
        <td><div class="skeleton-line"></div></td>
        <td><div class="skeleton-line"></div></td>
        <td><div class="skeleton-line"></div></td>
        <td><div class="skeleton-line short"></div></td>
    </tr>
`;

/**
 * Skeleton Table
 */
export const SkeletonTable = (rows = 5) => `
    <table class="skeleton-table">
        <thead>
            <tr>
                <th><div class="skeleton-line"></div></th>
                <th><div class="skeleton-line"></div></th>
                <th><div class="skeleton-line"></div></th>
                <th><div class="skeleton-line short"></div></th>
            </tr>
        </thead>
        <tbody>
            ${Array(rows).fill(SkeletonTableRow()).join('')}
        </tbody>
    </table>
`;

/**
 * Skeleton Profile Header
 */
export const SkeletonProfileHeader = () => `
    <div class="skeleton-profile-header">
        <div class="skeleton-profile-avatar"></div>
        <div class="skeleton-profile-info">
            <div class="skeleton-line skeleton-name"></div>
            <div class="skeleton-line skeleton-email"></div>
            <div class="skeleton-line skeleton-role"></div>
        </div>
    </div>
`;

/**
 * Skeleton Dashboard Stats
 */
export const SkeletonDashboardStats = () => `
    <div class="skeleton-stats-grid">
        <div class="skeleton-stat-card">
            <div class="skeleton-stat-icon"></div>
            <div class="skeleton-stat-content">
                <div class="skeleton-line skeleton-stat-value"></div>
                <div class="skeleton-line skeleton-stat-label"></div>
            </div>
        </div>
        <div class="skeleton-stat-card">
            <div class="skeleton-stat-icon"></div>
            <div class="skeleton-stat-content">
                <div class="skeleton-line skeleton-stat-value"></div>
                <div class="skeleton-line skeleton-stat-label"></div>
            </div>
        </div>
        <div class="skeleton-stat-card">
            <div class="skeleton-stat-icon"></div>
            <div class="skeleton-stat-content">
                <div class="skeleton-line skeleton-stat-value"></div>
                <div class="skeleton-line skeleton-stat-label"></div>
            </div>
        </div>
        <div class="skeleton-stat-card">
            <div class="skeleton-stat-icon"></div>
            <div class="skeleton-stat-content">
                <div class="skeleton-line skeleton-stat-value"></div>
                <div class="skeleton-line skeleton-stat-label"></div>
            </div>
        </div>
    </div>
`;

/**
 * Show skeleton loader
 */
export function showSkeleton(container, skeletonHtml) {
    container.innerHTML = skeletonHtml;
    container.classList.add('skeleton-loading');
}

/**
 * Hide skeleton loader and show content
 */
export function hideSkeleton(container, contentHtml) {
    container.classList.remove('skeleton-loading');
    container.innerHTML = contentHtml;
}

/**
 * Skeleton utility for async data loading
 */
export async function loadWithSkeleton(container, skeletonFn, dataFn) {
    // Show skeleton
    showSkeleton(container, skeletonFn());

    try {
        // Load data
        const data = await dataFn();

        // Hide skeleton and show content
        hideSkeleton(container, data);

        return data;
    } catch (error) {
        // Show error state
        container.innerHTML = `
            <div class="error-state">
                <p>Failed to load content</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
        throw error;
    }
}

export default {
    SkeletonCard,
    SkeletonList,
    SkeletonComplaintCard,
    SkeletonTableRow,
    SkeletonTable,
    SkeletonProfileHeader,
    SkeletonDashboardStats,
    showSkeleton,
    hideSkeleton,
    loadWithSkeleton
};
