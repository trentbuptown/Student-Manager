<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Đường dẫn gốc của các route.
     */
    public const HOME = '/home';

    /**
     * Đăng ký bất kỳ dịch vụ ứng dụng nào.
     */
    public function register()
    {
        //
    }

    /**
     * Tải các route của ứng dụng.
     */
    public function boot()
    {
        $this->routes(function () {
            // Định nghĩa route API
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            // Định nghĩa route Web
            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}

