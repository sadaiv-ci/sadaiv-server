const express = require("express");
const port = process.env.PORT || 4000;

const { ethers } = require("ethers")
const ABI = require('./data/abi.json')
const { SMART_CONTRACT_ADDRESS } = require('./config')

const app = express();

app.listen(port, function () {
  console.log("Listening to requests for port ", port);
});

app.post("/sendTransaction", async (req, res) => {
  const { repositoryOwner, repositoryName, branchName, developer, commitMessage, cid } = req.query

  const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_APP_PROVIDER_URL ?? '');
  const wallet = new ethers.Wallet(process.env.NEXT_APP_WALLET_PRIVATE_KEY ?? '', provider)
  const contract = new ethers.Contract(SMART_CONTRACT_ADDRESS, ABI.abi, wallet)
  try {
    const transaction = await contract.createBuild(repositoryOwner, repositoryName, branchName, developer, commitMessage, cid);
    const transactionReceipt = await transaction.wait();
    if (transactionReceipt.status !== 1) {
      res.status(500).json({ message: "Unable to do the transaction" });
      return;
    }
  } catch (e) {
    res.status(500).json({ message: `Error: ${e}` })
    return;
  }

  res.status(200).json({ message: "Contract method called successfully." })
})
