import type { EstimateRecord, EstimateItem, EstimateApprovalStatus, EstimateItemType, EstimateStatus } from '../../types';

/**
 * Strict Customer-Safe Quote DTO Allowlist.
 * Excludes all internal technician assignments, bay allocations, internal notes,
 * margin/wholesale metrics, requisition logs, and admin CMS copy.
 */
export interface CustomerSafeQuoteItemDTO {
  id: string;
  description: string;
  type: EstimateItemType;
  category?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  lineTotal: number;
  approvalStatus: EstimateApprovalStatus;
  sourceRecommendation?: string;
  customerNote?: string;
}

export interface CustomerSafeQuoteDTO {
  id: string;
  estimateNumber: string;
  customerName: string;
  vehicleSummary: string;
  registration?: string;
  createdDate: string;
  validityDate: string;
  status: EstimateStatus;
  items: CustomerSafeQuoteItemDTO[];
  labourTotal: number;
  partsTotal: number;
  discountTotal: number;
  subtotal: number;
  total: number;
  approvedTotal: number;
  declinedTotal: number;
  publicToken: string;
  customerNotes?: string;
  policyNotice: string;
}

/**
 * List of forbidden internal patterns that must never appear in customer quote text.
 */
const FORBIDDEN_INTERNAL_PATTERNS = [
  /\btechnician\b/gi,
  /\bbay allocation\b/gi,
  /\brequisition\b/gi,
  /\bwholesale\b/gi,
  /\bmargin\b/gi,
  /\binternal note\b/gi,
  /\bcost price\b/gi,
  /\bdealer cost\b/gi,
];

/**
 * Scrub forbidden internal terminology from arbitrary text strings.
 */
export function sanitizeCustomerText(text?: string | null): string {
  if (!text) return '';
  let sanitized = text;
  
  // Specific known substitutions
  sanitized = sanitized.replace(/technician\s+bay\s+allocation/gi, 'workshop service scheduling');
  sanitized = sanitized.replace(/assigned\s+technician/gi, 'workshop team');
  sanitized = sanitized.replace(/technician/gi, 'specialist');
  sanitized = sanitized.replace(/parts\s+requisition/gi, 'parts procurement');
  sanitized = sanitized.replace(/requisition/gi, 'procurement');
  sanitized = sanitized.replace(/bay\s+allocation/gi, 'bay scheduling');
  sanitized = sanitized.replace(/wholesale/gi, 'standard');
  sanitized = sanitized.replace(/margin/gi, 'scope');

  // Verify no forbidden keywords remain
  for (const pattern of FORBIDDEN_INTERNAL_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  return sanitized.trim();
}

/**
 * Transforms an internal EstimateRecord into an allowlist-only CustomerSafeQuoteDTO.
 * Strictly drops:
 * - internal_notes
 * - technician_id / technician_name
 * - advisor_id
 * - items.internal_note
 * - items where customer_visible === false
 * - revisions (which contain internal author/reasons)
 * - internal timeline logs
 */
export function toCustomerSafeQuoteDTO(estimate: EstimateRecord): CustomerSafeQuoteDTO {
  // Only allow customer visible items
  const safeItems: CustomerSafeQuoteItemDTO[] = (estimate.items || [])
    .filter((item) => item.customer_visible !== false)
    .map((item: EstimateItem) => ({
      id: item.id,
      description: sanitizeCustomerText(item.description),
      type: item.type,
      category: item.category ? sanitizeCustomerText(item.category) : undefined,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unit_price,
      lineTotal: item.line_total,
      approvalStatus: item.approval_status || 'PENDING',
      sourceRecommendation: item.source_recommendation
        ? sanitizeCustomerText(item.source_recommendation)
        : undefined,
      customerNote: item.customer_note ? sanitizeCustomerText(item.customer_note) : undefined,
    }));

  const customerNotes = estimate.customer_notes
    ? sanitizeCustomerText(estimate.customer_notes)
    : undefined;

  const policyNotice = estimate.notes
    ? sanitizeCustomerText(estimate.notes)
    : 'Digital inspection estimate. Any unforeseen findings discovered during teardown will be submitted for secondary approval prior to replacement.';

  return {
    id: estimate.id,
    estimateNumber: estimate.estimate_number,
    customerName: estimate.customer_name,
    vehicleSummary: estimate.vehicle_summary,
    registration: estimate.registration,
    createdDate: estimate.created_date,
    validityDate: estimate.validity_date,
    status: estimate.status,
    items: safeItems,
    labourTotal: estimate.labour_total,
    partsTotal: estimate.parts_total,
    discountTotal: estimate.discount_total || 0,
    subtotal: estimate.subtotal || (estimate.labour_total + estimate.parts_total),
    total: estimate.total,
    approvedTotal: estimate.approved_total || 0,
    declinedTotal: estimate.declined_total || 0,
    publicToken: estimate.public_token,
    customerNotes,
    policyNotice,
  };
}
