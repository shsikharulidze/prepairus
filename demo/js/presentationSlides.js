// PrePair Presentation Slides Configuration
const presentationSlides = {
  1: {
    id: 1,
    keyboardKey: "1",
    label: "SLIDE 1 · HOOK: INTERNSHIPS ARE HARD TO GET",
    pages: [
      {
        id: "1",
        heading: "Internships are hard to get",
        intro: "This is what the internship system looks like when you are the student trying to get in:",
        bullets: [
          "Internships are **HARD** to get.",
          "Competition keeps rising while the number of internships barely increases.",
          "Most internships already ask for **prior experience**.",
          "That experience becomes the main thing that separates candidates.",
          "Internships were supposed to be a college student's **first step** into the professional world.",
          "If they already favor **prior experience**, they are not really a **first step** any more.",
          "So there is a gap: what actually comes **before** an internship now?"
        ]
      }
    ]
  }
  // Future slides will be added here: 2: {...}, 3: {...}, etc.
};

// Make available globally for static HTML environment
if (typeof window !== 'undefined') {
  window.presentationSlides = presentationSlides;
}

// Also support module exports if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = presentationSlides;
}