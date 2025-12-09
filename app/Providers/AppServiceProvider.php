<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Allow only admins to view patients
        Gate::define('view-patients', function ($user) {
            return in_array(strtolower($user->role), [
                'admin',
                'receptionist',
                'nurse',
                'supervisor',
            ]);
        });

    }
}
