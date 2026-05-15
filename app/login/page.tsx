'use client';

import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {loginSchema, LoginFormData} from '@/lib/validations/auth';
import {useLogin} from '@/hooks/useAuth';
import {GuestRoute} from '@/components/auth/GuestRoute';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import Link from 'next/link';
import {Sparkles, MessageSquare, FileText, Brain} from 'lucide-react';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';

export default function LoginPage() {
  const router = useRouter();
  const {mutate: login, isPending, error} = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        router.push('/');
      },
    });
  };

  return (
    <GuestRoute>
      <div className='workspace-grid flex min-h-screen bg-background'>
        {/* Left Panel - Branding */}
        <div className='relative hidden w-1/2 overflow-hidden bg-sidebar lg:block'>
          {/* Background Pattern */}
          <div className='absolute inset-0 opacity-10'>
            <div
              className='absolute inset-0'
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                backgroundSize: '32px 32px',
              }}
            />
          </div>

          <div className='absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent' />

          {/* Content */}
          <div className='relative flex h-full flex-col justify-between p-12'>
            {/* Logo */}
            <Link href='/' className='text-2xl font-bold text-sidebar-foreground'>
              <span className='opacity-90'>HireMe</span>
              <span className='opacity-70'>.dev</span>
            </Link>

            {/* Main Message */}
            <div className='space-y-8'>
              <div className='space-y-4'>
                <h1 className='text-4xl font-bold leading-tight text-sidebar-foreground'>
                  Your career story,
                  <br />
                  <span className='opacity-80'>powered by AI</span>
                </h1>
                <p className='max-w-md text-lg text-sidebar-foreground/70'>
                  Document your experiences, let AI help you articulate your journey, and create a
                  portfolio that speaks for itself.
                </p>
              </div>

              {/* Feature Pills */}
              <div className='flex flex-wrap gap-3'>
                <div className='flex items-center gap-2 rounded-full border border-sidebar-border bg-white/[0.06] px-4 py-2 text-sm text-sidebar-foreground/90 backdrop-blur-sm'>
                  <MessageSquare className='h-4 w-4' />
                  <span>AI Story Creation</span>
                </div>
                <div className='flex items-center gap-2 rounded-full border border-sidebar-border bg-white/[0.06] px-4 py-2 text-sm text-sidebar-foreground/90 backdrop-blur-sm'>
                  <Brain className='h-4 w-4' />
                  <span>RAG-Powered Chat</span>
                </div>
                <div className='flex items-center gap-2 rounded-full border border-sidebar-border bg-white/[0.06] px-4 py-2 text-sm text-sidebar-foreground/90 backdrop-blur-sm'>
                  <FileText className='h-4 w-4' />
                  <span>CV Parsing</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className='text-sm text-sidebar-foreground/50'>
              A learning project exploring RAG and AI-powered portfolios.
            </p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className='flex w-full items-center justify-center px-6 lg:w-1/2'>
          <div className='w-full max-w-sm rounded-lg border border-border/70 bg-card/90 p-6 shadow-2xl shadow-primary/10 backdrop-blur'>
            {/* Mobile Logo */}
            <div className='mb-8 text-center lg:hidden'>
              <Link href='/' className='text-2xl font-bold'>
                <span className='text-gradient'>HireMe</span>
                <span>.dev</span>
              </Link>
            </div>

            {/* Header */}
            <div className='mb-8 space-y-2'>
              <div className='flex items-center gap-2'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
                  <Sparkles className='h-5 w-5 text-primary' />
                </div>
              </div>
              <h2 className='mt-4 text-2xl font-semibold'>Welcome back</h2>
              <p className='text-muted-foreground'>Sign in to continue to your dashboard</p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({field}) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium'>Email address</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='you@example.com'
                          className='h-11'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='password'
                  render={({field}) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium'>Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='Enter your password'
                          className='h-11'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className='rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive'>
                    {error.message}
                  </div>
                )}

                <Button type='submit' className='h-11 w-full text-base' disabled={isPending}>
                  {isPending ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </Form>

            {/* Footer Note */}
            <div className='mt-8 rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-center'>
              <p className='text-xs text-muted-foreground'>
                I&apos;m footing the infrastructure bill hence why registration is locked.
                <br />
                If you are a job seeker and would like to try it out, please reach out if you&apos;d
                like access!
              </p>
            </div>

            {/* Links */}
            <div className='mt-6 flex flex-col items-center gap-2 text-sm text-muted-foreground'>
              <p>
                Want to see it in action?{' '}
                <Link href='/sshanzel' className='text-primary hover:underline'>
                  Try my profile
                </Link>
              </p>
              <p>
                Curious about how it works?{' '}
                <Link href='/stack' className='text-primary hover:underline'>
                  View the tech stack
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </GuestRoute>
  );
}
