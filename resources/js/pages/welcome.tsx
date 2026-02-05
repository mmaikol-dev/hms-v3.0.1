import { Form, Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { LayoutDashboard } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
        };
    };
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
    auth,
}: LoginProps) {
    const { props } = usePage();

    // Check if user is authenticated - using the auth prop from Laravel
    const isAuthenticated = !!auth?.user;

    // If user is already authenticated, show dashboard redirect option
    if (isAuthenticated) {
        return (
            <AuthLayout
                title="Welcome back!"
                description="You are already logged in to your account"
            >
                <Head title="Already Logged In" />

                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-6 rounded-full bg-green-100 p-4">
                        <LayoutDashboard className="h-12 w-12 text-green-600" />
                    </div>

                    <h2 className="text-2xl font-bold mb-2">Already Logged In</h2>
                    <p className="text-muted-foreground mb-8">
                        You are already logged in as <span className="font-semibold">{auth?.user?.name || auth?.user?.email}</span>.
                        Would you like to go to your dashboard?
                    </p>

                    <div className="space-y-4 w-full max-w-sm">
                        <Button
                            asChild
                            className="w-full gap-2"
                            size="lg"
                        >
                            <a href="/dashboard">
                                <LayoutDashboard className="h-5 w-5" />
                                Go to Dashboard
                            </a>
                        </Button>

                        <div className="text-sm text-muted-foreground">
                            Not you?{' '}
                            <Form action="/logout" method="POST" className="inline">
                                <button
                                    type="submit"
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    Log out
                                </button>
                            </Form>
                        </div>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    // Normal login form for non-authenticated users
    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}