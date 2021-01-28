import React, { useLayoutEffect, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

import am4themes_animated from "@amcharts/amcharts4/themes/animated";
am4core.useTheme(am4themes_animated);

const Chart = ({
  data,
  hidden,
  x,
  y,
}: {
  data: any;
  hidden: boolean;
  x: string;
  y: string;
}) => {
  const chartRef = useRef<am4charts.XYChart>();
  const id = useRef(Math.random().toString(36).substr(2, 9));

  useLayoutEffect(() => {
    let chart = am4core.create(id.current, am4charts.XYChart);
    chart.padding(0, 15, 0, 15);
    chart.leftAxesContainer.layout = "vertical";

    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.ticks.template.length = 8;
    dateAxis.renderer.ticks.template.strokeOpacity = 0.1;
    dateAxis.renderer.grid.template.disabled = true;
    dateAxis.renderer.ticks.template.disabled = false;
    dateAxis.renderer.ticks.template.strokeOpacity = 0.2;
    dateAxis.renderer.minLabelPosition = 0.01;
    dateAxis.renderer.maxLabelPosition = 0.99;
    dateAxis.keepSelection = true;
    dateAxis.minHeight = 30;

    dateAxis.groupData = true;
    dateAxis.minZoomCount = 5;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    if (valueAxis.tooltip) {
      valueAxis.tooltip.disabled = true;
    }
    valueAxis.zIndex = 1;
    valueAxis.renderer.baseGrid.disabled = true;
    valueAxis.height = am4core.percent(65);

    valueAxis.renderer.gridContainer.background.fill = am4core.color("#000000");
    valueAxis.renderer.gridContainer.background.fillOpacity = 0.05;
    valueAxis.renderer.inside = true;
    valueAxis.renderer.labels.template.verticalCenter = "bottom";
    valueAxis.renderer.labels.template.padding(2, 2, 2, 2);
    valueAxis.renderer.fontSize = "0.8em";

    let series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.dateX = x;
    series.dataFields.valueY = y;
    series.tooltipText = "{valueY.value}";
    series.defaultState.transitionDuration = 0;

    chart.cursor = new am4charts.XYCursor();

    let scrollbarX = new am4charts.XYChartScrollbar();
    scrollbarX.series.push(series);
    scrollbarX.marginBottom = 20;
    chart.scrollbarX = scrollbarX;

    chartRef.current = chart;

    return () => {
      chart.dispose();
    };
  }, [x, y]);

  useLayoutEffect(() => {
    if (chartRef.current) {
      chartRef.current.data = data;
    }
  }, [data]);

  return (
    <div
      id={id.current}
      style={{ width: "100%", height: 300 }}
      hidden={hidden}
    />
  );
};

export default Chart;
