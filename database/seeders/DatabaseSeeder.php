<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Setting;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Project;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Spatie roles and permissions
        $this->call(RoleAndPermissionSeeder::class);

        // Create default Super Admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password'), // In production, this should be secure or generated
            ]
        );

        if (!$admin->hasRole('Super Admin')) {
            $admin->assignRole('Super Admin');
        }

        // Seed default site settings
        $settings = [
            'site_name' => 'Saurabh Sharma Portfolio',
            'site_meta_title' => 'Saurabh Sharma | Connect, Follow & Hire Software Engineer',
            'site_meta_description' => 'Senior Software Engineer with 8+ years of experience in building scalable web, mobile, and AI-enabled software solutions.',
            'owner_name' => 'Saurabh Sharma',
            'owner_title' => 'Senior Software Engineer',
            'owner_bio_short' => 'Software Engineer and Technical Expert with 8+ years of industry experience and practical skills in full-stack development.',
            'owner_bio_long' => 'I am always chasing new ideas and looking for ways to push technology forward. My purpose is to bridge the gap between dream and realization by designing simple user experiences and building robust systems.',
            'total_experience' => '8+',
            'google_map_link' => 'https://maps.app.goo.gl/rPGukw6MKhQc1V3k6',
            'contact_email' => 'saurabh.ss957@gmail.com',
            'contact_phone' => '+91-7014182012',
            'contact_location' => 'Jaipur, Rajasthan',
            'contact_address' => 'Jaipur, Rajasthan, India',
            'cv_file_path' => '/storage/frontend/cv/saurabh-cv.pdf', // default path
            'site_logo' => '/storage/frontend/images/logo.png',
            'site_favicon' => '/storage/frontend/images/favicon.png',


            // Social links
            'social_links' => json_encode([
                [
                    'icon' => 'linkedin',
                    'name' => 'LinkedIn',
                    'url' => 'https://www.linkedin.com/in/coder0011',
                    'sort_order' => 1
                ],
                [
                    'icon' => 'github',
                    'name' => 'GitHub',
                    'url' => 'https://github.com/coder0011',
                    'sort_order' => 2
                ],
                [
                    'icon' => 'facebook',
                    'name' => 'Facebook',
                    'url' => 'https://www.facebook.com/coder0011',
                    'sort_order' => 3
                ],
                [
                    'icon' => 'instagram',
                    'name' => 'Instagram',
                    'url' => 'https://www.instagram.com/_coder11',
                    'sort_order' => 4
                ],
                [
                    'icon' => 'instagram_pro',
                    'name' => 'Instagram Pro',
                    'url' => 'https://www.instagram.com/withsaurabhcodes',
                    'sort_order' => 5
                ],
                [
                    'icon' => 'youtube',
                    'name' => 'YouTube',
                    'url' => 'https://www.youtube.com/@withsaurabhcodes',
                    'sort_order' => 6
                ],
                [
                    'icon' => 'whatsapp',
                    'name' => 'WhatsApp',
                    'url' => 'https://tinyurl.com/6jrae2er',
                    'sort_order' => 7
                ],
                [
                    'icon' => 'email',
                    'name' => 'Email',
                    'url' => 'saurabh.ss957@gmail.com',
                    'sort_order' => 8
                ],
                [
                    'icon' => 'indeed',
                    'name' => 'Indeed',
                    'url' => 'https://profile.indeed.com/p/saurabhs-gf266zr',
                    'sort_order' => 9
                ],
                [
                    'icon' => 'medium',
                    'name' => 'Medium',
                    'url' => 'https://medium.com/@coder11',
                    'sort_order' => 10
                ],
                [
                    'icon' => 'dev_to',
                    'name' => 'Dev.to',
                    'url' => 'https://dev.to/coder11',
                    'sort_order' => 11
                ],
            ])
        ];

        foreach ($settings as $key => $value) {
            Setting::set($key, is_string($value) ? $value : null);
        }

        // Seed Education Timeline
        if (Education::count() === 0) {
            Education::create([
                'degree' => 'BCA (Bachelor of Computer Applications)',
                'institution' => 'Late Pandit Nawal Kishore P.G College',
                'period' => '2018 - 2021',
                'description' => null,
                'sort_order' => 1,
            ]);
            Education::create([
                'degree' => 'MCA (Master of Computer Applications)',
                'institution' => 'Maharishi Arvind University',
                'period' => '2021 - 2023',
                'description' => null,
                'sort_order' => 2,
            ]);
        }

        // Seed Experience Timeline
        if (Experience::count() === 0) {
            Experience::create([
                'job_title' => 'Associate Engineer',
                'company' => 'Kadam Technologies P.V.T L.T.D',
                'period' => '2018 - 2021',
                'description' => 'Full-stack development using PHP, Laravel, JavaScript, and MySQL. Built responsive web layouts, custom business workflows, and database models for enterprise clients.',
                'sort_order' => 1,
            ]);
            Experience::create([
                'job_title' => 'Sr. Software Engineer',
                'company' => 'Kadam Technologies P.V.T L.T.D',
                'period' => '2021 - Present',
                'description' => 'Led full-cycle SaaS platform development, architected multi-tenant healthcare solutions with Next.js and Laravel, and optimized frontend performance by 35% using Redux Toolkit. Engineered Stripe and Razorpay payment integrations, mentored junior engineers, and served as Technical Consultant for Quarks Technosoft across enterprise-scale deliveries.',
                'sort_order' => 2,
            ]);
        }

        // Seed Projects Portfolio
        if (Project::count() === 0) {
            $projects = [
                [
                    'title' => 'Hospital/Clinic Management SaaS (Multi-tenant)',
                    'subtitle' => 'Multi-tenant Healthcare Platform',
                    'role' => 'Team Lead (Full Stack)',
                    'link' => 'https://clinic.jaipurjoints.com',
                    'links_additional' => [
                        ['title' => 'JaipurJoints', 'url' => 'https://clinic.jaipurjoints.com'],
                        ['title' => 'BreathClinic', 'url' => 'https://clinic.breathclinic.in'],
                        ['title' => 'DrTarachand', 'url' => 'https://clinic.drtarachand.com'],
                        ['title' => 'JaipurNeuro', 'url' => 'https://clinic.jaipurneuro.com']
                    ],
                    'description' => 'Built a multi-tenant healthcare SaaS utilizing Next.js 14 and Laravel 12. Implemented real-time event broadcasting via Pusher and centralized state management using Redux Toolkit to sync clinical charts across 8+ clinic networks.',
                    'image_path' => '/storage/frontend/images/portfolio/hospital-management-saas/1.webp',
                    'project_folder' => 'hospital-management-saas',
                    'is_featured' => true,
                    'sort_order' => 1,
                ],
                [
                    'title' => 'Adworks (Hindustan Times)',
                    'subtitle' => 'Ad Booking Gateway & Workflow',
                    'role' => 'Frontend Developer',
                    'link' => 'https://www.htadworks.com',
                    'links_additional' => null,
                    'description' => 'Built a robust booking gateway for Hindustan Times allowing agencies to list and place ads across multiple media channels. Constructed responsive Angular UI layouts and integrated them with legacy REST APIs.',
                    'image_path' => '/storage/frontend/images/portfolio/ht-adwords/1.webp',
                    'project_folder' => 'ht-adwords',
                    'is_featured' => true,
                    'sort_order' => 2,
                ],
                [
                    'title' => 'Fabplay (Hindustan Times)',
                    'subtitle' => 'Desktop Music Client & Offline Player',
                    'role' => 'Electron.js Developer',
                    'link' => 'https://www.fabplay.in',
                    'links_additional' => null,
                    'description' => 'Developed a cross-platform desktop music client using Electron.js and Angular. Engineered local caching, offline-first media playback, and subscription licensing checks to support campaigns in retail venues.',
                    'image_path' => '/storage/frontend/images/portfolio/fab-player/1.webp',
                    'project_folder' => 'fab-player',
                    'is_featured' => true,
                    'sort_order' => 3,
                ],
                [
                    'title' => 'Houseoftempus',
                    'subtitle' => 'B2C Premium Jewelry E-commerce',
                    'role' => 'Back End Developer',
                    'link' => 'http://houseoftempus.com',
                    'links_additional' => null,
                    'description' => 'Developed a premium B2C jewelry e-commerce application using Bagisto (Laravel). Enhanced the administrative dashboard with custom Vue.js modules and optimized relational database queries.',
                    'image_path' => '/storage/frontend/images/portfolio/houseoftempus (tempusgems)/1.webp',
                    'project_folder' => 'houseoftempus (tempusgems)',
                    'is_featured' => true,
                    'sort_order' => 4,
                ],
                [
                    'title' => 'Airlinq',
                    'subtitle' => 'Telecom Workflow Platform',
                    'role' => 'Frontend Developer',
                    'link' => 'https://www.airlinq.com',
                    'links_additional' => null,
                    'description' => 'Engineered high-performance frontend interfaces for telecom workflows using React.js and Kendo UI. Integrated RESTful endpoints to manage a central data exchange repository, boosting data processing speed and coordination.',
                    'image_path' => '/storage/frontend/images/portfolio/air-control/1.webp',
                    'project_folder' => 'air-control',
                    'is_featured' => true,
                    'sort_order' => 5,
                ],
                [
                    'title' => 'STC Inventory',
                    'subtitle' => 'B2B Inventory Management System',
                    'role' => 'Team Lead (Full Stack)',
                    'link' => 'https://www.stcinventory.knowyourright.net',
                    'links_additional' => null,
                    'description' => 'Engineered a secure inventory management database and platform using Node.js and React. Automated workflows for supply chain orders, billing computations, cold storage transfers, and activity logs.',
                    'image_path' => '/storage/frontend/images/portfolio/stc-inventory/1.webp',
                    'project_folder' => 'stc-inventory',
                    'is_featured' => true,
                    'sort_order' => 6,
                ],
                [
                    'title' => 'Zenkify',
                    'subtitle' => 'Therapy Booking SaaS',
                    'role' => 'Team Lead (Full Stack)',
                    'link' => 'https://www.zenkify.com',
                    'links_additional' => null,
                    'description' => 'Architected a full-stack therapy booking SaaS using Next.js (SSR) and Laravel. Integrated secure Stripe checkout APIs and scaled the application container workflow on AWS to support thousands of active users.',
                    'image_path' => '/storage/frontend/images/portfolio/zenkify/1.png',
                    'project_folder' => 'zenkify',
                    'is_featured' => false,
                    'sort_order' => 7,
                ],
                [
                    'title' => 'IECPA',
                    'subtitle' => 'International Heart Care Specialty Portal',
                    'role' => 'Team Lead (Full Stack)',
                    'link' => 'https://iecpa.com',
                    'links_additional' => null,
                    'description' => 'Developed a full-stack practitioner portal using Angular and Node.js. Implemented secure member registration, subscription payment processing, and administrative dashboards for practitioner data tracking.',
                    'image_path' => '/storage/frontend/images/portfolio/iecpa (International ECP Association)/1.png',
                    'project_folder' => 'iecpa (International ECP Association)',
                    'is_featured' => false,
                    'sort_order' => 8,
                ],
                [
                    'title' => 'EnekLuso',
                    'subtitle' => 'B2C Eyewear Platform',
                    'role' => 'Frontend Developer',
                    'link' => 'http://enekluso.com',
                    'links_additional' => null,
                    'description' => 'Developed a B2C eyewear e-commerce platform utilizing Bagisto (Laravel). Optimized frontend performance with React.js, built custom Vue components for checkout, and customized backend admin workflows.',
                    'image_path' => 'https://dummyimage.com/600x400/0c1322/55e6a5&text=EnekLuso',
                    'project_folder' => null,
                    'is_featured' => false,
                    'sort_order' => 9,
                ],
                [
                    'title' => 'DoubtNut',
                    'subtitle' => 'Ed-Tech Platform',
                    'role' => 'Full Stack Developer',
                    'link' => 'https://www.doubtnut.com',
                    'links_additional' => null,
                    'description' => 'Developed React-based educational portal interfaces and built a Core PHP backend panel to integrate with SuiteCRM. Programmed automated cron jobs, lead scoring workflows, and task management systems for support agents.',
                    'image_path' => 'https://dummyimage.com/600x400/0c1322/55e6a5&text=DoubtNut',
                    'project_folder' => null,
                    'is_featured' => false,
                    'sort_order' => 10,
                ],
                [
                    'title' => 'DeepSell',
                    'subtitle' => 'Business & Sales Analysis',
                    'role' => 'Frontend Developer',
                    'link' => 'https://deepsell.today',
                    'links_additional' => null,
                    'description' => 'Developed a B2B sales analytics platform processing unstructured data from Excel/PDF files. Built interactive, state-driven Vue components and connected them to GraphQL APIs for responsive data views.',
                    'image_path' => '/storage/frontend/images/portfolio/deepsell/1.png',
                    'project_folder' => 'deepsell',
                    'is_featured' => false,
                    'sort_order' => 11,
                ],
                [
                    'title' => 'Avtar Insurance',
                    'subtitle' => 'Insurance Admin Portal',
                    'role' => 'Full Stack Developer',
                    'link' => 'https://avatar-liquidation.com',
                    'links_additional' => null,
                    'description' => 'Developed a React-based insurance administration panel and Laravel RESTful APIs to automate customer query ticketing, policy lookup, and claim histories.',
                    'image_path' => 'https://dummyimage.com/600x400/0c1322/55e6a5&text=Avtar+Insurance',
                    'project_folder' => null,
                    'is_featured' => false,
                    'sort_order' => 12,
                ],
                [
                    'title' => 'Indofitnesssolution',
                    'subtitle' => 'B2B Gym Equipment Marketplace',
                    'role' => 'Back End Developer',
                    'link' => 'https://indofitnesssolution.in',
                    'links_additional' => null,
                    'description' => 'Developed a B2B e-commerce platform for commercial gym equipment using Bagisto (Laravel). Built responsive product catalog displays and optimized search indexing for inventory lookup.',
                    'image_path' => '/storage/frontend/images/portfolio/indofitness-solutions/1.png',
                    'project_folder' => 'indofitness-solutions',
                    'is_featured' => false,
                    'sort_order' => 13,
                ],
                [
                    'title' => 'Laravel CMS',
                    'subtitle' => 'Content Management Engine',
                    'role' => 'Team Lead',
                    'link' => 'https://www.csirajasthan.com',
                    'links_additional' => [
                        ['title' => 'DrHimanshu', 'url' => 'https://www.drhimanshugupta.com'],
                        ['title' => 'CSIRajasthan', 'url' => 'https://www.csirajasthan.com'],
                        ['title' => 'Digigeeks', 'url' => 'https://www.digigeeks.co'],
                        ['title' => 'SGKHospitals', 'url' => 'https://www.sgkhospitals.com']
                    ],
                    'description' => 'Architected a custom PHP/Laravel Content Management System to streamline content administration across client portals. Replaced hardcoded structures with dynamic, database-driven page components.',
                    'image_path' => '/storage/frontend/images/portfolio/laravel-cms (CSI/1.png',
                    'project_folder' => 'laravel-cms (CSI',
                    'is_featured' => false,
                    'sort_order' => 14,
                ],
                [
                    'title' => 'All About City',
                    'subtitle' => 'Local Business Directory',
                    'role' => 'Back End Developer',
                    'link' => 'https://www.allaboutcity.in',
                    'links_additional' => null,
                    'description' => 'Developed a high-performance business directory. Designed optimized search queries and index structures in MySQL to deliver local search results with minimal latency.',
                    'image_path' => 'https://dummyimage.com/600x400/0c1322/55e6a5&text=All+About+City',
                    'project_folder' => null,
                    'is_featured' => false,
                    'sort_order' => 15,
                ],
                [
                    'title' => 'WorkSpaceAsia',
                    'subtitle' => 'B2B Office Brokerage',
                    'role' => 'Back End Developer',
                    'link' => 'https://www.workspaceasia.com',
                    'links_additional' => null,
                    'description' => 'Developed a commercial real-estate directory for Hong Kong\'s coworking market. Designed responsive search filters and listing pages to help users compare office spaces.',
                    'image_path' => '/storage/frontend/images/portfolio/workspaceasia/1.png',
                    'project_folder' => 'workspaceasia',
                    'is_featured' => false,
                    'sort_order' => 16,
                ],
                [
                    'title' => 'BigTour',
                    'subtitle' => 'Tour & Travel Planner',
                    'role' => 'Back End Developer',
                    'link' => 'https://thebigtours.com',
                    'links_additional' => null,
                    'description' => 'Developed a booking portal for travel and transportation services in Malaysia. Engineered reservation logs, seat allocations, and payment workflows to simplify booking management.',
                    'image_path' => '/storage/frontend/images/portfolio/bigtour/1.png',
                    'project_folder' => 'bigtour',
                    'is_featured' => false,
                    'sort_order' => 17,
                ],
                [
                    'title' => 'Zevsoft',
                    'subtitle' => 'Paving Estimation Software',
                    'role' => 'Back End Developer',
                    'link' => 'https://www.zevsoft.com',
                    'links_additional' => null,
                    'description' => 'Engineered paving estimation software to calculate construction surface areas, material volumes, and labor cost metrics, increasing bid processing efficiency.',
                    'image_path' => 'https://dummyimage.com/600x400/0c1322/55e6a5&text=Zevsoft',
                    'project_folder' => null,
                    'is_featured' => false,
                    'sort_order' => 18,
                ],
                [
                    'title' => 'Food Inventory',
                    'subtitle' => 'Recipe & Stock Control',
                    'role' => 'Back End Developer',
                    'link' => 'https://production.marksfoodsolutions.com',
                    'links_additional' => null,
                    'description' => 'Architected a secure warehouse inventory database using Laravel and MySQL. Managed custom workflows for commercial recipe formula creation, real-time client order processing, and ingredient tracking.',
                    'image_path' => 'https://dummyimage.com/600x400/0c1322/55e6a5&text=Food+Inventory',
                    'project_folder' => null,
                    'is_featured' => false,
                    'sort_order' => 19,
                ],
                [
                    'title' => 'Eclickship',
                    'subtitle' => 'Multi-Carrier Logistics Dashboard',
                    'role' => 'Back End Developer',
                    'link' => 'https://eclickship.com',
                    'links_additional' => null,
                    'description' => 'Built a reactive shipping and logistics dashboard using Laravel, Vue.js, and Inertia.js. Integrated multi-carrier shipping APIs, package labels generation, and real-time shipment status tracking.',
                    'image_path' => '/storage/frontend/images/portfolio/gyftgo (eclickship)/1.png',
                    'project_folder' => 'gyftgo (eclickship)',
                    'is_featured' => false,
                    'sort_order' => 20,
                ],
                [
                    'title' => 'PrepaidMall',
                    'subtitle' => 'Mobile Recharge Platform',
                    'role' => 'Back End Developer',
                    'link' => 'https://www.prepaidmall.com',
                    'links_additional' => null,
                    'description' => 'Developed a global mobile recharge portal integrating the Ding.com REST API. Integrated Stripe payment gateways for multi-currency invoicing and international transaction tracking.',
                    'image_path' => 'https://dummyimage.com/600x400/0c1322/55e6a5&text=PrepaidMall',
                    'project_folder' => null,
                    'is_featured' => false,
                    'sort_order' => 21,
                ],
                [
                    'title' => 'Car Plate',
                    'subtitle' => 'VIP License Plate Marketplace',
                    'role' => 'Back End Developer',
                    'link' => null,
                    'links_additional' => null,
                    'description' => 'Built an administrative web catalog and listing marketplace for premium registration plates. Optimized search indexing in MySQL to enable fast, secure license plate lookups and transactions.',
                    'image_path' => '/storage/frontend/images/portfolio/car-plate/1.png',
                    'project_folder' => 'car-plate',
                    'is_featured' => false,
                    'sort_order' => 22,
                ],
                [
                    'title' => 'BMTool',
                    'subtitle' => 'Financial Modeling Application',
                    'role' => 'Back End Developer',
                    'link' => null,
                    'links_additional' => null,
                    'description' => 'Engineered a financial data analysis module using JavaScript and PHP to parse 2-5 years of cash-flow histories, generating responsive data charts and detailed PDF export summaries.',
                    'image_path' => '/storage/frontend/images/portfolio/bm-tools/1.png',
                    'project_folder' => 'bm-tools',
                    'is_featured' => false,
                    'sort_order' => 23,
                ],
                [
                    'title' => 'sup2020',
                    'subtitle' => 'Water Sports E-commerce Catalog',
                    'role' => 'Back End Developer',
                    'link' => null,
                    'links_additional' => null,
                    'description' => 'Developed a high-performance e-commerce catalog using Laravel. Designed reactive shopping cart workflows and inventory status updates for catalog clearance items, ensuring smooth user journey and checkouts.',
                    'image_path' => '/storage/frontend/images/portfolio/sup2020/1.png',
                    'project_folder' => 'sup2020',
                    'is_featured' => false,
                    'sort_order' => 24,
                ],
                [
                    'title' => 'Mehndi Sanskar',
                    'subtitle' => 'Wedding Mehndi Booking & Showcase',
                    'role' => 'Full Stack React Developer',
                    'link' => 'https://www.mehndisanskar.com',
                    'links_additional' => null,
                    'description' => 'Designed and developed a responsive online booking and visual showcase platform using React.js and Tailwind CSS. Built dynamic portfolio gallery sliders, custom booking query triggers, and integrated optimized service landing layouts for regional wedding mehndi campaigns.',
                    'image_path' => '/storage/frontend/images/portfolio/mehndisanskar/1.png',
                    'project_folder' => 'mehndisanskar',
                    'is_featured' => false,
                    'sort_order' => 25,
                ]
            ];

            foreach ($projects as $proj) {
                Project::create($proj);
            }
        }
    }
}
