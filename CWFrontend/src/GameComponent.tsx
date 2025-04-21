import React, { Component } from 'react';
import { PlacementService } from '_services/index';
import World from './World';
import { BuildingIds, JobIds } from '_utilities/Enums';

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
      <div style={{width:"20%", height:"32px", position:"absolute", right:0, bottom:"40px"}}>
        <img style={{width:"32px", height:"32px", float:"left", objectFit:"scale-down"}} alt="Dig" src={"textures/Dig.png"} onClick={() => PlacementService.Instance.PlaceJob(JobIds.Dig)} />
        <img style={{width:"32px", height:"32px", float:"left", objectFit:"scale-down"}} alt="Stair" src={"textures/Stair.png"} onClick={() => PlacementService.Instance.PlaceJob(JobIds.Stair)} />
      </div>
      <div style={{width:"100%", height:"40px", position:"absolute", bottom:0}}>
        <img style={{width:"40px", height:"40px", float:"left", objectFit:"scale-down"}} alt="TinyHouse" src={"textures/buildings/TinyHouse.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.TinyHouse)} />
        <img style={{width:"40px", height:"40px", float:"left", objectFit:"scale-down"}} alt="SmallHouse" src={"textures/buildings/SmallHouse.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.SmallHouse)} />
        <img style={{width:"40px", height:"40px", float:"left", objectFit:"scale-down"}} alt="MediumHouse" src={"textures/buildings/MediumHouse.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.MediumHouse)} />
        <img style={{width:"60px", height:"40px", float:"left", objectFit:"scale-down"}} alt="BigHouse" src={"textures/buildings/BigHouse.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.BigHouse)} />
        <img style={{width:"60px", height:"40px", float:"left", objectFit:"scale-down"}} alt="HugeHouse" src={"textures/buildings/HugeHouse.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.HugeHouse)} />
        <img style={{width:"40px", height:"40px", float:"left", objectFit:"scale-down"}} alt="SmallStorageHouse" src={"textures/buildings/SmallStorageHouse.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.SmallStorageHouse)} />
        <img style={{width:"60px", height:"40px", float:"left", objectFit:"scale-down"}} alt="MediumStorageHouse" src={"textures/buildings/MediumStorageHouse.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.MediumStorageHouse)} />
        <img style={{width:"60px", height:"40px", float:"left", objectFit:"scale-down"}} alt="BigStorageHouse" src={"textures/buildings/BigStorageHouse.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.BigStorageHouse)} />

        <img style={{width:"60px", height:"40px", float:"left", objectFit:"scale-down"}} alt="Woodworks" src={"textures/buildings/Woodworks.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.Woodworks)} />
        <img style={{width:"60px", height:"40px", float:"left", objectFit:"scale-down"}} alt="Stoneworks" src={"textures/buildings/Stoneworks.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.Stoneworks)} />
        <img style={{width:"60px", height:"40px", float:"left", objectFit:"scale-down"}} alt="Steelworks" src={"textures/buildings/Steelworks.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.Steelworks)} />
        <img style={{width:"60px", height:"40px", float:"left", objectFit:"scale-down"}} alt="Waterworks" src={"textures/buildings/Waterworks.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.Waterworks)} />
        <img style={{width:"60px", height:"40px", float:"left", objectFit:"scale-down"}} alt="ToolFactory" src={"textures/buildings/ToolFactory.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.ToolFactory)} />
        <img style={{width:"60px", height:"40px", float:"left", objectFit:"scale-down"}} alt="CogwheelFactory" src={"textures/buildings/CogwheelFactory.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.CogwheelFactory)} />
        <img style={{width:"60px", height:"40px", float:"left", objectFit:"scale-down"}} alt="FoodFactory" src={"textures/buildings/FoodFactory.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.FoodFactory)} />
        <img style={{width:"60px", height:"40px", float:"left", objectFit:"scale-down"}} alt="CharcoalBurner" src={"textures/buildings/CharcoalBurner.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.CharcoalBurner)} />
        <img style={{width:"60px", height:"40px", float:"left", objectFit:"scale-down"}} alt="Laboratory" src={"textures/buildings/Laboratory.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.Laboratory)} />
        <img style={{width:"60px", height:"40px", float:"left", objectFit:"scale-down"}} alt="CrystalLoadingstation" src={"textures/buildings/CrystalLoadingstation.png"} onClick={() => PlacementService.Instance.PlaceBuilding(BuildingIds.CrystalLoadingstation)} />
      </div>
    </>);
  }
}

export default GameComponent;