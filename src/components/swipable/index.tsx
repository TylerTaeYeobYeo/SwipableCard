import { FC, useCallback, useEffect, useState } from "react";
import "./swipable.css";

export type SwipableProps = {
  backgroundColors: string[];
  children?: React.ReactNode | React.ReactNode[];
  width?: number;
  height?: number;
}
let animationInterval: number | undefined;

export const Swipable: FC<SwipableProps> = (props) => {
  const [colorIndex, setColorIndex] = useState<number>(0);

  const cancelInterval = () => {
    if (animationInterval) clearInterval(animationInterval);
  };
  const reserveAnimation = useCallback((index: number) => {
    if (animationInterval) clearInterval(animationInterval);
    animationInterval = setInterval(() => {
      setColorIndex((index) % props.backgroundColors.length);
    }, 3000);
  }, [props.backgroundColors.length]);

  const colorize = (index: number) => props.backgroundColors[(index) % props.backgroundColors.length];
  const color = colorize(colorIndex);
  const nextColor = colorize(colorIndex + 1);

  let touchStartX: number | undefined = undefined;
  let moved = false;
  let target: HTMLElement | undefined = undefined;
  const handleTouchStart = (e) => {
    if (moved) return;
    cancelInterval();
    touchStartX = e.pageX ?? e.touches[0].pageX;
    target = e.target;
    target?.setAttribute("dragging", "true");
    if (e.pageX) {
      document.addEventListener("mousemove", handleTouchMove);
      document.addEventListener("mouseup", handleTouchEnd);
    }
  };
  const handleTouchMove = (e) => {
    if (touchStartX === undefined) return;
    moved = true;
    const newX = e.pageX ?? e.touches[0].pageX;
    const deltaX = newX - (touchStartX ?? 0);
    if (target) {
      target.style.transform = `translate3d(${deltaX}px, 0px, 0px)`;
      target.style.opacity = `${1 - Math.abs(deltaX) / target.clientWidth}`;
      target.style.transition = "none";
      target.style.cursor = "grabbing";
    }
  };
  const handleTouchEnd = (e) => {
    if (moved) {
      const endX = e.pageX ?? e.changedTouches[0].pageX;
      const deltaX = endX - (touchStartX ?? 0);
      const width50 = (e.target.clientWidth) / 2;

      if (Math.abs(deltaX) < width50) {
        target?.style.setProperty("transform", "translate3d(0px, 0px, 0px)");
        target?.style.setProperty("transition", "transform 0.2s ease-in-out");
        target?.style.setProperty("opacity", "1.0");
        target?.style.setProperty("cursor", "grab");
        moved = false;
        reserveAnimation(colorIndex + 1);
      } else {
        const direction = deltaX > 0 ? 1 : -1;
        target?.style.setProperty("transition", "all 0.2s ease-in-out");
        target?.style.setProperty("transform", `translate3d(${direction * e.target.clientWidth}px, 0px, 0px)`);
        target?.style.setProperty("opacity", "0.0");
        target?.style.setProperty("cursor", "grab");
        setTimeout(() => {
          target = document.querySelector(".ty_card[dragging=true]") as HTMLElement;
          target?.removeAttribute("dragging");
          target?.style.setProperty("transform", "translate3d(0px, 0px, 0px)");
          target?.style.setProperty("opacity", "1.0");
          target?.style.setProperty("transition", "none");
          target?.style.setProperty("cursor", "grab");
          moved = false;
          setColorIndex((colorIndex + 1) % props.backgroundColors.length);
          reserveAnimation(colorIndex + 1);
        }, 200);
      }
    } else if (target === e.target){
      alert(`CLICK: ${color}`);
    }
    touchStartX = undefined;
    target = undefined;
    document.removeEventListener("mousemove", handleTouchMove);
    document.removeEventListener("mouseup", handleTouchEnd);
  };
  const handleMouseLeave = () => {
    touchStartX = undefined;
    moved = false;
    target = document.querySelector(".ty_card[dragging=true]") as HTMLElement;
    target?.removeAttribute("dragging");
    target?.style.setProperty("transform", "translate3d(0px, 0px, 0px)");
    target?.style.setProperty("opacity", "1.0");
    target?.style.setProperty("transition", "none");
  };
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    reserveAnimation(colorIndex + 1);
    return () => cancelInterval();
  }, [colorIndex, props.backgroundColors]);

  return <section style={{
    position: "relative",
    width: props.width ?? 300,
    height: props.height ?? 200,
  }}>
    <div
      className="ty_card"
      style={{
        position: "absolute",
        background: nextColor,
      }}
      color={color}
    >
      {nextColor}
    </div>
    <div
      className="ty_card"
      style={{
        transform: "translate3d(0px, 0px, 0px)",
        background: color,
        width: props.width ?? 300,
      }}
      color={color}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
    >
      {color}
    </div>
  </section>;
};

export default Swipable;