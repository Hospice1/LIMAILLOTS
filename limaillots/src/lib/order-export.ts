import { formatPrice } from "@/lib/store-utils";
import { CheckoutCustomer } from "@/types/store";

export interface OrderExportItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderExportData {
  orderId: string;
  customer: CheckoutCustomer;
  items: OrderExportItem[];
  subtotal: number;
  discountAmount: number;
  finalPrice: number;
  promoCode?: string;
}

const ADMIN_WHATSAPP_NUMBER = "2290191326544";

function sanitizePdfText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()\\]/g, "")
    .slice(0, 110);
}

function escapePdfText(value: string): string {
  return sanitizePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdfLines(order: OrderExportData): string[] {
  const lines = [
    "LIMAILLOTS - BON DE COMMANDE",
    `Commande: ${order.orderId}`,
    `Date: ${new Date().toLocaleString("fr-FR")}`,
    "",
    "CLIENT",
    `Email: ${order.customer.email}`,
    `Telephone: ${order.customer.phone}`,
    `Livraison: ${order.customer.wantsDelivery ? "Oui" : "Non - retrait / confirmation WhatsApp"}`,
  ];

  if (order.customer.wantsDelivery) {
    lines.push(`Adresse: ${order.customer.deliveryAddress}`);
  }

  lines.push("", "ARTICLES");

  order.items.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.name} x${item.quantity} - ${formatPrice(item.unitPrice * item.quantity)}`,
    );
  });

  lines.push(
    "",
    `Sous-total: ${formatPrice(order.subtotal)}`,
    `Reduction${order.promoCode ? ` (${order.promoCode})` : ""}: -${formatPrice(order.discountAmount)}`,
    `TOTAL: ${formatPrice(order.finalPrice)}`,
    "",
    "Ce bon de commande sert de recapitulatif. La confirmation finale se fait sur WhatsApp.",
  );

  return lines;
}

function createSimplePdfBlob(lines: string[]): Blob {
  const objects: string[] = [];
  const content = ["BT", "/F1 18 Tf", "50 800 Td"];

  lines.forEach((line, index) => {
    if (index === 1) {
      content.push("/F1 11 Tf");
    }
    content.push(`(${escapePdfText(line)}) Tj`, "0 -18 Td");
  });

  content.push("ET");

  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");
  objects.push("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj");
  objects.push(
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
  );
  objects.push("4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj");
  objects.push(`5 0 obj << /Length ${content.join("\n").length} >> stream\n${content.join("\n")}\nendstream endobj`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let index = 0; index < pdf.length; index += 1) {
    bytes[index] = pdf.charCodeAt(index) & 0xff;
  }

  return new Blob([bytes], { type: "application/pdf" });
}

export function downloadOrderPdf(order: OrderExportData): void {
  const blob = createSimplePdfBlob(buildPdfLines(order));
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bon-commande-${order.orderId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function buildWhatsAppOrderUrl(order: OrderExportData): string {
  const itemLines = order.items
    .map((item) => `- ${item.name} x${item.quantity}: ${formatPrice(item.unitPrice * item.quantity)}`)
    .join("\n");

  const message = [
    "Bonjour LIMAILLOTS, je veux passer cette commande:",
    `Commande: ${order.orderId}`,
    "",
    itemLines,
    "",
    `Sous-total: ${formatPrice(order.subtotal)}`,
    `Reduction${order.promoCode ? ` (${order.promoCode})` : ""}: -${formatPrice(order.discountAmount)}`,
    `Total: ${formatPrice(order.finalPrice)}`,
    "",
    `Email: ${order.customer.email}`,
    `Telephone: ${order.customer.phone}`,
    `Livraison: ${order.customer.wantsDelivery ? "Oui" : "Non"}`,
    order.customer.wantsDelivery ? `Adresse: ${order.customer.deliveryAddress}` : "Adresse: retrait / a confirmer",
  ].join("\n");

  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}