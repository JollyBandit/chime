import StreamrClient from "streamr-client";

const axios = require('axios').default;

const { ethereum } = window;

export const streamr = new StreamrClient({
  auth: {ethereum},
  publishWithSignature: "never",
})

export default async function getMessageStream(){
    //Get the address of the connected wallet
    const address = await streamr.getAddress();
    //Create a new message stream or select one that exists
    const stream = await streamr.getOrCreateStream({
      id: address.toLowerCase() + "/chime-messages",
      name: "Chime Messages",
      description: "The messages that you have sent using Chime",
      config: {
        fields: [
          {
            sender: "string",
            message: "string",
            date: "number",
          },
        ],
      },
      partitions: 1,
      requireSignedData: false,
      requireEncryptedData: false,
      autoConfigure: true,
      storageDays: 1,
      inactivityThresholdHours: 48,
    });
    return stream;
  };

  export const getStreamCreation = async () => {
    const stream = await getMessageStream();
    //Return time since epoch (milliseconds)
    return new Date(stream.dateCreated).getTime()
  }

  export const getStreamLast = async () => {
    const stream = await getMessageStream();
    const lastMessage = await streamr.getStreamLast(stream.id);
    return lastMessage[0].content;
  }

  export const getStreamData = async () => {
    const stream = await getMessageStream();
    const result = await axios.request({
      "method": "get",
      "url": "https://streamr.network/api/v1/streams/" + encodeURIComponent(stream.id) + "/data/partitions/0/from",
      "headers": {
        "Content-Type": "application/json",
        "authorization": "Bearer ZbZI0GhKxE7Z3U1lZ5a6YhoI2MKb23SHBm35n4T7eyI5qs1BfX6Oe7YU07lSyGNr"
      },
      "params": {
        "fromTimestamp": await getStreamCreation()
      }
    })
    return result.data;
  }