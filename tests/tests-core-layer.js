var assert = require('assert');
var Layer = require('../es6/core/layer');

describe('Layer', function() {
  describe('#contructor', function() {
    it('should create an instance with default `dataType`', function(done) {});
    it('should be instanciated according to given params', function(done) {});
    it('should have public and private properties', function(done) {});
  });

  describe('#data', function() {
    it('should return the `data` if used as a getter', function(done) {});
    it('should wrap the datum into an Array if `dataType` is `entity` when used as a setter', function(done) {});
  });

  describe('#initialize', function() {
    it('should create a properly instanciated context', function(done) {});
    it('should receive the parentContext as argument', function(done) {});
  });

  describe('#addLayer', function() {
    it('should register an `innreLayer` and initialize it', function(done) {});
  });

  // COMPONENT CREATION
  describe('#setShape', function() {});
  describe('#setCommonShape', function() {});
  describe('#setBehavior', function() {});

  // CONTEXT COMMANDS
  describe('#start', function() {
    it('should return the context `start` value when used as a getter', function(done) {});
    it('should set the context `start` value when used as a setter', function(done) {});
  });

  describe('#duration', function() {
    it('should return the context `duration` value when used as a getter', function(done) {});
    it('should set the context `duration` value when used as a setter', function(done) {});
  });

  describe('#offset', function() {
    it('should return the context `offset` value when used as a getter', function(done) {});
    it('should set the context `offset` value when used as a setter', function(done) {});
  });

  describe('#stretchRatio', function() {
    it('should return the context `stretchRatio` value when used as a getter', function(done) {});
    it('should set the context `stretchRatio` value when used as a setter', function(done) {});
  });

  describe('#yDomain', function() {
    it('should return the context `yDomain` value when used as a getter', function(done) {});
    it('should set the context `yDomain` value when used as a setter', function(done) {});
  });

  describe('#opacity', function() {
    it('should return the context `opacity` value when used as a getter', function(done) {});
    it('should set the context `opacity` value when used as a setter', function(done) {});
  });

  // HELPERS
  describe('#each - not implemented', function() {
    it('should call d3 each on `this.items`', function() {});
  });

  // INTERACTIONS
  describe('#_getItemFromDOMElement', function() {
    it('should return the closest `item` given a DOM element', function(done) {});
  });

  describe('#hasItem', function() {
    it('should define in a given DOM element belongs to an item of the layer', function(done) {});
  });

  describe('#getItemsInArea', function() {
    it('should return a copy of the `items` DOM elements present in the given area', function(done) {});
  });

  describe('#select - bad design API', function() {
    it('should call `behavior.select` on each given items', function(done) {});
  });

  describe('#unselect - bad design API', function() {
    it('should call `behavior.unselect` on each given item', function(done) {});
  });

  describe('#toggleSelection - bad design API', function() {
    it('should call `behavior.toggleSelection` on each given item', function(done) {});
  });

  describe('#selectAll', function() {
    it('should call `behavior.select` on all items', function(done) {});
  });

  describe('#unselectAll', function() {
    it('should call `behavior.unselect` on all items', function(done) {});
  });

  describe('#get:selectedItems', function() {
    it('should return the `behavior.selectedItems` as an Array', function(done) {});
  });

  describe('#edit - bad design API', function() {
    it('should call `behavior.edit` with proper parameters', function(done) {});
  });

  // DISPLAY / RENDERING
  describe('#render', function(done) {
    it('should call `render` on the context', function(done) {});
    it('should create a group to flip system coordinates', function(done) {});
    it('should call `innerLayer.render` method - remove ?', function(done) {});
    it('should return the context DOM element', function(done) {});
  });

  describe('#draw', function(done) {
    it('should create a unique id for each new datum', function(done) {});
    it('should create a d3 selection binded to the data', function(done) {});
    it('should render the registered common shapes', function(done) {});
    it('should apply the d3 enter pattern and create all the shapes', function(done) {});
    it('should apply the d3 exit pattern and destroy all the shapes', function(done) {});
    it('shoudl call `draw` on innerLayers', function(done) {});
  });

  describe('#update', function(done) {
    it('should call `updateContext` then `updateShapes`', function(done) {});
  });

  describe('#updateContext', function(done) {
    it('should call `context.update`', function(done) {});
    it('should call `updateContext` on each innerLayers', function(done) {});
  });

  describe('#updateShapes', function(done) {
    it('should update `commonShapes`', function(done) {});
    it('should update each `shape`', function(done) {});
    it('should call `updateShapes` on each innerLayers', function(done) {});
  });
});


describe('Timeline', function(){
    it('should create a Timeline instance with dom elements targets', function(){
        // domElements = document.querySelectorAll('.timelineElement');
        // timeline = new Timeline(domElements);
        // assert whatever this instance should create: svg and public variables.
    });
});

describe('Layer', function(){
    it('should create a layer and attach it to a DOM element of a timeline instance', function(){
        // Here we have to mock a timeline instance
        // domElementOfTimelineInstance = document.querySelector('.domElementOfTimelineInstance');
        // layer = new Layer(domElementOfTimelineInstance);
        // assert whatever this instance should create as svg and public variables.
    });
    it('should modify svg when modify xDomain', function(){
        // layer.xDomain = [3, 4]
        // assert that svg is rigth
        // Public variables remain unchanged right? as audio rendering should compute itself values
    });
    // Same for other public variables: xScale, yDomain, yRange
});

describe('Segment', function(){
    it('should render a segment item or collection', function(){
        // mock a layer instance (svg + variables)
        // segment = new Segment(datas);
        // layer.add(segment);
        // assert that segments are rendered in the DOM and public variables for segment are fine too.
    });
    // And programmatically move segments: left anchor, right anchor, all shape
    // on one or more segment (one or more may be abstracted)
});

describe('Waveform', function(){
    // Same as Segment
});

describe('Marker', function(){
    // Same as Segment
});

describe('Label', function(){
    // Same as Segment
});

describe('Breakpoint', function(){
    // Same as Segment + curve rendering?
});

describe('Cursor', function(){

});

describe('Zoom', function(){
    // Programmatically set a zoom property and check svg is well rendered.
});

