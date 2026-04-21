import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  PageBreak,
} from "docx";
import { saveAs } from "file-saver";
import type { Agreement } from "@/interfaces/agreement.interface";
import type { Client } from "@/interfaces/clients.interface";
import dayjs from "dayjs";

// Helper: create a normal text run
function text(t: string, options?: { bold?: boolean; size?: number; font?: string }): TextRun {
  return new TextRun({
    text: t,
    bold: options?.bold ?? false,
    size: options?.size ?? 22, // 11pt
    font: options?.font ?? "Times New Roman",
  });
}

// Helper: create a highlighted text run (yellow background for dynamic data)
function highlighted(t: string, options?: { bold?: boolean; size?: number }): TextRun {
  return new TextRun({
    text: t,
    bold: options?.bold ?? false,
    size: options?.size ?? 22,
    font: "Times New Roman",
    highlight: "yellow",
  });
}

// Helper: create a centered paragraph
function centeredParagraph(children: TextRun[], spacing?: { before?: number; after?: number }): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: spacing?.before ?? 0, after: spacing?.after ?? 0 },
    children,
  });
}

// Helper: create a justified paragraph
function justifiedParagraph(children: TextRun[], spacing?: { before?: number; after?: number }): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: spacing?.before ?? 0, after: spacing?.after ?? 0 },
    children,
  });
}

// Helper: empty line
function emptyLine(): Paragraph {
  return new Paragraph({ children: [text("")] });
}

// Format date
function formatDateRu(date: string | undefined): string {
  if (!date) return "___________";
  return dayjs(date).format("DD.MM.YYYY") + "г.";
}

function formatDateTm(date: string | undefined): string {
  if (!date) return "___________";
  return dayjs(date).format("DD.MM.YYYY") + "ý.";
}

// Get client display info
function getClientNameRu(client: Client | null | undefined): string {
  return client?.name_ru || "___________";
}

function getClientNameTm(client: Client | null | undefined): string {
  return client?.name_tm || "___________";
}

function getDirectorRu(client: Client | null | undefined): string {
  return client?.directorName_ru || "___________";
}

function getDirectorTm(client: Client | null | undefined): string {
  return client?.directorName_tm || "___________";
}

// Build the product table from purchase order items
function buildProductTable(agreement: Agreement): Table {
  // Collect all items from all purchase orders
  const allItems: {
    name: string;
    country: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[] = [];

  if (agreement.purchaseOrders) {
    for (const order of agreement.purchaseOrders) {
      if (order.items) {
        for (const item of order.items) {
          allItems.push({
            name: `${item.product?.name_tm || ""} / ${item.product?.name_ru || ""}`,
            country: `${item.product?.productionCountry_tm || ""} / ${item.product?.productionCountry_ru || ""}`,
            unit: "-",
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.totalPrice),
          });
        }
      }
    }
  }

  const borderStyle = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: "000000",
  };

  const borders = {
    top: borderStyle,
    bottom: borderStyle,
    left: borderStyle,
    right: borderStyle,
  };

  // Header row
  const headerRow = new TableRow({
    children: [
      new TableCell({ borders, width: { size: 5, type: WidthType.PERCENTAGE }, children: [centeredParagraph([text("№", { bold: true, size: 18 })])] }),
      new TableCell({ borders, width: { size: 35, type: WidthType.PERCENTAGE }, children: [centeredParagraph([text("Harydyň ady / Наименование товара", { bold: true, size: 18 })])] }),
      new TableCell({ borders, width: { size: 12, type: WidthType.PERCENTAGE }, children: [centeredParagraph([text("Öndürilen ýurdy / Страна", { bold: true, size: 18 })])] }),
      new TableCell({ borders, width: { size: 10, type: WidthType.PERCENTAGE }, children: [centeredParagraph([text("Ölçeg birligi / Ед. изм.", { bold: true, size: 18 })])] }),
      new TableCell({ borders, width: { size: 10, type: WidthType.PERCENTAGE }, children: [centeredParagraph([text("Mukdary / Кол-во", { bold: true, size: 18 })])] }),
      new TableCell({ borders, width: { size: 13, type: WidthType.PERCENTAGE }, children: [centeredParagraph([text("Bahasy / Цена (USD)", { bold: true, size: 18 })])] }),
      new TableCell({ borders, width: { size: 15, type: WidthType.PERCENTAGE }, children: [centeredParagraph([text("Jemi / Сумма (USD)", { bold: true, size: 18 })])] }),
    ],
  });

  // Data rows
  const dataRows = allItems.map((item, idx) =>
    new TableRow({
      children: [
        new TableCell({ borders, children: [centeredParagraph([text(String(idx + 1), { size: 18 })])] }),
        new TableCell({ borders, children: [new Paragraph({ children: [text(item.name, { size: 18 })] })] }),
        new TableCell({ borders, children: [centeredParagraph([text(item.country, { size: 18 })])] }),
        new TableCell({ borders, children: [centeredParagraph([text(item.unit, { size: 18 })])] }),
        new TableCell({ borders, children: [centeredParagraph([text(String(item.quantity), { size: 18 })])] }),
        new TableCell({ borders, children: [centeredParagraph([text(item.unitPrice.toFixed(2), { size: 18 })])] }),
        new TableCell({ borders, children: [centeredParagraph([text(item.totalPrice.toFixed(2), { size: 18 })])] }),
      ],
    })
  );

  // Total row
  const grandTotal = allItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalRow = new TableRow({
    children: [
      new TableCell({ borders, columnSpan: 5, children: [centeredParagraph([text("")])] }),
      new TableCell({ borders, children: [centeredParagraph([text("Jemi / Итого", { bold: true, size: 18 })])] }),
      new TableCell({ borders, children: [centeredParagraph([text(grandTotal.toFixed(2), { bold: true, size: 18 })])] }),
    ],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows, totalRow],
  });
}

export async function generateAgreementDocx(agreement: Agreement): Promise<void> {
  const buyer = agreement.buyerClient;
  const agreementNo = agreement.agreementNumber || "___";
  const regDate = agreement.registeredDate;
  const validDate = agreement.validDate;

  // Calculate total from orders
  let grandTotal = 0;
  if (agreement.purchaseOrders) {
    for (const order of agreement.purchaseOrders) {
      grandTotal += Number(order.totalPrice || 0);
    }
  }
  const totalStr = grandTotal.toFixed(2);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          // ===== TITLE =====
          centeredParagraph([
            text("ДОГОВОР №", { bold: true, size: 24 }),
            highlighted(agreementNo, { bold: true, size: 24 }),
          ], { after: 100 }),

          centeredParagraph([
            text("ŞERTNAMA №", { bold: true, size: 24 }),
            highlighted(agreementNo, { bold: true, size: 24 }),
          ], { after: 200 }),

          // Date and city
          centeredParagraph([
            highlighted(formatDateRu(regDate), { size: 22 }),
            text("                                                                          г. Ашхабад / Aşgabat ş.", { size: 22 }),
          ], { after: 200 }),

          emptyLine(),

          // ===== PREAMBLE (Russian) =====
          justifiedParagraph([
            text("Компания Humeteks Tekstil Makina Sanayi Ticaret Ltd.Şti., в лице директора Мертжан Гонул, именуемый «ПРОДАВЕЦ» с одной стороны, и ", { size: 22 }),
            highlighted(`${getClientNameRu(buyer)}, в лице директора ${getDirectorRu(buyer)}`, { size: 22 }),
            text(", именуемый «ПОКУПАТЕЛЬ» с другой стороны, заключили настоящий Договор о нижеследующем:", { size: 22 }),
          ], { after: 100 }),

          emptyLine(),

          // ===== ARTICLE 1: SUBJECT (Russian) =====
          centeredParagraph([text("Статья 1. Предмет Договора", { bold: true, size: 22 })], { after: 100 }),

          justifiedParagraph([
            text("1.1. «ПРОДАВЕЦ» продает, а «ПОКУПАТЕЛЬ» покупает товар согласно Приложению №1 к настоящему Договора, которое является его неотъемлемой частью.", { size: 22 }),
          ], { after: 100 }),

          emptyLine(),

          // ===== ARTICLE 2: PRICE (Russian) =====
          centeredParagraph([text("Статья 2. Цена Договора", { bold: true, size: 22 })], { after: 100 }),

          justifiedParagraph([
            text("2.1. Общая сумма настоящего Договора составляет: ", { size: 22 }),
            highlighted(`${totalStr} доллара США.`, { size: 22 }),
          ], { after: 100 }),

          justifiedParagraph([
            text("2.2. Цена включает стоимость товара, упаковку, маркировку и доставку.", { size: 22 }),
          ], { after: 100 }),

          emptyLine(),

          // ===== ARTICLE 3: PAYMENT (Russian) =====
          centeredParagraph([text("Статья 3. Условия оплаты", { bold: true, size: 22 })], { after: 100 }),

          justifiedParagraph([
            text("3.1. Оплата за товар производится в долларах США путем банковского перевода на расчетный счет «ПРОДАВЦА».", { size: 22 }),
          ], { after: 100 }),

          emptyLine(),

          // ===== ARTICLE 4: DELIVERY (Russian) =====
          centeredParagraph([text("Статья 4. Условия поставки", { bold: true, size: 22 })], { after: 100 }),

          justifiedParagraph([
            text("4.1. Условия поставки: согласно формуле INCOTERMS-2020: CIP – г. Ашхабад.", { size: 22 }),
          ], { after: 100 }),

          justifiedParagraph([
            text("4.2. Срок поставки: до ", { size: 22 }),
            highlighted(formatDateRu(validDate), { size: 22 }),
          ], { after: 100 }),

          emptyLine(),

          // ===== ARTICLE 5: VALIDITY (Russian) =====
          centeredParagraph([text("Статья 5. Срок действия Договора", { bold: true, size: 22 })], { after: 100 }),

          justifiedParagraph([
            text("5.1. Настоящий Договор вступает в силу с момента подписания и действует до ", { size: 22 }),
            highlighted(formatDateRu(validDate), { size: 22 }),
          ], { after: 100 }),

          emptyLine(),

          // ===== ARTICLE 6: SIGNATURES (Russian) =====
          centeredParagraph([text("Статья 6. Юридические адреса и реквизиты сторон", { bold: true, size: 22 })], { after: 200 }),

          // Buyer details
          justifiedParagraph([
            text("«ПОКУПАТЕЛЬ»: ", { bold: true, size: 22 }),
            highlighted(getClientNameRu(buyer), { bold: true, size: 22 }),
          ], { after: 100 }),

          justifiedParagraph([
            highlighted("Банковские реквизиты:", { size: 22 }),
          ], { after: 50 }),

          justifiedParagraph([
            highlighted(`${buyer?.bankName_ru || "___________"}`, { size: 22 }),
          ], { after: 50 }),

          justifiedParagraph([
            highlighted(`Расчетный счет: ${buyer?.currentAccount || "___________"}`, { size: 22 }),
          ], { after: 50 }),

          justifiedParagraph([
            highlighted(`Корр. счет: ${buyer?.correspondentAccount || "___________"}`, { size: 22 }),
          ], { after: 50 }),

          justifiedParagraph([
            highlighted(`БИК: ${buyer?.bankIdCode || "___________"}`, { size: 22 }),
          ], { after: 50 }),

          justifiedParagraph([
            highlighted(`ИИН: ${buyer?.individualIdNumber || "___________"}`, { size: 22 }),
          ], { after: 200 }),

          emptyLine(),

          // ===== TURKMEN SECTION (mirror) =====
          centeredParagraph([text("───────────────────────────────────────────────────", { size: 22 })], { after: 200 }),

          centeredParagraph([
            text("ŞERTNAMA №", { bold: true, size: 24 }),
            highlighted(agreementNo, { bold: true, size: 24 }),
          ], { after: 100 }),

          centeredParagraph([
            highlighted(formatDateTm(regDate), { size: 22 }),
            text("                                                                          Aşgabat ş.", { size: 22 }),
          ], { after: 200 }),

          emptyLine(),

          // Preamble (Turkmen)
          justifiedParagraph([
            text("Humeteks Tekstil Makina Sanayi Ticaret Ltd.Şti. kompaniýasy, Tertipnamanyň esasynda hereket edýän, direktor Mertjan Gonul, «SATYJY» diýlip atlandyrylýan bir tarapdan, we ", { size: 22 }),
            highlighted(`${getClientNameTm(buyer)}, Tertipnamanyň esasynda hereket edýän, direktor ${getDirectorTm(buyer)},`, { size: 22 }),
            text(" «SATYN ALYJY» diýlip atlandyrylýan ikinji tarapdan, şu aşakdaky Şertnamany baglaşdylar:", { size: 22 }),
          ], { after: 100 }),

          emptyLine(),

          // Article 1 (Turkmen)
          centeredParagraph([text("1-nji madda. Şertnamanyň predmeti", { bold: true, size: 22 })], { after: 100 }),

          justifiedParagraph([
            text("1.1. «SATYJY» satýar, «SATYN ALYJY» bolsa şu Şertnamanyň aýrylmaz bölegi bolan №1 Goşundysyna laýyklykda haryt satyn alýar.", { size: 22 }),
          ], { after: 100 }),

          emptyLine(),

          // Article 2 (Turkmen)
          centeredParagraph([text("2-nji madda. Şertnamanyň bahasy", { bold: true, size: 22 })], { after: 100 }),

          justifiedParagraph([
            text("2.1. Şu Şertnamanyň umumy bahasy: ", { size: 22 }),
            highlighted(`${totalStr} ABŞ dollary.`, { size: 22 }),
          ], { after: 100 }),

          emptyLine(),

          // Article 4 (Turkmen)
          centeredParagraph([text("4-nji madda. Üpjün etmegiň şertleri", { bold: true, size: 22 })], { after: 100 }),

          justifiedParagraph([
            text("4.1. Üpjün etmegiň şertleri: INCOTERMS-2020 formulasyna laýyklykda: CIP - Aşgabat ş.", { size: 22 }),
          ], { after: 100 }),

          justifiedParagraph([
            text("4.2. Üpjün etmegiň möhleti: ", { size: 22 }),
            highlighted(formatDateTm(validDate), { size: 22 }),
            text(" çenli.", { size: 22 }),
          ], { after: 100 }),

          emptyLine(),

          // Article 5 (Turkmen)
          centeredParagraph([text("5-nji madda. Şertnamanyň hereket ediş möhleti", { bold: true, size: 22 })], { after: 100 }),

          justifiedParagraph([
            text("5.1. Şu Şertnama gol çekilen pursatyndan güýje girýär we ", { size: 22 }),
            highlighted(formatDateTm(validDate), { size: 22 }),
            text(" çenli hereket edýär.", { size: 22 }),
          ], { after: 100 }),

          emptyLine(),

          // Buyer details (Turkmen)
          centeredParagraph([text("6-njy madda. Taraplaryň ýuridiki salgylary we rekwizitleri", { bold: true, size: 22 })], { after: 200 }),

          justifiedParagraph([
            text("«SATYN ALYJY»: ", { bold: true, size: 22 }),
            highlighted(getClientNameTm(buyer), { bold: true, size: 22 }),
          ], { after: 100 }),

          justifiedParagraph([
            highlighted("Bank rekwizitleri:", { size: 22 }),
          ], { after: 50 }),

          justifiedParagraph([
            highlighted(`${buyer?.bankName_tm || "___________"}`, { size: 22 }),
          ], { after: 50 }),

          justifiedParagraph([
            highlighted(`H.h: ${buyer?.currentAccount || "___________"}`, { size: 22 }),
          ], { after: 50 }),

          justifiedParagraph([
            highlighted(`K.h: ${buyer?.correspondentAccount || "___________"}`, { size: 22 }),
          ], { after: 50 }),

          justifiedParagraph([
            highlighted(`BAB: ${buyer?.bankIdCode || "___________"}`, { size: 22 }),
          ], { after: 50 }),

          justifiedParagraph([
            highlighted(`ŞSB: ${buyer?.individualIdNumber || "___________"}`, { size: 22 }),
          ], { after: 200 }),

          emptyLine(),

          // ===== SIGNATURES =====
          centeredParagraph([text("───────────────────────────────────────────────────", { size: 22 })], { after: 200 }),

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
            children: [
              text("«ПРОДАВЕЦ» / «SATYJY»                                                «ПОКУПАТЕЛЬ» / «SATYN ALYJY»", { bold: true, size: 22 }),
            ],
          }),

          emptyLine(),

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
            children: [
              text("Компания / Kompaniýa", { size: 22 }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
            children: [
              text("Humeteks Tekstil Makina                                                 ", { size: 22 }),
              highlighted(getClientNameRu(buyer), { size: 22 }),
            ],
          }),

          emptyLine(),
          emptyLine(),

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
            children: [
              text("Директор / Direktor                                                           Директор / Direktor", { size: 22 }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
            children: [
              text("Мертжан Гонул ________________                          ", { size: 22 }),
              highlighted(`${getDirectorRu(buyer)} ________________`, { size: 22 }),
            ],
          }),

          // ===== PAGE BREAK - APPENDIX =====
          new Paragraph({ children: [new PageBreak()] }),

          // Appendix title
          centeredParagraph([
            text("Приложение ", { bold: true, size: 24 }),
            highlighted(`№1 к Договору ${agreementNo} от ${formatDateRu(regDate)}`, { bold: true, size: 24 }),
          ], { after: 100 }),

          centeredParagraph([
            highlighted(`${formatDateTm(regDate)} seneli №${agreementNo} belgili Şertnamanyň 1-nji goşundy`, { bold: true, size: 24 }),
          ], { after: 200 }),

          emptyLine(),

          // Product table
          buildProductTable(agreement),

          emptyLine(),

          // Total text
          justifiedParagraph([
            text("Ugradylan harydyň jemi bahasy: ", { size: 22 }),
            highlighted(`${totalStr} ABŞ dollary.`, { size: 22 }),
          ], { after: 100 }),

          justifiedParagraph([
            text("Общая стоимость отгруженного товара: ", { size: 22 }),
            highlighted(`${totalStr} доллара США.`, { size: 22 }),
          ], { after: 100 }),

          emptyLine(),

          justifiedParagraph([
            text("Условия поставки: согласно формуле INCOTERMS-2020: CIP – г. Ашхабад.", { size: 22 }),
          ], { after: 50 }),

          justifiedParagraph([
            text("Ýükleme şerti: INCOTERMS-2020 formulasyna laýyklykda: CIP - ş. Aşgabat.", { size: 22 }),
          ], { after: 200 }),

          emptyLine(),

          // Signatures on appendix
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
            children: [
              text("«ПРОДАВЕЦ» / «SATYJY»                                                «ПОКУПАТЕЛЬ» / «SATYN ALYJY»", { bold: true, size: 22 }),
            ],
          }),

          emptyLine(),

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
            children: [
              text("Humeteks Tekstil Makina                                                 ", { size: 22 }),
              highlighted(getClientNameRu(buyer), { size: 22 }),
            ],
          }),

          emptyLine(),

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
            children: [
              text("Мертжан Гонул ________________                          ", { size: 22 }),
              highlighted(`${getDirectorRu(buyer)} ________________`, { size: 22 }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Договор_${agreementNo}.docx`);
}
