import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt } from "@graphprotocol/graph-ts"
import { Count, Create } from "../generated/powerVoting/powerVoting"

export function createCountEvent(
  cid: string,
  expTime: BigInt,
  voteResults: string
): Count {
  let countEvent = changetype<Count>(newMockEvent())

  countEvent.parameters = new Array()

  countEvent.parameters.push(
    new ethereum.EventParam("cid", ethereum.Value.fromString(cid))
  )
  countEvent.parameters.push(
    new ethereum.EventParam(
      "expTime",
      ethereum.Value.fromUnsignedBigInt(expTime)
    )
  )
  countEvent.parameters.push(
    new ethereum.EventParam(
      "voteResults",
      ethereum.Value.fromString(voteResults)
    )
  )

  return countEvent
}

export function createCreateEvent(cid: string, expTime: BigInt): Create {
  let createEvent = changetype<Create>(newMockEvent())

  createEvent.parameters = new Array()

  createEvent.parameters.push(
    new ethereum.EventParam("cid", ethereum.Value.fromString(cid))
  )
  createEvent.parameters.push(
    new ethereum.EventParam(
      "expTime",
      ethereum.Value.fromUnsignedBigInt(expTime)
    )
  )

  return createEvent
}
