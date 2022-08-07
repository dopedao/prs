// https://github.com/wighawag/hardhat-deploy
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy('PRS', {
    from: deployer,
    args: [],
    log: true,
    // speed up deployment on local network (ganache, hardhat)
    // no effect on live networks
    autoMine: true, 
  });
};
export default func;
func.tags = ['PRS'];
