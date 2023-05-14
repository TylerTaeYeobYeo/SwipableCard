import { FC, useCallback, useEffect, useRef, useState } from "react";
import "./swipable.css";

export type SwipableProps = {
  backgroundColors: string[];
  children?: React.ReactNode | React.ReactNode[];
  defaultIndex?: number;
  width?: number;
  height?: number;
}

export const Swipable: FC<SwipableProps> = (props) => {
  const [colorIndex, setColorIndex] = useState<number>(0);
  const animationInterval = useRef<number | undefined>();
  let ref: HTMLElement | null = null;

  const flipCard = useCallback((card: HTMLElement, direction: 1 | -1 = 1, callback?: () => void) => {
    card.style.setProperty("transition", "all 0.2s ease-in-out");
    card.style.setProperty("transform", `translate3d(${direction * card.clientWidth}px, 0px, 0px)`);
    card.style.setProperty("opacity", "0.0");
    card.style.setProperty("cursor", "grab");
    setTimeout(() => {
      card.removeAttribute("dragging");
      card.style.setProperty("transform", "translate3d(0px, 0px, 0px)");
      card.style.setProperty("opacity", "1.0");
      card.style.setProperty("transition", "none");
      card.style.setProperty("cursor", "grab");
      setColorIndex(v => (v + 1) % props.backgroundColors.length);
      callback?.();
    }, 200);
  }, [props.backgroundColors.length])
  const cancelInterval = () => {
    if (animationInterval.current) clearInterval(animationInterval.current);
  };
  const reserveAnimation = useCallback(() => {
    if (animationInterval.current) clearInterval(animationInterval.current);
    animationInterval.current = setInterval(() => {
      if (ref) {
        flipCard(ref);
      } else {
        cancelInterval();
        throw "No active card found!";
      }
    }, 3000);
  }, [flipCard, ref]);

  const colorize = (index: number) => props.backgroundColors[(index) % props.backgroundColors.length];
  const color = colorize(colorIndex);
  const nextColor = colorize(colorIndex + 1);

  let touchStartX: number | undefined = undefined;
  let moved = false;
  let target: HTMLElement | undefined = undefined;
  const handleTouchStart = (e: any /*React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement> */) => {
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
  const handleTouchMove = (e: any /*React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement> */) => {
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
  const handleTouchEnd = (e: any /*React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement> */) => {
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
        reserveAnimation();
      } else {
        const direction = deltaX > 0 ? 1 : -1;
        const callback = () => {
          moved = false;
          reserveAnimation();
        };
        if (target) {
          flipCard(target, direction, callback);
        }
        else {
          callback();
        }
      }
    } else if (target === e.target){
      alert(`CLICK: ${color}`);
    }
    touchStartX = undefined;
    target = undefined;
    document.removeEventListener("mousemove", handleTouchMove);
    document.removeEventListener("mouseup", handleTouchEnd);
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    reserveAnimation();
    return () => cancelInterval();
  }, [reserveAnimation]);

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
      ref={el => {
        if (el) ref = el;
      }}
      className="ty_card ty_card--active"
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