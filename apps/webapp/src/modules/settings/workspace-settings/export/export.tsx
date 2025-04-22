import { Button } from '@tegonhq/ui/components/button';

import { SettingSection } from 'modules/settings/setting-section';

import { useCurrentWorkspace } from 'hooks/workspace';

export function Export() {
  const workspace = useCurrentWorkspace();

  return (
    <SettingSection
      title="Export"
      description="Export your issue data in CSV format."
    >
       <div className="flex gap-4">
      <Button
        variant="secondary"
        onClick={() => {
          window.open(
            `/api/v1/issues/export?workspaceId=${workspace.id}`,
            '_blank',
          );
        }}
      >
        Export CSV
      </Button>
      <Button variant="secondary">
          <a href="https://github.com/user-attachments/files/18752459/Data.Analytics.Report.1.pdf">
            {' '}
            Download Analytics
          </a>
        </Button>
        </div>
    </SettingSection>
  );
}
