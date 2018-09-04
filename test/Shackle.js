/* eslint-env node, mocha */
/* eslint no-unused-expressions: 0 */
/* eslint prefer-const: 0 */
const Shackle = artifacts.require('../contracts/Shackle.sol')
// const expectThrow = require('./helpers/expectThrow.js')
const should = require('chai') // eslint-disable-line no-unused-vars
  .use(require('chai-as-promised'))
  .should()

contract('Shackle', (accounts) => {
  let shackle

  before(async () => {
    shackle = await Shackle.new()
  })

  // Test linking multiple testnets together
  context('Link testnets', () => {
    it('should add chains', async () => {
      await shackle.addChain(1, '0x0000001')
      await shackle.addChain(2, '0x0000002')
    })

    xit('should not allow a duplicate chain with the same ID', async () => {
    })

    it('should add hashes', async () => {
      await shackle.recordBlock(1, 1, '0x1010101')
      await shackle.recordBlock(2, 1, '0x2020202')
    })

    xit('should check hash on chain', async () => {
    })
  })
})
