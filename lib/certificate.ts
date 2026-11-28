"use client";

/**
 * Module certificate: the SVG template in /public/certificat-template is filled in,
 * rasterised on a canvas and embedded in an A4 landscape PDF with jsPDF.
 * Everything happens in the browser.
 */

import { asset } from "@/lib/site";

export interface CertificateData {
  name: string;
  module: string;
  moduleNumber: string;
  slogan: string;
  heading: string;
  awardedTo: string;
  forCompleting: string;
  details: string;
  dateLabel: string;
  date: string;
  idLabel: string;
  id: string;
  footer: string;
}

const TEMPLATE_URL = asset("/certificat-template/certificate.svg");
const WIDTH = 1123;
const HEIGHT = 794;
/** 3x keeps text sharp when the PDF is printed */
const SCALE = 3;

/** The learner's name is free text: it must never be able to inject SVG markup. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Short, stable identifier derived from the certificate content (not a cryptographic proof). */
export async function certificateId(name: string, moduleSlug: string, date: string): Promise<string> {
  const data = new TextEncoder().encode(`${name.trim().toLowerCase()}|${moduleSlug}|${date}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(digest).slice(0, 6), (b) => b.toString(16).padStart(2, "0")).join("");
  return `DSO-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`.toUpperCase();
}

function fillTemplate(template: string, data: CertificateData): string {
  const values = data as unknown as Record<string, string>;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => escapeXml(values[key] ?? ""));
}

function svgToPng(svg: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = WIDTH * SCALE;
        canvas.height = HEIGHT * SCALE;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas is not available");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The certificate template could not be rendered"));
    };
    image.src = url;
  });
}

export async function downloadCertificate(data: CertificateData, fileName: string): Promise<void> {
  const response = await fetch(TEMPLATE_URL);
  if (!response.ok) throw new Error("Certificate template not found");
  const svg = fillTemplate(await response.text(), data);
  const png = await svgToPng(svg);

  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  pdf.setProperties({
    title: `${data.heading} - ${data.module}`,
    subject: data.module,
    author: "DevSecOps App",
    creator: "DevSecOps App",
  });
  pdf.addImage(png, "PNG", 0, 0, 297, 210);
  pdf.save(fileName);
}
