// PrePair Presentation Overlay System
class PresentationOverlay {
  constructor() {
    this.activeSlide = null;
    this.activePageIndex = 0;
    this.overlayElement = null;
    this.currentPageId = null;
    
    this.init();
  }
  
  init() {
    // Get current page ID
    this.currentPageId = document.body.dataset.page || null;
    
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
  
  findSlideForKey(pageId, key) {
    return window.presentationSlides?.find(
      (slide) => slide.pageId === pageId && slide.key.toLowerCase() === key.toLowerCase()
    ) || null;
  }
  
  attachKeyboardListeners() {
    document.addEventListener('keydown', (event) => {
      // Prevent if user is typing in an input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }
      
      if (!this.activeSlide) {
        // No overlay open - check for slide triggers
        if (this.currentPageId) {
          const slide = this.findSlideForKey(this.currentPageId, event.key);
          if (slide) {
            event.preventDefault();
            this.openSlideWithScroll(slide);
          }
        }
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
  
  openSlideWithScroll(slide) {
    const targetSelector = slide.scrollTargetSelector;
    if (targetSelector) {
      const targetEl = document.querySelector(targetSelector);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
        // Delay showing overlay slightly to let the scroll start.
        setTimeout(() => {
          this.openSlide(slide, 0); // start at page index 0
        }, 350);
        return;
      }
    }
    // If no target or not found, open immediately.
    this.openSlide(slide, 0);
  }
  
  openSlide(slide, pageIndex) {
    this.activeSlide = slide;
    this.activePageIndex = pageIndex;
    this.renderOverlay();
    this.showOverlay();
  }
  
  closeOverlay() {
    this.activeSlide = null;
    this.activePageIndex = 0;
    this.hideOverlay();
  }
  
  nextPage() {
    // Only navigate if slide has multiple pages
    if (this.activeSlide && this.activeSlide.pages.length > 1 && this.activePageIndex < this.activeSlide.pages.length - 1) {
      this.activePageIndex++;
      this.renderOverlay();
    }
  }
  
  previousPage() {
    // Only navigate if slide has multiple pages
    if (this.activeSlide && this.activeSlide.pages.length > 1 && this.activePageIndex > 0) {
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
    if (!this.activeSlide) return;
    
    const currentPage = this.activeSlide.pages[this.activePageIndex];
    const totalPages = this.activeSlide.pages.length;
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
    
    // Special handling for operations slide page 2 with agreement visual
    let specialContent = '';
    if (this.activeSlide.id === 'app-operations' && this.activePageIndex === 1) {
      specialContent = `
        <div style="margin-top: 1rem; padding: 1.5rem; border: 1px solid var(--border, #ddd); border-radius: 12px; background: var(--card, #f9f9f9);">
          <h4 style="text-align: center; margin: 0 0 1rem; color: var(--clay, #666);">Project Agreement</h4>
          <div style="display: grid; gap: 0.75rem;">
            <div style="border: 1px solid var(--border, #ddd); padding: 0.75rem; border-radius: 6px; background: white;">
              <strong style="color: var(--clay, #666);">Participant</strong>
              <div style="font-size: 12px; margin-top: 0.25rem;">Student completing project as learning experience</div>
              <div style="border-bottom: 1px solid var(--border, #ddd); margin-top: 0.5rem; padding-bottom: 0.25rem; font-size: 10px;">Signature: _______________</div>
            </div>
            <div style="border: 1px solid var(--border, #ddd); padding: 0.75rem; border-radius: 6px; background: white;">
              <strong style="color: var(--clay, #666);">Host</strong>
              <div style="font-size: 12px; margin-top: 0.25rem;">Business defining project and mentoring student</div>
              <div style="border-bottom: 1px solid var(--border, #ddd); margin-top: 0.5rem; padding-bottom: 0.25rem; font-size: 10px;">Signature: _______________</div>
            </div>
            <div style="border: 1px solid var(--border, #ddd); padding: 0.75rem; border-radius: 6px; background: white;">
              <strong style="color: var(--clay, #666);">Facilitator</strong>
              <div style="font-size: 12px; margin-top: 0.25rem;">PrePair providing platform and support</div>
              <div style="border-bottom: 1px solid var(--border, #ddd); margin-top: 0.5rem; padding-bottom: 0.25rem; font-size: 10px;">Signature: _______________</div>
            </div>
          </div>
        </div>
      `;
    }
    
    // Create visual content if image is available
    const hasVisual = this.activeSlide.visualSrc;
    const visualContent = hasVisual ? `
      <div class="slide-visual">
        <img src="${this.activeSlide.visualSrc}" alt="${this.activeSlide.visualAlt || ''}" />
      </div>
    ` : '';

    this.overlayElement.innerHTML = `
      <div class="presentation-card" onclick="event.stopPropagation()">
        <!-- Header -->
        <div class="presentation-header">
          <div class="presentation-label">${this.activeSlide.label}</div>
          <div class="presentation-divider"></div>
        </div>
        
        <!-- Body -->
        <div class="presentation-body">
          <div class="slide-content ${hasVisual ? 'slide-content--with-visual' : ''}">
            <div class="slide-text">
              <h2 class="presentation-heading">${currentPage.heading}</h2>
              <p class="presentation-intro">${currentPage.intro}</p>
              <div class="presentation-bullets">
                ${bulletsHtml}
              </div>
              ${specialContent}
            </div>
            ${visualContent}
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