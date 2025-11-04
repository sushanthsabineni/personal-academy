# Professional eLearning Storyboard Template
## Industry-Standard Template Based on Best Practices & Award-Winning Course Design

---

## **What is an eLearning Storyboard?**

An eLearning storyboard is a detailed blueprint that outlines every aspect of your online course before development begins. It serves as the communication bridge between instructional designers, subject matter experts (SMEs), graphic designers, developers, and stakeholders. Think of it as the architectural plan for your course—specifying content, visuals, interactions, navigation, and technical requirements screen by screen.

**Key Benefits:**
- Ensures alignment with learning objectives
- Facilitates collaboration and feedback
- Reduces development time and costly revisions
- Provides clear technical specifications for developers
- Maintains consistency across the entire course
- Serves as documentation for future updates

---

## **Core Storyboard Template Structure**

### **Template Format Options**

Based on industry best practices, you can choose from four primary storyboard formats:

#### **1. Text-Based Template (pdf/Word)**
- **Best For:** Text-heavy courses, simple courses, remote collaboration
- **Advantages:** Easy commenting, track changes, SME-friendly, fast to create
- **Format:** Table-based document with rows and columns

#### **2. Visual Template (PowerPoint)**
- **Best For:** Highly visual courses, complex interactions, stakeholder presentations
- **Advantages:** Visual preview, multimedia representation, stakeholder buy-in
- **Format:** One slide per screen with visual mockups

---

## **Essential Storyboard Columns**

Every professional eLearning storyboard should include these **12 essential columns**:

### **1. Screen/Slide Number**
- **Purpose:** Unique identifier for each screen
- **Best Practice:** Use alphanumeric format (e.g., L001, L002, 1.1, 1.2) for easy reference and reordering
- **Example:** `1.1`, `1.2`, `2.1`, `Module1_Screen05`
- **Why Important:** Enables precise communication between team members without confusion

---

### **2. Module/Topic/Lesson Title**
- **Purpose:** Identifies the module and specific screen title
- **Best Practice:** Include both module name and screen-specific title for context
- **Example:** 
  - Module: "Customer Service Excellence"
  - Screen Title: "Greeting Customers - Best Practices"
- **Why Important:** Provides hierarchical context and course organization

---

### **3. Learning Objective**
- **Purpose:** Links each screen to specific learning outcomes
- **Best Practice:** Reference which learning objective(s) this screen addresses; ensure every element supports the objective
- **Example:** 
  - "LO1: Identify three key principles of customer service"
  - "LO3: Demonstrate proper phone etiquette in customer interactions"
- **Why Important:** Keeps content focused and measurable; aligns with Bloom's Taxonomy

---

### **4. On-Screen Text**
- **Purpose:** All visible text that learners will see
- **Best Practice:** Include headings, body text, button labels, navigation instructions, and any overlays
- **Example:**
  ```
  Heading: "Welcome to Customer Service 101"
  Subheading: "Building Lasting Customer Relationships"
  Body Text: "In this module, you'll learn the fundamental principles..."
  Button Label: "Click Next to Continue"
  Navigation: "Use arrows to navigate | Click menu for sections"
  ```
- **Why Important:** Ensures consistent messaging and reduces ambiguity

---

### **5. Voiceover/Audio Script**
- **Purpose:** Complete narration script with pronunciation guides and timing
- **Best Practice:** Include:
  - Phonetic spelling for complex terms
  - Emotional tone/delivery notes
  - Timing cues
  - Pauses for emphasis
  - Background music notes
- **Example:**
  ```
  [Warm, welcoming tone]
  "Welcome to this comprehensive training on customer service excellence. 
  [PAUSE 1 second]
  Throughout this course, you'll develop skills in communication, 
  problem-solving, and relationship management."
  
  [Background music: Soft, professional instrumental - fade out after 5 seconds]
  
  Pronunciation Guide: 
  - Excellence: ek-suh-luhns
  ```
- **Why Important:** Critical for narrator/voiceover artist; ensures proper delivery and accessibility (transcripts)

---

### **6. Visual/Graphics Description**
- **Purpose:** Details about images, videos, animations, and visual elements
- **Best Practice:** Include:
  - Visual style and mood
  - Placeholder descriptions
  - Stock image IDs
  - Character positions and expressions
  - Color schemes
  - Layout specifications
  - Animation descriptions
- **Example:**
  ```
  Background: Modern corporate office setting, bright natural lighting
  
  Main Image: 
  - Female professional, 30s, business casual attire
  - Friendly, approachable expression
  - Positioned right of screen
  - Stock Image ID: iStock-123456789
  
  Supporting Graphics:
  - Company logo (top left corner)
  - Three icon callouts (communication, empathy, problem-solving)
  - Color palette: Primary blue (#0052CC), Secondary gray (#F4F5F7)
  
  Animation: Character fades in from right (0.5s duration)
  ```
- **Why Important:** Guides graphic designers and ensures visual consistency

---

### **7. Interactions/Functionality**
- **Purpose:** Describes all interactive elements and user actions
- **Best Practice:** Detail:
  - Click areas and hotspots
  - Drag-and-drop mechanics
  - Hover states
  - Branching logic
  - Tab interactions
  - Accordion functionality
  - Slider controls
  - Input fields
- **Example:**
  ```
  Interaction Type: Click-to-reveal hotspots
  
  Setup: Three circular hotspots on screen labeled 1, 2, 3
  
  Behavior:
  - Initial State: All hotspots pulsing gently
  - On Click: Hotspot expands to show text layer
  - Display: Modal overlay with information + Close button
  - Tracking: Must click all 3 hotspots before Next button activates
  
  Branching Logic:
  - If user selects Option A → Jump to Slide 15 (Scenario 1)
  - If user selects Option B → Jump to Slide 18 (Scenario 2)
  - If user selects Option C → Show feedback layer, remain on current slide
  ```
- **Why Important:** Ensures proper technical implementation and engaging user experience

---

### **8. Developer/Programming Notes**
- **Purpose:** Technical instructions for eLearning developers
- **Best Practice:** Include:
  - Animation timing and effects
  - Transitions between screens
  - Trigger conditions
  - Variables and states
  - Layer behaviors
  - Special effects
  - Responsive design considerations
  - Conditional logic
- **Example:**
  ```
  Technical Specifications:
  
  Animations:
  - Fade in: 0.5s ease-in
  - Slide from left: Title (0.3s delay)
  - Bounce effect on button hover
  
  Triggers:
  - Show layer "Feedback_Correct" when user clicks Submit AND Variable_Score > 80
  - Hide layer when user clicks Close button
  - Change state of Button_Next to Normal when Timeline ends
  
  Variables:
  - Set Variable_Score = Variable_Score + 10 (when correct answer selected)
  - Set Variable_Attempts = Variable_Attempts + 1 (on each attempt)
  
  Transitions:
  - Slide transition: Fade (0.3s)
  
  Special Notes:
  - Ensure mobile touch targets are minimum 44x44 pixels
  - Test branching logic thoroughly before QA
  ```
- **Why Important:** Prevents technical ambiguity and ensures proper functionality

---

### **9. Assessment/Feedback**
- **Purpose:** Quiz questions, answer options, and feedback messages
- **Best Practice:** Include:
  - Question stem and context
  - All answer choices
  - Correct answer indication
  - Feedback for correct responses
  - Feedback for incorrect responses
  - Partial credit information
  - Number of attempts allowed
  - Scoring/points
- **Example:**
  ```
  Question Type: Multiple Choice (Single Answer)
  
  Question Stem: 
  "What is the FIRST step when greeting a customer in person?"
  
  Answer Options:
  A) Make eye contact and smile [CORRECT]
  B) Ask how you can help them
  C) Introduce yourself by name
  D) Offer them a seat
  
  Correct Feedback:
  "Excellent! Making eye contact and smiling creates an immediate positive 
  impression and shows you're approachable and ready to help."
  
  Incorrect Feedback:
  "Not quite. While [selected option] is important, the very first step is 
  to make eye contact and smile. This creates an immediate connection. 
  Review Section 2.1 for more details."
  
  Attempts Allowed: 2
  Points: 10 points
  Scoring: Full credit on first attempt, 5 points on second attempt
  ```
- **Why Important:** Ensures effective knowledge checks and meaningful learner feedback

---

### **10. Navigation**
- **Purpose:** Specifies navigation flow and user journey
- **Best Practice:** Indicate:
  - Standard navigation (Next/Previous/Menu)
  - Branching scenarios
  - Non-linear paths
  - Locked/unlocked progression
  - Jump-to-slide logic
  - Exit points
- **Example:**
  ```
  Navigation Type: Linear with conditional branching
  
  Standard Controls:
  - Next button (bottom right)
  - Previous button (bottom left)
  - Menu button (top left) - accessible anytime
  - Exit button (top right)
  
  Progression Rules:
  - User must complete all interactions before Next button activates
  - Cannot skip ahead until previous slides completed
  
  Branching:
  - After quiz (Slide 12):
    → Score ≥ 80%: Jump to Module 3 (Slide 25)
    → Score < 80%: Proceed to Remedial Content (Slide 13)
  
  Special Navigation:
  - "Return to Menu" button on all slides
  - Breadcrumb navigation showing current module position
  ```
- **Why Important:** Defines user flow and prevents navigation issues

---
### **11. Timing/Duration**
- **Purpose:** Estimated time for screen completion and pacing
- **Best Practice:** Include:
  - Estimated screen time
  - Video/audio duration
  - Interaction time
  - Total module duration
- **Example:**
  ```
  Estimated Screen Time: 1 minute 30 seconds
  
  Breakdown:
  - Voiceover: 45 seconds
  - Video: 30 seconds (auto-play)
  - User interaction time: 15 seconds (estimate)
  
  Module Total: 25 minutes (17 screens)
  Course Total: 2 hours 15 minutes (6 modules)
  ```
- **Why Important:** Helps with pacing, course planning, and learner expectations

---

## **Storyboard Best Practices**

### **The Three Qualities of Great Storyboards**

#### **1. Simplicity**
- Include only the **bare minimum** information needed
- Apply the **Principle of Least Effort** - people choose the path of least resistance
- Follow Meyer's **Coherence Principle** - exclude extraneous words, pictures, and sounds
- Remove unnecessary details that don't support development

#### **2. Scannability**
- Design for quick review and easy information access
- Use clear visual hierarchy and logical layout
- Apply the **Aesthetic Usability Effect** - when it looks good, people think it works better
- Make information relationships clear and intuitive

#### **3. Adaptability**
- Create templates that can be reused across projects
- Allow customization for different course types
- Be flexible enough for various instructional approaches
- Support both simple and complex course structures

---

## **15 Essential Best Practices**

1. **Keep the learning objective top of mind** - Every element must link back to a learning objective

2. **Consider different learning styles** - Include visual, auditory, and kinesthetic elements

3. **Be consistent** - Use the same structure, formatting, and style throughout

4. **Keep it visual** - Use mockups and wireframes when possible to convey the course look

5. **Use reference numbers** - Enable precise communication (e.g., "See Screen 1.3A")

6. **Break content into granular chunks** - One row per layer, interaction, or component

7. **Include comprehensive developer notes** - Eliminate ambiguity and guesswork

8. **Get early and frequent feedback** - Share with SMEs, stakeholders, and fresh eyes

9. **Create reusable templates** - Save time on future projects

10. **Map branching scenarios visually** - Use flowcharts for complex navigation paths

11. **Prioritize information** - Use the "Goldilocks" methodology - not too much, not too little

12. **Test navigation flow** - Walk through the user journey before development

13. **Consider accessibility from the start** - Don't retrofit; design inclusively

14. **Maintain version control** - Track changes, dates, and revision history

15. **Collaborate effectively** - Use tools that support commenting and real-time collaboration

---

## **10 Common Mistakes to Avoid**

1. **Too much detail** - Overwhelming reviewers with unnecessary information

2. **Too little detail** - Leaving developers guessing about implementation

3. **Inconsistent formatting** - Different structures across screens cause confusion

4. **Missing accessibility considerations** - Retrofitting is costly and time-consuming

5. **No clear navigation instructions** - Leads to user experience issues

6. **Ignoring mobile/responsive design needs** - 50%+ of learners access on mobile devices

7. **Weak or missing feedback** - Generic "Correct!" or "Incorrect" messages don't support learning

8. **Not aligning content with learning objectives** - Content exists without clear purpose

9. **Poor visual descriptions** - Graphic designers can't execute your vision

10. **Mixing storyboard with design document** - Keep the storyboard focused on course structure, not design theory

---

## **Sample Storyboard Template Table**

Below is a simplified storyboard template structure you can adapt:

| Screen # | Module/Title | Learning Objective | On-Screen Text | Voiceover Script | Visual Description | Interactions | Developer Notes | Assessment/Feedback | Navigation | Media Assets | Time |
|----------|--------------|-------------------|----------------|------------------|-------------------|--------------|----------------|-------------------|-----------|--------------|------|
| 1.1 | Module 1: Intro / Welcome Screen | N/A (Introduction) | Heading: "Welcome to Customer Service Excellence" Body: "This course will transform how you interact with customers." Button: "Get Started" | [Upbeat tone] "Welcome! In the next hour, you'll learn proven techniques to deliver exceptional customer service. Let's get started!" | Background: Modern office Hero image: Diverse team smiling Logo: Top left Corner | Click "Get Started" button Fade-in animation on load | Fade in: 0.5s Trigger: Jump to 1.2 when button clicked | N/A | Standard Next button (disabled initially) Get Started button → Slide 1.2 | Background_Office.jpg Logo_Company.svg Voiceover_1-1.mp3 | 30 sec |
| 1.2 | Module 1: Intro / Learning Objectives | LO1-LO5 | Heading: "What You'll Learn" - Identify 3 communication principles - Demonstrate active listening - Apply problem-solving framework | "By the end of this module, you'll be able to..." [Read objectives] | Numbered list (1-3) Icons next to each objective Animation: Objectives appear one by one | None (content slide) Auto-advance after voiceover | Animate in sequence: 1s between each Transition: Fade (0.3s) | N/A | Auto-advance to 1.3 after 15 seconds OR Next button enabled | Icons_Communication.svg Icons_Listening.svg Icons_Problem.svg Voiceover_1-2.mp3 | 45 sec |

---

## **Sample Visual Storyboard Layout (PowerPoint/Slides Format)**

```
┌──────────────────────────────────────────────────────────┐
│  SLIDE 1.1: Welcome Screen                               │
│  Module: Customer Service Excellence - Introduction     │
│  Learning Objective: N/A (Welcome/Orientation)          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [VISUAL MOCKUP - Include screenshot/wireframe]  │   │
│  │                                                  │   │
│  │  Company Logo            [Menu] [Exit]          │   │
│  │                                                  │   │
│  │     Welcome to Customer Service Excellence       │   │
│  │                                                  │   │
│  │  [Image: Diverse team smiling]                  │   │
│  │                                                  │   │
│  │  This course will transform how you             │   │
│  │  interact with customers.                       │   │
│  │                                                  │   │
│  │              [Get Started Button]                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ON-SCREEN TEXT:                                        │
│  - Heading: "Welcome to Customer Service Excellence"   │
│  - Body: "This course will transform..."               │
│  - Button: "Get Started"                               │
│                                                          │
│  VOICEOVER:                                             │
│  [Upbeat, welcoming tone]                              │
│  "Welcome! In the next hour, you'll learn proven       │
│  techniques to deliver exceptional customer service.   │
│  Let's get started!"                                   │
│                                                          │
│  VISUAL DETAILS:                                        │
│  - Background: Modern office setting (soft blue)       │
│  - Hero image: iStock-123456 (diverse team)           │
│  - Logo: Top left corner                              │
│  - Animation: Content fades in (0.5s)                 │
│                                                          │
│  INTERACTIONS:                                          │
│  - Click "Get Started" button → Jump to Slide 1.2     │
│  - Fade-in animation on screen load                   │
│                                                          │
│  DEVELOPER NOTES:                                       │
│  - Fade in duration: 0.5s ease-in                     │
│  - Button hover state: Slight scale (1.05)            │
│  - Trigger: Jump to 1.2 when Get Started clicked     │
│                                                          │
│  NAVIGATION: Get Started → 1.2                         │
│  ASSETS: Background_Office.jpg, Logo.svg, VO_1-1.mp3  │
│  TIMING: 30 seconds                                     │
└──────────────────────────────────────────────────────────┘
```

---

## **Workflow: How to Create Your Storyboard**

### **Phase 1: Planning & Analysis**

**Step 1: Define Learning Objectives**
- Identify target audience and their needs
- Establish clear, measurable learning outcomes
- Determine success criteria
- Align with business/training goals

**Step 2: Choose Instructional Design Approach**
- Select instructional design model (ADDIE, SAM, Action Mapping, etc.)
- Determine content presentation style (storytelling, scenarios, demonstrations)
- Decide on interactivity levels
- Plan assessment strategy

**Step 3: Gather and Organize Content**
- Collect source materials from SMEs
- Organize assets (images, videos, documents)
- Identify content gaps
- Prioritize information by importance

**Step 4: Create Course Outline**
- Break content into modules and lessons
- Sequence topics logically
- Define module learning objectives
- Estimate duration for each module

**Step 5: Select Storyboard Template**
- Choose format (Word, PowerPoint, Excel, authoring tool)
- Customize columns based on project needs
- Set up version control
- Share template with team for feedback

---

### **Phase 2: Content Sequencing**

**Step 6: Create First Draft**
- Add one slide/page per learning objective
- Follow course outline structure
- Focus on flow, not detail yet
- Prioritize objectives by importance

**Step 7: Add Content Details**
- Write on-screen text
- Draft voiceover scripts
- Describe visual elements
- Define interactions

**Step 8: Design Assessments**
- Create quiz questions aligned with objectives
- Write detailed feedback (correct and incorrect)
- Determine scoring criteria
- Place assessments strategically

**Step 9: Map Navigation**
- Define user journey
- Create branching logic for scenarios
- Ensure clear pathways
- Add visual flowchart for complex branching

---
## **Quality Checklist**

Before finalizing your storyboard, verify:

**Content:**
- [ ] All learning objectives are addressed
- [ ] Content is accurate and up-to-date
- [ ] Information is appropriately chunked
- [ ] Examples are relevant and diverse
- [ ] Assessments align with objectives

**Design:**
- [ ] Visual descriptions are clear
- [ ] Interactions are well-defined
- [ ] Navigation is intuitive
- [ ] Branding is consistent
- [ ] Accessibility is considered

**Technical:**
- [ ] All assets are listed with specs
- [ ] Developer notes are comprehensive
- [ ] Branching logic is documented
- [ ] Timing is estimated
- [ ] File naming is consistent

**Review:**
- [ ] SME has reviewed content
- [ ] Stakeholders have approved approach
- [ ] Legal/compliance has cleared (if needed)
- [ ] Version control is documented
- [ ] Final approval is obtained

---

## **Conclusion**

A well-crafted storyboard is the foundation of successful eLearning development. By following industry best practices and using a comprehensive template structure, you'll:

✅ **Reduce development time and costs**
✅ **Improve collaboration among team members**
✅ **Ensure alignment with learning objectives**
✅ **Create better learning experiences**
✅ **Minimize revisions and rework**

Remember: The best storyboard is **simple, scannable, and adaptable**. Start with this template, customize it for your needs, and refine it based on your team's feedback and project requirements.

---

**Document Version:** 1.0  
**Created:** November 2025  
**Based on:** Industry research, award-winning eLearning practices, and professional instructional design standards