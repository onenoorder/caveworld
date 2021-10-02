import React, { Component } from 'react';
import { PlacementService } from '_services/index';
import World from './World';

class GameComponent extends Component {
  container: any;
  world: World | null;

  constructor(props: any) {
    super(props);

    this.world = null;
  }

  componentDidMount() {
    this.world = new World(this.container);
    this.world.start();
  }

  componentWillUnmount() {
    this.world?.destroy();
  }

  render() {
    return (<>
      <div style={{width:"80%", height:"calc(100% - 40px)", position:"absolute"}} 
        ref={thisNode => this.container=thisNode}
      />
      <div style={{width:"20%", height:"12px", position:"absolute", right:0, bottom:"40px"}}>
        <img style={{width:"12px", height:"12px", float:"left", objectFit:"scale-down"}} alt="Dig" src={"textures/Dig.png"} onClick={() => PlacementService.Instance.PlaceJob(1)} />
        <img style={{width:"12px", height:"12px", float:"left", objectFit:"scale-down"}} alt="Stair" src={"textures/Stair.png"} onClick={() => PlacementService.Instance.PlaceJob(2)} />
      </div>
      <div style={{width:"100%", height:"40px", position:"absolute", bottom:0}}>
        <img style={{width:"40px", height:"40px", float:"left", objectFit:"scale-down"}} alt="TinyHouse" src={"textures/buildings/TinyHouse.png"} onClick={() => PlacementService.Instance.PlaceBuilding(1)} />
        <img style={{width:"40px", height:"40px", float:"left", objectFit:"scale-down"}} alt="SmallHouse" src={"textures/buildings/SmallHouse.png"} onClick={() => PlacementService.Instance.PlaceBuilding(2)} />
        <img style={{width:"40px", height:"40px", float:"left", objectFit:"scale-down"}} alt="MediumHouse" src={"textures/buildings/MediumHouse.png"} onClick={() => PlacementService.Instance.PlaceBuilding(3)} />
        <img style={{width:"40px", height:"40px", float:"left", objectFit:"scale-down"}} alt="BigHouse" src={"textures/buildings/BigHouse.png"} onClick={() => PlacementService.Instance.PlaceBuilding(4)} />
        <img style={{width:"40px", height:"40px", float:"left", objectFit:"scale-down"}} alt="HugeHouse" src={"textures/buildings/HugeHouse.png"} onClick={() => PlacementService.Instance.PlaceBuilding(5)} />
        <img style={{width:"40px", height:"40px", float:"left", objectFit:"scale-down"}} alt="SmallStorageHouse" src={"textures/buildings/SmallStorageHouse.png"} onClick={() => PlacementService.Instance.PlaceBuilding(6)} />
        <img style={{width:"40px", height:"40px", float:"left", objectFit:"scale-down"}} alt="MediumStorageHouse" src={"textures/buildings/MediumStorageHouse.png"} onClick={() => PlacementService.Instance.PlaceBuilding(7)} />
        <img style={{width:"40px", height:"40px", float:"left", objectFit:"scale-down"}} alt="BigStorageHouse" src={"textures/buildings/BigStorageHouse.png"} onClick={() => PlacementService.Instance.PlaceBuilding(8)} />
      </div>
    </>);
  }
}

export default GameComponent;