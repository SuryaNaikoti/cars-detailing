import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface WhatsAppMessageParams {
  make?: string;
  model?: string;
  year?: number | string;
  service?: string;
  issue?: string;
  preferredDate?: string;
  customerName?: string;
  phone?: string;
}

export function generateWhatsAppLink(params: WhatsAppMessageParams, businessPhone: string = "919000000000"): string {
  let message = "Hi Torque Expert's,";
  
  if (params.make && params.model) {
    message += ` I need help with my ${params.year ? params.year + ' ' : ''}${params.make} ${params.model}.`;
  } else {
    message += " I would like to inquire about specialist automotive service.";
  }

  if (params.service) {
    message += `\nService: ${params.service}`;
  }
  if (params.issue) {
    message += `\nIssue: ${params.issue}`;
  }
  if (params.preferredDate) {
    message += `\nPreferred visit: ${params.preferredDate}`;
  }
  if (params.customerName) {
    message += `\nName: ${params.customerName}`;
  }

  return `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
}
