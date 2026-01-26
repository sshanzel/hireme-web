'use client';

import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation} from '@tanstack/react-query';
import {experienceSchema, ExperienceFormData} from '@/lib/validations/experience';
import {apiFetch, endpoints} from '@/lib/api';
import {applyFieldErrors} from '@/lib/form-utils';
import {toMonthInputValue} from '@/lib/strings/format';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Checkbox} from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Loader2} from 'lucide-react';
import type {Experience} from '@/types/experience';

interface ExperienceFormProps {
  experience?: Experience;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function toDateString(monthValue: string): string {
  return new Date(monthValue + '-01').toISOString();
}

function toExperiencePayload(data: ExperienceFormData) {
  return {
    type: data.type,
    organization: data.organization,
    title: data.title,
    startDate: toDateString(data.startDate),
    endDate: data.isCurrentRole ? null : toDateString(data.endDate),
    description: data.description,
  };
}

async function createExperience(data: ExperienceFormData): Promise<Experience> {
  return apiFetch<Experience>(endpoints.experiences, {
    method: 'POST',
    body: toExperiencePayload(data),
  });
}

async function updateExperience(id: string, data: ExperienceFormData): Promise<Experience> {
  return apiFetch<Experience>(endpoints.experience(id), {
    method: 'PATCH',
    body: toExperiencePayload(data),
  });
}

export function ExperienceForm({experience, onSuccess, onCancel}: ExperienceFormProps) {
  const isEditMode = !!experience;

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      type: experience?.type ?? 'work',
      organization: experience?.organization ?? '',
      title: experience?.title ?? '',
      startDate: toMonthInputValue(experience?.startDate),
      endDate: toMonthInputValue(experience?.endDate),
      isCurrentRole: experience?.endDate === null,
      description: experience?.description ?? '',
    },
  });

  const isCurrentRole = form.watch('isCurrentRole');

  const createMutation = useMutation({
    mutationFn: createExperience,
    onSuccess: () => {
      form.reset();
      onSuccess?.();
    },
    onError: error => {
      applyFieldErrors(error, form.setError);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ExperienceFormData) => updateExperience(experience!.id, data),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: error => {
      applyFieldErrors(error, form.setError);
    },
  });

  const mutation = isEditMode ? updateMutation : createMutation;

  const handleSubmit = (data: ExperienceFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='type'
          render={({field}) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='work'>Work Experience</SelectItem>
                  <SelectItem value='project'>Project</SelectItem>
                  <SelectItem value='education'>Education</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='organization'
            render={({field}) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <FormControl>
                  <Input placeholder='Company or organization name' {...field} />
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
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder='Job title' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='startDate'
            render={({field}) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type='month' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='endDate'
            render={({field}) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type='month' disabled={isCurrentRole} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='isCurrentRole'
          render={({field}) => (
            <FormItem className='flex items-center gap-2 space-y-0'>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className='font-normal'>I currently work here</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({field}) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Describe your responsibilities and achievements...'
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mutation.isError && <p className='text-sm text-destructive'>{mutation.error.message}</p>}

        <div className='flex justify-end gap-2'>
          {onCancel && (
            <Button type='button' variant='outline' onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type='submit' disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {isEditMode ? 'Updating...' : 'Saving...'}
              </>
            ) : isEditMode ? (
              'Update Experience'
            ) : (
              'Save Experience'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
