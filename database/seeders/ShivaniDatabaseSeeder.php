<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Post;
use App\Models\Project;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ShivaniDatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds for Shivani - UI/UX Designer & Frontend Developer.
     */
    public function run(): void
    {
        // 1. Reset Spatie roles if needed
        $this->call(RoleAndPermissionSeeder::class);

        // 2. Super Admin & Author User
        $user = User::updateOrCreate(
            ['email' => 'shivani.uiux@gmail.com'],
            [
                'name' => 'Shivani',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                'bio' => 'Senior UI/UX Designer & Frontend Engineer with 6+ years of experience blending user-centric interaction design with modern React, Next.js, and design token architectures.',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        if (!$user->hasRole('Super Admin')) {
            $user->assignRole('Super Admin');
        }

        // 3. Site Settings
        $settings = [
            'site_name' => 'Shivani // UI/UX & Frontend Developer',
            'site_meta_title' => 'Shivani | Senior UI/UX Designer & Frontend Developer Portfolio',
            'site_meta_description' => 'Portfolio of Shivani, a Senior UI/UX Designer & Frontend Developer crafting human-centered digital experiences, robust design systems, and modern React & Next.js applications.',
            'owner_name' => 'Shivani',
            'owner_title' => 'UI/UX Designer & Frontend Developer',
            'owner_bio_short' => 'UI/UX Designer and Frontend Developer crafting delightful digital experiences through human-centered design, robust design systems, and modern frontend code.',
            'owner_bio_long' => 'I bridge the gap between human intuition and engineering precision. Over the past 6+ years, I have crafted design systems, conducted deep qualitative user research, and engineered high-performance frontend interfaces using React, Next.js, Tailwind CSS, and Framer Motion. My design philosophy prioritizes clarity, emotional connection, accessibility (WCAG 2.1 AA), and fluid micro-interactions.',
            'total_experience' => '6+',
            'google_map_link' => 'https://maps.app.goo.gl/rPGukw6MKhQc1V3k6',
            'contact_email' => 'shivani.uiux@gmail.com',
            'contact_phone' => '+91-9876543210',
            'contact_location' => 'Jaipur, Rajasthan',
            'contact_address' => 'Jaipur, Rajasthan, India',
            'cv_file_path' => '/cv/shivani-resume.pdf',
            'site_logo' => '/images/logo.png',
            'site_favicon' => '/images/favicon.png',
            'social_links' => json_encode([
                ['icon' => 'linkedin', 'name' => 'LinkedIn', 'url' => 'https://linkedin.com/in/shivani-uiux', 'sort_order' => 1],
                ['icon' => 'github', 'name' => 'GitHub', 'url' => 'https://github.com/shivani-dev', 'sort_order' => 2],
                ['icon' => 'dribbble', 'name' => 'Dribbble', 'url' => 'https://dribbble.com/shivani_designs', 'sort_order' => 3],
                ['icon' => 'behance', 'name' => 'Behance', 'url' => 'https://behance.net/shivani_creative', 'sort_order' => 4],
                ['icon' => 'instagram', 'name' => 'Instagram', 'url' => 'https://instagram.com/shivani.uiux', 'sort_order' => 5],
                ['icon' => 'whatsapp', 'name' => 'WhatsApp', 'url' => 'https://wa.me/919876543210', 'sort_order' => 6],
                ['icon' => 'email', 'name' => 'Email', 'url' => 'mailto:shivani.uiux@gmail.com', 'sort_order' => 7],
            ]),
        ];

        foreach ($settings as $key => $value) {
            Setting::set($key, $value);
        }

        // 4. Educations
        Education::truncate();
        Education::create([
            'degree' => 'Bachelor of Design (B.Des) in Interaction & Communication Design',
            'institution' => 'National Institute of Design (NID) / RTU',
            'period' => '2017 - 2021',
            'description' => 'Focused on cognitive psychology, typography hierarchy, visual communication, design ethnography, and human-computer interaction (HCI). Graduated with academic distinction.',
            'sort_order' => 1,
        ]);
        Education::create([
            'degree' => 'Professional Certification in Design Systems & Usability Engineering',
            'institution' => 'Interaction Design Foundation (IxDF) & Nielsen Norman Group',
            'period' => '2021 - 2022',
            'description' => 'In-depth specialization in multi-brand token pipelines, WCAG 2.1 AA accessibility guidelines, quantitative usability testing, and cross-platform design architectures.',
            'sort_order' => 2,
        ]);

        // 5. Experiences
        Experience::truncate();
        Experience::create([
            'job_title' => 'Lead UI/UX Designer & Frontend Engineer',
            'company' => 'Studio Apex Digital',
            'period' => '2023 - Present',
            'description' => 'Leading the design and frontend engineering practice across fintech, healthcare, and SaaS product portfolios. Built a token-driven Figma component library and matching React UI system utilized by 6 engineering teams, slashing feature turnaround time by 40%. Delivered accessible Next.js interfaces with 98+ Lighthouse scores.',
            'sort_order' => 1,
        ]);
        Experience::create([
            'job_title' => 'Senior UI/UX Designer & Frontend Developer',
            'company' => 'Kadam Technologies P.V.T L.T.D',
            'period' => '2021 - 2023',
            'description' => 'Led end-to-end user research, information architecture, wireframing, and React/Next.js frontend implementation for global clients. Redesigned a multi-tenant healthcare application, reducing user task completion time by 32% and increasing overall platform adoption by 28%.',
            'sort_order' => 2,
        ]);
        Experience::create([
            'job_title' => 'UI/UX Designer & Interactive Web Developer',
            'company' => 'PixelCraft Creative Studio',
            'period' => '2019 - 2021',
            'description' => 'Designed visual identities, brand guidelines, mobile app prototypes, and high-impact marketing websites. Built animated web experiences using JavaScript, Tailwind CSS, and Framer Motion, prioritizing tactile micro-interactions and smooth user onboarding flows.',
            'sort_order' => 3,
        ]);

        // 6. Projects
        Project::truncate();
        $projects = [
            [
                'title' => 'NeoPay — Neobank & Financial Hub',
                'subtitle' => 'Mobile Banking UI/UX & React Design System',
                'role' => 'Lead Product Designer & Frontend Lead',
                'link' => 'https://neopay-finance.app',
                'links_additional' => [
                    ['title' => 'Figma Prototype', 'url' => 'https://figma.com/@shivani/neopay'],
                    ['title' => 'Live Web App', 'url' => 'https://neopay-finance.app'],
                ],
                'description' => 'Designed and developed a modern neobanking mobile application and web dashboard. Conducted contextual inquiry across 45 participants, simplified multi-currency transfers, and built a token-driven component library with React and Framer Motion. Reduced KYC transaction drop-off by 34%.',
                'image_path' => 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
                'project_folder' => 'neopay-fintech',
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Aura Health — Telemedicine & Clinical Portal',
                'subtitle' => 'Accessible Healthcare Interface & Design System',
                'role' => 'UI/UX Architect & Frontend Developer',
                'link' => 'https://aurahealth.io',
                'links_additional' => [
                    ['title' => 'Case Study', 'url' => 'https://aurahealth.io/case-study'],
                    ['title' => 'Clinical Portal', 'url' => 'https://clinic.aurahealth.io'],
                ],
                'description' => 'Architected an accessible, HIPAA-compliant patient management and virtual consultation platform. Implemented strict WCAG 2.1 AA color contrast standards, large-target touch controls, and high-legibility typographic scales. Developed the frontend with Next.js 15, Tailwind CSS, and Radix UI primitives.',
                'image_path' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
                'project_folder' => 'aura-health',
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Lumina — Multi-Brand Enterprise Design System',
                'subtitle' => 'Design Tokens & Headless React Component Library',
                'role' => 'Design Systems Engineer',
                'link' => 'https://lumina-design.dev',
                'links_additional' => [
                    ['title' => 'Storybook Docs', 'url' => 'https://storybook.lumina-design.dev'],
                    ['title' => 'Figma Community', 'url' => 'https://figma.com/@shivani/lumina'],
                ],
                'description' => 'Created an enterprise-grade design system comprising 80+ accessible components, automated Figma-to-code token pipelines with Style Dictionary, and complete Storybook documentation. Supports seamless dark/light modes, multi-brand theming, and reduced frontend development cycle times by 45%.',
                'image_path' => 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
                'project_folder' => 'lumina-design-system',
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'title' => 'OmniFlow — Cloud Observability & Analytics Dashboard',
                'subtitle' => 'Complex Data Visualization & Metric Heuristics',
                'role' => 'Senior UI/UX & React Engineer',
                'link' => 'https://omniflow-cloud.io',
                'links_additional' => [
                    ['title' => 'Live Dashboard', 'url' => 'https://omniflow-cloud.io/demo'],
                ],
                'description' => 'Engineered an intuitive monitoring dashboard displaying high-volume real-time server metrics, latency heatmaps, and query timelines. Streamlined cognitive load through progressive disclosure, customized D3.js and Recharts visualizations, and built a lightning-fast React frontend with virtualized data grids.',
                'image_path' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
                'project_folder' => 'omniflow-dashboard',
                'is_featured' => true,
                'sort_order' => 4,
            ],
            [
                'title' => 'Artisan & Co. — Luxury Minimalist E-Commerce',
                'subtitle' => 'Editorial Storefront & Fluid Motion Experience',
                'role' => 'Frontend Motion Specialist & Visual Designer',
                'link' => 'https://artisan-living.store',
                'links_additional' => [
                    ['title' => 'Storefront', 'url' => 'https://artisan-living.store'],
                ],
                'description' => 'Designed an editorial, high-fashion home goods shopping experience. Built bespoke micro-interactions, smooth page transitions, custom cursor states, and image zoom choreography using Next.js, GSAP, and Tailwind CSS. Increased checkout conversion rate by 22%.',
                'image_path' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
                'project_folder' => 'artisan-living',
                'is_featured' => true,
                'sort_order' => 5,
            ],
            [
                'title' => 'EduSpark — Interactive STEM Learning Platform',
                'subtitle' => 'Gamified EdTech Platform for Young Learners',
                'role' => 'Product Designer & Frontend Developer',
                'link' => 'https://eduspark-learn.org',
                'links_additional' => [
                    ['title' => 'Interactive Demo', 'url' => 'https://eduspark-learn.org/explore'],
                ],
                'description' => 'Reimagined online STEM education for K-12 students. Crafted playful visual rewards, progress badge animations, and responsive quiz interfaces that encourage active learning. Developed interactive canvas-based exercises with React and HTML5 Canvas API.',
                'image_path' => 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
                'project_folder' => 'eduspark-learning',
                'is_featured' => true,
                'sort_order' => 6,
            ],
        ];

        foreach ($projects as $proj) {
            Project::create($proj);
        }

        // 7. Categories
        Category::truncate();
        $categories = [
            ['title' => 'UI/UX Design', 'slug' => 'ui-ux-design', 'description' => 'User research, wireframing, interface heuristics, cognitive psychology, and human-centered design patterns.'],
            ['title' => 'Design Systems', 'slug' => 'design-systems', 'description' => 'Design tokens, Figma component architecture, Storybook documentation, and scalable multi-brand component libraries.'],
            ['title' => 'Frontend Engineering', 'slug' => 'frontend-engineering', 'description' => 'Modern React, Next.js, TypeScript, state architectures, and high-performance DOM rendering.'],
            ['title' => 'Micro-Interactions & Motion', 'slug' => 'micro-interactions-motion', 'description' => 'Physics-based animations, Framer Motion choreography, WebGL shaders, and tactile visual feedback.'],
            ['title' => 'Accessibility (a11y)', 'slug' => 'accessibility', 'description' => 'WCAG 2.1 AA compliance, keyboard navigation, screen reader ergonomics, and high-contrast color palettes.'],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }

        // 8. Posts
        Post::truncate();
        DB::table('category_post')->truncate();

        $post1 = Post::create([
            'title' => 'Bridging the Gap Between Figma and React: Building Token-Driven Design Systems',
            'slug' => 'bridging-the-gap-figma-react-design-tokens',
            'excerpt' => 'How establishing unified W3C design tokens and automated Style Dictionary pipelines transforms designer-developer collaboration from friction into continuous synchronization.',
            'body' => "### Why Design Tokens are the True Contract\n\nWhen designing and engineering scalable digital products, the handoff between Figma mockups and React code is traditionally fraught with discrepancies.\n\nDesign tokens solve this problem by serving as the atomic source of truth.\n\n```json\n{\n  \"color\": {\n    \"brand\": {\n      \"primary\": { \"value\": \"#6366f1\", \"type\": \"color\" }\n    }\n  }\n}\n```\n\n### The Three-Tier Architecture\n\n1. **Global Tokens**: Raw primitives (`indigo-500: #6366f1`).\n2. **Semantic Tokens**: Contextual roles (`surface-background: {neutral-900}`).\n3. **Component Tokens**: Targeted bindings (`btn-primary-bg: {semantic.accent}`).",
            'main_image' => 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
            'published_at' => now(),
            'likes_count' => 42,
            'difficulty' => 'intermediate',
            'estimated_time' => '7 min read',
            'tags' => ['Design Systems', 'Figma', 'React', 'Tokens', 'Tailwind CSS'],
            'categories' => ['Design Systems', 'Frontend Engineering'],
            'meta_title' => 'Figma to React Design Tokens Guide | Shivani',
            'meta_description' => 'Complete guide to building automated, token-driven design systems bridging Figma and React component libraries.',
            'focus_keyword' => 'Design Tokens',
            'user_id' => $user->id,
        ]);

        $catDesignSystem = Category::where('slug', 'design-systems')->first();
        $catFrontend = Category::where('slug', 'frontend-engineering')->first();
        if ($catDesignSystem && $catFrontend) {
            $post1->categories()->attach([$catDesignSystem->id, $catFrontend->id]);
        }
    }
}
