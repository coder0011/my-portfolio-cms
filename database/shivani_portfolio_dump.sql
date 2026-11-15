-- ========================================================
-- Shivani // UI/UX Designer & Frontend Developer
-- Complete Portfolio CMS Data Dump
-- Compatible with MySQL 8.0+ / MariaDB 10.4+ / phpMyAdmin
-- Generated for Database: `my-portfolio-cms`
-- ========================================================

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- 1. Truncate Existing Portfolio Tables
-- --------------------------------------------------------
TRUNCATE TABLE `settings`;
TRUNCATE TABLE `educations`;
TRUNCATE TABLE `experiences`;
TRUNCATE TABLE `projects`;
TRUNCATE TABLE `categories`;
TRUNCATE TABLE `posts`;
TRUNCATE TABLE `category_post`;
TRUNCATE TABLE `comments`;
TRUNCATE TABLE `contacts`;
TRUNCATE TABLE `subscribers`;
TRUNCATE TABLE `users`;

-- --------------------------------------------------------
-- 2. Populate `users` (Super Admin & Author: Shivani)
-- Password is: password
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `avatar`, `bio`, `email_verified_at`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Shivani', 'shivani.uiux@gmail.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', 'Senior UI/UX Designer & Frontend Engineer with 6+ years of experience blending user-centric interaction design with modern React, Next.js, and design token architectures.', NOW(), '$2y$12$K1dJ7L9vG2kQW8nZ0f5m.O4bUa6yC3eDf7gHi8jKlMnOpQrStUvWx', NOW(), NOW());

-- --------------------------------------------------------
-- 3. Populate `settings` (Site Settings & Profile)
-- --------------------------------------------------------
INSERT INTO `settings` (`key`, `value`, `created_at`, `updated_at`) VALUES
('site_name', 'Shivani // UI/UX & Frontend Developer', NOW(), NOW()),
('site_meta_title', 'Shivani | Senior UI/UX Designer & Frontend Developer Portfolio', NOW(), NOW()),
('site_meta_description', 'Portfolio of Shivani, a Senior UI/UX Designer & Frontend Developer crafting human-centered digital experiences, robust design systems, and modern React & Next.js applications.', NOW(), NOW()),
('owner_name', 'Shivani', NOW(), NOW()),
('owner_title', 'UI/UX Designer & Frontend Developer', NOW(), NOW()),
('owner_bio_short', 'UI/UX Designer and Frontend Developer crafting delightful digital experiences through human-centered design, robust design systems, and modern frontend code.', NOW(), NOW()),
('owner_bio_long', 'I bridge the gap between human intuition and engineering precision. Over the past 6+ years, I have crafted design systems, conducted deep qualitative user research, and engineered high-performance frontend interfaces using React, Next.js, Tailwind CSS, and Framer Motion. My design philosophy prioritizes clarity, emotional connection, accessibility (WCAG 2.1 AA), and fluid micro-interactions.', NOW(), NOW()),
('total_experience', '6+', NOW(), NOW()),
('google_map_link', 'https://maps.app.goo.gl/rPGukw6MKhQc1V3k6', NOW(), NOW()),
('contact_email', 'shivani.uiux@gmail.com', NOW(), NOW()),
('contact_phone', '+91-9876543210', NOW(), NOW()),
('contact_location', 'Jaipur, Rajasthan', NOW(), NOW()),
('contact_address', 'Jaipur, Rajasthan, India', NOW(), NOW()),
('cv_file_path', '/cv/shivani-resume.pdf', NOW(), NOW()),
('site_logo', '/images/logo.png', NOW(), NOW()),
('site_favicon', '/images/favicon.png', NOW(), NOW()),
('social_links', '[{"icon":"linkedin","name":"LinkedIn","url":"https://linkedin.com/in/shivani-uiux","sort_order":1},{"icon":"github","name":"GitHub","url":"https://github.com/shivani-dev","sort_order":2},{"icon":"dribbble","name":"Dribbble","url":"https://dribbble.com/shivani_designs","sort_order":3},{"icon":"behance","name":"Behance","url":"https://behance.net/shivani_creative","sort_order":4},{"icon":"instagram","name":"Instagram","url":"https://instagram.com/shivani.uiux","sort_order":5},{"icon":"whatsapp","name":"WhatsApp","url":"https://wa.me/919876543210","sort_order":6},{"icon":"email","name":"Email","url":"mailto:shivani.uiux@gmail.com","sort_order":7}]', NOW(), NOW());

-- --------------------------------------------------------
-- 4. Populate `educations` (Academic & Design Milestones)
-- --------------------------------------------------------
INSERT INTO `educations` (`id`, `degree`, `institution`, `period`, `description`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Bachelor of Design (B.Des) in Interaction & Communication Design', 'National Institute of Design (NID) / RTU', '2017 - 2021', 'Focused on cognitive psychology, typography hierarchy, visual communication, design ethnography, and human-computer interaction (HCI). Graduated with academic distinction.', 1, NOW(), NOW()),
(2, 'Professional Certification in Design Systems & Usability Engineering', 'Interaction Design Foundation (IxDF) & Nielsen Norman Group', '2021 - 2022', 'In-depth specialization in multi-brand token pipelines, WCAG 2.1 AA accessibility guidelines, quantitative usability testing, and cross-platform design architectures.', 2, NOW(), NOW());

-- --------------------------------------------------------
-- 5. Populate `experiences` (Professional Career Milestones)
-- --------------------------------------------------------
INSERT INTO `experiences` (`id`, `job_title`, `company`, `period`, `description`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Lead UI/UX Designer & Frontend Engineer', 'Studio Apex Digital', '2023 - Present', 'Leading the design and frontend engineering practice across fintech, healthcare, and SaaS product portfolios. Built a token-driven Figma component library and matching React UI system utilized by 6 engineering teams, slashing feature turnaround time by 40%. Delivered accessible Next.js interfaces with 98+ Lighthouse scores.', 1, NOW(), NOW()),
(2, 'Senior UI/UX Designer & Frontend Developer', 'Kadam Technologies P.V.T L.T.D', '2021 - 2023', 'Led end-to-end user research, information architecture, wireframing, and React/Next.js frontend implementation for global clients. Redesigned a multi-tenant healthcare application, reducing user task completion time by 32% and increasing overall platform adoption by 28%.', 2, NOW(), NOW()),
(3, 'UI/UX Designer & Interactive Web Developer', 'PixelCraft Creative Studio', '2019 - 2021', 'Designed visual identities, brand guidelines, mobile app prototypes, and high-impact marketing websites. Built animated web experiences using JavaScript, Tailwind CSS, and Framer Motion, prioritizing tactile micro-interactions and smooth user onboarding flows.', 3, NOW(), NOW());

-- --------------------------------------------------------
-- 6. Populate `projects` (UI/UX & Frontend Case Studies)
-- --------------------------------------------------------
INSERT INTO `projects` (`id`, `title`, `subtitle`, `role`, `link`, `links_additional`, `description`, `image_path`, `project_folder`, `is_featured`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'NeoPay — Neobank & Financial Hub', 'Mobile Banking UI/UX & React Design System', 'Lead Product Designer & Frontend Lead', 'https://neopay-finance.app', '[{\"title\":\"Figma Prototype\",\"url\":\"https://figma.com/@shivani/neopay\"},{\"title\":\"Live Web App\",\"url\":\"https://neopay-finance.app\"}]', 'Designed and developed a modern neobanking mobile application and web dashboard. Conducted contextual inquiry across 45 participants, simplified multi-currency transfers, and built a token-driven component library with React and Framer Motion. Reduced KYC transaction drop-off by 34%.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80', 'neopay-fintech', 1, 1, NOW(), NOW()),

(2, 'Aura Health — Telemedicine & Clinical Portal', 'Accessible Healthcare Interface & Design System', 'UI/UX Architect & Frontend Developer', 'https://aurahealth.io', '[{\"title\":\"Case Study\",\"url\":\"https://aurahealth.io/case-study\"},{\"title\":\"Clinical Portal\",\"url\":\"https://clinic.aurahealth.io\"}]', 'Architected an accessible, HIPAA-compliant patient management and virtual consultation platform. Implemented strict WCAG 2.1 AA color contrast standards, large-target touch controls, and high-legibility typographic scales. Developed the frontend with Next.js 15, Tailwind CSS, and Radix UI primitives.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80', 'aura-health', 1, 2, NOW(), NOW()),

(3, 'Lumina — Multi-Brand Enterprise Design System', 'Design Tokens & Headless React Component Library', 'Design Systems Engineer', 'https://lumina-design.dev', '[{\"title\":\"Storybook Docs\",\"url\":\"https://storybook.lumina-design.dev\"},{\"title\":\"Figma Community\",\"url\":\"https://figma.com/@shivani/lumina\"}]', 'Created an enterprise-grade design system comprising 80+ accessible components, automated Figma-to-code token pipelines with Style Dictionary, and complete Storybook documentation. Supports seamless dark/light modes, multi-brand theming, and reduced frontend development cycle times by 45%.', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80', 'lumina-design-system', 1, 3, NOW(), NOW()),

(4, 'OmniFlow — Cloud Observability & Analytics Dashboard', 'Complex Data Visualization & Metric Heuristics', 'Senior UI/UX & React Engineer', 'https://omniflow-cloud.io', '[{\"title\":\"Live Dashboard\",\"url\":\"https://omniflow-cloud.io/demo\"}]', 'Engineered an intuitive monitoring dashboard displaying high-volume real-time server metrics, latency heatmaps, and query timelines. Streamlined cognitive load through progressive disclosure, customized D3.js and Recharts visualizations, and built a lightning-fast React frontend with virtualized data grids.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', 'omniflow-dashboard', 1, 4, NOW(), NOW()),

(5, 'Artisan & Co. — Luxury Minimalist E-Commerce', 'Editorial Storefront & Fluid Motion Experience', 'Frontend Motion Specialist & Visual Designer', 'https://artisan-living.store', '[{\"title\":\"Storefront\",\"url\":\"https://artisan-living.store\"}]', 'Designed an editorial, high-fashion home goods shopping experience. Built bespoke micro-interactions, smooth page transitions, custom cursor states, and image zoom choreography using Next.js, GSAP, and Tailwind CSS. Increased checkout conversion rate by 22%.', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80', 'artisan-living', 1, 5, NOW(), NOW()),

(6, 'EduSpark — Interactive STEM Learning Platform', 'Gamified EdTech Platform for Young Learners', 'Product Designer & Frontend Developer', 'https://eduspark-learn.org', '[{\"title\":\"Interactive Demo\",\"url\":\"https://eduspark-learn.org/explore\"}]', 'Reimagined online STEM education for K-12 students. Crafted playful visual rewards, progress badge animations, and responsive quiz interfaces that encourage active learning. Developed interactive canvas-based exercises with React and HTML5 Canvas API.', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80', 'eduspark-learning', 1, 6, NOW(), NOW()),

(7, 'Verve Mobility — Smart EV Fleet Charging App', 'IoT Driver Interface & Route Telemetry', 'UI/UX Researcher & Mobile Developer', 'https://verve-ev.com', NULL, 'Designed mobile charging station discovery with real-time slot booking, live battery telemetry, and route planning. Mapped field-tested user journeys for drivers during rapid transit stops. Developed using React Native, Mapbox GL, and Tailwind.', 'https://images.unsplash.com/photo-1558441719-7d88e040c5e3?auto=format&fit=crop&w=800&q=80', NULL, 0, 7, NOW(), NOW()),

(8, 'Kura Coffee Roasters — Direct-Trade Subscription', 'Brand Identity, Digital Packaging & Headless Store', 'Lead Designer & Frontend Developer', 'https://kuracoffee.com', NULL, 'Complete end-to-end brand identity and digital platform. Created custom illustrations, an interactive coffee flavor wheel, a personalized subscription builder, and a responsive headless Shopify checkout.', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80', NULL, 0, 8, NOW(), NOW());

-- --------------------------------------------------------
-- 7. Populate `categories` (Design & Engineering Disciplines)
-- --------------------------------------------------------
INSERT INTO `categories` (`id`, `title`, `slug`, `description`, `created_at`, `updated_at`) VALUES
(1, 'UI/UX Design', 'ui-ux-design', 'User research, wireframing, interface heuristics, cognitive psychology, and human-centered design patterns.', NOW(), NOW()),
(2, 'Design Systems', 'design-systems', 'Design tokens, Figma component architecture, Storybook documentation, and scalable multi-brand component libraries.', NOW(), NOW()),
(3, 'Frontend Engineering', 'frontend-engineering', 'Modern React, Next.js, TypeScript, state architectures, and high-performance DOM rendering.', NOW(), NOW()),
(4, 'Micro-Interactions & Motion', 'micro-interactions-motion', 'Physics-based animations, Framer Motion choreography, WebGL shaders, and tactile visual feedback.', NOW(), NOW()),
(5, 'Accessibility (a11y)', 'accessibility', 'WCAG 2.1 AA compliance, keyboard navigation, screen reader ergonomics, and high-contrast color palettes.', NOW(), NOW());

-- --------------------------------------------------------
-- 8. Populate `posts` (In-Depth Technical & Design Articles)
-- --------------------------------------------------------
INSERT INTO `posts` (`id`, `title`, `slug`, `excerpt`, `body`, `main_image`, `published_at`, `likes_count`, `difficulty`, `estimated_time`, `tags`, `categories`, `meta_title`, `meta_description`, `focus_keyword`, `secondary_keywords`, `faqs`, `no_index`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 'Bridging the Gap Between Figma and React: Building Token-Driven Design Systems', 'bridging-the-gap-figma-react-design-tokens', 'How establishing unified W3C design tokens and automated Style Dictionary pipelines transforms designer-developer collaboration from constant friction into continuous synchronization.', 
'### Why Design Tokens are the True Contract

When designing and engineering scalable digital products, the handoff between Figma mockups and React code is traditionally fraught with discrepancies: slightly mismatched padding, divergent color values, and inconsistent border radiuses.

Design tokens solve this problem by serving as the atomic source of truth.

> [!NOTE]
> A design token is an immutable key-value pair that abstracts visual choices (colors, spacing, typography scales, elevation shadows) into platform-agnostic definitions.

```json
{
  "color": {
    "brand": {
      "primary": { "value": "#6366f1", "type": "color" },
      "secondary": { "value": "#ec4899", "type": "color" }
    }
  },
  "spacing": {
    "card-padding": { "value": "1.5rem", "type": "spacing" }
  }
}
```

### The Three-Tier Token Architecture

To build a resilient multi-brand or dark-mode system, structure your tokens into three hierarchical layers:

1. **Global Tokens**: Raw design primitives (`blue-500: #3b82f6`, `radius-md: 8px`).
2. **Semantic Tokens**: Contextual roles (`surface-background: {global.neutral-900}`, `text-highlight: {global.blue-500}`).
3. **Component Tokens**: Targeted bindings (`button-primary-bg: {semantic.brand-accent}`).

| Tier | Example Name | Value Reference | Purpose |
| :--- | :--- | :--- | :--- |
| Global | `color.indigo.500` | `#6366f1` | Raw palette foundation |
| Semantic | `action.primary.bg` | `{color.indigo.500}` | Intent & Dark mode switching |
| Component | `btn.primary.fill` | `{action.primary.bg}` | Component isolation |

### Automated Pipeline with Style Dictionary & Tailwind

By running automated GitHub Actions on Figma library publications, Style Dictionary converts the token JSON directly into:
- CSS Custom Variables (`var(--color-primary)`)
- Tailwind Theme Extension rules
- TypeScript type definitions

This guarantees that a visual change approved in Figma immediately reflects in pull requests without manual developer re-keying.', 
'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', NOW(), 42, 'intermediate', '7 min read', '[\"Design Systems\",\"Figma\",\"React\",\"Tokens\",\"Tailwind CSS\"]', '[\"Design Systems\",\"Frontend Engineering\"]', 'Figma to React Design Tokens Guide | Shivani', 'Complete guide to building automated, token-driven design systems bridging Figma and React component libraries.', 'Design Tokens', '[\"Figma to Code\",\"Style Dictionary\",\"Design System Architecture\"]', '[{\"question\":\"What is a design token?\",\"answer\":\"Design tokens are platform-agnostic variables that store visual design attributes like colors, typography, and spacing in a format that both designers and developers can use simultaneously.\"}]', 0, 1, NOW(), NOW()),

(2, 'Micro-Interactions that Delight: Physics-Based Motion with Framer Motion', 'micro-interactions-physics-based-motion-framer', 'Exploring spring physics, gesture dampening, and layout animations to create web interfaces that feel tactile, responsive, and genuinely alive.', 
'### Why Timing Curves Feel Robotic

Traditional CSS `ease-in-out` transitions work along fixed cubic-bezier curves. While adequate for fade transitions, they fail to simulate real-world physics because physical objects carry momentum, friction, and mass.

When you switch to physics-based spring models, UI interactions feel tangible:

```jsx
import { motion } from "framer-motion";

export function TactileCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.8
      }}
      className="glass-card"
    >
      <h3>Tactile Response</h3>
      <p>Feels responsive without bouncing excessively.</p>
    </motion.div>
  );
}
```

> [!TIP]
> Keep `stiffness` between 300-500 and `damping` between 20-30 for interactive buttons. Higher damping prevents distracting oscillations.

### Choreographing Layout Animations

One of the most complex challenges in modern frontend design is smoothly transitioning elements when sibling nodes are inserted or removed. With Framer Motion\'s `layout` and `layoutId` primitives, elements smoothly animate between container bounds automatically without manual coordinate calculation.', 
'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80', NOW(), 38, 'advanced', '6 min read', '[\"Framer Motion\",\"Animation\",\"Micro-Interactions\",\"React\",\"UI/UX\"]', '[\"Micro-Interactions & Motion\",\"Frontend Engineering\"]', 'Physics-Based Micro-Interactions in React | Shivani', 'How to craft physics-driven micro-interactions and smooth layout transitions using Framer Motion.', 'Framer Motion Spring Physics', '[\"Micro-interactions\",\"React Animation\",\"Tactile UI\"]', NULL, 0, 1, NOW(), NOW()),

(3, 'Designing for Extreme Usability: A Practical Guide to WCAG 2.1 AA Compliance', 'designing-for-usability-wcag-accessibility-guide', 'Accessibility is not an afterthought or compliance checklist — it is the bedrock of world-class design. Here is how to engineer color contrast, focus rings, and screen-reader hierarchies.', 
'### The Business and Human Case for Accessibility

Over 1.3 billion people experience significant disability worldwide. When we treat accessibility as an afterthought, we alienate users and build fragile products.

Adhering to WCAG 2.1 AA standards creates interfaces that are cleaner, more readable, and faster to navigate for everyone.

### Color Contrast: Beyond Simple Ratios

While the traditional 4.5:1 contrast ratio is the minimum baseline, modern UI requires consideration of chromatic aberration and ambient glare.

- **Body Text**: Target minimum 7:1 against background for optimal reading stamina.
- **Form Borders & Icons**: Minimum 3:1 against adjacent surfaces to ensure interactive affordance is evident.

```css
/* Visible, high-contrast accessible focus ring */
:focus-visible {
  outline: 2px solid var(--accent-pink, #ec4899);
  outline-offset: 3px;
  border-radius: 4px;
}
```

> [!IMPORTANT]
> Never remove `:focus` outlines (`outline: none`) without providing an equally prominent, custom `:focus-visible` styling indicator.

### Semantic Landmark Architecture

Screen reader users navigate complex web applications by jumping between landmark tags. Structure your JSX cleanly with `<header>`, `<nav>`, `<main>`, `<article>`, and `<footer>` rather than generic `<div>` soup.', 
'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', NOW(), 51, 'beginner', '8 min read', '[\"Accessibility\",\"a11y\",\"WCAG\",\"UI/UX\",\"Inclusive Design\"]', '[\"Accessibility (a11y)\",\"UI/UX Design\"]', 'WCAG 2.1 AA Usability & Accessibility Guide | Shivani', 'Practical engineering and design strategies to ensure WCAG 2.1 AA compliance in modern web apps.', 'WCAG Accessibility', '[\"Web Accessibility\",\"Screen Reader Design\",\"a11y\"]', NULL, 0, 1, NOW(), NOW()),

(4, 'The Psychology of Onboarding: Reducing Cognitive Load in SaaS Interfaces', 'psychology-of-onboarding-reducing-cognitive-load', 'Why most user drop-offs happen in the first 90 seconds, and how progressive disclosure, Hick\'s Law, and contextual empty states create effortless product adoption.', 
'### The First 90 Seconds Determine Retention

When a user registers for a new product, their cognitive energy is at its peak vulnerability. Presenting them with a 15-step wizard or empty dashboards with 40 disabled navigation buttons immediately triggers choice paralysis.

### The Principles of Frictionless Onboarding

1. **Hick\'s Law**: The time it takes to make a decision increases logarithmically with the number and complexity of choices. Keep the initial setup to 1 primary choice.
2. **Progressive Disclosure**: Only present details when the user specifically requires them. Defer secondary configuration to later milestones.
3. **Action-Oriented Empty States**: Never show a blank white page. Provide a pre-filled sample template or a single prominent "Create First Project" call-to-action.', 
'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80', NOW(), 29, 'intermediate', '5 min read', '[\"UX Psychology\",\"Onboarding\",\"SaaS\",\"Product Design\",\"Cognitive Load\"]', '[\"UI/UX Design\"]', 'SaaS Onboarding UX & Cognitive Load | Shivani', 'Techniques for designing effortless onboarding flows that retain users using cognitive psychology principles.', 'SaaS Onboarding Psychology', '[\"User Onboarding\",\"Hick Law UX\",\"Progressive Disclosure\"]', NULL, 0, 1, NOW(), NOW());

-- --------------------------------------------------------
-- 9. Populate `category_post` (Pivot Table)
-- --------------------------------------------------------
INSERT INTO `category_post` (`category_id`, `post_id`, `created_at`, `updated_at`) VALUES
(2, 1, NOW(), NOW()), -- Post 1: Design Systems
(3, 1, NOW(), NOW()), -- Post 1: Frontend Engineering
(4, 2, NOW(), NOW()), -- Post 2: Micro-Interactions & Motion
(3, 2, NOW(), NOW()), -- Post 2: Frontend Engineering
(5, 3, NOW(), NOW()), -- Post 3: Accessibility
(1, 3, NOW(), NOW()), -- Post 3: UI/UX Design
(1, 4, NOW(), NOW()); -- Post 4: UI/UX Design

-- --------------------------------------------------------
-- 10. Populate `comments` (Sample Reader Feedback)
-- --------------------------------------------------------
INSERT INTO `comments` (`id`, `post_id`, `parent_id`, `name`, `comment`, `user_id`, `approved`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 'Aarav Mehta', 'The 3-tier token breakdown is brilliant. We were having massive headaches syncing Figma variables with Tailwind v4, and this pipeline structure clarifies everything!', NULL, 1, NOW(), NOW()),
(2, 1, 1, 'Shivani', 'Thanks Aarav! Glad it helped. Style Dictionary 4 has native support for W3C token formats now, which makes the automated export even smoother.', '1', 1, NOW(), NOW()),
(3, 2, NULL, 'Elena Rostova', 'Loved the spring stiffness and damping reference table. Most tutorials only show layoutId without explaining how to dampen bounce.', NULL, 1, NOW(), NOW()),
(4, 3, NULL, 'Marcus Chen', 'Bookmarked this article. The visual reminder to never remove focus outlines without a replacement should be posted on every developer\'s monitor.', NULL, 1, NOW(), NOW());

-- --------------------------------------------------------
-- 11. Populate `contacts` (Sample Inquiries)
-- --------------------------------------------------------
INSERT INTO `contacts` (`id`, `name`, `email`, `subject`, `message`, `created_at`, `updated_at`) VALUES
(1, 'Vikram Malhotra', 'vikram@stellarfintech.com', 'Design System Consultation for FinTech App', 'Hi Shivani, we loved your work on the NeoPay case study. We are redesigning our investment dashboard and would love to consult with you on establishing a token-driven design system and React component library.', NOW(), NOW()),
(2, 'Sarah Jenkins', 's.jenkins@healthflow.co.uk', 'Senior UI/UX & Frontend Contract Role', 'Hello Shivani! Your telemetry and accessibility design work on Aura Health caught our team\'s attention. Are you currently open to remote product design and frontend consulting engagements?', NOW(), NOW());

-- --------------------------------------------------------
-- 12. Populate `subscribers` (Newsletter Subscribers)
-- --------------------------------------------------------
INSERT INTO `subscribers` (`id`, `email`, `verified_at`, `subscribed_at`, `created_at`, `updated_at`) VALUES
(1, 'design.digest@agency.io', NOW(), NOW(), NOW(), NOW()),
(2, 'frontend.lead@innovate.co', NOW(), NOW(), NOW(), NOW()),
(3, 'ux.researcher@saasflow.com', NOW(), NOW(), NOW(), NOW());

-- --------------------------------------------------------
-- 13. Populate Spatie Roles & Permissions
-- --------------------------------------------------------
INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'web', NOW(), NOW()),
(2, 'Editor', 'web', NOW(), NOW()),
(3, 'Moderator', 'web', NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `permissions` (`name`, `guard_name`, `created_at`, `updated_at`) VALUES
('posts.create', 'web', NOW(), NOW()),
('posts.edit', 'web', NOW(), NOW()),
('posts.delete', 'web', NOW(), NOW()),
('posts.publish', 'web', NOW(), NOW()),
('revisions.restore', 'web', NOW(), NOW()),
('comments.approve', 'web', NOW(), NOW()),
('comments.delete', 'web', NOW(), NOW()),
('subscribers.manage', 'web', NOW(), NOW()),
('contacts.manage', 'web', NOW(), NOW()),
('logs.view', 'web', NOW(), NOW()),
('educations.manage', 'web', NOW(), NOW()),
('experiences.manage', 'web', NOW(), NOW()),
('projects.manage', 'web', NOW(), NOW()),
('users.manage', 'web', NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Grant all permissions to Super Admin role
INSERT INTO `role_has_permissions` (`permission_id`, `role_id`)
SELECT p.id, r.id FROM `permissions` p CROSS JOIN `roles` r WHERE r.name = 'Super Admin'
ON DUPLICATE KEY UPDATE `role_id` = VALUES(`role_id`);

-- Assign Super Admin role to all users (including user 1: Shivani)
INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`)
SELECT r.id, 'App\\Models\\User', u.id
FROM `roles` r
CROSS JOIN `users` u
WHERE r.name = 'Super Admin'
ON DUPLICATE KEY UPDATE `role_id` = VALUES(`role_id`);

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
