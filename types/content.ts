export type Status = 
  | 'Material Bruto'
  | 'En Edición'
  | 'Revisión'
  | 'Exportado';

export type Priority = 'Alta' | 'Media' | 'Baja';

export type SocialNetwork = 'YouTube Shorts' | 'Instagram' | 'TikTok';

export type Workspace = 'team' | 'private';

export interface Links {
  driveRaw?: string;
  driveProject?: string;
  driveExports?: string;
  script?: string;
  thumbnails?: string;
  finalVideo?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  client: string;
  campaign: string;
  socialNetwork: SocialNetwork;
  workspace: Workspace; // To differentiate between team and private content
  assigneeId?: string; // Reference to user
  status: Status;
  priority: Priority;
  recordDate?: Date | null;
  deliveryDate?: Date | null;
  publishDate?: Date | null;
  thumbnailUrl?: string;
  links: Links;
  checklist?: ChecklistItem[]; // Checklist embedded as per instruction
  createdAt: Date;
  updatedAt: Date;
}
