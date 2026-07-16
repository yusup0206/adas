import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  convertInchesToTwip,
} from "docx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import type { DispatchGroup } from "@/interfaces/warehouses.interface";

// ─── unit helpers ─────────────────────────────────────────────────────────────

/** Convert points to twips (1 pt = 20 twips). Used for spacing. */
const pt = (n: number) => n * 20;

// ─── font sizes (half-points, docx unit) ────────────────────────────────────
const SM = 20; // ≈ text-sm  (14 px)
const XS = 18; // ≈ text-xs  (12 px)
const BASE = 24; // ≈ text-base (16 px)
const LG = 28; // ≈ text-lg  (18 px)

// ─── border presets ──────────────────────────────────────────────────────────

const noBorder = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
} as const;

const solidBorder = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
} as const;

/** Table-level invisible borders (insideHorizontal / insideVertical per docx v9 API) */
const noTableBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
  insideHorizontal: { style: BorderStyle.NONE, size: 0 },
  insideVertical: { style: BorderStyle.NONE, size: 0 },
} as const;

// ─── element builders ─────────────────────────────────────────────────────────

const run = (text: string, opts: { bold?: boolean; size?: number } = {}) =>
  new TextRun({
    text,
    bold: opts.bold,
    size: opts.size ?? SM,
    font: "Times New Roman",
  });

const para = (
  children: TextRun[],
  align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
  spacingAfter = 0,
  spacingBefore = 0,
) =>
  new Paragraph({
    children,
    alignment: align,
    spacing: { after: spacingAfter, before: spacingBefore },
  });

const spacer = (pts = 4) =>
  new Paragraph({ children: [], spacing: { after: pt(pts) } });

// ─── month name ───────────────────────────────────────────────────────────────

function getTurkmenMonthName(date?: string): string {
  if (!date) return "";
  const months = [
    "Ýanwar",
    "Fewral",
    "Mart",
    "Aprel",
    "Maý",
    "Iýun",
    "Iýul",
    "Awgust",
    "Sentýabr",
    "Oktýabr",
    "Noýabr",
    "Dekabr",
  ];
  return months[dayjs(date).month()];
}

// ─── 1. Header table (company info left, Ä-6 right) ──────────────────────────

function buildHeaderTable(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noTableBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 75, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              para([
                run("Kärhananyň ady ______________________________________"),
              ]),
              para([
                run("Kärhananyň salgyt belgisi ___________________________"),
              ]),
              para([run("Düzümdäki bölüm __________________________________")]),
            ],
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            borders: noBorder,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              para([run("Ä-6 görnüş")], AlignmentType.CENTER),
              para(
                [run("Türkmenistanyň Maliýe ministriniň")],
                AlignmentType.CENTER,
              ),
              para(
                [run("2011-nji ýylyň 19 awgustyndaky")],
                AlignmentType.CENTER,
              ),
              para(
                [run("82 belgili buýrugy bilen tassyklandy")],
                AlignmentType.CENTER,
              ),
            ],
          }),
        ],
      }),
    ],
  });
}

// ─── 2. Title ─────────────────────────────────────────────────────────────────

function buildTitle(dispatchGroupId?: number | null): Paragraph {
  return para(
    [
      run(
        `Ätiýaçlyklary gaýry tarapa göyberiş ýan haty №  ${dispatchGroupId ?? ""}`,
        {
          bold: true,
          size: LG,
        },
      ),
    ],
    AlignmentType.CENTER,
    pt(2),
    pt(6),
  );
}

// ─── 3. Date ─────────────────────────────────────────────────────────────────

function buildDate(dispatchDate?: string): Paragraph {
  const day = dayjs(dispatchDate).format("DD");
  const month = getTurkmenMonthName(dispatchDate);
  const year = dayjs(dispatchDate).format("YYYY");
  return para(
    [run(`"${day}" ${month} ${year} ýyl`, { size: BASE })],
    AlignmentType.CENTER,
    pt(4),
  );
}

// ─── 4. Esas + Kime row ───────────────────────────────────────────────────────

function buildBasaKime(clientName?: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noTableBorders,
    rows: [
      // "Esas" line
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 6,
            borders: noBorder,
            children: [
              new Paragraph({
                children: [
                  run("Esas", { bold: true }),
                  run(
                    " ___________________________________________________________" +
                      "___________________________________________________________" +
                      "_______________________",
                  ),
                ],
                spacing: { after: pt(3) },
              }),
            ],
          }),
        ],
      }),
      // Kime [line]  [gap] Kimiň üsti bilen [line]  [gap] TR. №: [line]
      new TableRow({
        children: [
          // ── Kime label (no gap before it) ─────────────────────────────
          new TableCell({
            width: { size: 3, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                children: [run("Kime ", { bold: true })],
                spacing: { after: pt(2) },
              }),
            ],
          }),

          // ── Kime value line (gap on RIGHT = space before next label) ──
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            borders: {
              ...noBorder,
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            },
            margins: { right: convertInchesToTwip(0.5) },
            children: [
              new Paragraph({
                children: [run(clientName ?? "")],
                spacing: { after: pt(2) },
              }),
            ],
          }),
          new TableCell({
            width: { size: 1, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                children: [run(" ", { bold: true })],
                spacing: { after: pt(2) },
              }),
            ],
          }),
          // ── Kimiň üsti bilen label ────────────────────────────────────
          new TableCell({
            width: { size: 8, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                children: [run("Kimiň üsti bilen ", { bold: true })],
                spacing: { after: pt(2) },
              }),
            ],
          }),
          // ── Kimiň value line (gap on RIGHT before TR. №:) ─────────────
          new TableCell({
            width: { size: 19, type: WidthType.PERCENTAGE },
            borders: {
              ...noBorder,
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            },
            margins: { right: convertInchesToTwip(0.5) },
            children: [
              new Paragraph({ children: [run("")], spacing: { after: pt(2) } }),
            ],
          }),

          // ── TR. №: label ──────────────────────────────────────────────
          new TableCell({
            width: { size: 4, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                children: [run("TR. №: ", { bold: true })],
                spacing: { after: pt(2) },
              }),
            ],
          }),
          // ── TR. №: value line ─────────────────────────────────────────
          new TableCell({
            width: { size: 12, type: WidthType.PERCENTAGE },
            borders: {
              ...noBorder,
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            },
            children: [
              new Paragraph({ children: [run("")], spacing: { after: pt(2) } }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ─── 5. Main 15-column table ──────────────────────────────────────────────────

const CELL_MARGIN = {
  top: convertInchesToTwip(0.03),
  bottom: convertInchesToTwip(0.03),
  left: convertInchesToTwip(0.06),
  right: convertInchesToTwip(0.06),
};

function headerCell(
  text: string,
  rowSpan?: number,
  colSpan?: number,
): TableCell {
  return new TableCell({
    rowSpan,
    columnSpan: colSpan,
    borders: solidBorder,
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGIN,
    children: [
      new Paragraph({
        children: [run(text, { size: XS })],
        alignment: AlignmentType.CENTER,
      }),
    ],
  });
}

function dataCell(
  text: string,
  align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.CENTER,
): TableCell {
  return new TableCell({
    borders: solidBorder,
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGIN,
    children: [
      new Paragraph({
        children: [run(text, { size: XS })],
        alignment: align,
      }),
    ],
  });
}

function buildMainTable(items: DispatchGroup["items"]): Table {
  // Header row 1 — grouped column headers
  const headerRow1 = new TableRow({
    tableHeader: true,
    children: [
      headerCell("Aragatnaşykdaky hasap", undefined, 2),
      headerCell("Maddy gymmatlyklar", undefined, 2),
      headerCell("Ölçeg birligi", undefined, 2),
      headerCell("Mukdary", undefined, 2),
      headerCell("Bahasy - manat, teňňe", 2),
      headerCell("Goşulan baha üçin salgydy goşmazdan jemi - manat, teňňe", 2),
      headerCell("Goşulan baha üçin salgydyň möçberi – manat, teňňe", 2),
      headerCell(
        "Goşulan baha üçin salgydy goşmak bilen hemmesi- manat, teňňe",
        2,
      ),
      headerCell("Belgisi", undefined, 2),
      headerCell("Ammar karty boýunça tertip belgisi", 2),
    ],
  });

  // Header row 2 — sub-column headers
  const headerRow2 = new TableRow({
    tableHeader: true,
    children: [
      headerCell("hasap, kömekçi hasap"),
      headerCell("analitik hasabyň kody"),
      headerCell("ady, sorty, möçberi, markasy"),
      headerCell("sanaw belgisi"),
      headerCell("ady"),
      headerCell("kody"),
      headerCell("göýberi-\nleni"),
      headerCell("göýberi-\nleni"),
      headerCell("sanaw"),
      headerCell("pasport"),
    ],
  });

  // Header row 3 — column numbers 1–15
  const headerRow3 = new TableRow({
    tableHeader: true,
    children: Array.from({ length: 15 }, (_, i) => headerCell(String(i + 1))),
  });

  // Data rows
  const dataRows = items.map(
    (item, index) =>
      new TableRow({
        children: [
          dataCell(""), // 1
          dataCell(""), // 2
          dataCell(item?.product?.name_tm ?? "", AlignmentType.LEFT), // 3
          dataCell(String(index + 1)), // 4
          dataCell(item?.product?.unit?.name_tm ?? ""), // 5
          dataCell(""), // 6
          dataCell(String(item?.quantity ?? "")), // 7
          dataCell(String(item?.quantity ?? "")), // 8
          dataCell(""), // 9
          dataCell(""), // 10
          dataCell(""), // 11
          dataCell(""), // 12
          dataCell(""), // 13
          dataCell(""), // 14
          dataCell(""), // 15
        ],
      }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow1, headerRow2, headerRow3, ...dataRows],
  });
}

// ─── 6. Jemi (totals) ─────────────────────────────────────────────────────────

function buildJemi(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noTableBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                children: [run("Jemi", { bold: true })],
                spacing: { after: pt(2) },
              }),
            ],
          }),
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              // Line sits at same baseline as "Jemi" / "atly," text
              new Paragraph({
                children: [run("")],
                border: {
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 4,
                    color: "000000",
                  },
                },
                spacing: { before: 0, after: 0 },
              }),
              new Paragraph({
                children: [run("ýazmaça", { size: XS })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 },
              }),
            ],
          }),

          new TableCell({
            width: { size: 3, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                children: [run("atly,", { bold: true })],
                spacing: { after: pt(2) },
              }),
            ],
          }),
          new TableCell({
            width: { size: 5, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                children: [run(" ", { bold: true })],
                spacing: { after: pt(2) },
              }),
            ],
          }),
          new TableCell({
            width: { size: 3, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                children: [run("Jemi", { bold: true })],
                spacing: { after: pt(2) },
              }),
            ],
          }),
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            borders: noBorder,
            // margins: { right: convertInchesToTwip(0.5) },
            children: [
              new Paragraph({
                children: [run("")],
                border: {
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 4,
                    color: "000000",
                  },
                },
                spacing: { before: 0, after: 0 },
              }),
              new Paragraph({
                children: [run("ýazmaça", { size: XS })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 },
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ─── 7. Signature block ───────────────────────────────────────────────────────

function buildSignatures1(): Table[] {
  const labelCell = (text: string, widthPct: number): TableCell =>
    new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      borders: noBorder,
      children: text
        ? [
            new Paragraph({
              children: [run(text, { bold: true })],
              spacing: { after: pt(2) },
            }),
          ]
        : [new Paragraph({ children: [] })],
    });

  const lineCell = (widthPct: number, showLine: boolean): TableCell =>
    new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      borders: noBorder,
      children: showLine
        ? [
            new Paragraph({
              children: [run("")],
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
              },
              spacing: { before: 0, after: 0 },
            }),
            new Paragraph({
              children: [
                run(
                  "wezipesi                       goly                            FAAa",
                  { size: XS },
                ),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 0 },
            }),
          ]
        : [new Paragraph({ children: [] })],
    });

  const gapCell = new TableCell({
    width: { size: 4, type: WidthType.PERCENTAGE },
    borders: noBorder,
    children: [new Paragraph({ children: [] })],
  });

  // Create a separate table for each row so Word allows different column widths
  const createSigTableRow = (
    leftLabel: string,
    leftWidth: number,
    rightLabel: string = "",
    rightWidth: number = 0,
  ) => {
    // Left half is 48%, Gap is 4%, Right half is 48% = 100%
    const leftLine = 48 - leftWidth;
    const rightLine = 48 - rightWidth;

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noTableBorders,
      rows: [
        new TableRow({
          children: [
            labelCell(leftLabel, leftWidth),
            lineCell(leftLine, true),
            gapCell,
            labelCell(rightLabel, rightWidth),
            lineCell(rightLine, !!rightLabel),
          ],
        }),
      ],
    });
  };

  return [createSigTableRow("Göýbermäge rugsat berdim", 18)];
}
function buildSignatures2(): Table[] {
  const labelCell = (text: string, widthPct: number): TableCell =>
    new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      borders: noBorder,
      children: text
        ? [
            new Paragraph({
              children: [run(text, { bold: true })],
              spacing: { after: pt(2) },
            }),
          ]
        : [new Paragraph({ children: [] })],
    });

  const lineCell = (widthPct: number, showLine: boolean): TableCell =>
    new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      borders: noBorder,
      children: showLine
        ? [
            new Paragraph({
              children: [run("")],
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
              },
              spacing: { before: 0, after: 0 },
            }),
            new Paragraph({
              children: [
                run(
                  "wezipesi                       goly                            FAAa",
                  { size: XS },
                ),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 0 },
            }),
          ]
        : [new Paragraph({ children: [] })],
    });

  const gapCell = new TableCell({
    width: { size: 4, type: WidthType.PERCENTAGE },
    borders: noBorder,
    children: [new Paragraph({ children: [] })],
  });

  // Create a separate table for each row so Word allows different column widths
  const createSigTableRow = (
    leftLabel: string,
    leftWidth: number,
    rightLabel: string = "",
    rightWidth: number = 0,
  ) => {
    // Left half is 48%, Gap is 4%, Right half is 48% = 100%
    const leftLine = 48 - leftWidth;
    const rightLine = 48 - rightWidth;

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noTableBorders,
      rows: [
        new TableRow({
          children: [
            labelCell(leftLabel, leftWidth),
            lineCell(leftLine, true),
            gapCell,
            labelCell(rightLabel, rightWidth),
            lineCell(rightLine, !!rightLabel),
          ],
        }),
      ],
    });
  };

  return [createSigTableRow("Göýberdim", 8, "Aldym", 5)];
}
function buildSignatures3(): Table[] {
  const labelCell = (text: string, widthPct: number): TableCell =>
    new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      borders: noBorder,
      children: text
        ? [
            new Paragraph({
              children: [run(text, { bold: true })],
              spacing: { after: pt(2) },
            }),
          ]
        : [new Paragraph({ children: [] })],
    });

  const lineCell = (widthPct: number, showLine: boolean): TableCell =>
    new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      borders: noBorder,
      children: showLine
        ? [
            new Paragraph({
              children: [run("")],
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
              },
              spacing: { before: 0, after: 0 },
            }),
            new Paragraph({
              children: [
                run(
                  "wezipesi                       goly                            FAAa",
                  { size: XS },
                ),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 0 },
            }),
          ]
        : [new Paragraph({ children: [] })],
    });

  const gapCell = new TableCell({
    width: { size: 4, type: WidthType.PERCENTAGE },
    borders: noBorder,
    children: [new Paragraph({ children: [] })],
  });

  // Create a separate table for each row so Word allows different column widths
  const createSigTableRow = (
    leftLabel: string,
    leftWidth: number,
    rightLabel: string = "",
    rightWidth: number = 0,
  ) => {
    // Left half is 48%, Gap is 4%, Right half is 48% = 100%
    const leftLine = 48 - leftWidth;
    const rightLine = 48 - rightWidth;

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noTableBorders,
      rows: [
        new TableRow({
          children: [
            labelCell(leftLabel, leftWidth),
            lineCell(leftLine, true),
            gapCell,
            labelCell(rightLabel, rightWidth),
            lineCell(rightLine, !!rightLabel),
          ],
        }),
      ],
    });
  };

  return [createSigTableRow("Barladym", 7)];
}

// ─── main export ─────────────────────────────────────────────────────────────

export async function generateDispatchWaybillDocx(
  dispatch: DispatchGroup,
): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: "landscape",
            },
            margin: {
              top: convertInchesToTwip(0.6),
              bottom: convertInchesToTwip(0.6),
              left: convertInchesToTwip(0.9),
              right: convertInchesToTwip(0.6),
            },
          },
        },
        children: [
          buildHeaderTable(),
          spacer(6),

          buildTitle(dispatch.dispatchGroupId),
          buildDate(dispatch.dispatchDate),
          spacer(4),

          buildBasaKime(dispatch.client?.name_tm),
          spacer(4),

          buildMainTable(dispatch.items),
          spacer(8),

          buildJemi(),
          spacer(4),

          ...buildSignatures1(),
          spacer(4),
          ...buildSignatures2(),
          spacer(4),
          ...buildSignatures3(),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(
    blob,
    `waybill_${dispatch.dispatchGroupId ?? dispatch.dispatchName}.docx`,
  );
}
