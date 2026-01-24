'use client';

import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {profileSchema, ProfileFormData} from '@/lib/validations/profile';
import {useUpdateProfile} from '@/hooks/useUpdateProfile';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription} from '@/components/ui/form';
import {Loader2} from 'lucide-react';

interface ProfileFormProps {
  defaultValues: {
    name: string;
    title?: string | null;
    bio?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    twitterUrl?: string | null;
    websiteUrl?: string | null;
  };
}

export function ProfileForm({defaultValues}: ProfileFormProps) {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: defaultValues.name,
      title: defaultValues.title ?? '',
      bio: defaultValues.bio ?? '',
      githubUrl: defaultValues.githubUrl ?? '',
      linkedinUrl: defaultValues.linkedinUrl ?? '',
      twitterUrl: defaultValues.twitterUrl ?? '',
      websiteUrl: defaultValues.websiteUrl ?? '',
    },
  });

  const mutation = useUpdateProfile();

  const handleSubmit = (data: ProfileFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        <div className='space-y-4'>
          <FormField
            control={form.control}
            name='name'
            render={({field}) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Your full name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='title'
            render={({field}) => (
              <FormItem>
                <FormLabel>Title / Headline</FormLabel>
                <FormControl>
                  <Input placeholder='e.g. Senior Software Engineer' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>A short professional headline</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='bio'
            render={({field}) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Tell us about yourself...'
                    rows={4}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>Max 500 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='space-y-4'>
          <h3 className='text-sm font-medium'>Social Links</h3>

          <FormField
            control={form.control}
            name='githubUrl'
            render={({field}) => (
              <FormItem>
                <FormLabel>GitHub</FormLabel>
                <FormControl>
                  <Input placeholder='https://github.com/username' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='linkedinUrl'
            render={({field}) => (
              <FormItem>
                <FormLabel>LinkedIn</FormLabel>
                <FormControl>
                  <Input placeholder='https://linkedin.com/in/username' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='twitterUrl'
            render={({field}) => (
              <FormItem>
                <FormLabel>Twitter / X</FormLabel>
                <FormControl>
                  <Input placeholder='https://twitter.com/username' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='websiteUrl'
            render={({field}) => (
              <FormItem>
                <FormLabel>Personal Website</FormLabel>
                <FormControl>
                  <Input placeholder='https://yourwebsite.com' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {mutation.isError && <p className='text-sm text-destructive'>{mutation.error.message}</p>}
        {mutation.isSuccess && <p className='text-sm text-green-600'>Profile updated successfully!</p>}

        <Button type='submit' disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </Button>
      </form>
    </Form>
  );
}
