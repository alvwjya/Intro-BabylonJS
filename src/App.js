
import * as BABYLON from '@babylonjs/core';
import { BoxParticleEmitter, ParticleSystem, SceneLoaderAnimationGroupLoadingMode } from '@babylonjs/core';
import { defaultUboDeclaration } from '@babylonjs/core/Shaders/ShadersInclude/defaultUboDeclaration';
import SceneComponent from 'babylonjs-hook';
import * as earcut from 'earcut';
import './App.css';




function onSceneReady(scene) {
  var canvas = scene.getEngine().getRenderingCanvas();

  var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2,
    Math.PI / 2.5, 50, new BABYLON.Vector3(0, 0, 0), scene);
  camera.upperBetaLimit = Math.PI / 2.1;
  camera.attachControl(canvas, true);

  var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  var spriteManagerTrees = new BABYLON.SpriteManager("treesManager", "objects/palmtree.png", 2000, { width: 512, height: 1024 }, scene);

  //We create trees at random positions
  for (let i = 0; i < 500; i++) {
    const tree = new BABYLON.Sprite("tree", spriteManagerTrees);
    tree.position.x = Math.random() * (-30);
    tree.position.z = Math.random() * 20 + 8;
    tree.position.y = 0.5;
  }

  for (let i = 0; i < 500; i++) {
    const tree = new BABYLON.Sprite("tree", spriteManagerTrees);
    tree.position.x = Math.random() * (25) + 7;
    tree.position.z = Math.random() * -35 + 8;
    tree.position.y = 0.5;
  }


  var skybox = BABYLON.MeshBuilder.CreateBox("skybox", { size: 150 }, scene);
  var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("objects/skybox/skybox", scene);
  skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
  skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  skybox.material = skyboxMaterial;

  var music = new BABYLON.Sound("music", "objects/music.wav", scene, null, {
    loop: true,
    volume: 0.3,
    autoplay: true
  });
  music.play();

  var ground = createGround();

  var house = createHouse();
  house.position.z = -3;

  var houses = [];

  houses[0] = house.createInstance("house")
  houses[0].rotation.y = 10;
  houses[0].position.x = -2
  createHouse().position = new BABYLON.Vector3(1, 0, 3);

  var car = createCar();
  car.rotation = new BABYLON.Vector3(-Math.PI / 2, 0, 0);
  car.position.y = 0.16;
  car.position.x = 1;
  car.position.z = 1;

  var dude = myDude();

  var fountain = generateFountain();


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
    var roof = BABYLON.MeshBuilder.CreateCylinder("root", {
      diameter: 1.3,
      height: 1.2,
      tessellation: 3
    });
    roof.scaling.x = 0.75;
    roof.rotation.z = Math.PI / 2;
    roof.position.y = 1.22;

    const roofMat = new BABYLON.StandardMaterial("roofMat");
    roofMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/roof.jpg");
    roof.material = roofMat;

    return roof;
  };


  function createGround() {
    var ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("ground", "https://assets.babylonjs.com/environments/villageheightmap.png", {
      width: 120,
      height: 120,
      subdivisions: 20,
      minHeight: 0,
      maxHeight: 10
    });
    var groundMat = new BABYLON.StandardMaterial("groundMat");
    groundMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/valleygrass.png");

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

    //Top
    outline.push(new BABYLON.Vector3(0, 0, 0.1));
    outline.push(new BABYLON.Vector3(-0.3, 0, 0.1));

    var faceUV = [];
    faceUV[0] = new BABYLON.Vector4(0, 0.5, 0.38, 1);
    faceUV[1] = new BABYLON.Vector4(0, 0, 1, 0.5);
    faceUV[2] = new BABYLON.Vector4(0.38, 1, 0, 0.5);

    var carMat = new BABYLON.StandardMaterial("carMat");
    carMat.diffuseTexture = new BABYLON.Texture("objects/car.png");


    var car = BABYLON.MeshBuilder.ExtrudePolygon("car",
      {
        shape: outline,
        depth: 0.2,
        faceUV: faceUV,
        wrap: true
      },
      scene, earcut);
    car.material = carMat;



    //Wheel part
    var wheelUV = [];
    wheelUV[0] = new BABYLON.Vector4(0, 0, 1, 1);
    wheelUV[1] = new BABYLON.Vector4(0, 0.5, 0, 0.5);
    wheelUV[2] = new BABYLON.Vector4(0, 0, 1, 1);

    //Wheel material
    var wheelMat = new BABYLON.StandardMaterial("wheelMat");
    wheelMat.diffuseTexture = new BABYLON.Texture("objects/wheel.png");

    const wheelRB = BABYLON.MeshBuilder.CreateCylinder("wheelRB",
      {
        diameter: 0.125,
        height: 0.05,
        faceUV: wheelUV
      });
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


    //Animate wheel
    var animWheel = new BABYLON.Animation("wheelAnimation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var wheelKeys = [];

    //Animation key

    //Frame 0 = rotation 0
    wheelKeys.push({
      frame: 0,
      value: 0
    });

    //Animation key 30 (1 sec @ 30fps) = rotation is 2PI (360)
    wheelKeys.push({
      frame: 30,
      value: 2 * Math.PI
    })


    //Set keys
    animWheel.setKeys(wheelKeys);

    wheelRB.animations = [];
    wheelRB.animations.push(animWheel);

    wheelRF.animations = [];
    wheelRF.animations.push(animWheel);

    wheelLB.animations = [];
    wheelLB.animations.push(animWheel);

    wheelLF.animations = [];
    wheelLF.animations.push(animWheel);

    var animCar = new BABYLON.Animation("carAnim", "position.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    var carKeys = [];

    carKeys.push({
      frame: 0,
      value: -4
    });

    carKeys.push({
      frame: 150,
      value: 4
    });

    animCar.setKeys(carKeys);

    car.animations = [];
    car.animations.push(animCar);
    scene.beginAnimation(car, 0, 150, true);


    scene.beginAnimation(wheelRB, 0, 30, true);
    scene.beginAnimation(wheelRF, 0, 30, true);
    scene.beginAnimation(wheelLB, 0, 30, true);
    scene.beginAnimation(wheelLF, 0, 30, true);


    // Car Animation



    return car;
  };

  function myDude() {

    BABYLON.SceneLoader.ImportMeshAsync("him", "/objects/", "dude.babylon", scene).then((result) => {
      var dude = result.meshes[0];
      dude.scaling = new BABYLON.Vector3(0.008, 0.008, 0.008);
      scene.beginAnimation(result.skeletons[0], 0, 100, true, 1.0);
      function walk(turn, dist) {
        this.turn = turn;
        this.dist = dist;
      }

      //camera.parent = dude;

      var track = [];
      track.push(new walk(86, 7));
      track.push(new walk(-85, 14.8));
      track.push(new walk(-93, 16.5));
      track.push(new walk(48, 25.5));
      track.push(new walk(-112, 30.5));
      track.push(new walk(-72, 33.2));
      track.push(new walk(42, 37.5));
      track.push(new walk(-98, 45.2));
      track.push(new walk(0, 47));

      dude.position = new BABYLON.Vector3(-6, 0, 0);
      dude.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(-95), BABYLON.Space.LOCAL);
      var startRotation = dude.rotationQuaternion.clone()

      let distance = 0;
      let step = 0.015;
      let p = 0;

      scene.onBeforeRenderObservable.add(() => {
        dude.movePOV(0, 0, step);
        distance += step;

        if (distance > track[p].dist) {
          dude.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(track[p].turn), BABYLON.Space.LOCAL);
          p += 1;
          p %= track.length;
          if (p === 0) {
            distance = 0;
            dude.position = new BABYLON.Vector3(-6, 0, 0);
            dude.rotationQuaternion = startRotation.clone();
          }
        }
      });
    });

  };

  function generateFountain() {

    var fountainOutline = [
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(0.5, 0, 0),
      new BABYLON.Vector3(0.5, 0.2, 0),
      new BABYLON.Vector3(0.4, 0.2, 0),
      new BABYLON.Vector3(0.4, 0.05, 0),
      new BABYLON.Vector3(0.05, 0.1, 0),
      new BABYLON.Vector3(0.05, 0.8, 0),
      new BABYLON.Vector3(0.15, 0.9, 0)
    ];

    //Create lathe fountain
    var fountain = BABYLON.MeshBuilder.CreateLathe('fountain', { shape: fountainOutline, sideOrientation: BABYLON.Mesh.DOUBLESIDE });
    fountain.position = new BABYLON.Vector3(-4, 0, -6);

    var particleSystem = new BABYLON.ParticleSystem('particles', 5000, scene);

    particleSystem.particleTexture = new BABYLON.Texture("objects/Flare.png", scene);

    //Particle source
    particleSystem.emitter = new BABYLON.Vector3(-4, 0.8, -6); // The starting object
    particleSystem.minEmitBox = new BABYLON.Vector3(-0.01, 0, -0.01); // Starting all from
    particleSystem.maxEmitBox = new BABYLON.Vector3(0.01, 0, 0.01); // Particle destination


    //Colors of all particles
    particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0); // Color before dead

    //Random size of particles in range
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;

    //Particle lifetime
    //particleSystem.minLifeTime = 2;
    particleSystem.maxLifeTime = 5.5;

    //Emision rate
    particleSystem.emitRate = 1500;


    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    // Set the gravity of all particles
    particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

    // Direction of each particle after it has been emitted
    particleSystem.direction1 = new BABYLON.Vector3(-2, 8, 2);
    particleSystem.direction2 = new BABYLON.Vector3(2, 8, -2);

    // Angular speed, in radians
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;

    // Speed
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.025;

    particleSystem.start();
  };


  //scene.debugLayer.show({});

  return scene
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
