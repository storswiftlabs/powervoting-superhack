import {
  Count as CountEvent, CountVoteResultsStruct,
  Create as CreateEvent
} from "../generated/powerVoting/powerVoting"
import { Count, Create } from "../generated/schema"

export function handleCount(event: CountEvent): void {
  let entity = new Count(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.cid = event.params.cid
  entity.expTime = event.params.expTime
  entity.voteResults = countVoteStructArrayToJson(event.params.voteResults)

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCreate(event: CreateEvent): void {
  let entity = new Create(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.cid = event.params.cid
  entity.expTime = event.params.expTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function countVoteStructArrayToJson(arrays: Array<CountVoteResultsStruct>): string {
  let  voteResults = '['
  if (arrays.length > 0) {
    let ofArray : Array<string> = []
    for (let i = 0; i < arrays.length; i++) {
      ofArray[i] = '{"optionId": ' + arrays[i].optionId.toString() + ', "votes": ' + arrays[i].votes.toString() + '}'
    }
    voteResults = voteResults.concat(ofArray.join(","))
  }
  return voteResults.concat(']');
}
