
import * as BABYLON from '@babylonjs/core';
import { BoxParticleEmitter, SceneLoaderAnimationGroupLoadingMode } from '@babylonjs/core';
import SceneComponent from 'babylonjs-hook';
import * as earcut from 'earcut';
import './App.css';




function onSceneReady(scene) {
  const canvas = scene.getEngine().getRenderingCanvas();

  var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2,
    Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0), scene);
  camera.attachControl(canvas, true);

  var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.7;



  var music = new BABYLON.Sound("music", "objects/music.wav", scene, null, {
    loop: true,
    volume: 0.3,
    autoplay: true
  });
  music.play();

  var ground = createGround();
  createHouse().rotation.y = 10;
  createHouse().position.z = 3;

  createCar().position = new BABYLON.Vector3(1, 1, 1);


  //create functions

  function createHouse() {
    var roof = createRoof();
    var box = createBox();

    return BABYLON.Mesh.MergeMeshes([roof, box], true, false, null, false, true);
  }


  function createBox() {
    const boxMat = new BABYLON.StandardMaterial("boxMat");
    boxMat.diffuseTexture = new BABYLON.Texture("objects/cubehouse.png");

    //House wall texture for each wall side
    var faceUV = [];
    faceUV[0] = new BABYLON.Vector4(0.5, 0.0, 0.75, 1.0); //rear side
    faceUV[1] = new BABYLON.Vector4(0.0, 0.0, 0.25, 1.0); //front side
    faceUV[2] = new BABYLON.Vector4(0.25, 0.0, 0.5, 1.0); //front side
    faceUV[3] = new BABYLON.Vector4(0.75, 0.0, 1.0, 1.0); //front side

    var box = BABYLON.MeshBuilder.CreateBox("box", { faceUV: faceUV, wrap: true });
    box.material = boxMat;
    box.position.y = 0.5;

    return box;
  };


  function createRoof() {
    var roof = BABYLON.MeshBuilder.CreateCylinder("root", { diameter: 1.3, height: 1.2, tessellation: 3 });
    roof.scaling.x = 0.75;
    roof.rotation.z = Math.PI / 2;
    roof.position.y = 1.22;

    const roofMat = new BABYLON.StandardMaterial("roofMat");
    roofMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/roof.jpg");
    roof.material = roofMat;

    return roof;
  };


  function createGround() {
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 });
    var groundMat = new BABYLON.StandardMaterial("groundMat");

    groundMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
    ground.material = groundMat;
  }

  function createCar() {
    const outline = [
      new BABYLON.Vector3(-0.3, 0, -0.1),
      new BABYLON.Vector3(0.2, 0, -0.1),
    ]

    //curved front
    for (let i = 0; i < 20; i++) {
      outline.push(new BABYLON.Vector3(0.2 * Math.cos(i * Math.PI / 40), 0, 0.2 * Math.sin(i * Math.PI / 40) - 0.1));
    }

    //top
    outline.push(new BABYLON.Vector3(0, 0, 0.1));
    outline.push(new BABYLON.Vector3(-0.3, 0, 0.1));

    var faceUV = [];
    faceUV[0] = new BABYLON.Vector4(0, 0.5, 0.38, 1);
    faceUV[1] = new BABYLON.Vector4(0, 0, 1, 0.5);
    faceUV[2] = new BABYLON.Vector4(0.38, 1, 0, 0.5);

    var carMat = new BABYLON.StandardMaterial("carMat");
    carMat.diffuseTexture = new BABYLON.Texture("objects/car.png");


    var car = BABYLON.MeshBuilder.ExtrudePolygon("car", { shape: outline, depth: 0.2, faceUV: faceUV, wrap: true }, scene, earcut);
    car.material = carMat;



    //Wheel part
    var wheelUV = [];
    wheelUV[0] = new BABYLON.Vector4(0, 0, 1, 1);
    wheelUV[1] = new BABYLON.Vector4(0, 0.5, 0, 0.5);
    wheelUV[2] = new BABYLON.Vector4(0, 0, 1, 1);

    //wheel material
    var wheelMat = new BABYLON.StandardMaterial("wheelMat");
    wheelMat.diffuseTexture = new BABYLON.Texture("objects/wheel.png");

    const wheelRB = BABYLON.MeshBuilder.CreateCylinder("wheelRB", { diameter: 0.125, height: 0.05, faceUV: wheelUV })
    wheelRB.material = wheelMat;
    wheelRB.parent = car;
    wheelRB.position.z = -0.1;
    wheelRB.position.x = -0.2;
    wheelRB.position.y = 0.035;

    var wheelRF = wheelRB.clone("wheelRF");
    wheelRF.position.x = 0.1;

    var wheelLB = wheelRB.clone("wheelLB");
    wheelLB.position.y = -0.2 - 0.035;

    var wheelLF = wheelRF.clone("wheelLF");
    wheelLF.position.y = -0.2 - 0.035;

    //animate wheel
    var animWheel = new BABYLON.Animation("wheelAnim", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);



    return car;
  };
};








function App() {

  return (
    <div className="App">
      <nav className="navbar navbar-expand-sm navbar-dark bg-dark sticky-top">
        <div className="text-light">
          HELLO GUYS. MY NAME IS GOCH-GOCH
        </div>
      </nav>
      <div className="mt-5">
        <SceneComponent antialias onSceneReady={onSceneReady} id="myCanvas" />
      </div>
    </div>
  );
}



export default App;
