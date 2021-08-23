import {
  select,
  json,
  tree,
  hierarchy,
  linkVertical,
  drag,
  scaleLinear,
  scaleOrdinal,
  schemeSet3,
  line,
} from "d3";
import TYPE from "./type";
import "../styles/index.css";

const createGraph = (container, data, minWeight = 0, maxWeight = 1000) => {
  const width = container.offsetWidth;
  const height = container.offsetHeight;
  const margin = { top: 50, left: 20, right: 20, bottom: 50 };

  const scale = scaleLinear()
    .domain([minWeight, maxWeight])
    .range([height / 30, height / 10]);
  const color = scaleOrdinal().domain([]).range(schemeSet3);
  const innerWidth = width - margin.right - margin.left;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = select("#graph")
    .append("svg")
    .attr("width", innerWidth)
    .attr("height", innerHeight);

  const g = svg
    .append("g") // (*)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  const markerBoxWidth = 20;
  const markerBoxHeight = 20;
  const refX = markerBoxWidth / 2;
  const refY = markerBoxHeight / 2;
  const arrowPoints = [
    [0, 0],
    [0, 20],
    [20, 10],
  ];
  svg
    .append("defs")
    .append("marker")
    .attr("id", "arrow")
    .attr("viewBox", [0, 0, markerBoxWidth, markerBoxHeight])
    .attr("refX", refX)
    .attr("refY", refY)
    .attr("markerWidth", markerBoxWidth)
    .attr("markerHeight", markerBoxHeight)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", line()(arrowPoints))
    .attr("stroke", "black");

  const treeLayout = tree().size([
    innerWidth - margin.left * 2,
    innerHeight - margin.top * 2,
  ]);

  const linkPathGenerator = linkVertical()
    .source((d) => {
      console.log(d);
      return {
        ...d.source,
        y:
          d.source.y +
          (d.source.data.weight ? scale(d.source.data.weight / 2) + 20 : 40),
      };
    })
    .x((d) => d.x)
    .y((d) => d.y);

  update(data);

  function update(newDatas) {
    console.log("data", newDatas);
    for(const newData of newDatas) {
      const root = hierarchy(newData);
      let links = treeLayout(root).links();
      console.log(root.data.name);
      g.selectAll(`.${root.data.name}`).remove();
      // Data
      const nodes = g.selectAll(".node").data(root.descendants()); // 자손 연결
      const link = g.selectAll(".edge").data(links);
      nodes.exit().remove();
      link.exit().remove();
      // Enter
      const linkEnter = link
        .enter()
        .append("path")
        .attr("class", "edge")
        .merge(link)
        .attr("d", linkPathGenerator)
        .attr("marker-start", "url(#arrow)");
  
      const nodesEnter = nodes
        .enter()
        .append("g")
        .merge(nodes)
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x}, ${d.y})`);
      
      nodes.selectAll('.shape').remove()
      nodes.selectAll('.text').remove()
      nodesEnter
        .append(function (d) {
          if (d.data.type === TYPE.CONDITION) {
            return document.createElementNS("http://www.w3.org/2000/svg", "rect");
          } else {
            return document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle"
            );
          }
        })
        .attr("class", "shape")
        .attr("width", "120")
        .attr("height", "50")
        .attr("r", (d) => {
          return scale(d.data.weight);
        })
        .attr("fill", (d) => color(d.data.name))
        .attr("stroke", "black")
        .attr("dy", "0.32em")
        .attr("transform", (d) => d.data.type === TYPE.CONDITION ? "translate(-60, -25)" : '');
  
      nodesEnter
        .append("svg:text")
        .attr("class", "text")
        .attr("text-anchor", "middle")
        .append("svg:tspan")
        .attr("x", 0)
        .attr("y", 0)
        .text((d) => {
          if (d.data.type === TYPE.NODE) return `Node: ${d.data.name}`;
          if (d.data.type === TYPE.CONDITION) return `Condition`;
        })
        .append("svg:tspan")
        .attr("x", 0)
        .attr("y", 20)
        .text((d) => {
          console.log(d.data.weight);
          if (d.data.type === TYPE.NODE) return `Weight: ${d.data.weight}`;
          if (d.data.type === TYPE.CONDITION) return `<${d.data.name}>`;
        });
  
      g.selectAll(".node").call(drag().on("start", started));
  
      function started(event) {
        var node = select(this).classed("dragging", true);
        event.on("drag", dragged).on("end", ended);
        function dragged(event, d) {
          const nodeData = node.data()[0];
          nodeData.x = event.x;
          nodeData.y = event.y;
          node.raise().attr("transform", `translate(${event.x}, ${event.y})`);
          linkEnter.attr("d", linkPathGenerator);
        }
  
        function ended() {
          node.classed("dragging", false);
        }
      }
    }

  }

  return {
    update: update,
  };
};

export default createGraph;
