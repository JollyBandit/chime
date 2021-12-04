import { useState, useCallback, useEffect } from "react";

const ContextMenu = (props) => {
  const [anchorPoint, setAnchorPoint] = useState(props.anchorPoint);
  const display = anchorPoint.x !== 0 && anchorPoint.y !== 0;

  const handleClick = useCallback(() => setAnchorPoint({ x: 0, y: 0 }), []);

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  });

  useEffect(() => {
      setAnchorPoint(props.anchorPoint);
  }, [props.anchorPoint])

  const style = () => {
    return {
      left: anchorPoint.x,
      top: anchorPoint.y,
    };
  };

  if (display) {
    return (
      <ul
        style={style()}
        id="context-menu"
        className="show-context-menu"
        onClick={(e) => e.stopPropagation()}
      >
      {props.options.map((option) => {
          let optionName;
          for(let i = 0; i < Object.keys(props).length; i++){
              if((Object.keys(props)[i] !== "options" || Object.keys(props)[i] !== "anchorPoint") && Object.keys(props)[i] === option){
                  optionName = Object.keys(props)[i];
              }
          }
          return (
            <li key={optionName}>
              <button
                key={optionName}
                onClick={(e) => {
                  e.stopPropagation();
                  //This is not a error, silly typescript
                  props.[optionName]();
                  setAnchorPoint({ x: 0, y: 0 });
                }}
              >
                {option}
              </button>
            </li>
          );
      })}
      </ul>
    );
  }

  return <></>;
};

export default ContextMenu;
