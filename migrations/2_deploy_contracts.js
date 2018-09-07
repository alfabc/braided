const ChainBlockHashes = artifacts.require('ChainBlockHashes')

module.exports = function (deployer) {
  deployer.deploy(ChainBlockHashes)
}
