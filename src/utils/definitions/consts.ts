import { Chain } from "wagmi";

export const filecoinMainnetContractAddress = '0xA67927b02b6Cf7800107D6603e4c7784c97a594B';
export const filecoinTestnetContractAddress = '0x6847f31A260EF0fd66285e7Bc8187B6e6C96A2D2';

export const walletConnectProjectId = '43a5e091da6b7d42e521c6cce175bc94';

export const ALL_STATUS = 0
export const IN_PROGRESS_STATUS = 1
export const VOTE_COUNTING_STATUS = 2
export const COMPLETED_STATUS = 3

export const SINGLE_VOTE = 1
export const MULTI_VOTE = 2

export const pollTypes = [
  {
    label: 'Single Answer',
    value: SINGLE_VOTE
  },
  {
    label: 'Multiple Answers',
    value: MULTI_VOTE
  }
]
