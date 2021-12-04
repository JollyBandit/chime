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

  const optionIcons = new Map();
  optionIcons.set("select", "➢");
  optionIcons.set("send", "🡽");
  optionIcons.set("copy", "❐");
  optionIcons.set("delete", "X");

  if (display) {
    return (
      <ul
        style={style()}
        id="context-menu"
        className="show-context-menu"
        onClick={(e) => e.stopPropagation()}
      >
      {props.options.map((optionName) => {
          let option;
          for(let i = 0; i < Object.keys(props).length; i++){
              if((Object.keys(props)[i] !== "options" || Object.keys(props)[i] !== "anchorPoint") && Object.keys(props)[i] === optionName){
                  option = Object.keys(props)[i];
              }
          }
          return (
            <li key={option}>
              <button
                key={option}
                onClick={(e) => {
                  e.stopPropagation();
                  //This is not a error, silly typescript
                  props.[option]();
                  setAnchorPoint({ x: 0, y: 0 });
                }}
              >
                <p id="context-icon">{optionIcons.get(optionName)}</p>
                <p>{optionName}</p>
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
