import { ethers } from "ethers";
import { filecoin, filecoinCalibration } from "wagmi/chains";
import { filecoinMainnetContractAddress, filecoinTestnetContractAddress } from "../utils/definitions/consts";
import PowerVoting from "@Contracts/PowerVoting.sol/PowerVoting.json";
let contractAddress = filecoinTestnetContractAddress;


if (!contractAddress) {
  throw new Error(
    "Please set VOTING_CONTRACT_ADDRESS in a .env file"
  )
}

export const useStaictContract = (isMainNet: boolean) => {
  let link: any = filecoinCalibration.rpcUrls.default.http[0];

  if (isMainNet) {
    link = filecoin.rpcUrls.default.http[0];
    contractAddress = filecoinMainnetContractAddress;
  }

  const provider = new ethers.providers.JsonRpcProvider(link);
  // 创建合约实例
  const contract = new ethers.Contract(contractAddress, PowerVoting.abi, provider);

  // 封装获取投票列表方法
  const getVotingList = async (pageIndex: number, pageSize: number, net: number) => {
    const data = await contract.proposalList(pageIndex, pageSize, net);
    return data;
  }

  // 导出模块方法
  return {
    getVotingList,
  }
}

export const useDynamicContract = (isConnect?:boolean, isMainNet?: boolean) => {
  if(!isConnect){
    return {};
  }
  if (isMainNet) {
    contractAddress = filecoinMainnetContractAddress;
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  // 创建合约实例
  const contract = new ethers.Contract(contractAddress, PowerVoting.abi, signer);

  // 封装创建投票方法
  const createVotingApi = async (proposalCid: string, optionIds: any[] , timestamp: string, net: number) => {
    const data = await contract.createProposal(proposalCid, optionIds, timestamp, net)
    return data
  }

  // 获取投票方法
  const getVoteApi = async (proposalCid: string) => {
    const data = await contract.getProposal(proposalCid)
    return data
  }

  // 投票
  const voteApi = async (cid: string, voteInfoList: string[][]) => {
    return await contract.vote(cid, voteInfoList)
  }

  return {
    createVotingApi,
    getVoteApi,
    voteApi,
  }
}