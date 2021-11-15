# Chime

A Decentralized Peer-to-Peer Social Communications Network

Chime is a distributed network that allows for direct communication with peers. Users can login using a web3 compatible wallet and Chime will fetch the appropriate encrypted messaging private key (MPK) from the Ethereum blockchain. The MPK will be decrypted and allow for the user to access the application while their wallet is connected. Messages are encrypted (using a variation of the signal protocol’s double ratcheting algorithm), sharded, and then they are accessible from OrbitDB nodes that have pinned the data. When the user disconnects their wallet, the application will clear the MPK that was gathered locally during runtime, keeping your messages safe.