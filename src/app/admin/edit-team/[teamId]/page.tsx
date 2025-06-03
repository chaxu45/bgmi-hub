
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/shared/page-header';
import { useToast } from '@/hooks/use-toast';
import { TeamSchema, PlayerSchema, type Team } from '@/types';
import { PlusCircle, Trash2, UserPlus, Save, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


// Schema for player data within the edit form (ID is not directly editable but needed for keying)
const EditPlayerFormSchema = PlayerSchema.omit({ id: true }); // Server regenerates IDs on PUT for roster

// Schema for editing a team. ID is from URL, roster uses EditPlayerFormSchema.
const EditTeamFormSchema = TeamSchema.omit({ id: true, roster: true }).extend({
  roster: z.array(EditPlayerFormSchema).min(1, "At least one player is required in the roster."),
});
type EditTeamFormValues = z.infer<typeof EditTeamFormSchema>;

export default function EditTeamPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<EditTeamFormValues>({
    resolver: zodResolver(EditTeamFormSchema),
    defaultValues: {
      name: '',
      logoUrl: '',
      description: '',
      roster: [{ name: '', ign: '', role: '' }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'roster',
  });

  React.useEffect(() => {
    if (teamId) {
      const fetchTeamData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/teams/${teamId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch team data');
          }
          const teamData: Team = await response.json();
          form.reset({
            name: teamData.name,
            logoUrl: teamData.logoUrl || '',
            description: teamData.description || '',
            // For roster, we map to the form schema (without IDs for this form)
            roster: teamData.roster.map(p => ({ name: p.name, ign: p.ign, role: p.role || '' })),
          });
        } catch (error) {
          toast({
            title: 'Error Loading Team',
            description: (error as Error).message,
            variant: 'destructive',
          });
          router.push('/admin/manage-teams');
        } finally {
          setIsLoading(false);
        }
      };
      fetchTeamData();
    }
  }, [teamId, form, router, toast]);

  async function onSubmit(data: EditTeamFormValues) {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update team');
      }

      toast({
        title: 'Success!',
        description: 'Team updated successfully.',
      });
      router.push('/admin/manage-teams');
    } catch (error) {
      toast({
        title: 'Error Updating Team',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading team data...</p>
      </div>
    );
  }
  if (!teamId) {
     return (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Team ID is missing. Cannot edit team.</AlertDescription>
        </Alert>
     )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Edit Team: ${form.getValues('name') || 'Loading...'}`}
        description="Modify the details for this BGMI team."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter team name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Logo URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/team-logo.png" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>
                  Enter the full URL for the team&apos;s logo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of the team"
                    {...field}
                    value={field.value ?? ''}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Team Roster</h3>
            {fields.map((item, index) => (
              <div key={item.id} className="space-y-4 p-4 border rounded-md mb-4 relative">
                <h4 className="font-semibold">Player {index + 1}</h4>
                <FormField
                  control={form.control}
                  name={`roster.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter player's real name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`roster.${index}.ign`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>In-Game Name (IGN)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter player's IGN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`roster.${index}.role`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., IGL, Assaulter, Support" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2"
                    disabled={fields.length <= 1} 
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove Player
                  </Button>
              </div>
            ))}
             <FormMessage>{form.formState.errors.roster?.root?.message || form.formState.errors.roster?.message}</FormMessage>
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: '', ign: '', role: '' })}
              className="mt-2"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Player to Roster
            </Button>
          </div>

          <Button type="submit" disabled={isSaving} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" /> Save Changes
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
