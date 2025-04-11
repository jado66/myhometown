export interface ProjectFormData {
  // UUID Fields
  id?: string;
  created_by?: string;
  updated_by?: string;

  // Basic Information
  project_name?: string;
  project_id?: string;
  project_developer?: string;
  project_developer_phone1?: string;
  project_developer_email1?: string;
  project_developer_phone2?: string;
  project_developer_email2?: string;
  status?: string;

  // Property Information
  property_owner?: string;
  property_owner_2?: string;
  phone_number?: string;
  phone_number_2?: string;
  email?: string;
  email_2?: string;

  // Host Information
  host_name?: string;
  host_phone?: string;
  host_email?: string;

  // Address
  address_street1?: string;
  address_street2?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  is_address_verified?: boolean;

  // Project Details
  work_summary?: string;
  date_of_service?: string | Date;
  project_duration?: number;
  actual_project_duration?: number;
  volunteers_needed?: number;
  actual_volunteers?: number;
  has_prep_day?: boolean;
  prep_day_work_summary?: string;
  prep_day_preferred_remedies?: string;

  // Resource Couple Information
  project_development_couple?: string;
  project_development_couple_ward?: string;
  project_development_couple_phone1?: string;
  project_development_couple_email1?: string;
  project_development_couple_phone2?: string;
  project_development_couple_email2?: string;

  // Planning
  preferred_remedies?: string;
  tasks?: any; // JSONB in database

  // Resources & Budget
  budget?: string;
  budget_estimates?: number;
  budget_hidden?: boolean;
  homeowner_ability?: string;
  homeowner_ability_estimates?: number;
  volunteer_tools?: string[];
  volunteerTools?: string; // Text field in database
  equipment?: string[];
  materials?: string[];
  homeownerMaterials?: string;
  otherMaterials?: string;

  // Project Requirements
  are_blue_stakes_needed?: boolean;
  is_dumpster_needed?: boolean;
  is_second_dumpster_needed?: boolean;

  // Status Flags
  materials_procured?: boolean;
  tools_arranged?: boolean;
  materials_on_site?: boolean;
  called_811?: boolean;
  dumpster_requested?: boolean;

  // Partner Information
  partner_stake_id?: string;
  partner_stake_liaison?: string;
  partner_stake_liaison_phone?: string;
  partner_stake_liaison_email?: string;
  partner_stake_liaison_title?: string;
  partner_stake_liaison_title2?: string;

  partner_ward?: string;
  partner_ward_liaison?: string;
  partner_ward_liaison2?: string;
  partner_ward_liaison_phone1?: string;
  partner_ward_liaison_email1?: string;
  partner_ward_liaison_phone2?: string;
  partner_ward_liaison_email2?: string;
  partner_ward_liaison_title?: string;
  partner_ward_liaison_title2?: string;
  partner_ward_volunteer_count?: number;

  // Status Flags
  partner_stake_contacted?: boolean;
  partner_ward_contacted?: boolean;
  site_visit_done_with_resource_couple?: boolean;
  site_visit_done_with_host?: boolean;
  site_visit_done_with_partner?: boolean;
  review_completed_with_couple?: boolean;
  review_completed_with_homeowner?: boolean;

  // Review
  review_notes?: string;

  // Signature
  signature_text?: string;
  signature_image?: string;
  terms_agreed_at?: string | Date;

  // Related IDs
  community_id?: string;
  city_id?: string;
  days_of_service_id?: string;

  // Timestamps
  created_at?: string | Date;
  updated_at?: string | Date;

  // Collaboration
  collaborators?: any; // JSONB in database
}
