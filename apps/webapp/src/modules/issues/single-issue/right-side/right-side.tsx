import { ScrollArea } from '@tegonhq/ui/components/scroll-area';
import { cn } from '@tegonhq/ui/lib/utils';
import { observer } from 'mobx-react-lite';
import React from 'react';

import {
  IssueAssigneeDropdown,
  IssueAssigneeDropdownVariant,
  IssueLabelDropdown,
  IssueLabelDropdownVariant,
  IssuePriorityDropdown,
  IssuePriorityDropdownVariant,
  IssueStatusDropdown,
  IssueStatusDropdownVariant,
} from 'modules/issues/components';
import {
  ProjectDropdown,
  ProjectDropdownVariant,
  ProjectMilestoneDropdown,
  ProjectMilestoneDropdownVariant,
} from 'modules/issues/components/issue-metadata/project';

import { useIssueData } from 'hooks/issues';
import { useTeamWithId } from 'hooks/teams';

import { useUpdateIssueMutation } from 'services/issues';

import { useContextStore } from 'store/global-context-provider';

import { EngineeringProperties } from './engineering-properties';
import { IssueRelatedProperties } from './issue-related-properties';
import { SupportProperties } from './support-properties';

export const RightSide = observer(() => {
  const issue = useIssueData();
  const { mutate: updateIssue } = useUpdateIssueMutation({});
  const { projectsStore } = useContextStore();
  const team = useTeamWithId(issue?.teamId);
  const hasProjectsForTeam = projectsStore.hasProjects(team.id);

  const statusChange = (stateId: string) => {
    updateIssue({ id: issue.id, stateId, teamId: issue.teamId });
  };

  const assigneeChange = (assigneeId: string) => {
    updateIssue({ id: issue.id, assigneeId, teamId: issue.teamId });
  };

  const labelsChange = (labelIds: string[]) => {
    updateIssue({ id: issue.id, labelIds, teamId: issue.teamId });
  };

  const projectChange = (projectId: string) => {
    updateIssue({
      id: issue.id,
      projectId,
      projectMilestoneId: null,
      teamId: issue.teamId,
    });
  };

  const projectMilestoneChange = (projectMilestoneId: string) => {
    updateIssue({ id: issue.id, projectMilestoneId, teamId: issue.teamId });
  };

  const priorityChange = (priority: number) => {
    updateIssue({
      id: issue.id,
      priority,
      teamId: issue.teamId,
    });
  };

  return (
    <ScrollArea className="h-full">
      <div className="grow p-6 flex flex-col gap-4 pb-10">
        <div className="flex flex-col items-start">
          <label className="text-xs">Status</label>
          <IssueStatusDropdown
            value={issue.stateId}
            onChange={statusChange}
            variant={IssueStatusDropdownVariant.LINK}
            teamIdentifier={team.identifier}
          />
        </div>

        <div className="flex flex-col items-start">
          <label className="text-xs">Priority</label>

          <IssuePriorityDropdown
            value={issue.priority ?? 0}
            onChange={priorityChange}
            variant={IssuePriorityDropdownVariant.LINK}
          />
        </div>

        <div className="flex flex-col items-start">
          <label className="text-xs">Assignee</label>

          <IssueAssigneeDropdown
            value={issue.assigneeId}
            teamId={team.id}
            onChange={assigneeChange}
            variant={IssueAssigneeDropdownVariant.LINK}
          />
        </div>

        <IssueRelatedProperties />

        <div className={cn('flex flex-col items-start')}>
          <div className="text-xs text-left">Labels</div>

          <IssueLabelDropdown
            value={issue.labelIds}
            onChange={labelsChange}
            variant={IssueLabelDropdownVariant.LINK}
            teamIdentifier={team.identifier}
          />
        </div>

        {hasProjectsForTeam && (
          <div className={cn('flex flex-col items-start')}>
            <div className="text-xs text-left">Project</div>

            <ProjectDropdown
              value={issue.projectId}
              onChange={projectChange}
              variant={ProjectDropdownVariant.LINK}
              teamIdentifier={team.identifier}
            />
          </div>
        )}

        {issue.projectId && (
          <div className={cn('flex flex-col items-start')}>
            <div className="text-xs text-left">Project Milestone</div>

            <ProjectMilestoneDropdown
              value={issue.projectMilestoneId}
              onChange={projectMilestoneChange}
              variant={ProjectMilestoneDropdownVariant.LINK}
              teamIdentifier={team.identifier}
              projectId={issue.projectId}
            />
          </div>
        )}

        {team.preferences?.teamType === 'support' ? (
          <SupportProperties />
        ) : (
          <EngineeringProperties />
        )}
      </div>
    </ScrollArea>
  );
});
