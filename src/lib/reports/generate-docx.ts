import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";

export interface DocSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
  note?: string;
}

export interface ReportDocModel {
  title: string;
  subtitle: string;
  meta: string[];
  highlights: string[];
  /** 摘要区标题，默认「今日必看」 */
  highlightTitle?: string;
  sections: DocSection[];
  footerNote?: string;
}

const BRAND = "E04D4E";
const INK = "0F172A";
const MUTED = "64748B";
const LINE = "E2E8F0";
const SOFT = "F8FAFC";

/** A4 可用内容宽（页宽 11906 - 左右边距各 720） */
const CONTENT_WIDTH = 10466;

function run(
  content: string,
  opts?: { bold?: boolean; size?: number; color?: string },
) {
  return new TextRun({
    text: content,
    bold: opts?.bold,
    size: opts?.size ?? 20,
    color: opts?.color ?? INK,
    font: "Microsoft YaHei",
  });
}

function para(
  content: string,
  opts?: {
    bold?: boolean;
    after?: number;
    color?: string;
    keepNext?: boolean;
  },
) {
  return new Paragraph({
    spacing: { after: opts?.after ?? 140 },
    keepNext: opts?.keepNext,
    children: [run(content, { bold: opts?.bold, color: opts?.color })],
  });
}

function bullet(content: string) {
  return new Paragraph({
    spacing: { after: 90 },
    indent: { left: 200 },
    children: [run(`·  ${content}`)],
  });
}

/** 按表头语义分配列宽，避免等分导致中文错位 */
function columnWidthsFor(headers: string[]): number[] {
  const weights = headers.map((h) => {
    if (/建议|动作|判断/.test(h)) return 2.8;
    if (/走势|趋势/.test(h)) return 2.4;
    if (/游戏|竞品|热搜|IP/.test(h)) return 2.2;
    if (/位差|标记/.test(h)) return 1.6;
    if (/灯/.test(h)) return 0.7;
    if (/名次|排名|变化|连升|指数/.test(h)) return 1.1;
    return 1.4;
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map((w) => Math.floor((CONTENT_WIDTH * w) / sum));
  const used = widths.reduce((a, b) => a + b, 0);
  widths[widths.length - 1] += CONTENT_WIDTH - used;
  return widths;
}

function cell(
  content: string,
  opts: {
    header?: boolean;
    width: number;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
  },
) {
  const text = (content || "—").replace(/\s+/g, " ").trim();
  return new TableCell({
    width: { size: opts.width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    shading: opts.header ? { type: "clear", fill: SOFT } : undefined,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      left: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      right: { style: BorderStyle.SINGLE, size: 4, color: LINE },
    },
    children: [
      new Paragraph({
        alignment: opts.align ?? AlignmentType.LEFT,
        spacing: { before: 0, after: 0, line: 276 },
        keepLines: true,
        children: [
          run(text, {
            bold: opts.header,
            size: opts.header ? 16 : 17,
            color: opts.header ? MUTED : INK,
          }),
        ],
      }),
    ],
  });
}

function makeTable(headers: string[], rows: string[][]) {
  const widths = columnWidthsFor(headers);
  const numericLike = /名次|排名|变化|连升|指数|标记|灯|位差/;

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: headers.map((h, i) =>
          cell(h, {
            header: true,
            width: widths[i]!,
            align: numericLike.test(h)
              ? AlignmentType.CENTER
              : AlignmentType.LEFT,
          }),
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            cantSplit: true,
            children: headers.map((h, i) =>
              cell(row[i] ?? "—", {
                width: widths[i]!,
                align: numericLike.test(h)
                  ? AlignmentType.CENTER
                  : AlignmentType.LEFT,
              }),
            ),
          }),
      ),
    ],
  });
}

export async function packReportDocx(model: ReportDocModel): Promise<Buffer> {
  const children: Array<Paragraph | Table> = [];

  children.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [run("MomoRank", { bold: true, size: 18, color: BRAND })],
    }),
  );
  children.push(
    new Paragraph({
      spacing: { after: 80 },
      children: [run(model.title, { bold: true, size: 30 })],
    }),
  );
  children.push(
    new Paragraph({
      spacing: { after: 160 },
      children: [run(model.subtitle, { size: 19, color: MUTED })],
    }),
  );

  for (const line of model.meta) {
    children.push(
      new Paragraph({
        spacing: { after: 36 },
        children: [run(line, { size: 17, color: MUTED })],
      }),
    );
  }

  children.push(
    new Paragraph({
      spacing: { before: 140, after: 180 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 12, color: BRAND, space: 6 },
      },
      children: [run(" ")],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { before: 40, after: 120 },
      children: [
        run(model.highlightTitle ?? "今日必看", { bold: true, size: 24 }),
      ],
    }),
  );
  for (const line of model.highlights) {
    children.push(bullet(line));
  }

  for (const section of model.sections) {
    children.push(
      new Paragraph({
        spacing: { before: 260, after: 120 },
        keepNext: true,
        children: [run(section.heading, { bold: true, size: 24 })],
      }),
    );
    for (const line of section.paragraphs ?? []) {
      children.push(
        para(line, {
          keepNext: Boolean(section.table),
        }),
      );
    }
    for (const item of section.bullets ?? []) {
      children.push(bullet(item));
    }
    if (section.table && section.table.headers.length > 0) {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          keepNext: true,
          children: [],
        }),
      );
      children.push(makeTable(section.table.headers, section.table.rows));
      children.push(new Paragraph({ spacing: { before: 120 }, children: [] }));
    }
    if (section.note) {
      children.push(para(section.note, { color: MUTED, after: 80 }));
    }
  }

  if (model.footerNote) {
    children.push(
      new Paragraph({
        spacing: { before: 300 },
        border: {
          top: { style: BorderStyle.SINGLE, size: 6, color: LINE, space: 10 },
        },
        children: [run(model.footerNote, { size: 15, color: MUTED })],
      }),
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
