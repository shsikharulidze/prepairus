// PrePair Presentation Slides Configuration
const presentationSlides = {
  1: {
    id: 1,
    keyboardKey: "1",
    label: "Slide 1: Hook – Internships are hard to get",
    pages: [
      {
        id: "1a",
        heading: "Internships are hard to get",
        intro: "Start by grounding the audience in the reality students face when they try to get internships:",
        bullets: [
          "Internships are **HARD** to get.",
          "Competition has increased while the number of available positions has decreased.",
          "Most internships require a certain amount of **prior experience**.",
          "Experience becomes the main way to differentiate yourself from other candidates."
        ]
      },
      {
        id: "1b",
        heading: "The contradiction in the system",
        intro: "Then highlight the logical contradiction in how internships are supposed to work versus how they actually work today:",
        bullets: [
          "There is a clear **contradiction** in the current internship system.",
          "An internship was originally designed as a college student's **first step** into the professional world.",
          "How can someone claim that an internship is a first step if it already favors **prior experience**?",
          "The answer is simple: internships are no longer truly the **first step** students take into the professional world. Something needs to come before them."
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