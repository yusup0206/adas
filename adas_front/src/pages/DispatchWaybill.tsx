import Box from "@/components/shared/Box";
import Header from "@/components/shared/header/Header";
import Section from "@/components/shared/Section";
import { useGetDispatchByIdQuery } from "@/services/warehouseApi";
import { generateDispatchWaybillDocx } from "@/utils/generateDispatchWaybillDocx";
import { Button, message } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaFileArrowDown } from "react-icons/fa6";
import { useParams } from "react-router-dom";

const DispatchWaybill = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  //   states
  const [isExporting, setIsExporting] = useState(false);

  //   queries
  const { data: dispatch } = useGetDispatchByIdQuery(Number(id));

  const getTurkmenMonthName = (date?: string) => {
    if (!date) return "";
    const monthIndex = dayjs(date).month();
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
    return months[monthIndex];
  };

  const handleDownload = async () => {
    if (!dispatch) return;

    const key = "dispatch-waybill-export";
    setIsExporting(true);
    message.loading({ content: t("exporting"), key, duration: 0 });

    try {
      await generateDispatchWaybillDocx(dispatch);
      message.success({ content: t("downloaded"), key, duration: 2 });
    } catch (error) {
      console.error("Waybill export failed:", error);
      message.error({ content: t("exportError"), key, duration: 2 });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section>
      <Header title={dispatch?.dispatchName || ""} goBack={true} />
      <Section>
        <div className="w-full flex items-center justify-end">
          <Button
            icon={<FaFileArrowDown />}
            size="large"
            className="max-w-full md:max-w-fit w-full"
            type="primary"
            loading={isExporting}
            onClick={handleDownload}
          >
            {t("download")}
          </Button>
        </div>
        <Box>
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <p className="text-black text-sm">
                  Kärhananyň ady ______________________________________
                </p>
                <p className="text-black text-sm">
                  Kärhananyň salgyt belgisi ___________________________
                </p>
                <p className="text-black text-sm">
                  Düzümdäki bölüm __________________________________
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-black text-sm text-center text-balance">
                  Ä-6 görnüş <br /> Türkmenistanyň Maliýe ministriniň <br />{" "}
                  2011-nji ýylyň 19 awgustyndaky <br /> 82 belgili buýrugy bilen
                  tassyklandy
                </p>
              </div>
            </div>
            <div className="w-full">
              <p className="text-black text-lg font-bold text-center">
                Ätiýaçlyklary gaýry tarapa göyberiş ýan haty №{" "}
                {dispatch?.dispatchGroupId}
              </p>
            </div>
            <div className="w-full">
              <p className="text-black text-base text-center">
                “{dayjs(dispatch?.dispatchDate).format("DD")}”{" "}
                {getTurkmenMonthName(dispatch?.dispatchDate)}{" "}
                {dayjs(dispatch?.dispatchDate).format("YYYY")} ýyl <br />
              </p>
            </div>
            <div className="w-full flex flex-col">
              <p className="text-black text-sm font-bold">
                Esas
                ________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
              </p>
              <div className="w-full flex items-center gap-4">
                <div className="w-4/6 flex gap-1">
                  <p className="text-black text-sm font-bold">Kime </p>
                  <p className="w-full text-black text-sm border-b border-black">
                    {dispatch?.client?.name_tm}
                  </p>
                </div>
                <div className="w-2/6 flex gap-1">
                  <p className="text-black text-sm whitespace-nowrap font-bold">
                    Kimiň üsti bilen{" "}
                  </p>
                  <p className="w-full text-black text-sm border-b border-black"></p>
                </div>
                <div className="w-1/6 flex gap-1">
                  <p className="text-black text-sm whitespace-nowrap font-bold">
                    TR. №:{" "}
                  </p>
                  <p className="w-full text-black text-sm border-b border-black"></p>
                </div>
              </div>
            </div>
            <table className="table-auto w-full border border-black text-black text-sm">
              <thead>
                <tr>
                  <th colSpan={2} className="border px-2 py-1">
                    Aragatnaşykdaky hasap
                  </th>
                  <th colSpan={2} className="border px-2 py-1">
                    Maddy gymmatlyklar
                  </th>
                  <th colSpan={2} className="border px-2 py-1">
                    Ölçeg birligi
                  </th>
                  <th colSpan={2} className="border px-2 py-1">
                    Mukdary
                  </th>
                  <th rowSpan={2} className="border px-2 py-1">
                    Bahasy - manat, teňňe
                  </th>
                  <th rowSpan={2} className="border px-2 py-1">
                    Goşulan baha üçin salgydy goşmazdan jemi - manat, teňňe
                  </th>
                  <th rowSpan={2} className="border px-2 py-1">
                    Goşulan baha üçin salgydyň möçberi – manat, teňňe
                  </th>
                  <th rowSpan={2} className="border px-2 py-1">
                    Goşulan baha üçin salgydy goşmak bilen hemmesi- manat, teňňe
                  </th>
                  <th colSpan={2} className="border px-2 py-1">
                    Belgisi
                  </th>
                  <th rowSpan={2} className="border px-2 py-1">
                    Ammar karty boýunça tertip belgisi
                  </th>
                </tr>
                <tr>
                  <th className="border px-2 py-1">hasap, kömekçi hasap</th>
                  <th className="border px-2 py-1">analitik hasabyň kody</th>
                  <th className="border px-2 py-1">
                    ady, sorty, möçberi, markasy
                  </th>
                  <th className="border px-2 py-1">sanaw belgisi</th>
                  <th className="border px-2 py-1">ady</th>
                  <th className="border px-2 py-1">kody</th>
                  <th className="border px-2 py-1">göýberi - leni</th>
                  <th className="border px-2 py-1">göýberi - leni</th>
                  <th className="border px-2 py-1">sanaw</th>
                  <th className="border px-2 py-1">pasport</th>
                </tr>
                <tr>
                  <th className="border px-2 py-1">1</th>
                  <th className="border px-2 py-1">2</th>
                  <th className="border px-2 py-1">3</th>
                  <th className="border px-2 py-1">4</th>
                  <th className="border px-2 py-1">5</th>
                  <th className="border px-2 py-1">6</th>
                  <th className="border px-2 py-1">7</th>
                  <th className="border px-2 py-1">8</th>
                  <th className="border px-2 py-1">9</th>
                  <th className="border px-2 py-1">10</th>
                  <th className="border px-2 py-1">11</th>
                  <th className="border px-2 py-1">12</th>
                  <th className="border px-2 py-1">13</th>
                  <th className="border px-2 py-1">14</th>
                  <th className="border px-2 py-1">15</th>
                </tr>
              </thead>
              <tbody>
                {dispatch?.items.map((item, index) => (
                  <tr>
                    <td className="border px-2 py-1 text-center"></td>
                    <td className="border px-2 py-1 text-center"></td>
                    <td className="border px-2 py-1">
                      {item?.product?.name_tm}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {index + 1}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {item?.product?.unit?.name_tm}
                    </td>
                    <td className="border px-2 py-1 text-center"></td>
                    <td className="border px-2 py-1 text-center">
                      {item?.quantity}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {item?.quantity}
                    </td>
                    <td className="border px-2 py-1 text-center"></td>
                    <td className="border px-2 py-1 text-center"></td>
                    <td className="border px-2 py-1 text-center"></td>
                    <td className="border px-2 py-1 text-center"></td>
                    <td className="border px-2 py-1 text-center"></td>
                    <td className="border px-2 py-1 text-center"></td>
                    <td className="border px-2 py-1 text-center"></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="w-full flex flex-col">
              <div className="w-full flex items-center gap-20">
                <div className="w-full flex items-center gap-1">
                  <p className="text-black text-sm font-bold">Jemi</p>
                  <p className="w-full text-black text-xs text-center border-t border-black mt-8">
                    ýazmaça
                  </p>
                  <p className="text-black text-sm">atly,</p>
                </div>
                <div className="w-full flex items-center gap-1">
                  <p className="text-black text-sm font-bold">Jemi</p>
                  <p className="w-full text-black text-xs text-center border-t border-black mt-8">
                    ýazmaça
                  </p>
                </div>
              </div>
              <div className="w-full flex items-center gap-20">
                <div className="w-full flex items-center gap-1">
                  <p className="text-black text-sm font-bold whitespace-nowrap">
                    Göýbermäge rugsat berdim
                  </p>
                  <div className="w-full flex items-center">
                    <p className="w-1/4 text-black text-xs text-center border-t border-black mt-8">
                      wezipesi
                    </p>
                    <p className="w-1/4 text-black text-xs text-center border-t border-black mt-8">
                      goly
                    </p>
                    <p className="w-2/4 text-black text-xs text-center border-t border-black mt-8">
                      FAAa
                    </p>
                  </div>
                </div>
                <div className="w-full"></div>
              </div>
              <div className="w-full flex items-center gap-20">
                <div className="w-full flex items-center gap-1">
                  <p className="text-black text-sm font-bold whitespace-nowrap">
                    Göýberdim
                  </p>
                  <div className="w-full flex items-center">
                    <p className="w-1/4 text-black text-xs text-center border-t border-black mt-8">
                      wezipesi
                    </p>
                    <p className="w-1/4 text-black text-xs text-center border-t border-black mt-8">
                      goly
                    </p>
                    <p className="w-2/4 text-black text-xs text-center border-t border-black mt-8">
                      FAAa
                    </p>
                  </div>
                </div>
                <div className="w-full flex items-center gap-1">
                  <p className="text-black text-sm font-bold whitespace-nowrap">
                    Aldym
                  </p>
                  <div className="w-full flex items-center">
                    <p className="w-1/4 text-black text-xs text-center border-t border-black mt-8">
                      wezipesi
                    </p>
                    <p className="w-1/4 text-black text-xs text-center border-t border-black mt-8">
                      goly
                    </p>
                    <p className="w-2/4 text-black text-xs text-center border-t border-black mt-8">
                      FAAa
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full flex items-center gap-20">
                <div className="w-full flex items-center gap-1">
                  <p className="text-black text-sm font-bold whitespace-nowrap">
                    Barladym
                  </p>
                  <div className="w-full flex items-center">
                    <p className="w-1/4 text-black text-xs text-center border-t border-black mt-8">
                      wezipesi
                    </p>
                    <p className="w-1/4 text-black text-xs text-center border-t border-black mt-8">
                      goly
                    </p>
                    <p className="w-2/4 text-black text-xs text-center border-t border-black mt-8">
                      FAAa
                    </p>
                  </div>
                </div>
                <div className="w-full"></div>
              </div>
            </div>
          </div>
        </Box>
      </Section>
    </section>
  );
};

export default DispatchWaybill;
