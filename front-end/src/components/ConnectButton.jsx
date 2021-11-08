

export const ConnectButton = ({ connect, disconnect, ownerAddress }) => {
  const isConnected = ownerAddress !== "";
  return (
    <div>
      {isConnected ? (
        <button className="self-profile" onClick={() => disconnect()}>
          <img src="https://placedog.net/200/200" alt="Me" />
          <p>{ownerAddress}</p>
        </button>
      ) : (
        <button className="self-profile" onClick={() => connect()}>
          <p>Connect</p>
        </button>
      )}
    </div>
  );
};
