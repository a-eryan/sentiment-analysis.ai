import { useRef, useEffect } from 'react';

const Squares = ({
  direction = 'right',
  speed = 1,
  borderColor = '#999',
  cellWidth = 80,
  cellHeight = 40,
  hoverFillColor = '#222'
}) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const numCellsX = useRef(0);
  const numCellsY = useRef(0);
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredCellRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      numCellsX.current = Math.ceil(canvas.width / cellWidth) + 1;
      numCellsY.current = Math.ceil(canvas.height / cellHeight) + 1;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const startX = Math.floor(gridOffset.current.x / cellWidth) * cellWidth;
      const startY = Math.floor(gridOffset.current.y / cellHeight) * cellHeight;

      for (let x = startX; x < canvas.width + cellWidth; x += cellWidth) {
        for (let y = startY; y < canvas.height + cellHeight; y += cellHeight) {
          const cellX = x - (gridOffset.current.x % cellWidth);
          const cellY = y - (gridOffset.current.y % cellHeight);

          if (
            hoveredCellRef.current &&
            Math.floor((x - startX) / cellWidth) === hoveredCellRef.current.x &&
            Math.floor((y - startY) / cellHeight) === hoveredCellRef.current.y
          ) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(cellX, cellY, cellWidth, cellHeight);
          }

          ctx.strokeStyle = borderColor;
          ctx.strokeRect(cellX, cellY, cellWidth, cellHeight);
        }
      }
    };

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1);
      switch (direction) {
        case 'right':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + cellWidth) % cellWidth;
          break;
        case 'left':
          gridOffset.current.x = (gridOffset.current.x + effectiveSpeed + cellWidth) % cellWidth;
          break;
        case 'up':
          gridOffset.current.y = (gridOffset.current.y + effectiveSpeed + cellHeight) % cellHeight;
          break;
        case 'down':
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + cellHeight) % cellHeight;
          break;
        case 'diagonal':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + cellWidth) % cellWidth;
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + cellHeight) % cellHeight;
          break;
        default:
          break;
      }

      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = event => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const startX = Math.floor(gridOffset.current.x / cellWidth) * cellWidth;
      const startY = Math.floor(gridOffset.current.y / cellHeight) * cellHeight;

      const hoveredCellX = Math.floor((mouseX + gridOffset.current.x - startX) / cellWidth);
      const hoveredCellY = Math.floor((mouseY + gridOffset.current.y - startY) / cellHeight);

      if (
        !hoveredCellRef.current ||
        hoveredCellRef.current.x !== hoveredCellX ||
        hoveredCellRef.current.y !== hoveredCellY
      ) {
        hoveredCellRef.current = { x: hoveredCellX, y: hoveredCellY };
      }
    };

    const handleMouseLeave = () => {
      hoveredCellRef.current = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [direction, speed, borderColor, hoverFillColor, cellWidth, cellHeight]);

  return <canvas ref={canvasRef} className="w-full h-full border-none block"></canvas>;
};

export default Squares;
