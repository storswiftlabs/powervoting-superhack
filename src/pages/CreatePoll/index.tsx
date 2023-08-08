import React, { useState } from "react";
import { message } from "antd";
// @ts-ignore
import nftStorage from "../../utils/storeNFT.js";
import axios from 'axios';
import dayjs from "dayjs";
import { useDynamicContract } from "../../hooks";
import { useNavigate, Link } from "react-router-dom";
import Table from '../../components/Table';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { TrashIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { RadioGroup } from '@headlessui/react';
import { useAccount, useNetwork } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Editor from '../../components/MDEditor';
import { filecoin } from 'wagmi/chains';
import { pollTypes } from '../../utils/definitions/consts';

const CreatePoll = () => {
  const { chain } = useNetwork();
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [descriptions, setDescriptions] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  }: any = useForm({
    defaultValues: {
      VoteType: 1,
      option: [{ value: '' }]
    }
  })

  // ts-ignore
  const { fields, append, remove } = useFieldArray({
    name: 'option',
    control,
    rules: {
      required: true
    }
  })

  const navigate = useNavigate()

  const [loading, setLoading] = useState<boolean>(false);

  const validateName = (value: string) => {
    if (value.trim() === '') {
      return 'Proposal Title is required ';
    }
    return true;
  };

  const validateOptionName = (value: string) => {
    if (value.trim() === '') {
      return 'Option Name is required ';
    }
    return true;
  };

  const getCurrentDateTime = () => {
    return dayjs().format("YYYY-MM-DDTHH:mm");
  }

  const handleTimeChange = (event: any) => {
    event.preventDefault();
  }

  const onSubmit = async (values:any) => {
    if (values.option?.length <= 0) {
      message.error("Please confirm if you want to add a voting option")
    } else {
      setLoading(true)
      // 调取接口发送数据
      const timestamp = new Date(values.Time).getTime();
      const net = chain?.id === filecoin.id ? 1 : 2
      const _values = {
        ...values,
        Descriptions: descriptions,
        Time: timestamp,
        option: values.option.map((item: any) => item.value),
        Address: address,
      };
      const cid = await nftStorage(_values);
      const json = JSON.stringify({
        expirationTime: timestamp / 1000,
        proposalCid: cid,
        net
      })
      axios.post('/api/create_proposal', json);

      if (cid) {
        message.success("Waiting for the transaction to be chained!");
        if (isConnected) {
          const { createVotingApi } = useDynamicContract(isConnected, chain?.id === filecoin.id);
          const optionArr = new Array(_values.option.length).fill(0).map((_, index) => index);
          // @ts-ignore
          const res = await createVotingApi(cid, optionArr, timestamp / 1000, net);
          if (res) {
            setLoading(false);
            message.success("Preparing to wind the chain!");
            navigate("/");
          }
        } else{
          // @ts-ignore
          openConnectModal && openConnectModal();
        }
      }
    }
  }

  const handleEditorChange = (value: any) => {
    setDescriptions(value);
  }


  const list = [
    {
      name: 'Proposal Title',
      comp: (
        <>
          <input
            name='Name'
            className={classNames(
              'form-input w-full rounded bg-[#212B3C] border border-[#313D4F]',
              errors['Name'] && 'border-red-500 focus:border-red-500'
            )}
            placeholder='Proposal Title'
            {...register('Name', { required: true, validate: validateName })}
          />
          {errors['Name'] && (
            <p className='text-red-500 mt-1'>{errors.Name.message}</p>
          )}
        </>
      )
    },
    {
      name: 'Proposal Description',
      comp: <Editor style={{ height: 500 }} value={descriptions} onChange={handleEditorChange}
      />
    },
    {
      name: 'Proposal Expiration Time',
      comp: (
        <div className='flex items-center'>
          <div className='mr-2.5'>
            <input
              name='Time'
              min={getCurrentDateTime()}
              onChange={handleTimeChange}
              onKeyDown={handleTimeChange}
              type='datetime-local'
              className={classNames(
                'form-input rounded bg-[#212B3C] border border-[#313D4F] w-[248px]',
                errors['Time'] && 'border-red-500 focus:border-red-500'
              )}
              placeholder='Pick Date'
              {...register('Time', { required: true })}
            />
            {errors['Time'] && (
              <p className='text-red-500 mt-1'>Please Pick Start Date</p>
            )}
          </div>
        </div>
      )
    },
    {
      name: 'Proposal Type',
      comp: (
        <Controller
          name='VoteType'
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <RadioGroup className='flex' value={value} onChange={onChange}>
                {pollTypes.map(poll => (
                  <RadioGroup.Option
                    key={poll.label}
                    value={poll.value}
                    className={
                      'relative flex items-center cursor-pointer p-4 focus:outline-none'
                    }
                  >
                    {({ active, checked }) => (
                      <>
                        <span
                          className={classNames(
                            checked
                              ? 'bg-[#45B753] border-transparent'
                              : 'bg-[#212B3B] border-[#38485C]',
                            active ? 'ring-2 ring-offset-2 ring-[#45B753]' : '',
                            'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-full border flex items-center justify-center'
                          )}
                          aria-hidden='true'
                        >
                          {(active || checked) && (
                            <span className='rounded-full bg-white w-1.5 h-1.5' />
                          )}
                        </span>
                        <span className='ml-3'>
                          <RadioGroup.Label
                            as='span'
                            className={
                              checked ? 'text-white' : 'text-[#8896AA]'
                            }
                          >
                            {poll.label}
                          </RadioGroup.Label>
                        </span>
                      </>
                    )}
                  </RadioGroup.Option>
                ))}
              </RadioGroup>
            )
          }}
        />
      )
    },
    {
      name: 'Proposal Options',
      comp: (
        <>
          <div className='rounded border border-[#313D4F] divide-y divide-[#212B3C]'>
            <div className='flex justify-between bg-[#293545] text-base text-[#8896AA] px-5 py-4'>
              <span>Options</span>
              <span>Operations</span>
            </div>
            {fields.map((field: any, index:number) => (
              <div key={field.id}>
                <div className='flex items-center pl-2.5 py-2.5 pr-5'>
                  <input
                    type='text'
                    maxLength="40"
                    className={classNames(
                      'form-input flex-auto rounded bg-[#212B3C] border border-[#313D4F]',
                      errors.option && errors.option[index]?.value &&
                      'border-red-500 focus:border-red-500'
                    )}
                    placeholder='Edit Option'
                    {...register(`option.${index}.value`, { required: true, validate: validateOptionName })}
                  />
                  {
                    fields.length > 1 &&
                    <button
                      type='button'
                      onClick={() => remove(index)}
                      className='ml-3 w-[50px] h-[50px] flex justify-center items-center bg-[#212B3C] rounded-full'
                    >
                      <TrashIcon className='h-5 w-5 text-[#8896AA] hover:opacity-80' />
                    </button>
                  }
                </div>
                {errors.option && errors.option[index]?.value && (
                  <div className='px-2.5 pb-3'>
                    <p className='text-red-500 text-base'>
                      This field is required
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {
            fields.length < 5 &&
            <div className='pl-2.5 py-4'>
              <button
                type='button'
                onClick={() => append('')}
                className='px-8 py-3 rounded border border-[#313D4F] bg-[#3B495B] text-base text-white hover:opacity-80'
              >
                Add Option
              </button>
            </div>
          }
        </>
      )
    }
  ]

  return (
    <>
      <div className="px-3 mb-6 md:px-0">
        <button>
          <div className="inline-flex items-center gap-1 text-skin-text hover:text-skin-link">
            <Link to="/" className="flex items-center">
              <svg className="mr-1" viewBox="0 0 24 24" width="1.2em" height="1.2em">
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="m11 17l-5-5m0 0l5-5m-5 5h12"></path>
              </svg>
              Back
            </Link>
          </div>
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='flow-root space-y-8'>
          <Table title='Create A Proposal' list={list} />

          <div className='text-center'>
            <button className="h-[40px] bg-sky-500 hover:bg-sky-700 text-white py-2 px-6 rounded-xl" type='submit' disabled={loading}>
              Create
            </button>
          </div>
        </div>
      </form>
    </>
  )
}

export default CreatePoll
