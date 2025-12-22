<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()) {
            return redirect()->route('login');
        }

        $userRole = $request->user()->role;

        // Check if role is an Enum object and get its value, or use it directly if string
        $roleValue = $userRole instanceof \BackedEnum ? $userRole->value : $userRole;

        // Allow SuperAdmin to access everything
        if ($roleValue === \App\Enums\UserRole::SuperAdmin->value) {
            return $next($request);
        }

        if (! in_array($roleValue, $roles)) {
            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}
