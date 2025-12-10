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
    
    // Determine visual layout
    const hasVisual = this.activeSlide.visualSrc || this.activeSlide.visualKind;
    const visualPlacement = this.activeSlide.visualPlacement || "side";
    
    // Create visual content (image or code-driven)
    let visualContent = '';
    const hasImageVisual = this.activeSlide.visualSrc;
    const hasCodeVisual = this.activeSlide.visualKind;
    
    if (hasImageVisual) {
      visualContent = `
        <div class="slide-visual">
          <img src="${this.activeSlide.visualSrc}" alt="${this.activeSlide.visualAlt || ''}" />
        </div>
      `;
    } else if (hasCodeVisual) {
      const visualNode = this.createVisualNode(this.activeSlide);
      if (visualNode) {
        visualContent = `<div class="slide-visual">${visualNode.outerHTML}</div>`;
      }
    }
    
    // Determine slide content class and layout
    let slideContentClass = 'slide-content';
    let slideContentHTML = '';
    
    if (hasImageVisual && visualPlacement === 'top') {
      // About-1 slide: visual on top, then text
      slideContentClass = 'slide-content slide-content--visual-top';
      const textContent = `
        <div class="slide-text">
          <h2 class="presentation-heading">${currentPage.heading}</h2>
          <p class="presentation-intro">${currentPage.intro}</p>
          <div class="presentation-bullets">
            ${bulletsHtml}
          </div>
          ${specialContent}
        </div>
      `;
      slideContentHTML = visualContent + textContent;
    } else if (hasImageVisual && visualPlacement === 'side') {
      // Hook slide: side-by-side layout
      slideContentClass = 'slide-content slide-content--with-visual';
      const textContent = `
        <div class="slide-text">
          <h2 class="presentation-heading">${currentPage.heading}</h2>
          <p class="presentation-intro">${currentPage.intro}</p>
          <div class="presentation-bullets">
            ${bulletsHtml}
          </div>
          ${specialContent}
        </div>
      `;
      slideContentHTML = textContent + visualContent;
    } else if (hasImageVisual && visualPlacement === 'bottom') {
      // About-1 slide: visual at bottom
      slideContentClass = 'slide-content slide-content--visual-bottom';
      const textContentMain = `
        <div class="slide-text">
          <h2 class="presentation-heading">${currentPage.heading}</h2>
          <p class="presentation-intro">${currentPage.intro}</p>
          <div class="presentation-bullets">
            ${bulletsHtml}
          </div>
        </div>
      `;
      slideContentHTML = textContentMain + visualContent + (specialContent ? `<div class="slide-special">${specialContent}</div>` : '');
    } else if (hasCodeVisual && visualPlacement === 'inlineAfterIntro') {
      // Code visuals: single column with visual inline after intro
      slideContentClass = 'slide-content';
      const visualNode = this.createVisualNode(this.activeSlide);
      const visualHtml = visualNode ? visualNode.outerHTML : '';
      
      slideContentHTML = `
        <div class="slide-text">
          <h2 class="presentation-heading">${currentPage.heading}</h2>
          <p class="presentation-intro">${currentPage.intro}</p>
          ${visualHtml}
          <div class="presentation-bullets">
            ${bulletsHtml}
          </div>
          ${specialContent}
        </div>
      `;
    } else {
      // Default: text only
      slideContentClass = 'slide-content';
      slideContentHTML = `
        <div class="slide-text">
          <h2 class="presentation-heading">${currentPage.heading}</h2>
          <p class="presentation-intro">${currentPage.intro}</p>
          <div class="presentation-bullets">
            ${bulletsHtml}
          </div>
          ${specialContent}
        </div>
      `;
    }

    this.overlayElement.innerHTML = `
      <div class="presentation-card" onclick="event.stopPropagation()">
        <!-- Header -->
        <div class="presentation-header">
          <div class="presentation-label">${this.activeSlide.label}</div>
          <div class="presentation-divider"></div>
        </div>
        
        <!-- Body -->
        <div class="presentation-body">
          <div class="${slideContentClass}">
            ${slideContentHTML}
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
  
  createVisualNode(slide) {
    // Code-driven visuals based on visualKind
    if (!slide.visualKind) return null;

    switch (slide.visualKind) {
      case "agendaTimeline":
        return this.createAgendaTimelineVisual(slide.visualData);
      case "marketBullseye":
        return this.createMarketBullseyeVisual(slide.visualData);
      case "teamRow":
        return this.createTeamRowVisual(slide.visualData);
      case "esgPillars":
        return this.createEsgPillarsVisual(slide.visualData);
      case "studentPath":
        return this.createStudentPathVisual(slide.visualData);
      case "fourPs":
        return this.createFourPsVisual(slide.visualData);
      case "rolesTriangle":
        return this.createRolesTriangleVisual(slide.visualData);
      case "financialSummary":
        return this.createFinancialSummaryVisual(slide.visualData);
      case "takeawaysStack":
        return this.createTakeawaysStackVisual(slide.visualData);
      default:
        return null;
    }
  }
  
  createAgendaTimelineVisual(data) {
    const card = document.createElement("div");
    card.className = "slide-visual-card visual-timeline-card";

    const title = document.createElement("div");
    title.className = "visual-title";
    title.textContent = "Flow of the presentation";
    card.appendChild(title);

    const line = document.createElement("div");
    line.className = "visual-timeline";

    (data.steps || []).forEach((step) => {
      const item = document.createElement("div");
      item.className = "timeline-step";

      const dot = document.createElement("div");
      dot.className = "timeline-dot";

      const label = document.createElement("div");
      label.className = "timeline-label";
      label.textContent = step;

      item.appendChild(dot);
      item.appendChild(label);
      line.appendChild(item);
    });

    card.appendChild(line);
    return card;
  }
  
  createMarketBullseyeVisual(data) {
    const card = document.createElement("div");
    card.className = "slide-visual-card visual-bullseye-card";

    const rings = document.createElement("div");
    rings.className = "visual-bullseye";

    const outer = document.createElement("div");
    outer.className = "bullseye-ring bullseye-ring--outer";
    outer.textContent = data.outerLabel;

    const inner = document.createElement("div");
    inner.className = "bullseye-ring bullseye-ring--inner";
    inner.textContent = data.innerLabel;

    const center = document.createElement("div");
    center.className = "bullseye-center";
    center.textContent = data.centerLabel;

    rings.appendChild(outer);
    rings.appendChild(inner);
    rings.appendChild(center);
    card.appendChild(rings);

    const metrics = document.createElement("div");
    metrics.className = "visual-metrics-row";

    [
      `${data.freelanceMarket} freelance`,
      `${data.freelanceGrowth} growth`,
      `${data.internshipMarket} virtual internships`
    ].forEach((text) => {
      const chip = document.createElement("div");
      chip.className = "visual-metric-chip";
      chip.textContent = text;
      metrics.appendChild(chip);
    });

    card.appendChild(metrics);
    return card;
  }
  
  createTeamRowVisual(data) {
    const card = document.createElement("div");
    card.className = "slide-visual-card visual-team-card";

    const row = document.createElement("div");
    row.className = "visual-team-row";

    (data.roles || []).forEach((role) => {
      const chip = document.createElement("div");
      chip.className = "team-chip";

      const tag = document.createElement("div");
      tag.className = "team-tag";
      tag.textContent = role.tag;

      const label = document.createElement("div");
      label.className = "team-label";
      label.textContent = role.label;

      chip.appendChild(tag);
      chip.appendChild(label);
      row.appendChild(chip);
    });

    card.appendChild(row);

    if (data.futureNote) {
      const future = document.createElement("div");
      future.className = "team-future-note";
      future.textContent = data.futureNote;
      card.appendChild(future);
    }

    return card;
  }
  
  createEsgPillarsVisual(data) {
    const card = document.createElement("div");
    card.className = "slide-visual-card visual-esg-card";

    const grid = document.createElement("div");
    grid.className = "visual-esg-grid";

    (data.items || []).forEach((item) => {
      const col = document.createElement("div");
      col.className = "esg-col";

      const circle = document.createElement("div");
      circle.className = "esg-letter";
      circle.textContent = item.letter;

      const title = document.createElement("div");
      title.className = "esg-title";
      title.textContent = item.title;

      const note = document.createElement("div");
      note.className = "esg-note";
      note.textContent = item.note;

      col.appendChild(circle);
      col.appendChild(title);
      col.appendChild(note);
      grid.appendChild(col);
    });

    card.appendChild(grid);
    return card;
  }
  
  createStudentPathVisual(data) {
    const card = document.createElement("div");
    card.className = "slide-visual-card visual-path-card";

    const path = document.createElement("div");
    path.className = "visual-path";

    (data.steps || []).forEach((step, index, arr) => {
      const node = document.createElement("div");
      node.className = "path-step";

      const bubble = document.createElement("div");
      bubble.className = "path-bubble";
      bubble.textContent = step.title;

      const note = document.createElement("div");
      note.className = "path-note";
      note.textContent = step.note;

      node.appendChild(bubble);
      node.appendChild(note);
      path.appendChild(node);

      if (index < arr.length - 1) {
        const arrow = document.createElement("div");
        arrow.className = "path-arrow";
        path.appendChild(arrow);
      }
    });

    card.appendChild(path);
    return card;
  }
  
  createFourPsVisual(data) {
    const card = document.createElement("div");
    card.className = "slide-visual-card visual-fourps-card";

    const grid = document.createElement("div");
    grid.className = "visual-fourps-grid";

    const items = [
      { key: "P", title: "Product", text: data.product },
      { key: "P", title: "Price", text: data.price },
      { key: "P", title: "Place", text: data.place },
      { key: "P", title: "Promotion", text: data.promotion }
    ];

    items.forEach((item) => {
      const cell = document.createElement("div");
      cell.className = "fourps-cell";

      const badge = document.createElement("div");
      badge.className = "fourps-badge";
      badge.textContent = item.title[0]; // P

      const title = document.createElement("div");
      title.className = "fourps-title";
      title.textContent = item.title;

      const text = document.createElement("div");
      text.className = "fourps-text";
      text.textContent = item.text;

      cell.appendChild(badge);
      cell.appendChild(title);
      cell.appendChild(text);
      grid.appendChild(cell);
    });

    card.appendChild(grid);
    return card;
  }
  
  createRolesTriangleVisual(data) {
    const card = document.createElement("div");
    card.className = "slide-visual-card visual-roles-card";

    const triangle = document.createElement("div");
    triangle.className = "visual-roles-triangle";

    const participant = document.createElement("div");
    participant.className = "roles-node roles-node--bottom-left";
    participant.textContent = data.participant;

    const host = document.createElement("div");
    host.className = "roles-node roles-node--bottom-right";
    host.textContent = data.host;

    const facilitator = document.createElement("div");
    facilitator.className = "roles-node roles-node--top";
    facilitator.textContent = data.facilitator;

    triangle.appendChild(participant);
    triangle.appendChild(host);
    triangle.appendChild(facilitator);

    card.appendChild(triangle);
    return card;
  }
  
  createFinancialSummaryVisual(data) {
    const card = document.createElement("div");
    card.className = "slide-visual-card visual-financial-card";

    const bars = document.createElement("div");
    bars.className = "visual-financial-bars";

    const barInitial = document.createElement("div");
    barInitial.className = "financial-bar financial-bar--initial";
    barInitial.innerHTML = `<span class="financial-bar-label">Initial</span><span class="financial-bar-value">${data.initialInvestment}</span>`;

    const barYearEnd = document.createElement("div");
    barYearEnd.className = "financial-bar financial-bar--yearend";
    barYearEnd.innerHTML = `<span class="financial-bar-label">Year-end cash</span><span class="financial-bar-value">${data.yearEndCash}</span>`;

    bars.appendChild(barInitial);
    bars.appendChild(barYearEnd);
    card.appendChild(bars);

    const chips = document.createElement("div");
    chips.className = "visual-metrics-row";

    [data.monthlyCosts, data.mrrQ1, data.breakEven].forEach((text) => {
      const chip = document.createElement("div");
      chip.className = "visual-metric-chip";
      chip.textContent = text;
      chips.appendChild(chip);
    });

    card.appendChild(chips);
    return card;
  }
  
  createTakeawaysStackVisual(data) {
    const card = document.createElement("div");
    card.className = "slide-visual-card visual-takeaways-card";

    const stack = document.createElement("div");
    stack.className = "visual-takeaways-stack";

    (data.layers || []).forEach((layer, index) => {
      const bar = document.createElement("div");
      bar.className = "takeaway-bar";
      bar.textContent = layer;
      bar.dataset.index = index;
      stack.appendChild(bar);
    });

    card.appendChild(stack);

    if (data.flagText) {
      const flag = document.createElement("div");
      flag.className = "takeaway-flag";
      flag.textContent = data.flagText;
      card.appendChild(flag);
    }

    return card;
  }
}

// Initialize when DOM is ready
let presentationOverlay;

document.addEventListener('DOMContentLoaded', () => {
  presentationOverlay = new PresentationOverlay();
  window.presentationOverlay = presentationOverlay;
});