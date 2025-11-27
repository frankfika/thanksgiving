import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { StarData } from '../types';

interface GalaxyCanvasProps {
  stars: StarData[];
  onStarClick: (star: StarData) => void;
}

const GalaxyCanvas: React.FC<GalaxyCanvasProps> = ({ stars, onStarClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<StarData, undefined> | null>(null);
  const [hoveredStar, setHoveredStar] = useState<StarData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!svgRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const svg = d3.select(svgRef.current);

    svg.attr("width", width).attr("height", height);

    // Create container groups for layering
    // 1. Constellation lines (bottom)
    let linkGroup = svg.select<SVGGElement>(".links");
    if (linkGroup.empty()) {
      linkGroup = svg.append("g").attr("class", "links");
    }

    // 2. Stars (top)
    let nodeGroup = svg.select<SVGGElement>(".nodes");
    if (nodeGroup.empty()) {
      nodeGroup = svg.append("g").attr("class", "nodes");
    }

    // Initialize simulation with smoother physics
    if (!simulationRef.current) {
      simulationRef.current = d3.forceSimulation<StarData>(stars)
        // Reduced repulsion for a tighter galaxy
        .force("charge", d3.forceManyBody().strength(-20)) 
        // Gentle center pull
        .force("center", d3.forceCenter(width / 2, height / 2).strength(0.02))
        // Softer collision
        .force("collide", d3.forceCollide().radius((d) => 25 + (d.aiResponse.brightness * 10)).strength(0.8))
        // Very gentle drift
        .force("x", d3.forceX(width / 2).strength(0.005))
        .force("y", d3.forceY(height / 2).strength(0.005))
        // Add velocity decay to simulate fluid resistance
        .velocityDecay(0.2); 
    }

    const simulation = simulationRef.current;
    simulation.nodes(stars);
    simulation.alpha(0.3).restart(); // Lower alpha restart for smoother "settling"

    const render = () => {
      // --- Render Stars ---
      const nodes = nodeGroup.selectAll<SVGGElement, StarData>(".star-node")
        .data(stars, (d) => d.id);

      const enter = nodes.enter()
        .append("g")
        .attr("class", "star-node")
        .style("cursor", "pointer")
        .on("click", (event, d) => {
          event.stopPropagation();
          onStarClick(d);
        })
        .on("mouseenter", (event, d) => {
          setHoveredStar(d);
          setTooltipPos({ x: event.clientX, y: event.clientY });
          
          // Draw Constellation Lines to same category
          const relatedStars = stars.filter(s => s.id !== d.id && s.aiResponse.category === d.aiResponse.category);
          
          const links = relatedStars.map(target => ({
            source: d,
            target: target
          }));

          const lines = linkGroup.selectAll("line")
            .data(links);
          
          lines.enter()
            .append("line")
            .attr("stroke", d.aiResponse.sentimentColor)
            .attr("stroke-width", 1)
            .attr("opacity", 0)
            .attr("x1", (l) => l.source.x || 0)
            .attr("y1", (l) => l.source.y || 0)
            .attr("x2", (l) => l.source.x || 0) // Start from source for animation
            .attr("y2", (l) => l.source.y || 0)
            .transition().duration(400)
            .attr("opacity", 0.3)
            .attr("x2", (l) => l.target.x || 0)
            .attr("y2", (l) => l.target.y || 0);

          // Highlight effect
          d3.select(event.currentTarget).transition().duration(300).attr("transform", `translate(${d.x}, ${d.y}) scale(1.2)`);
        })
        .on("mousemove", (event) => {
           setTooltipPos({ x: event.clientX, y: event.clientY });
        })
        .on("mouseleave", (event, d) => {
          setHoveredStar(null);
          // Remove lines
          linkGroup.selectAll("line").transition().duration(300).attr("opacity", 0).remove();
          // Remove highlight
          d3.select(event.currentTarget).transition().duration(300).attr("transform", `translate(${d.x}, ${d.y}) scale(1)`);
        })
        .call(d3.drag<SVGGElement, StarData>()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

      // Star Glow
      enter.append("circle")
        .attr("r", 0)
        .attr("class", "glow")
        .attr("fill", (d) => d.aiResponse.sentimentColor)
        .attr("opacity", 0.15)
        .transition().duration(1500).ease(d3.easeElasticOut)
        .attr("r", (d) => 20 + (d.aiResponse.brightness * 25));

      // Star Core
      enter.append("circle")
        .attr("r", 0)
        .attr("class", "core")
        .attr("fill", (d) => d.aiResponse.sentimentColor)
        .attr("opacity", 0.9)
        .style("filter", "blur(1px)")
        .transition().duration(1500).ease(d3.easeElasticOut)
        .attr("r", (d) => 5 + (d.aiResponse.brightness * 8));

      // Add Twinkle Animation
      enter.select(".core")
        .append("animate")
        .attr("attributeName", "opacity")
        .attr("values", "0.9;0.4;0.9")
        .attr("dur", () => `${1.5 + Math.random() * 3}s`)
        .attr("repeatCount", "indefinite");

      // Update positions
      nodes.merge(enter)
        .attr("transform", (d) => `translate(${d.x || width/2}, ${d.y || height/2})`);

      nodes.exit().remove();
    };

    simulation.on("tick", render);

    function dragstarted(event: any, d: StarData) {
      if (!event.active) simulation?.alphaTarget(0.1).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: StarData) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: StarData) {
      if (!event.active) simulation?.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [stars, onStarClick]);

  return (
    <>
      <svg 
        ref={svgRef} 
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ zIndex: 0 }}
      />
      
      {/* Tooltip */}
      {hoveredStar && (
        <div 
          className="fixed pointer-events-none z-50 px-4 py-2 rounded-xl glass-panel text-white text-sm backdrop-blur-md border-l-4 transition-opacity duration-200"
          style={{ 
            left: tooltipPos.x + 20, 
            top: tooltipPos.y - 20,
            borderColor: hoveredStar.aiResponse.sentimentColor,
            opacity: 1
          }}
        >
          <div className="font-bold text-xs uppercase tracking-widest opacity-70 mb-1">
            {hoveredStar.aiResponse.category}
          </div>
          <div className="font-serif italic">
            "{hoveredStar.originalText.length > 30 ? hoveredStar.originalText.substring(0, 30) + '...' : hoveredStar.originalText}"
          </div>
        </div>
      )}
    </>
  );
};

export default GalaxyCanvas;