import { shortenIfAddress, useEthers } from "@usedapp/core";
import {Button} from "@mui/material";

export const ConnectButton = () => {
    const {account, activateBrowserWallet, deactivate} = useEthers();

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
                    color="primary" variant="contained"
                    onClick={() => deactivate()}>
                    <p>Connected: {formatAddress()}</p>
                </Button>
                :
                <Button
                    color="primary" variant="contained"
                    onClick={() => activateBrowserWallet()}>
                    Connect
                </Button>
            }
        </div>
    )
}