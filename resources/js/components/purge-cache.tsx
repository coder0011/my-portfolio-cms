import { router } from '@inertiajs/react';
import { useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';

export default function PurgeCache() {
    const [purgingData, setPurgingData] = useState(false);
    const [clearingFramework, setClearingFramework] = useState(false);

    const handlePurgeData = () => {
        setPurgingData(true);
        router.post(
            ProfileController.purgeCache().url,
            {},
            {
                preserveScroll: true,
                onFinish: () => setPurgingData(false),
            },
        );
    };

    const handleClearFramework = () => {
        setClearingFramework(true);
        router.post(
            ProfileController.clearFrameworkCache().url,
            {},
            {
                preserveScroll: true,
                onFinish: () => setClearingFramework(false),
            },
        );
    };

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="System Cache Management"
                description="Manage and clear application data and framework bootstrap caches."
            />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Application Cache */}
                <div className="flex flex-col justify-between space-y-4 rounded-lg border border-yellow-100 bg-yellow-50/50 p-4 dark:border-yellow-900/30 dark:bg-yellow-950/10">
                    <div className="space-y-1.5">
                        <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                            Application Data Cache
                        </p>
                        <p className="text-xs text-yellow-700/80 dark:text-yellow-300/70">
                            Clears and instantly regenerates the public frontend
                            caches (such as your education timeline, projects
                            portfolio, settings parameters, and blog sliders) to
                            ensure maximum speed.
                        </p>
                    </div>
                    <Button
                        onClick={handlePurgeData}
                        disabled={purgingData || clearingFramework}
                        className="w-full bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800"
                    >
                        {purgingData ? 'Purging...' : 'Purge & Warm Cache'}
                    </Button>
                </div>

                {/* Laravel Framework Cache */}
                <div className="flex flex-col justify-between space-y-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/10">
                    <div className="space-y-1.5">
                        <p className="font-semibold text-blue-800 dark:text-blue-200">
                            Laravel Framework Cache
                        </p>
                        <p className="text-xs text-blue-700/80 dark:text-blue-300/70">
                            Clears Laravel's compiled configuration, routing,
                            compiled Blade views, and event bootstrap files. Run
                            this if changes to your configuration files are not
                            showing up.
                        </p>
                    </div>
                    <Button
                        onClick={handleClearFramework}
                        disabled={purgingData || clearingFramework}
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    >
                        {clearingFramework
                            ? 'Clearing...'
                            : 'Clear Framework Cache'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
