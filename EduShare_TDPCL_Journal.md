# TRANS DISCIPLINARY – PROJECT CENTRIC LEARNING (TD-PCL)
## REFLECTION JOURNAL: EduShare Platform (2025-2028)

---

### 1. PROJECT OVERVIEW

| Section | Humanized Content |
| :--- | :--- |
| **Project Title** | **EduShare** — Advanced Peer-to-Peer Learning Ecosystem |
| **Problem / Challenge being addressed** | Modern education often feels isolated. Students possess valuable knowledge but lack a structured, rewarding way to share it with their peers. Traditional platforms are usually top-down and lack a "peer" element. We aimed to bridge this "knowledge gap" by creating an ecosystem where sharing a resource is a valuable contribution to a decentralized learning economy, rewarding students for their expertise and helping others excel. |
| **Intersecting Disciplines and Knowledge Areas** | This project sits at the intersection of **Software Engineering** (scalable Next.js/MERN architectures), **Educational Pedagogy** (designing effective assessment tools), and **Behavioral Economics** (creating a credit-based incentive system to drive community engagement). |
| **Goals and Expected Outcome** | Our goal was to build a self-sustaining community of learners. The outcome is a high-performance platform where students upload tutorials, earn credits, and use those credits to "unlock" premium resources or live sessions—all managed through a professional administrative moderation suite. |

---

### 2. FORTNIGHTLY REFLECTIONS

#### Week 1 & 2: Environmental Exploration & Student Surveys
**Key Activities & Progress:**
The first two weeks were focused on "Discovery and Validation." Before writing any code, we spent time exploring our university environment to understand the actual pain points students face when looking for study materials. We conducted an informal survey across different departments to ask what students wanted most in a peer-learning platform.

The survey results were clear: students felt that while there is plenty of information online, it lacks the "relevance" that peer-created notes provide. Based on this feedback, we refined our project idea into **EduShare**—a platform centered on verified student content. Once the idea was validated by our peers, we proceeded to set up our development environment and initialized the **Next.js 14** project structure to begin the build phase.

#### Week 3 & 4: Architecture Design & Authentication
**Key Activities & Progress:**
In this phase, we focused on the "Skeleton" of EduShare. We spent most of our time designing the **MongoDB Schema** to ensure that data relationships between users, resources, and their credits were optimized for performance. 

We also implemented the **Firebase Authentication** system. This was a slow process because we had to ensure that user roles (Student vs. Admin) were correctly synchronized between Firebase and our internal database. We successfully built a basic landing page and a secure login/signup flow, ensuring that only authenticated users could access the internal dashboard.

#### Week 5 & 6: Content Hub & Basic Resource Uploads
**Key Activities & Progress:**
With the foundation set, we moved on to the **Content Hub**. This was a major milestone where we implemented the logic for students to view a list of available resources. We integrated **AWS S3** with pre-signed URLs, which was a steep learning curve for the team. 

Instead of jumping straight to the credit economy, we focused on making the upload process robust. We spent time debugging the "Multipart Upload" logic to ensure that even large PDF files or short videos wouldn't time out. By the end of Week 6, a user could successfully upload a resource and have it appear in the community library.

#### Week 7 & 8: The Credit Economy & Quiz Integration
**Key Activities & Progress:**
This was the most complex phase of the project. We finally implemented the **Atomic Credit System**. We had to be very careful to ensure that credits are transferred reliably between peers without any "double-spending" or data corruption. 

We also started building the **Quiz Engine**. This was an iterative process—we first built a simple multiple-choice form and then slowly integrated it into the resource view so that a user has to "pass" a quiz to earn credits. Testing these transaction flows took most of our time, but it was essential to ensure the platform's integrity.

#### Week 9 & 10: Admin Dashboard & Production Audit
**Key Activities & Progress:**
In the final weeks, we focused on "Oversight and Optimization." We built the **Admin Dashboard**, which provides a bird's-eye view of the platform's activity using simple SVG visualizations. This was a slow process of mapping database metrics to visual charts.

We also conducted a thorough **Production Readiness Audit**. This involved silencing development-only logs, optimizing API response times, and finalizing our legal documentation (Privacy Policy and DMCA). We spent the last few days bug-hunting and ensuring that the platform feels polished and professional for the final submission.

---

### 3. TECHNICAL SPECIFICATIONS (EVIDENCE OF WORK)

*   **Frontend**: Next.js 14 (App Router), Framer Motion, Tailwind CSS.
*   **Backend**: Node.js, Next.js API Routes, Mongoose.
*   **Identity**: Firebase Auth + Custom Role Synchronization.
*   **Storage**: AWS S3 (Presigned URLs) & CloudFront.
*   **Monitoring**: Sentry (Error Tracking) & Upstash Redis (Rate Limiting).

---

### 4. PERSONAL REFLECTION
The journey of building **EduShare** has been transformative. It taught us that engineering is not just about writing code, but about solving human problems. Watching the platform evolve from a simple idea to a complex, credit-driven economy has been incredibly rewarding. We are proud to have built a tool that can truly empower students to help one another.
