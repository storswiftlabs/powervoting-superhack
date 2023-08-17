import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt } from "@graphprotocol/graph-ts"
import { Count } from "../generated/schema"
import { Count as CountEvent } from "../generated/powerVoting/powerVoting"
import { handleCount } from "../src/power-voting"
import { createCountEvent } from "./power-voting-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let cid = "Example string value"
    let expTime = BigInt.fromI32(234)
    let voteResults = "ethereum.Tuple Not implemented"
    let newCountEvent = createCountEvent(cid, expTime, voteResults)
    handleCount(newCountEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Count created and stored", () => {
    assert.entityCount("Count", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "Count",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "cid",
      "Example string value"
    )
    assert.fieldEquals(
      "Count",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "expTime",
      "234"
    )
    assert.fieldEquals(
      "Count",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "voteResults",
      "[ethereum.Tuple Not implemented]"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
