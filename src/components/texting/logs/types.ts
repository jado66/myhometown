export interface TextLog {
  id: string;
  message_id: string | null;
  sender_id: string;
  recipient_phone: string;
  recipient_contact_id: string | null;
  message_content: string;
  media_urls: any;
  status: string;
  error_message: string | null;
  owner_id: string;
  owner_type: string;
  created_at: string;
  updated_at: string;
  delivered_at: string | null;
  metadata: any;
  sent_at: string | null;
  batch_id: string;
  twilio_sid: string | null;
}

export interface TextBatch {
  id: string;
  created_at: string;
  updated_at: string;
  sender_id: string;
  owner_type: string;
  owner_id: string;
  message_content: string;
  media_urls: any;
  status: string;
  total_count: number;
  pending_count: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  metadata: any;
}
