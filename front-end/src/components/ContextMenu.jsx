const ContextMenu = (props) => {
  const display = props.anchorPoint.x !== 0 && props.anchorPoint.y !== 0;

  const style = () => {
    return {
      left: props.anchorPoint.x,
      top: props.anchorPoint.y,
    };
  };

  if (display) {
    return (
      <ul style={style()} id="context-menu" className="show-context-menu" onClick={(e) => e.stopPropagation()}>
        <li>
          <button
            onClick={(e) => {
                e.stopPropagation();
                props.select();
            }}
          >
            Select
          </button>
        </li>
        <li>
          <button
            onClick={(e) => {
                e.stopPropagation();
                props.send();
            }}
          >
            Send Crypto
          </button>
        </li>
        <li>
          <button
            onClick={(e) => {
                e.stopPropagation();
                props.delete();
            }}
          >
            Delete
          </button>
        </li>
      </ul>
    );
  }

  return <></>;
};

export default ContextMenu;
