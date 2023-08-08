import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useDynamicContract } from "../../hooks";
import axios from 'axios';
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import EllipsisMiddle from "../../components/EllipsisMiddle";
import MDEditor from '../../components/MDEditor';
import {COMPLETED_STATUS, IN_PROGRESS_STATUS, VOTE_COUNTING_STATUS} from "../../utils/definitions/consts";


const VotingResults = () => {
  const { isConnected } = useAccount();
  const { id } = useParams();
  const { state } = useLocation() || null;
  const [votingData, setVotingDate] = useState(state);
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    initState()
  }, [])

  async function initState() {
    if (isConnected) {
      if (!votingData) {
        const { getVoteApi } = useDynamicContract(isConnected);
        // @ts-ignore
        const voteData = await getVoteApi(id);
        const res = await axios.get(`https://${id}.ipfs.nftstorage.link/`);
        const now = new Date().getTime();
        let voteStatus = null;
        if (now <= res.data.string.Time) {
          voteStatus = IN_PROGRESS_STATUS;
        } else if (voteData.isCounted) {
          voteStatus = COMPLETED_STATUS;
        } else {
          voteStatus = VOTE_COUNTING_STATUS;
        }
        const option = res.data.string.option?.map((item: string, index: number) => {
          const bigNumberCount = voteData.voteResults[index]?.votes;
          const count = bigNumberCount ? bigNumberCount.toNumber() / 100 : 0;
          return {
            name: item,
            count
          }
        })
        setVotingDate({
          ...res.data.string,
          option,
          cid: id,
          voteStatus
        })
      }
    } else {
      // @ts-ignore
      openConnectModal && openConnectModal();
    }
  }


  return (
    <div className='flex voting-result'>
      <div className='relative w-full pr-4 lg:w-8/12'>
        <div className='px-3 mb-6 md:px-0'>
          <button>
            <div className='inline-flex items-center gap-1 text-skin-text hover:text-skin-link'>
              <Link to='/' className='flex items-center'>
                <svg className='mr-1' viewBox="0 0 24 24" width="1.2em" height="1.2em"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m11 17l-5-5m0 0l5-5m-5 5h12"></path></svg>
                Back
              </Link>
            </div>
          </button>
        </div>
        <div className='px-3 md:px-0'>
          <h1 className='mb-6 text-3xl font-semibold text-white mbreak-words leading-12'>
            {votingData?.Name}
          </h1>
          <div className='flex justify-between mb-6'>
            <div className='flex items-center mb-1 sm:mb-0'>
              <button className='bg-[#6D28D9] h-[26px] px-[12px] text-white rounded-xl mr-4'>
                Completed
              </button>
              <div className='flex items-center justify-center'>
                <span>Created By</span>
                <div className='ml-2'>
                  { EllipsisMiddle({ suffixCount: 4, children: votingData?.Address }) }
                </div>
              </div>
            </div>
            <div className='flex items-center space-x-1 grow'>

            </div>
          </div>
          <div className='MDEditor'>
            <MDEditor
              className="border-none rounded-[16px] bg-transparent"
              style={{ height: 'auto' }}
              value={votingData?.Descriptions}
              moreButton
              readOnly={true}
              view={{ menu: false, md: false, html: true, both: false, fullScreen: true, hideMenu: false }}
              onChange={() => {}}
            />
          </div>
        </div>
      </div>
      <div className='w-full lg:w-4/12 lg:min-w-[321px]'>
        <div className='mt-4 space-y-4 lg:mt-0'>
          <div className='text-base border-solid border-y border-skin-border bg-skin-block-bg md:rounded-xl md:border'>
            <div className='group flex h-[57px] justify-between rounded-t-none border-b border-skin-border border-solid px-4 pb-[12px] pt-3 md:rounded-t-lg'>
              <h4 className='flex items-center text-xl'>
                <div>Message</div>
              </h4>
              <div className='flex items-center'>

              </div>
            </div>
            <div className='p-4 leading-6 sm:leading-8'>
              <div className='space-y-1'>
                <div>
                  <b>Vote Type</b>
                  <span className='float-right text-white'>{ ['Single', 'Multiple'][votingData?.VoteType - 1] } choice voting</span>
                </div>
                <div>
                  <b>Expiration Time</b>
                  <span className='float-right text-white'>{new Date(votingData?.Time).toLocaleString()}</span>
                </div>
                <div>
                  <b>Snapshot</b>
                  <span className="float-right text-white">Takes at Exp. Time</span>
                </div>
              </div>
            </div>
          </div>
          <div className='text-base border-solid border-y border-skin-border bg-skin-block-bg md:rounded-xl md:border'>
            <div className='group flex h-[57px] justify-between rounded-t-none border-b border-skin-border border-solid px-4 pb-[12px] pt-3 md:rounded-t-lg'>
              <h4 className='flex items-center text-xl'>
                <div>Vote</div>
              </h4>
              <div className='flex items-center'></div>
            </div>
            <div className='p-4 leading-6 sm:leading-8'>
              <div className='space-y-3'>
                {
                  votingData?.option?.map((item: any) => {
                    const total = votingData?.option.reduce(((acc: number, current: any) => acc + current.count), 0);
                    const percent = item.count ? ((item.count / total) * 100).toFixed(2) : 0;
                    return (
                      <div key={item.name}>
                        <div className='flex justify-between mb-1 text-skin-link'>
                          <div className='flex items-center overflow-hidden'>
                            <span className='mr-1 truncate'>{item.name}</span>
                          </div>
                          <div className='flex justify-end'>
                            <div className='space-x-2'>
                              <span className='whitespace-nowrap'>{item.count} tFIL Vote</span>
                              <span>{percent}%</span>
                            </div>
                          </div>
                        </div>
                        <div className='relative h-2 rounded bg-[#273141]'>
                          {
                            item.count ?
                              <div
                                className='absolute top-0 left-0 h-full rounded bg-[#384AFF]'
                                style={{
                                  width: `${percent}%`
                                }}
                              /> :
                              <div
                                className='absolute top-0 left-0 h-full rounded bg-[#273141]'
                                style={{
                                  width: '100%'
                                }}
                              />
                          }
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VotingResults
