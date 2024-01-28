import * as THREE from 'three';
import { ObjectControls } from "threejs-object-controls";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'

let camera, scene, renderer, controls;

// https://3dviewer.net/#

async function LoadStep(filename, targetObject) {
    // init occt-import-js
    const occt = await occtimportjs();

    // import step file
    let response = await fetch(filename);
    let buffer = await response.arrayBuffer();

    // read imported step file
    let fileBuffer = new Uint8Array(buffer);
    let result = occt.ReadStepFile(fileBuffer, null);

    // process the geometries of the result
    for (let resultMesh of result.meshes) {
        let geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(resultMesh.attributes.position.array, 3));
        if (resultMesh.attributes.normal) {
            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(resultMesh.attributes.normal.array, 3));
        }
        const index = Uint32Array.from(resultMesh.index.array);
        geometry.setIndex(new THREE.BufferAttribute(index, 1));

        let material = null;
        if (resultMesh.color) {
            const color = new THREE.Color(resultMesh.color[0], resultMesh.color[1], resultMesh.color[2]);
            material = new THREE.MeshPhongMaterial({color: color});
        } else {
            material = new THREE.MeshPhongMaterial({color: 0xcccccc});
        }

        const mesh = new THREE.Mesh(geometry, material);
        targetObject.add(mesh);
    }
    console.log(result);
}

async function setupCamera(width, height) {
    camera = new THREE.PerspectiveCamera (45, width / height, 1.0, 500000.0);
    camera.position.set (100, 5000.0, 120);
    camera.up.set (0.0, 0.0, 180.0);
    camera.lookAt (new THREE.Vector3 (0.0, 0.0, 0.0));
}

async function setupScene() {
    scene = new THREE.Scene();

    const ambientLight = new THREE.AmbientLight (0x444444);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight (0x888888);
    directionalLight.position.set (camera.position.x, camera.position.y, camera.position.z);
    scene.add(directionalLight);
}

async function setupControl(object) {
    // controls = new ObjectControls(camera, renderer.domElement, object);
    controls = new OrbitControls(camera,renderer.domElement);
    controls.enableDamping = true
}

async function Load(filename) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize (width, height);
    renderer.setClearColor (0xfafafa);
    document.body.appendChild (renderer.domElement);

    setupCamera(width, height);
    setupScene();

    const mainObject = new THREE.Object3D();
    LoadStep(filename, mainObject);
    scene.add(mainObject);

    setupControl(mainObject);

    const stats = new Stats()
    document.body.appendChild(stats.dom)

    window.addEventListener( 'resize', onWindowResize );
    animate()
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render()
}

function animate() {
    requestAnimationFrame(animate);
    // controls.update();
    render()
}

function render() {
    renderer.render(scene, camera);
}
Load('./models/2X6-BENCH.stp')

