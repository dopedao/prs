// https://github.com/wighawag/hardhat-deploy
// https://github.com/wighawag/tutorial-hardhat-deploy
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { proxies } from '@tableland/evm/proxies';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy('PRSMock', {
    from: deployer,
    // Pass constructor arguments
    args: [proxies["ethereum-goerli"]],
    log: true,
    // speed up deployment on local network (ganache, hardhat)
    // no effect on live networks
    autoMine: true, 
  });
};
export default func;
func.tags = ['PRSMock'];
