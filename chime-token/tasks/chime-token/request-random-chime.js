task("request-random-chime", "Requests a random number for Chime")
    .addParam("contract", "The address of the API Consumer contract that you want to call")
    .setAction(async taskArgs => {

        const contractAddr = taskArgs.contract
        const networkId = network.name
        console.log("Requesting a random number using VRF consumer contract ", contractAddr, " on network ", networkId)
        const ChimeToken = await ethers.getContractFactory("ChimeToken")

        //Get signer information
        const accounts = await hre.ethers.getSigners()
        const signer = accounts[0]

        //Create connection to VRF Contract and call the getRandomNumber function
        const chimeToken = new ethers.Contract(contractAddr, ChimeToken.interface, signer)
        var result = await chimeToken.getRandomNumber()
        console.log('Contract ', contractAddr, ' random number request successfully called. Transaction Hash: ', result.hash)
        console.log("Run the following to read the returned random number:")
        console.log("npx hardhat read-random-chime --contract " + contractAddr + " --network " + network.name)
    })

module.exports = {}
