var VirtualMachine =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 471);
/******/ })
/************************************************************************/
/******/ ({

/***/ 471:
/***/ (function(module, exports) {

var Scratch = window.Scratch = window.Scratch || {};
var ASSET_SERVER = 'https://cdn.assets.scratch.mit.edu/';
var PROJECT_SERVER = 'https://cdn.projects.scratch.mit.edu/';

var loadProject = function loadProject() {
  var id = location.hash.substring(1);

  if (id.length < 1 || !isFinite(id)) {
    id = '119615668';
  }

  Scratch.vm.downloadProjectId(id);
};
/**
 * @param {Asset} asset - calculate a URL for this asset.
 * @returns {string} a URL to download a project file.
 */


var getProjectUrl = function getProjectUrl(asset) {
  var assetIdParts = asset.assetId.split('.');
  var assetUrlParts = [PROJECT_SERVER, 'internalapi/project/', assetIdParts[0], '/get/'];

  if (assetIdParts[1]) {
    assetUrlParts.push(assetIdParts[1]);
  }

  return assetUrlParts.join('');
};
/**
 * @param {Asset} asset - calculate a URL for this asset.
 * @returns {string} a URL to download a project asset (PNG, WAV, etc.)
 */


var getAssetUrl = function getAssetUrl(asset) {
  var assetUrlParts = [ASSET_SERVER, 'internalapi/asset/', asset.assetId, '.', asset.dataFormat, '/get/'];
  return assetUrlParts.join('');
};

var addProfilerPanels = function addProfilerPanels(stats, vm) {
  var panelName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'BLK%';
  var panelFg = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '#fff';
  var panelBg = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '#111';
  vm.runtime.enableProfiling();

  if (vm.runtime.profiler === null) {
    // Profiler isn't available on the local system.
    return;
  }

  var blockPercentPanel = stats.addPanel(new window.Stats.Panel(panelName, panelFg, panelBg)); // Store the profiler reference for later.

  var profiler = vm.runtime.profiler; // Set profiler to null to disable profiling until later.

  vm.runtime.profiler = null;
  var stepThreadsProfilerId = profiler.idByName('Sequencer.stepThreads');
  var blockFunctionProfilerId = profiler.idByName('blockFunction');
  var blockFunctionTime = 0;
  var stepValues = [];
  var lastUpdate = Date.now(); // Collect time used by `blockFunction` calls in `execute` and add a column
  // to the stats graph of the average for the last second of recordings.

  profiler.onFrame = function (_ref) {
    var id = _ref.id,
        totalTime = _ref.totalTime;

    if (id === stepThreadsProfilerId && totalTime > 0) {
      // This frame wraps Sequencer.stepThreads.
      // Push the most recently summed blockFunctionTime.
      stepValues.push(blockFunctionTime / totalTime * 100); // Every second, average the pushed values and render that as a new
      // column in the stats graph.

      if (Date.now() - lastUpdate > 1000) {
        lastUpdate = Date.now();
        var average = stepValues.reduce(function (a, b) {
          return a + b;
        }, 0) / stepValues.length;
        blockPercentPanel.update(average, 100);
        stepValues.length = 0;
      }

      blockFunctionTime = 0;
    } else if (id === blockFunctionProfilerId) {
      // This frame wraps around each blockFunction call.
      blockFunctionTime += totalTime;
    }
  }; // Set the stats panel to not display by default.


  blockPercentPanel.dom.style.display = 'none'; // When the parent of the stats graphs is clicked, check if the
  // blockPercentPanel is visible. If it is visible, enable profiling by
  // setting the runtime's profiler to the stored Profiler instance. If it is
  // not visible, disable profiling by setting the profiler to null.

  stats.dom.addEventListener('click', function () {
    if (blockPercentPanel.dom.style.display === 'block') {
      vm.runtime.profiler = profiler;
    } else {
      vm.runtime.profiler = null;
    }
  });
  return blockPercentPanel;
};

window.onload = function () {
  // Lots of global variables to make debugging easier
  // Instantiate the VM.
  var vm = new window.VirtualMachine();
  Scratch.vm = vm;
  var storage = new ScratchStorage();
  /* global ScratchStorage */

  var AssetType = storage.AssetType;
  storage.addWebSource([AssetType.Project], getProjectUrl);
  storage.addWebSource([AssetType.ImageVector, AssetType.ImageBitmap, AssetType.Sound], getAssetUrl);
  vm.attachStorage(storage); // Loading projects from the server.

  document.getElementById('projectLoadButton').onclick = function () {
    document.location = "#".concat(document.getElementById('projectId').value);
    location.reload();
  };

  loadProject(); // Instantiate the renderer and connect it to the VM.

  var canvas = document.getElementById('scratch-stage');
  var renderer = new window.RenderWebGL(canvas);
  Scratch.renderer = renderer;
  vm.attachRenderer(renderer);
  var audioEngine = new window.AudioEngine();
  vm.attachAudioEngine(audioEngine); // Instantiate scratch-blocks and attach it to the DOM.

  var workspace = window.Blockly.inject('blocks', {
    media: './media/',
    zoom: {
      controls: true,
      wheel: true,
      startScale: 0.75
    },
    colours: {
      workspace: '#334771',
      flyout: '#283856',
      scrollbar: '#24324D',
      scrollbarHover: '#0C111A',
      insertionMarker: '#FFFFFF',
      insertionMarkerOpacity: 0.3,
      fieldShadow: 'rgba(255, 255, 255, 0.3)',
      dragShadowOpacity: 0.6
    }
  });
  Scratch.workspace = workspace; // Attach scratch-blocks events to VM.

  workspace.addChangeListener(vm.blockListener);
  workspace.addChangeListener(vm.variableListener);
  var flyoutWorkspace = workspace.getFlyout().getWorkspace();
  flyoutWorkspace.addChangeListener(vm.flyoutBlockListener);
  flyoutWorkspace.addChangeListener(vm.monitorBlockListener); // Create FPS counter.

  var stats = new window.Stats();
  document.getElementById('tab-renderexplorer').appendChild(stats.dom);
  stats.dom.style.position = 'relative';
  addProfilerPanels(stats, vm, 'BLK%', '#fff', '#111');
  stats.begin(); // Playground data tabs.
  // Block representation tab.

  var blockexplorer = document.getElementById('blockexplorer');

  var updateBlockExplorer = function updateBlockExplorer(blocks) {
    blockexplorer.innerHTML = JSON.stringify(blocks, null, 2);
    window.hljs.highlightBlock(blockexplorer);
  }; // Thread representation tab.


  var threadexplorer = document.getElementById('threadexplorer');
  var cachedThreadJSON = '';

  var updateThreadExplorer = function updateThreadExplorer(newJSON) {
    if (newJSON !== cachedThreadJSON) {
      cachedThreadJSON = newJSON;
      threadexplorer.innerHTML = cachedThreadJSON;
      window.hljs.highlightBlock(threadexplorer);
    }
  }; // Only request data from the VM thread if the appropriate tab is open.


  Scratch.exploreTabOpen = false;

  var getPlaygroundData = function getPlaygroundData() {
    vm.getPlaygroundData();

    if (Scratch.exploreTabOpen) {
      window.requestAnimationFrame(getPlaygroundData);
    }
  }; // VM handlers.
  // Receipt of new playground data (thread, block representations).


  vm.on('playgroundData', function (data) {
    updateThreadExplorer(data.threads);
    updateBlockExplorer(data.blocks);
  }); // Receipt of new block XML for the selected target.

  vm.on('workspaceUpdate', function (data) {
    workspace.clear();
    var dom = window.Blockly.Xml.textToDom(data.xml);
    window.Blockly.Xml.domToWorkspace(dom, workspace);
  }); // Receipt of new list of targets, selected target update.

  var selectedTarget = document.getElementById('selectedTarget');
  vm.on('targetsUpdate', function (data) {
    // Clear select box.
    while (selectedTarget.firstChild) {
      selectedTarget.removeChild(selectedTarget.firstChild);
    } // Generate new select box.


    for (var i = 0; i < data.targetList.length; i++) {
      var targetOption = document.createElement('option');
      targetOption.setAttribute('value', data.targetList[i].id); // If target id matches editingTarget id, select it.

      if (data.targetList[i].id === data.editingTarget) {
        targetOption.setAttribute('selected', 'selected');
      }

      targetOption.appendChild(document.createTextNode(data.targetList[i].name));
      selectedTarget.appendChild(targetOption);
    }
  });

  selectedTarget.onchange = function () {
    vm.setEditingTarget(this.value);
  }; // Feedback for stacks and blocks running.


  vm.on('SCRIPT_GLOW_ON', function (data) {
    workspace.glowStack(data.id, true);
  });
  vm.on('SCRIPT_GLOW_OFF', function (data) {
    workspace.glowStack(data.id, false);
  });
  vm.on('BLOCK_GLOW_ON', function (data) {
    workspace.glowBlock(data.id, true);
  });
  vm.on('BLOCK_GLOW_OFF', function (data) {
    workspace.glowBlock(data.id, false);
  });
  vm.on('VISUAL_REPORT', function (data) {
    workspace.reportValue(data.id, data.value);
  });
  vm.on('SPRITE_INFO_REPORT', function (data) {
    if (data.id !== selectedTarget.value) return; // Not the editingTarget

    document.getElementById('sinfo-x').value = data.x;
    document.getElementById('sinfo-y').value = data.y;
    document.getElementById('sinfo-size').value = data.size;
    document.getElementById('sinfo-direction').value = data.direction;
    document.getElementById('sinfo-rotationstyle').value = data.rotationStyle;
    document.getElementById('sinfo-visible').value = data.visible;
  });
  document.getElementById('sinfo-post').addEventListener('click', function () {
    var data = {};
    data.x = document.getElementById('sinfo-x').value;
    data.y = document.getElementById('sinfo-y').value;
    data.direction = document.getElementById('sinfo-direction').value;
    data.rotationStyle = document.getElementById('sinfo-rotationstyle').value;
    data.visible = document.getElementById('sinfo-visible').value === 'true';
    vm.postSpriteInfo(data);
  }); // Feed mouse events as VM I/O events.

  document.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    var coordinates = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      canvasWidth: rect.width,
      canvasHeight: rect.height
    };
    Scratch.vm.postIOData('mouse', coordinates);
  });
  canvas.addEventListener('mousedown', function (e) {
    var rect = canvas.getBoundingClientRect();
    var data = {
      isDown: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      canvasWidth: rect.width,
      canvasHeight: rect.height
    };
    Scratch.vm.postIOData('mouse', data);
    e.preventDefault();
  });
  canvas.addEventListener('mouseup', function (e) {
    var rect = canvas.getBoundingClientRect();
    var data = {
      isDown: false,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      canvasWidth: rect.width,
      canvasHeight: rect.height
    };
    Scratch.vm.postIOData('mouse', data);
    e.preventDefault();
  }); // Feed keyboard events as VM I/O events.

  document.addEventListener('keydown', function (e) {
    // Don't capture keys intended for Blockly inputs.
    if (e.target !== document && e.target !== document.body) {
      return;
    }

    Scratch.vm.postIOData('keyboard', {
      keyCode: e.keyCode,
      isDown: true
    });
    e.preventDefault();
  });
  document.addEventListener('keyup', function (e) {
    // Always capture up events,
    // even those that have switched to other targets.
    Scratch.vm.postIOData('keyboard', {
      keyCode: e.keyCode,
      isDown: false
    }); // E.g., prevent scroll.

    if (e.target !== document && e.target !== document.body) {
      e.preventDefault();
    }
  }); // Run threads

  vm.start(); // Inform VM of animation frames.

  var animate = function animate() {
    stats.update();
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate); // Handlers for green flag and stop all.

  document.getElementById('greenflag').addEventListener('click', function () {
    vm.greenFlag();
  });
  document.getElementById('stopall').addEventListener('click', function () {
    vm.stopAll();
  });
  document.getElementById('turbomode').addEventListener('change', function () {
    var turboOn = document.getElementById('turbomode').checked;
    vm.setTurboMode(turboOn);
  });
  document.getElementById('compatmode').addEventListener('change', function () {
    var compatibilityMode = document.getElementById('compatmode').checked;
    vm.setCompatibilityMode(compatibilityMode);
  });
  var tabBlockExplorer = document.getElementById('tab-blockexplorer');
  var tabThreadExplorer = document.getElementById('tab-threadexplorer');
  var tabRenderExplorer = document.getElementById('tab-renderexplorer');
  var tabImportExport = document.getElementById('tab-importexport'); // Handlers to show different explorers.

  document.getElementById('threadexplorer-link').addEventListener('click', function () {
    Scratch.exploreTabOpen = true;
    getPlaygroundData();
    tabBlockExplorer.style.display = 'none';
    tabRenderExplorer.style.display = 'none';
    tabThreadExplorer.style.display = 'block';
    tabImportExport.style.display = 'none';
  });
  document.getElementById('blockexplorer-link').addEventListener('click', function () {
    Scratch.exploreTabOpen = true;
    getPlaygroundData();
    tabBlockExplorer.style.display = 'block';
    tabRenderExplorer.style.display = 'none';
    tabThreadExplorer.style.display = 'none';
    tabImportExport.style.display = 'none';
  });
  document.getElementById('renderexplorer-link').addEventListener('click', function () {
    Scratch.exploreTabOpen = false;
    tabBlockExplorer.style.display = 'none';
    tabRenderExplorer.style.display = 'block';
    tabThreadExplorer.style.display = 'none';
    tabImportExport.style.display = 'none';
  });
  document.getElementById('importexport-link').addEventListener('click', function () {
    Scratch.exploreTabOpen = false;
    tabBlockExplorer.style.display = 'none';
    tabRenderExplorer.style.display = 'none';
    tabThreadExplorer.style.display = 'none';
    tabImportExport.style.display = 'block';
  });
};

/***/ })

/******/ });
//# sourceMappingURL=playground.js.map