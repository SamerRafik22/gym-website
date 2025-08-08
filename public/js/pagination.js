// === PAGINATION UTILITY ===

class PaginationManager {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.currentPage = 1;
        this.itemsPerPage = options.itemsPerPage || 10;
        this.totalItems = 0;
        this.totalPages = 0;
        this.onPageChange = options.onPageChange || (() => {});
        this.showPageNumbers = options.showPageNumbers !== false;
        this.maxPageNumbers = options.maxPageNumbers || 5;
    }

    // Update pagination info
    updatePagination(paginationData) {
        this.currentPage = paginationData.currentPage || 1;
        this.totalItems = paginationData.totalItems || 0;
        this.totalPages = paginationData.totalPages || 0;
        this.itemsPerPage = paginationData.itemsPerPage || this.itemsPerPage;
        
        this.render();
    }

    // Render pagination controls
    render() {
        if (!this.container) return;

        if (this.totalPages <= 1) {
            this.container.innerHTML = '';
            return;
        }

        const paginationHTML = this.generatePaginationHTML();
        this.container.innerHTML = paginationHTML;
        this.attachEventListeners();
    }

    // Generate pagination HTML
    generatePaginationHTML() {
        const startPage = Math.max(1, this.currentPage - Math.floor(this.maxPageNumbers / 2));
        const endPage = Math.min(this.totalPages, startPage + this.maxPageNumbers - 1);

        let html = `
            <div class="pagination-container">
                <div class="pagination-info">
                    <span class="pagination-text">
                        Showing ${((this.currentPage - 1) * this.itemsPerPage) + 1} to ${Math.min(this.currentPage * this.itemsPerPage, this.totalItems)} of ${this.totalItems} items
                    </span>
                </div>
                <div class="pagination-controls">
        `;

        // Previous button
        html += `
            <button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    data-page="${this.currentPage - 1}" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
                Previous
            </button>
        `;

        // Page numbers
        if (this.showPageNumbers) {
            // First page
            if (startPage > 1) {
                html += `<button class="pagination-btn" data-page="1">1</button>`;
                if (startPage > 2) {
                    html += `<span class="pagination-ellipsis">...</span>`;
                }
            }

            // Page numbers
            for (let i = startPage; i <= endPage; i++) {
                html += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                        ${i}
                    </button>
                `;
            }

            // Last page
            if (endPage < this.totalPages) {
                if (endPage < this.totalPages - 1) {
                    html += `<span class="pagination-ellipsis">...</span>`;
                }
                html += `<button class="pagination-btn" data-page="${this.totalPages}">${this.totalPages}</button>`;
            }
        }

        // Next button
        html += `
            <button class="pagination-btn ${this.currentPage === this.totalPages ? 'disabled' : ''}" 
                    data-page="${this.currentPage + 1}" 
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                Next
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
            </button>
        `;

        html += `
                </div>
                <div class="pagination-limit">
                    <label for="itemsPerPage">Items per page:</label>
                    <select id="itemsPerPage" class="pagination-select">
                        <option value="5" ${this.itemsPerPage === 5 ? 'selected' : ''}>5</option>
                        <option value="10" ${this.itemsPerPage === 10 ? 'selected' : ''}>10</option>
                        <option value="20" ${this.itemsPerPage === 20 ? 'selected' : ''}>20</option>
                        <option value="50" ${this.itemsPerPage === 50 ? 'selected' : ''}>50</option>
                    </select>
                </div>
            </div>
        `;

        return html;
    }

    // Attach event listeners
    attachEventListeners() {
        const buttons = this.container.querySelectorAll('.pagination-btn:not(.disabled)');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(button.dataset.page);
                if (page && page !== this.currentPage) {
                    this.goToPage(page);
                }
            });
        });

        // Items per page selector
        const itemsPerPageSelect = this.container.querySelector('#itemsPerPage');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.goToPage(1); // Reset to first page
            });
        }
    }

    // Go to specific page
    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        
        this.currentPage = page;
        this.onPageChange(this.currentPage, this.itemsPerPage);
    }

    // Get current pagination state
    getState() {
        return {
            currentPage: this.currentPage,
            itemsPerPage: this.itemsPerPage,
            totalItems: this.totalItems,
            totalPages: this.totalPages
        };
    }
}

// Global pagination manager instances
window.paginationManagers = {};

// Helper function to create pagination manager
function createPaginationManager(containerId, options = {}) {
    const manager = new PaginationManager(containerId, options);
    window.paginationManagers[containerId] = manager;
    return manager;
}

// Export for use in other files
window.PaginationManager = PaginationManager;
window.createPaginationManager = createPaginationManager; 