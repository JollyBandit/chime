import { shortenIfAddress, useEthers } from "@usedapp/core";
import {Button} from "@mui/material";

export const ConnectButton = () => {
    const {account, activateBrowserWallet} = useEthers();

    const formatAddress = () => {
        return shortenIfAddress(account);
    }

    //Figure out if we are connected
    //If not connected. show a connect button
    //Otherwise just show address

    const isConnected = account !== undefined;
    return(
        <div>
            {isConnected ?
                <Button
                    color="primary" variant="contained" className="connect_button">
                    <p>Connected: {formatAddress()}</p>
                </Button>
                :
                <Button
                    color="primary" variant="contained" className="connect_button"
                    onClick={() => activateBrowserWallet()}>
                    Connect
                </Button>
            }
        </div>
    )
}