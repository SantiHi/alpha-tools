import React, { useEffect, useRef, memo, useState } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "./ui/separator";
import { BASE_URL } from "../lib/utils";
import { useParams } from "react-router-dom";

const TradingViewScrollArea = ({ info }) => {
  const [allDocuments, setAllDocuments] = useState([]);
  const { selectedId } = useParams();

  useEffect(() => {
    const getAllDocuments = async () => {
      const response = await fetch(
        `${BASE_URL}/getters/documents/${selectedId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const allDocs = await response.json();
      setAllDocuments(allDocs);
    };
    getAllDocuments();
  });

  if (info == null) {
    return;
  }

  return (
    <ScrollArea className="h-125 rounded-md border border-white w-100 -z-50">
      <div className="p-4">
        <h4 className="mb-4 text-sm leading-none font-bold text-white">
          Major Filings for {info.name} (by date filed)
        </h4>
        {allDocuments != null &&
          allDocuments.map((document) => {
            const date = new Date(document.filed_date);
            return (
              <React.Fragment key={document.id}>
                <a href={document.url} target="_blank">
                  <div className="text-sm text-white hover:brightness-40 hover:cursor-pointer">
                    {document.type} | {date.toDateString()}
                  </div>
                </a>
                <Separator className="my-2" />
              </React.Fragment>
            );
          })}
      </div>
    </ScrollArea>
  );
};

function TradingViewWidget({ info }) {
  const container = useRef(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (info == null || container.current == null || loadedRef.current) {
      return;
    }
    loadedRef.current = true;
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "lineWidth": 2,
          "lineType": 0,
          "chartType": "area",
          "fontColor": "rgb(106, 109, 120)",
          "gridLineColor": "rgba(46, 46, 46, 0.06)",
          "volumeUpColor": "rgba(34, 171, 148, 0.5)",
          "volumeDownColor": "rgba(247, 82, 95, 0.5)",
          "backgroundColor": "#ffffff",
          "widgetFontColor": "#0F0F0F",
          "upColor": "#22ab94",
          "downColor": "#f7525f",
          "borderUpColor": "#22ab94",
          "borderDownColor": "#f7525f",
          "wickUpColor": "#22ab94",
          "wickDownColor": "#f7525f",
          "colorTheme": "light",
          "isTransparent": false,
          "locale": "en",
          "chartOnly": false,
          "scalePosition": "right",
          "scaleMode": "Normal",
          "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
          "valuesTracking": "1",
          "changeMode": "price-and-percent",
          "symbols": [
            [
              "${info.name}",
              "${info.ticker} |1D"
            ]
          ],
          "dateRanges": [
            "1d|1",
            "1m|30",
            "3m|60",
            "12m|1D",
            "60m|1W",
            "all|1M"
          ],
          "fontSize": "10",
          "headerFontSize": "medium",
          "autosize": true,
          "height": "100%",
          "width": "100%", 
          "noTimeScale": false,
          "hideDateRanges": false,
          "hideMarketStatus": false,
          "hideSymbolLogo": false
        }`;
    container.current.appendChild(script);
  }, [info]);

  return (
    <>
      <div className="w-320 h-125 flex flex-row">
        <div
          className="tradingview-widget-container"
          style={{ width: "100%", height: "100%" }}
          ref={container}
        ></div>
        <div className="ml-10">
          <TradingViewScrollArea info={info} />
        </div>
      </div>
    </>
  );
}

export default memo(TradingViewWidget);
export { TradingViewScrollArea };
