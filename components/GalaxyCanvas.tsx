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

    // Set explicit dimensions and viewBox for mobile compatibility
    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "100%");

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

    // Initialize simulation with floating physics
    // Adjust parameters for mobile screens
    const isMobile = width < 768;
    const collideRadius = isMobile ? 20 : 30;

    // Boundary padding to keep stars on screen
    const padding = isMobile ? 80 : 120;

    // Initialize star positions randomly across the screen if not set
    stars.forEach(star => {
      if (star.x === undefined) star.x = padding + Math.random() * (width - padding * 2);
      if (star.y === undefined) star.y = padding + Math.random() * (height - padding * 2);
    });

    if (!simulationRef.current) {
      simulationRef.current = d3.forceSimulation<StarData>(stars)
        // Very light repulsion to prevent overlap
        .force("charge", d3.forceManyBody().strength(-10))
        // No center force - let stars float freely
        // Only collision detection to prevent overlap
        .force("collide", d3.forceCollide().radius((d) => collideRadius + (d.aiResponse.brightness * 5)).strength(0.3))
        // Soft boundary force to keep stars on screen
        .force("boundary", () => {
          stars.forEach(star => {
            if (star.x !== undefined && star.y !== undefined) {
              if (star.x < padding) star.vx = (star.vx || 0) + 0.5;
              if (star.x > width - padding) star.vx = (star.vx || 0) - 0.5;
              if (star.y < padding) star.vy = (star.vy || 0) + 0.5;
              if (star.y > height - padding) star.vy = (star.vy || 0) - 0.5;
            }
          });
        })
        // Low velocity decay for smooth floating
        .velocityDecay(0.02);
    }

    const simulation = simulationRef.current;
    simulation.nodes(stars);
    // Keep simulation running continuously with low alpha
    simulation.alpha(0.3).alphaDecay(0.005).alphaMin(0.1).restart();

    // Add very gentle floating motion - slow and dreamy
    const orbitInterval = setInterval(() => {
      stars.forEach((star, i) => {
        if (!star.fx && !star.fy) {
          const time = Date.now() * 0.0001; // Much slower time
          const uniqueOffset = i * 2.3; // Unique phase for each star
          // Very gentle drift
          const driftX = Math.sin(time + uniqueOffset) * 0.15;
          const driftY = Math.cos(time * 0.8 + uniqueOffset) * 0.15;
          star.vx = (star.vx || 0) * 0.98 + driftX;
          star.vy = (star.vy || 0) * 0.98 + driftY;
        }
      });
      simulation.alpha(0.05).restart();
    }, 100); 

    const render = () => {
      // --- Render Stars ---
      const nodes = nodeGroup.selectAll<SVGGElement, StarData>(".star-node")
        .data(stars, (d) => d.id);

      const enter = nodes.enter()
        .append("g")
        .attr("class", "star-node")
        .style("cursor", "pointer")
        .on("click touchend", (event, d) => {
          event.stopPropagation();
          event.preventDefault();
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
            .transition().duration(500).ease(d3.easeCubicOut)
            .attr("opacity", 0.4)
            .attr("x2", (l) => l.target.x || 0)
            .attr("y2", (l) => l.target.y || 0);

          // Highlight effect
          d3.select(event.currentTarget).transition().duration(400).ease(d3.easeBackOut).attr("transform", `translate(${d.x}, ${d.y}) scale(1.3)`);
        })
        .on("mousemove", (event) => {
           setTooltipPos({ x: event.clientX, y: event.clientY });
        })
        .on("mouseleave", (event, d) => {
          setHoveredStar(null);
          // Remove lines
          linkGroup.selectAll("line").transition().duration(300).attr("opacity", 0).remove();
          // Remove highlight
          d3.select(event.currentTarget).transition().duration(300).ease(d3.easeCubicOut).attr("transform", `translate(${d.x}, ${d.y}) scale(1)`);
        })
        .call(d3.drag<SVGGElement, StarData>()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

      // Size multiplier for mobile
      const sizeMult = isMobile ? 0.5 : 1;

      // Outer Glow (pulsing)
      enter.append("circle")
        .attr("r", 0)
        .attr("class", "outer-glow")
        .attr("fill", (d) => d.aiResponse.sentimentColor)
        .attr("opacity", 0.08)
        .transition().duration(1500).ease(d3.easeElasticOut)
        .attr("r", (d) => (35 + (d.aiResponse.brightness * 35)) * sizeMult);

      // Add pulse animation to outer glow
      enter.select(".outer-glow")
        .append("animate")
        .attr("attributeName", "r")
        .attr("values", (d: StarData) => {
          const base = (35 + (d.aiResponse.brightness * 35)) * sizeMult;
          return `${base};${base * 1.3};${base}`;
        })
        .attr("dur", () => `${3 + Math.random() * 2}s`)
        .attr("repeatCount", "indefinite");

      // Star Glow
      enter.append("circle")
        .attr("r", 0)
        .attr("class", "glow")
        .attr("fill", (d) => d.aiResponse.sentimentColor)
        .attr("opacity", 0.2)
        .transition().duration(2000).ease(d3.easeElasticOut)
        .attr("r", (d) => (20 + (d.aiResponse.brightness * 25)) * sizeMult);

      // Add breathing animation to glow
      enter.select(".glow")
        .append("animate")
        .attr("attributeName", "opacity")
        .attr("values", "0.2;0.35;0.2")
        .attr("dur", () => `${2 + Math.random() * 3}s`)
        .attr("repeatCount", "indefinite");

      // Star Core
      enter.append("circle")
        .attr("r", 0)
        .attr("class", "core")
        .attr("fill", (d) => d.aiResponse.sentimentColor)
        .attr("opacity", 0.95)
        .style("filter", "blur(1px)")
        .transition().duration(2000).ease(d3.easeElasticOut)
        .attr("r", (d) => (6 + (d.aiResponse.brightness * 10)) * sizeMult);

      // Add Twinkle Animation to core
      enter.select(".core")
        .append("animate")
        .attr("attributeName", "opacity")
        .attr("values", "0.95;0.6;0.95")
        .attr("dur", () => `${1.5 + Math.random() * 2}s`)
        .attr("repeatCount", "indefinite");

      // Inner bright spot
      enter.append("circle")
        .attr("r", 0)
        .attr("class", "inner")
        .attr("fill", "#ffffff")
        .attr("opacity", 0.8)
        .transition().duration(2000).ease(d3.easeElasticOut)
        .attr("r", (d) => (2 + (d.aiResponse.brightness * 3)) * sizeMult);

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
      clearInterval(orbitInterval);
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
          className="fixed pointer-events-none z-50 px-4 py-2 rounded-xl glass-panel text-white text-sm backdrop-blur-md border-l-4 transition-all duration-300"
          style={{ 
            left: tooltipPos.x + 20, 
            top: tooltipPos.y - 20,
            borderColor: hoveredStar.aiResponse.sentimentColor,
            opacity: 1,
            transform: 'translateY(0)'
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