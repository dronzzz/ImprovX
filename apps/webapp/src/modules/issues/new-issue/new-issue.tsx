import { zodResolver } from '@hookform/resolvers/zod';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@tegonhq/ui/components/accordion';
import { Form } from '@tegonhq/ui/components/form';
import { Separator } from '@tegonhq/ui/components/separator';
import { useToast } from '@tegonhq/ui/components/use-toast';
import { cn } from '@tegonhq/ui/lib/utils';
import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { getTiptapJSON } from 'common';
import { SCOPES } from 'common/scopes';
import type { IssueType } from 'common/types';

import { useScope } from 'hooks';

import {
  type CreateIssueParams,
  useCreateIssueMutation,
} from 'services/issues';

import { IssueCollapseView } from './issue-collapse-view';
import { NewIssueForm } from './new-issue-form';
import { NewIssueSchema, NewIssueTemplateSchema } from './new-issues-type';

export interface NewIssueProps {
  defaultValues?: Partial<IssueType>;
  onClose?: () => void;
  createOutsideFunction?: (values: CreateIssueParams) => void;
}

export function NewIssue({
  defaultValues = {},
  createOutsideFunction,
  onClose,
}: NewIssueProps) {
  useScope(SCOPES.NewIssue);

  const { toast } = useToast();

  // The form has a array of issues where first issue is the parent and the later sub issues
  const form = useForm<z.infer<typeof NewIssueSchema>>({
    resolver: zodResolver(
      createOutsideFunction ? NewIssueTemplateSchema : NewIssueSchema,
    ),
    defaultValues: {
      issues: [defaultValues],
    },
  });

  const { mutate: createIssue, isLoading } = useCreateIssueMutation({
    onSuccess: (data: IssueType) => {
      form.reset();
      toast({
        title: 'Issue Created',
        description: (
          <div className="flex flex-col gap-1">
            <div>
              {data.number} - {data.title}
            </div>
          </div>
        ),
      });
      onClose();
    },
    onError: (e) => {
      toast({
        title: 'Issue Creation error',
        description: <div className="flex flex-col gap-1">{e}</div>,
      });
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormProvider)
    name: 'issues', // unique name for your Field Array
  });

  const [collapseId, setCollapseId] = React.useState(fields[0].id);

  const onSubmit = (values: { issues: CreateIssueParams[] }) => {
    const issues = [...values.issues];
    const parentIssue = issues.shift();

    const { json: parentDescription } = getTiptapJSON(parentIssue.description);
    const createIssueParams = {
      ...parentIssue,
      description: JSON.stringify(parentDescription),
      parentId: defaultValues.parentId,
      subIssues: issues.map((issue) => {
        const { json: description } = getTiptapJSON(issue.description);

        return { ...issue, description: JSON.stringify(description) };
      }),
    } as CreateIssueParams;

    if (createOutsideFunction) {
      createOutsideFunction(createIssueParams);
      return;
    }

    createIssue(createIssueParams);
  };

  // Shortcuts
  useHotkeys(
    [`${Key.Meta}+${Key.Enter}`, `${Key.Control}+${Key.Enter}`],
    () => form.handleSubmit(onSubmit)(),
    {
      enableOnFormTags: true,
    },
    [SCOPES.NewIssue],
  );

  React.useEffect(() => {
    const exists = fields.find((field) => field.id === collapseId);

    if (!exists) {
      setCollapseId(fields[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  return (
    <Form {...form}>
      <form
        className="new-issue-form flex flex-col overflow-hidden h-full"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Accordion
          type="single"
          collapsible={false}
          onValueChange={(value) => setCollapseId(value)}
          value={collapseId ? collapseId : fields[0].id}
          className="flex flex-col overflow-hidden h-full"
        >
          {fields.map((field, index) => {
            const collapsed = field.id !== collapseId;

            return (
              <AccordionItem
                value={field.id}
                key={field.id}
                className={cn(
                  'flex flex-col overflow-hidden h-full',
                  collapsed && 'shrink-0',
                )}
              >
                <AccordionTrigger>
                  {collapsed && (
                    <div className="flex flex-col w-full">
                      <Separator />
                      <IssueCollapseView
                        index={index}
                        form={form}
                        isSubIssue={index > 0}
                        // Sub issue controllers
                        subIssueOperations={{
                          append,
                          remove,
                        }}
                      />
                      <Separator />
                    </div>
                  )}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col h-full overflow-hidden">
                  {index > 0 && <Separator />}

                  <NewIssueForm
                    key={field.id}
                    isSubIssue={index > 0}
                    form={form}
                    index={index}
                    defaultValues={defaultValues}
                    isTemplate={!!createOutsideFunction}
                    isLoading={isLoading}
                    onClose={onClose}
                    // Sub issue controllers
                    subIssueOperations={{
                      append,
                      remove,
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </form>
    </Form>
  );
}
