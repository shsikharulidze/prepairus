// PrePair Presentation Overlay System
class PresentationOverlay {
  constructor() {
    this.activeSlideId = null;
    this.activePageIndex = 0;
    this.overlayElement = null;
    
    this.init();
  }
  
  init() {
    // Create overlay root element
    this.createOverlayRoot();
    
    // Attach keyboard listeners
    this.attachKeyboardListeners();
  }
  
  createOverlayRoot() {
    const overlayRoot = document.createElement('div');
    overlayRoot.id = 'presentation-overlay-root';
    overlayRoot.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(2px);
    `;
    
    document.body.appendChild(overlayRoot);
    this.overlayElement = overlayRoot;
  }
  
  attachKeyboardListeners() {
    document.addEventListener('keydown', (event) => {
      // Prevent if user is typing in an input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }
      
      if (!this.activeSlideId) {
        // No overlay open - check for slide triggers
        if (event.key === '1') {
          event.preventDefault();
          this.openSlide(1);
        }
        // Future: Add more slide numbers here
      } else {
        // Overlay is open
        switch (event.key) {
          case 'Escape':
            event.preventDefault();
            this.closeOverlay();
            break;
          case 'ArrowRight':
            event.preventDefault();
            this.nextPage();
            break;
          case 'ArrowLeft':
            event.preventDefault();
            this.previousPage();
            break;
        }
      }
    });
  }
  
  openSlide(slideId) {
    const slide = window.presentationSlides?.[slideId];
    if (!slide) {
      console.warn(`Slide ${slideId} not found`);
      return;
    }
    
    this.activeSlideId = slideId;
    this.activePageIndex = 0;
    this.renderOverlay();
    this.showOverlay();
  }
  
  closeOverlay() {
    this.activeSlideId = null;
    this.activePageIndex = 0;
    this.hideOverlay();
  }
  
  nextPage() {
    const slide = window.presentationSlides?.[this.activeSlideId];
    // Only navigate if slide has multiple pages
    if (slide && slide.pages.length > 1 && this.activePageIndex < slide.pages.length - 1) {
      this.activePageIndex++;
      this.renderOverlay();
    }
  }
  
  previousPage() {
    const slide = window.presentationSlides?.[this.activeSlideId];
    // Only navigate if slide has multiple pages
    if (slide && slide.pages.length > 1 && this.activePageIndex > 0) {
      this.activePageIndex--;
      this.renderOverlay();
    }
  }
  
  showOverlay() {
    this.overlayElement.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  
  hideOverlay() {
    this.overlayElement.style.display = 'none';
    document.body.style.overflow = '';
  }
  
  renderOverlay() {
    const slide = window.presentationSlides?.[this.activeSlideId];
    if (!slide) return;
    
    const currentPage = slide.pages[this.activePageIndex];
    const totalPages = slide.pages.length;
    const hasMultiplePages = totalPages > 1;
    
    // Format bullets with bold text
    const formattedBullets = currentPage.bullets.map(bullet => {
      return bullet.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    });
    
    const bulletsHtml = formattedBullets.map(bullet => 
      `<div class="presentation-bullet">
        <div class="bullet-dot"></div>
        <div class="bullet-text">${bullet}</div>
      </div>`
    ).join('');
    
    // Navigation buttons - only show for multi-page slides
    let navigationButtons = '';
    if (hasMultiplePages) {
      const prevButton = this.activePageIndex > 0 
        ? `<button class="presentation-nav-btn" onclick="presentationOverlay.previousPage()">← Back</button>`
        : '';
      
      const nextButton = this.activePageIndex < totalPages - 1
        ? `<button class="presentation-nav-btn presentation-nav-btn-primary" onclick="presentationOverlay.nextPage()">Next →</button>`
        : `<button class="presentation-nav-btn presentation-nav-btn-close" onclick="presentationOverlay.closeOverlay()">Close</button>`;
      
      navigationButtons = `${prevButton}${nextButton}`;
    } else {
      // Single page - just show close button
      navigationButtons = `<button class="presentation-nav-btn presentation-nav-btn-close" onclick="presentationOverlay.closeOverlay()">Close</button>`;
    }
    
    this.overlayElement.innerHTML = `
      <div class="presentation-card" onclick="event.stopPropagation()">
        <!-- Header -->
        <div class="presentation-header">
          <div class="presentation-label">${slide.label}</div>
          <div class="presentation-divider"></div>
        </div>
        
        <!-- Body -->
        <div class="presentation-body">
          <h2 class="presentation-heading">${currentPage.heading}</h2>
          <p class="presentation-intro">${currentPage.intro}</p>
          <div class="presentation-bullets">
            ${bulletsHtml}
          </div>
        </div>
        
        <!-- Footer -->
        <div class="presentation-footer">
          ${hasMultiplePages ? `<div class="presentation-page-indicator">Page ${this.activePageIndex + 1} of ${totalPages}</div>` : '<div class="presentation-page-indicator"></div>'}
          <div class="presentation-nav">
            ${navigationButtons}
          </div>
        </div>
      </div>
    `;
    
    // Add click outside to close
    this.overlayElement.addEventListener('click', (event) => {
      if (event.target === this.overlayElement) {
        this.closeOverlay();
      }
    });
  }
}

// Initialize when DOM is ready
let presentationOverlay;

document.addEventListener('DOMContentLoaded', () => {
  presentationOverlay = new PresentationOverlay();
  window.presentationOverlay = presentationOverlay;
});