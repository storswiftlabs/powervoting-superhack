// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class Count extends ethereum.Event {
  get params(): Count__Params {
    return new Count__Params(this);
  }
}

export class Count__Params {
  _event: Count;

  constructor(event: Count) {
    this._event = event;
  }

  get cid(): string {
    return this._event.parameters[0].value.toString();
  }

  get expTime(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get voteResults(): Array<CountVoteResultsStruct> {
    return this._event.parameters[2].value.toTupleArray<
      CountVoteResultsStruct
    >();
  }
}

export class CountVoteResultsStruct extends ethereum.Tuple {
  get optionId(): BigInt {
    return this[0].toBigInt();
  }

  get votes(): BigInt {
    return this[1].toBigInt();
  }
}

export class Create extends ethereum.Event {
  get params(): Create__Params {
    return new Create__Params(this);
  }
}

export class Create__Params {
  _event: Create;

  constructor(event: Create) {
    this._event = event;
  }

  get cid(): string {
    return this._event.parameters[0].value.toString();
  }

  get expTime(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class powerVoting__getProposalResultValue0Struct extends ethereum.Tuple {
  get cid(): string {
    return this[0].toString();
  }

  get expTime(): BigInt {
    return this[1].toBigInt();
  }

  get isCounted(): boolean {
    return this[2].toBoolean();
  }

  get optionIds(): Array<BigInt> {
    return this[3].toBigIntArray();
  }

  get voteResults(): Array<
    powerVoting__getProposalResultValue0VoteResultsStruct
  > {
    return this[4].toTupleArray<
      powerVoting__getProposalResultValue0VoteResultsStruct
    >();
  }
}

export class powerVoting__getProposalResultValue0VoteResultsStruct extends ethereum.Tuple {
  get optionId(): BigInt {
    return this[0].toBigInt();
  }

  get votes(): BigInt {
    return this[1].toBigInt();
  }
}

export class powerVoting__getProposalListResultValue0Struct extends ethereum.Tuple {
  get cid(): string {
    return this[0].toString();
  }

  get expTime(): BigInt {
    return this[1].toBigInt();
  }

  get isCounted(): boolean {
    return this[2].toBoolean();
  }

  get optionIds(): Array<BigInt> {
    return this[3].toBigIntArray();
  }

  get voteResults(): Array<
    powerVoting__getProposalListResultValue0VoteResultsStruct
  > {
    return this[4].toTupleArray<
      powerVoting__getProposalListResultValue0VoteResultsStruct
    >();
  }
}

export class powerVoting__getProposalListResultValue0VoteResultsStruct extends ethereum.Tuple {
  get optionId(): BigInt {
    return this[0].toBigInt();
  }

  get votes(): BigInt {
    return this[1].toBigInt();
  }
}

export class powerVoting__getProposalListByIndexResultValue0Struct extends ethereum.Tuple {
  get cid(): string {
    return this[0].toString();
  }

  get expTime(): BigInt {
    return this[1].toBigInt();
  }

  get isCounted(): boolean {
    return this[2].toBoolean();
  }

  get optionIds(): Array<BigInt> {
    return this[3].toBigIntArray();
  }

  get voteResults(): Array<
    powerVoting__getProposalListByIndexResultValue0VoteResultsStruct
  > {
    return this[4].toTupleArray<
      powerVoting__getProposalListByIndexResultValue0VoteResultsStruct
    >();
  }
}

export class powerVoting__getProposalListByIndexResultValue0VoteResultsStruct extends ethereum.Tuple {
  get optionId(): BigInt {
    return this[0].toBigInt();
  }

  get votes(): BigInt {
    return this[1].toBigInt();
  }
}

export class powerVoting__proposalListResultValue0Struct extends ethereum.Tuple {
  get totalSize(): BigInt {
    return this[0].toBigInt();
  }

  get proposalList(): Array<
    powerVoting__proposalListResultValue0ProposalListStruct
  > {
    return this[1].toTupleArray<
      powerVoting__proposalListResultValue0ProposalListStruct
    >();
  }
}

export class powerVoting__proposalListResultValue0ProposalListStruct extends ethereum.Tuple {
  get cid(): string {
    return this[0].toString();
  }

  get expTime(): BigInt {
    return this[1].toBigInt();
  }

  get isCounted(): boolean {
    return this[2].toBoolean();
  }

  get optionIds(): Array<BigInt> {
    return this[3].toBigIntArray();
  }

  get voteResults(): Array<
    powerVoting__proposalListResultValue0ProposalListVoteResultsStruct
  > {
    return this[4].toTupleArray<
      powerVoting__proposalListResultValue0ProposalListVoteResultsStruct
    >();
  }
}

export class powerVoting__proposalListResultValue0ProposalListVoteResultsStruct extends ethereum.Tuple {
  get optionId(): BigInt {
    return this[0].toBigInt();
  }

  get votes(): BigInt {
    return this[1].toBigInt();
  }
}

export class powerVoting extends ethereum.SmartContract {
  static bind(address: Address): powerVoting {
    return new powerVoting("powerVoting", address);
  }

  getProposal(proposalCid: string): powerVoting__getProposalResultValue0Struct {
    let result = super.call(
      "getProposal",
      "getProposal(string):((string,uint248,bool,uint256[],(uint256,uint256)[]))",
      [ethereum.Value.fromString(proposalCid)]
    );

    return changetype<powerVoting__getProposalResultValue0Struct>(
      result[0].toTuple()
    );
  }

  try_getProposal(
    proposalCid: string
  ): ethereum.CallResult<powerVoting__getProposalResultValue0Struct> {
    let result = super.tryCall(
      "getProposal",
      "getProposal(string):((string,uint248,bool,uint256[],(uint256,uint256)[]))",
      [ethereum.Value.fromString(proposalCid)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      changetype<powerVoting__getProposalResultValue0Struct>(value[0].toTuple())
    );
  }

  getProposalList(
    proposalCidList: Array<string>
  ): Array<powerVoting__getProposalListResultValue0Struct> {
    let result = super.call(
      "getProposalList",
      "getProposalList(string[]):((string,uint248,bool,uint256[],(uint256,uint256)[])[])",
      [ethereum.Value.fromStringArray(proposalCidList)]
    );

    return result[0].toTupleArray<
      powerVoting__getProposalListResultValue0Struct
    >();
  }

  try_getProposalList(
    proposalCidList: Array<string>
  ): ethereum.CallResult<
    Array<powerVoting__getProposalListResultValue0Struct>
  > {
    let result = super.tryCall(
      "getProposalList",
      "getProposalList(string[]):((string,uint248,bool,uint256[],(uint256,uint256)[])[])",
      [ethereum.Value.fromStringArray(proposalCidList)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      value[0].toTupleArray<powerVoting__getProposalListResultValue0Struct>()
    );
  }

  getProposalListByIndex(
    start: BigInt,
    end: BigInt
  ): Array<powerVoting__getProposalListByIndexResultValue0Struct> {
    let result = super.call(
      "getProposalListByIndex",
      "getProposalListByIndex(uint256,uint256):((string,uint248,bool,uint256[],(uint256,uint256)[])[])",
      [
        ethereum.Value.fromUnsignedBigInt(start),
        ethereum.Value.fromUnsignedBigInt(end)
      ]
    );

    return result[0].toTupleArray<
      powerVoting__getProposalListByIndexResultValue0Struct
    >();
  }

  try_getProposalListByIndex(
    start: BigInt,
    end: BigInt
  ): ethereum.CallResult<
    Array<powerVoting__getProposalListByIndexResultValue0Struct>
  > {
    let result = super.tryCall(
      "getProposalListByIndex",
      "getProposalListByIndex(uint256,uint256):((string,uint248,bool,uint256[],(uint256,uint256)[])[])",
      [
        ethereum.Value.fromUnsignedBigInt(start),
        ethereum.Value.fromUnsignedBigInt(end)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      value[0].toTupleArray<
        powerVoting__getProposalListByIndexResultValue0Struct
      >()
    );
  }

  onwer(): Address {
    let result = super.call("onwer", "onwer():(address)", []);

    return result[0].toAddress();
  }

  try_onwer(): ethereum.CallResult<Address> {
    let result = super.tryCall("onwer", "onwer():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  proposalList(
    pageIndex: BigInt,
    pageSize: BigInt
  ): powerVoting__proposalListResultValue0Struct {
    let result = super.call(
      "proposalList",
      "proposalList(int256,int256):((uint256,(string,uint248,bool,uint256[],(uint256,uint256)[])[]))",
      [
        ethereum.Value.fromSignedBigInt(pageIndex),
        ethereum.Value.fromSignedBigInt(pageSize)
      ]
    );

    return changetype<powerVoting__proposalListResultValue0Struct>(
      result[0].toTuple()
    );
  }

  try_proposalList(
    pageIndex: BigInt,
    pageSize: BigInt
  ): ethereum.CallResult<powerVoting__proposalListResultValue0Struct> {
    let result = super.tryCall(
      "proposalList",
      "proposalList(int256,int256):((uint256,(string,uint248,bool,uint256[],(uint256,uint256)[])[]))",
      [
        ethereum.Value.fromSignedBigInt(pageIndex),
        ethereum.Value.fromSignedBigInt(pageSize)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      changetype<powerVoting__proposalListResultValue0Struct>(
        value[0].toTuple()
      )
    );
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class CountCall extends ethereum.Call {
  get inputs(): CountCall__Inputs {
    return new CountCall__Inputs(this);
  }

  get outputs(): CountCall__Outputs {
    return new CountCall__Outputs(this);
  }
}

export class CountCall__Inputs {
  _call: CountCall;

  constructor(call: CountCall) {
    this._call = call;
  }

  get proposalCid(): string {
    return this._call.inputValues[0].value.toString();
  }
}

export class CountCall__Outputs {
  _call: CountCall;

  constructor(call: CountCall) {
    this._call = call;
  }
}

export class CountBatchCall extends ethereum.Call {
  get inputs(): CountBatchCall__Inputs {
    return new CountBatchCall__Inputs(this);
  }

  get outputs(): CountBatchCall__Outputs {
    return new CountBatchCall__Outputs(this);
  }
}

export class CountBatchCall__Inputs {
  _call: CountBatchCall;

  constructor(call: CountBatchCall) {
    this._call = call;
  }

  get proposals(): Array<string> {
    return this._call.inputValues[0].value.toStringArray();
  }
}

export class CountBatchCall__Outputs {
  _call: CountBatchCall;

  constructor(call: CountBatchCall) {
    this._call = call;
  }
}

export class CreateProposalCall extends ethereum.Call {
  get inputs(): CreateProposalCall__Inputs {
    return new CreateProposalCall__Inputs(this);
  }

  get outputs(): CreateProposalCall__Outputs {
    return new CreateProposalCall__Outputs(this);
  }
}

export class CreateProposalCall__Inputs {
  _call: CreateProposalCall;

  constructor(call: CreateProposalCall) {
    this._call = call;
  }

  get proposalCid(): string {
    return this._call.inputValues[0].value.toString();
  }

  get optionIds(): Array<BigInt> {
    return this._call.inputValues[1].value.toBigIntArray();
  }

  get expTime(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class CreateProposalCall__Outputs {
  _call: CreateProposalCall;

  constructor(call: CreateProposalCall) {
    this._call = call;
  }
}

export class VoteCall extends ethereum.Call {
  get inputs(): VoteCall__Inputs {
    return new VoteCall__Inputs(this);
  }

  get outputs(): VoteCall__Outputs {
    return new VoteCall__Outputs(this);
  }
}

export class VoteCall__Inputs {
  _call: VoteCall;

  constructor(call: VoteCall) {
    this._call = call;
  }

  get proposalCid(): string {
    return this._call.inputValues[0].value.toString();
  }

  get voteInfoList(): Array<VoteCallVoteInfoListStruct> {
    return this._call.inputValues[1].value.toTupleArray<
      VoteCallVoteInfoListStruct
    >();
  }
}

export class VoteCall__Outputs {
  _call: VoteCall;

  constructor(call: VoteCall) {
    this._call = call;
  }
}

export class VoteCallVoteInfoListStruct extends ethereum.Tuple {
  get optionId(): i32 {
    return this[0].toI32();
  }

  get votePercent(): BigInt {
    return this[1].toBigInt();
  }
}