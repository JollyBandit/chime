task("read-random-chime", "Reads the random number returned to a contract by Chainlink VRF")
    .addParam("contract", "The address of the Chime contract that you want to read")
    .setAction(async taskArgs => {

        const contractAddr = taskArgs.contract
        const networkId = network.name
        console.log("Reading data from Chime contract ", contractAddr, " on network ", networkId)
        const ChimeToken = await ethers.getContractFactory("ChimeToken")

        //Get signer information
        const accounts = await hre.ethers.getSigners()
        const signer = accounts[0]

        //Create connection to API Consumer Contract and call the createRequestTo function
        const chimeToken = new ethers.Contract(contractAddr, ChimeToken.interface, signer)
        let result = BigInt(await chimeToken.randomResult()).toString()
        console.log('Random Number is: ', result)
        if (result == 0 && ['hardhat', 'localhost', 'ganache'].indexOf(network.name) == 0) {
            console.log("You'll either need to wait another minute, or fix something!")
        }
        if (['hardhat', 'localhost', 'ganache'].indexOf(network.name) >= 0) {
            console.log("You'll have to manually update the value since you're on a local chain!")
        }
    })

module.exports = {}
