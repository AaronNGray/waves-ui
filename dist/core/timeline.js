"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var events = require("events");
var ns = require("./namespace");
var TimeContext = require("./time-context");
var Surface = require("../interactions/surface");
var Keyboard = require("../interactions/keyboard");
var Layer = require("./layer");

/**
 *  @class Timeline
 */

var Timeline = (function (_events$EventEmitter) {
  /**
   *  Creates a new Timeline
   *  @param params {Object} an object to override defaults parameters
   */

  function Timeline() {
    var params = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Timeline);

    _get(_core.Object.getPrototypeOf(Timeline.prototype), "constructor", this).call(this);

    this._defaults = {
      width: 1000,
      duration: 60
    };

    // public attributes
    this.params = _core.Object.assign({}, this._defaults, params);
    this.layers = [];
    this.categorizedLayers = {}; // group layer by categories
    this.context = null;
    // private attributes
    this._state = null;
    this.containers = {};
    this._layerContainerMap = new _core.Map();
    this._handleEvent = this._handleEvent.bind(this);

    this._createTimeContext();
    this._createInteraction(Keyboard, "body");
  }

  _inherits(Timeline, _events$EventEmitter);

  _createClass(Timeline, {
    setState: {

      /**
       *  Change the state of the timeline, `States` are the main entry point between
       *  application logic, interactions, ..., and the library
       *  @param state {BaseState} the state in which the timeline must be setted
       */

      value: function setState(state) {
        if (this._state) {
          this._state.exit();
        }
        this._state = state;
        this._state.enter();
      }
    },
    _handleEvent: {

      /**
       *  @private
       *  The callback that is used to listen to interactions modules
       *  @params e {Event} a custom event generated by interaction modules
       */

      value: function _handleEvent(e) {
        if (!this._state) {
          return;
        }
        this._state.handleEvent(e);
      }
    },
    _createInteraction: {

      /**
       *  Factory method to add interaction modules the timeline should listen to
       *  by default, the timeline listen to Keyboard, and instance a Surface on each
       *  container
       *  @param ctor {EventSource} the contructor of the interaction module to instanciate
       *  @param el {DOMElement} the DOM element to bind to the EventSource module
       */

      value: function _createInteraction(ctor, el) {
        var options = arguments[2] === undefined ? {} : arguments[2];

        var interaction = new ctor(el, options);
        interaction.on("event", this._handleEvent);
      }
    },
    _createTimeContext: {

      /**
       *  Creates a new TimeContext for the visualisation, this `TimeContext`
       *  will be at the top of the `TimeContext` tree
       */

      value: function _createTimeContext() {
        var duration = this.params.duration;
        var width = this.params.width;

        var xScale = d3.scale.linear().domain([0, duration]).range([0, width]);

        this.context = new TimeContext();
        this.context.duration = duration;
        this.context.xScale = xScale;
      }
    },
    xScale: {
      get: function () {
        return this.context.xScale;
      }
    },
    add: {

      /**
       *  Adds a `Layer` to the Timeline
       *  @param layer {Layer} the layer to register
       *  @param containerId {String} a valid id of a previsouly registered container
       *  @param category {String} insert the layer into some user defined category
       *  @param context {TimeContext} a `TimeContext` the layer is associated with
       *      if null given, a new `TimeContext` will be created for the layer
       */

      value: function add(layer, containerId) {
        var category = arguments[2] === undefined ? "default" : arguments[2];
        var context = arguments[3] === undefined ? null : arguments[3];

        var layerContext = context || new TimeContext(this.context);
        layer.setContext(layerContext);

        this._layerContainerMap.set(layer, this.containers[containerId]);
        this.layers.push(layer);

        if (!this.categorizedLayers[category]) {
          this.categorizedLayers[category] = [];
        }

        this.categorizedLayers[category].push(layer);
      }
    },
    remove: {

      /**
       *  Remove a layer from the timeline
       *  @param layer {Layer} the layer to remove
       */

      value: function remove(layer) {}
    },
    getLayers: {

      /**
       *  Returns an array of layers given some category
       *  @param category {String} name of the category
       *  @return {Array} an array of layers which belongs to the category
       */

      value: function getLayers() {
        var category = arguments[0] === undefined ? "default" : arguments[0];

        return this.categorizedLayers[category] || [];
      }
    },
    registerContainer: {

      /**
       *  Register a container and prepare the DOM svg element for the timeline's layers
       *  @param id {String} a user defined id for the container
       *  @param el {DOMElement} the DOMElement to use as a container
       *  @param options {Object} the options to apply to the container
       */

      value: function registerContainer(id, el) {
        var options = arguments[2] === undefined ? {} : arguments[2];

        var width = this.params.width;
        var height = options.height || 120;

        var svg = document.createElementNS(ns, "svg");
        svg.setAttributeNS(null, "width", width);
        svg.setAttributeNS(null, "height", height);
        svg.setAttributeNS(null, "viewbox", "0 0 " + width + " " + height);

        var defs = document.createElementNS(ns, "defs");

        var offsetGroup = document.createElementNS(ns, "g");
        offsetGroup.classList.add("offset");

        var layoutGroup = document.createElementNS(ns, "g");
        layoutGroup.classList.add("layout");

        var interactionsGroup = document.createElementNS(ns, "g");
        interactionsGroup.classList.add("interactions");

        svg.appendChild(defs);
        offsetGroup.appendChild(layoutGroup);
        svg.appendChild(offsetGroup);
        svg.appendChild(interactionsGroup);

        el.appendChild(svg);

        // create a container object
        var container = {
          id: id,
          layoutElement: layoutGroup,
          offsetElement: offsetGroup,
          interactionsElement: interactionsGroup,
          svgElement: svg,
          DOMElement: el,
          brushElement: null
        };

        this.containers[id] = container;
        this._createInteraction(Surface, el);
      }
    },
    getContainerPerElement: {

      // container helpers
      // @NOTE change to `getContainer(el || id || layer)` ?

      value: function getContainerPerElement(el) {
        for (var id in this.containers) {
          var container = this.containers[id];
          if (container.DOMElement === el) {
            return container;
          }
        }

        return null;
      }
    },
    getLayerContainer: {
      value: function getLayerContainer(layer) {
        return this._layerContainerMap.get(layer);
      }
    },
    render: {

      // getContainerPerId(id) {
      //   return this.containers[id];
      // }

      /**
       *  Render all the layers in the timeline
       */

      value: function render() {
        var _this = this;

        this.layers.forEach(function (layer) {
          var container = _this._layerContainerMap.get(layer);
          var layout = container.layoutElement;
          layout.appendChild(layer.render());
        });
      }
    },
    draw: {

      /**
       *  Draw all the layers in the timeline
       */

      value: function draw() {
        var layerOrCategory = arguments[0] === undefined ? null : arguments[0];

        var layers = null;

        if (typeof layerOrCategory === "string") {
          layers = this.getLayers(layerOrCategory);
        } else if (layerOrCategory instanceof Layer) {
          layers = [layerOrCategory];
        } else {
          layers = this.layers;
        }

        this.layers.forEach(function (layer) {
          return layer.draw();
        });
      }
    },
    updateContainers: {
      value: function updateContainers() {
        for (var id in this.containers) {
          var container = this.containers[id];
          var offset = container.offsetElement;
          var context = this.context;
          var translate = "translate(" + context.xScale(context.offset * context.stretchRatio) + ", 0)";
          offset.setAttributeNS(null, "transform", translate);
        }
      }
    },
    update: {
      /**
       *  Update all the layers in the timeline
       *  @TODO accept several `layers` or `categories` as arguments ?
       */

      value: function update() {
        var layerOrCategory = arguments[0] === undefined ? null : arguments[0];

        this.updateContainers();
        var layers = null;

        if (typeof layerOrCategory === "string") {
          layers = this.getLayers(layerOrCategory);
        } else if (layerOrCategory instanceof Layer) {
          layers = [layerOrCategory];
        } else {
          layers = this.layers;
        }

        this.emit("update", layers);
        layers.forEach(function (layer) {
          return layer.update();
        });
      }
    }
  });

  return Timeline;
})(events.EventEmitter);

module.exports = Timeline;
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBTSxDQUFDO0FBQzNGLGdCQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDckQ7T0FDRjs7QUFLRCxVQUFNOzs7Ozs7YUFBQSxrQkFBeUI7WUFBeEIsZUFBZSxnQ0FBRyxJQUFJOztBQUMzQixZQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUN4QixZQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7O0FBRWxCLFlBQUksT0FBTyxlQUFlLEtBQUssUUFBUSxFQUFFO0FBQ3ZDLGdCQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUMxQyxNQUFNLElBQUksZUFBZSxZQUFZLEtBQUssRUFBRTtBQUMzQyxnQkFBTSxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDNUIsTUFBTTtBQUNMLGdCQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztTQUN0Qjs7QUFFRCxZQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM1QixjQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSztpQkFBSyxLQUFLLENBQUMsTUFBTSxFQUFFO1NBQUEsQ0FBQyxDQUFDO09BQzNDOzs7O1NBclBHLFFBQVE7R0FBUyxNQUFNLENBQUMsWUFBWTs7QUF3UDFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDIiwiZmlsZSI6ImVzNi9jb3JlL3RpbWVsaW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZXZlbnRzID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5jb25zdCBucyA9IHJlcXVpcmUoJy4vbmFtZXNwYWNlJyk7XG5jb25zdCBUaW1lQ29udGV4dCA9IHJlcXVpcmUoJy4vdGltZS1jb250ZXh0Jyk7XG5jb25zdCBTdXJmYWNlICA9IHJlcXVpcmUoJy4uL2ludGVyYWN0aW9ucy9zdXJmYWNlJyk7XG5jb25zdCBLZXlib2FyZCA9IHJlcXVpcmUoJy4uL2ludGVyYWN0aW9ucy9rZXlib2FyZCcpO1xuY29uc3QgTGF5ZXIgPSByZXF1aXJlKCcuL2xheWVyJyk7XG5cbi8qKlxuICogIEBjbGFzcyBUaW1lbGluZVxuICovXG5jbGFzcyBUaW1lbGluZSBleHRlbmRzIGV2ZW50cy5FdmVudEVtaXR0ZXIge1xuICAvKipcbiAgICogIENyZWF0ZXMgYSBuZXcgVGltZWxpbmVcbiAgICogIEBwYXJhbSBwYXJhbXMge09iamVjdH0gYW4gb2JqZWN0IHRvIG92ZXJyaWRlIGRlZmF1bHRzIHBhcmFtZXRlcnNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX2RlZmF1bHRzID0ge1xuICAgICAgd2lkdGg6IDEwMDAsXG4gICAgICBkdXJhdGlvbjogNjBcbiAgICB9O1xuXG4gICAgLy8gcHVibGljIGF0dHJpYnV0ZXNcbiAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuX2RlZmF1bHRzLCBwYXJhbXMpO1xuICAgIHRoaXMubGF5ZXJzID0gW107XG4gICAgdGhpcy5jYXRlZ29yaXplZExheWVycyA9IHt9OyAvLyBncm91cCBsYXllciBieSBjYXRlZ29yaWVzXG4gICAgdGhpcy5jb250ZXh0ID0gbnVsbDtcbiAgICAvLyBwcml2YXRlIGF0dHJpYnV0ZXNcbiAgICB0aGlzLl9zdGF0ZSA9IG51bGw7XG4gICAgdGhpcy5jb250YWluZXJzID0ge307XG4gICAgdGhpcy5fbGF5ZXJDb250YWluZXJNYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5faGFuZGxlRXZlbnQgPSB0aGlzLl9oYW5kbGVFdmVudC5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5fY3JlYXRlVGltZUNvbnRleHQoKTtcbiAgICB0aGlzLl9jcmVhdGVJbnRlcmFjdGlvbihLZXlib2FyZCwgJ2JvZHknKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgQ2hhbmdlIHRoZSBzdGF0ZSBvZiB0aGUgdGltZWxpbmUsIGBTdGF0ZXNgIGFyZSB0aGUgbWFpbiBlbnRyeSBwb2ludCBiZXR3ZWVuXG4gICAqICBhcHBsaWNhdGlvbiBsb2dpYywgaW50ZXJhY3Rpb25zLCAuLi4sIGFuZCB0aGUgbGlicmFyeVxuICAgKiAgQHBhcmFtIHN0YXRlIHtCYXNlU3RhdGV9IHRoZSBzdGF0ZSBpbiB3aGljaCB0aGUgdGltZWxpbmUgbXVzdCBiZSBzZXR0ZWRcbiAgICovXG4gIHNldFN0YXRlKHN0YXRlKSB7XG4gICAgaWYgKHRoaXMuX3N0YXRlKSB7IHRoaXMuX3N0YXRlLmV4aXQoKTsgfVxuICAgIHRoaXMuX3N0YXRlID0gc3RhdGU7XG4gICAgdGhpcy5fc3RhdGUuZW50ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgQHByaXZhdGVcbiAgICogIFRoZSBjYWxsYmFjayB0aGF0IGlzIHVzZWQgdG8gbGlzdGVuIHRvIGludGVyYWN0aW9ucyBtb2R1bGVzXG4gICAqICBAcGFyYW1zIGUge0V2ZW50fSBhIGN1c3RvbSBldmVudCBnZW5lcmF0ZWQgYnkgaW50ZXJhY3Rpb24gbW9kdWxlc1xuICAgKi9cbiAgX2hhbmRsZUV2ZW50KGUpIHtcbiAgICBpZiAoIXRoaXMuX3N0YXRlKSB7IHJldHVybjsgfVxuICAgIHRoaXMuX3N0YXRlLmhhbmRsZUV2ZW50KGUpO1xuICB9XG5cbiAgLyoqXG4gICAqICBGYWN0b3J5IG1ldGhvZCB0byBhZGQgaW50ZXJhY3Rpb24gbW9kdWxlcyB0aGUgdGltZWxpbmUgc2hvdWxkIGxpc3RlbiB0b1xuICAgKiAgYnkgZGVmYXVsdCwgdGhlIHRpbWVsaW5lIGxpc3RlbiB0byBLZXlib2FyZCwgYW5kIGluc3RhbmNlIGEgU3VyZmFjZSBvbiBlYWNoXG4gICAqICBjb250YWluZXJcbiAgICogIEBwYXJhbSBjdG9yIHtFdmVudFNvdXJjZX0gdGhlIGNvbnRydWN0b3Igb2YgdGhlIGludGVyYWN0aW9uIG1vZHVsZSB0byBpbnN0YW5jaWF0ZVxuICAgKiAgQHBhcmFtIGVsIHtET01FbGVtZW50fSB0aGUgRE9NIGVsZW1lbnQgdG8gYmluZCB0byB0aGUgRXZlbnRTb3VyY2UgbW9kdWxlXG4gICAqL1xuICBfY3JlYXRlSW50ZXJhY3Rpb24oY3RvciwgZWwsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGludGVyYWN0aW9uID0gbmV3IGN0b3IoZWwsIG9wdGlvbnMpO1xuICAgIGludGVyYWN0aW9uLm9uKCdldmVudCcsIHRoaXMuX2hhbmRsZUV2ZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgQ3JlYXRlcyBhIG5ldyBUaW1lQ29udGV4dCBmb3IgdGhlIHZpc3VhbGlzYXRpb24sIHRoaXMgYFRpbWVDb250ZXh0YFxuICAgKiAgd2lsbCBiZSBhdCB0aGUgdG9wIG9mIHRoZSBgVGltZUNvbnRleHRgIHRyZWVcbiAgICovXG4gIF9jcmVhdGVUaW1lQ29udGV4dCgpIHtcbiAgICBjb25zdCBkdXJhdGlvbiA9IHRoaXMucGFyYW1zLmR1cmF0aW9uO1xuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5wYXJhbXMud2lkdGg7XG5cbiAgICBjb25zdCB4U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuICAgICAgLmRvbWFpbihbMCwgZHVyYXRpb25dKVxuICAgICAgLnJhbmdlKFswLCB3aWR0aF0pO1xuXG4gICAgdGhpcy5jb250ZXh0ID0gbmV3IFRpbWVDb250ZXh0KCk7XG4gICAgdGhpcy5jb250ZXh0LmR1cmF0aW9uID0gIGR1cmF0aW9uO1xuICAgIHRoaXMuY29udGV4dC54U2NhbGUgPSB4U2NhbGU7XG4gIH1cblxuICBnZXQgeFNjYWxlKCkge1xuICAgIHJldHVybiB0aGlzLmNvbnRleHQueFNjYWxlO1xuICB9XG5cbiAgLyoqXG4gICAqICBBZGRzIGEgYExheWVyYCB0byB0aGUgVGltZWxpbmVcbiAgICogIEBwYXJhbSBsYXllciB7TGF5ZXJ9IHRoZSBsYXllciB0byByZWdpc3RlclxuICAgKiAgQHBhcmFtIGNvbnRhaW5lcklkIHtTdHJpbmd9IGEgdmFsaWQgaWQgb2YgYSBwcmV2aXNvdWx5IHJlZ2lzdGVyZWQgY29udGFpbmVyXG4gICAqICBAcGFyYW0gY2F0ZWdvcnkge1N0cmluZ30gaW5zZXJ0IHRoZSBsYXllciBpbnRvIHNvbWUgdXNlciBkZWZpbmVkIGNhdGVnb3J5XG4gICAqICBAcGFyYW0gY29udGV4dCB7VGltZUNvbnRleHR9IGEgYFRpbWVDb250ZXh0YCB0aGUgbGF5ZXIgaXMgYXNzb2NpYXRlZCB3aXRoXG4gICAqICAgICAgaWYgbnVsbCBnaXZlbiwgYSBuZXcgYFRpbWVDb250ZXh0YCB3aWxsIGJlIGNyZWF0ZWQgZm9yIHRoZSBsYXllclxuICAgKi9cbiAgYWRkKGxheWVyLCBjb250YWluZXJJZCwgY2F0ZWdvcnkgPSAnZGVmYXVsdCcsIGNvbnRleHQgPSBudWxsKSB7XG4gICAgY29uc3QgbGF5ZXJDb250ZXh0ID0gY29udGV4dCB8fMKgbmV3IFRpbWVDb250ZXh0KHRoaXMuY29udGV4dCk7XG4gICAgbGF5ZXIuc2V0Q29udGV4dChsYXllckNvbnRleHQpO1xuXG4gICAgdGhpcy5fbGF5ZXJDb250YWluZXJNYXAuc2V0KGxheWVyLCB0aGlzLmNvbnRhaW5lcnNbY29udGFpbmVySWRdKTtcbiAgICB0aGlzLmxheWVycy5wdXNoKGxheWVyKTtcblxuICAgIGlmICghdGhpcy5jYXRlZ29yaXplZExheWVyc1tjYXRlZ29yeV0pIHtcbiAgICAgIHRoaXMuY2F0ZWdvcml6ZWRMYXllcnNbY2F0ZWdvcnldID0gW107XG4gICAgfVxuXG4gICAgdGhpcy5jYXRlZ29yaXplZExheWVyc1tjYXRlZ29yeV0ucHVzaChsYXllcik7XG4gIH1cblxuICAvKipcbiAgICogIFJlbW92ZSBhIGxheWVyIGZyb20gdGhlIHRpbWVsaW5lXG4gICAqICBAcGFyYW0gbGF5ZXIge0xheWVyfSB0aGUgbGF5ZXIgdG8gcmVtb3ZlXG4gICAqL1xuICByZW1vdmUobGF5ZXIpIHtcblxuICB9XG5cbiAgLyoqXG4gICAqICBSZXR1cm5zIGFuIGFycmF5IG9mIGxheWVycyBnaXZlbiBzb21lIGNhdGVnb3J5XG4gICAqICBAcGFyYW0gY2F0ZWdvcnkge1N0cmluZ30gbmFtZSBvZiB0aGUgY2F0ZWdvcnlcbiAgICogIEByZXR1cm4ge0FycmF5fSBhbiBhcnJheSBvZiBsYXllcnMgd2hpY2ggYmVsb25ncyB0byB0aGUgY2F0ZWdvcnlcbiAgICovXG4gIGdldExheWVycyhjYXRlZ29yeSA9ICdkZWZhdWx0Jykge1xuICAgIHJldHVybiB0aGlzLmNhdGVnb3JpemVkTGF5ZXJzW2NhdGVnb3J5XSB8fMKgW107XG4gIH1cblxuICAvKipcbiAgICogIFJlZ2lzdGVyIGEgY29udGFpbmVyIGFuZCBwcmVwYXJlIHRoZSBET00gc3ZnIGVsZW1lbnQgZm9yIHRoZSB0aW1lbGluZSdzIGxheWVyc1xuICAgKiAgQHBhcmFtIGlkIHtTdHJpbmd9IGEgdXNlciBkZWZpbmVkIGlkIGZvciB0aGUgY29udGFpbmVyXG4gICAqICBAcGFyYW0gZWwge0RPTUVsZW1lbnR9IHRoZSBET01FbGVtZW50IHRvIHVzZSBhcyBhIGNvbnRhaW5lclxuICAgKiAgQHBhcmFtIG9wdGlvbnMge09iamVjdH0gdGhlIG9wdGlvbnMgdG8gYXBwbHkgdG8gdGhlIGNvbnRhaW5lclxuICAgKi9cbiAgcmVnaXN0ZXJDb250YWluZXIoaWQsIGVsLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMucGFyYW1zLndpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0IHx8IDEyMDtcblxuICAgIGNvbnN0IHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgJ3N2ZycpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGVOUyhudWxsLCAnd2lkdGgnLCB3aWR0aCk7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZU5TKG51bGwsICdoZWlnaHQnLCBoZWlnaHQpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGVOUyhudWxsLCAndmlld2JveCcsIGAwIDAgJHt3aWR0aH0gJHtoZWlnaHR9YCk7XG5cbiAgICBjb25zdCBkZWZzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCAnZGVmcycpO1xuXG4gICAgY29uc3Qgb2Zmc2V0R3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsICdnJyk7XG4gICAgb2Zmc2V0R3JvdXAuY2xhc3NMaXN0LmFkZCgnb2Zmc2V0Jyk7XG5cbiAgICBjb25zdCBsYXlvdXRHcm91cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgJ2cnKTtcbiAgICBsYXlvdXRHcm91cC5jbGFzc0xpc3QuYWRkKCdsYXlvdXQnKTtcblxuICAgIGNvbnN0IGludGVyYWN0aW9uc0dyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCAnZycpO1xuICAgIGludGVyYWN0aW9uc0dyb3VwLmNsYXNzTGlzdC5hZGQoJ2ludGVyYWN0aW9ucycpO1xuXG4gICAgc3ZnLmFwcGVuZENoaWxkKGRlZnMpXG4gICAgb2Zmc2V0R3JvdXAuYXBwZW5kQ2hpbGQobGF5b3V0R3JvdXApO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChvZmZzZXRHcm91cClcbiAgICBzdmcuYXBwZW5kQ2hpbGQoaW50ZXJhY3Rpb25zR3JvdXApO1xuXG4gICAgZWwuYXBwZW5kQ2hpbGQoc3ZnKTtcblxuICAgIC8vIGNyZWF0ZSBhIGNvbnRhaW5lciBvYmplY3RcbiAgICBjb25zdCBjb250YWluZXIgPSB7XG4gICAgICBpZDogaWQsXG4gICAgICBsYXlvdXRFbGVtZW50OiBsYXlvdXRHcm91cCxcbiAgICAgIG9mZnNldEVsZW1lbnQ6IG9mZnNldEdyb3VwLFxuICAgICAgaW50ZXJhY3Rpb25zRWxlbWVudDogaW50ZXJhY3Rpb25zR3JvdXAsXG4gICAgICBzdmdFbGVtZW50OiBzdmcsXG4gICAgICBET01FbGVtZW50OiBlbCxcbiAgICAgIGJydXNoRWxlbWVudDogbnVsbFxuICAgIH07XG5cbiAgICB0aGlzLmNvbnRhaW5lcnNbaWRdID0gY29udGFpbmVyO1xuICAgIHRoaXMuX2NyZWF0ZUludGVyYWN0aW9uKFN1cmZhY2UsIGVsKTtcbiAgfVxuXG4gIC8vIGNvbnRhaW5lciBoZWxwZXJzXG4gIC8vIEBOT1RFIGNoYW5nZSB0byBgZ2V0Q29udGFpbmVyKGVsIHx8IGlkIHx8IGxheWVyKWAgP1xuICBnZXRDb250YWluZXJQZXJFbGVtZW50KGVsKSB7XG4gICAgZm9yIChsZXQgaWQgaW4gdGhpcy5jb250YWluZXJzKSB7XG4gICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcnNbaWRdO1xuICAgICAgaWYgKGNvbnRhaW5lci5ET01FbGVtZW50ID09PSBlbCkgeyByZXR1cm4gY29udGFpbmVyOyB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXRMYXllckNvbnRhaW5lcihsYXllcikge1xuICAgIHJldHVybiB0aGlzLl9sYXllckNvbnRhaW5lck1hcC5nZXQobGF5ZXIpO1xuICB9XG5cbiAgLy8gZ2V0Q29udGFpbmVyUGVySWQoaWQpIHtcbiAgLy8gICByZXR1cm4gdGhpcy5jb250YWluZXJzW2lkXTtcbiAgLy8gfVxuXG5cblxuICAvKipcbiAgICogIFJlbmRlciBhbGwgdGhlIGxheWVycyBpbiB0aGUgdGltZWxpbmVcbiAgICovXG4gIHJlbmRlcigpIHtcbiAgICB0aGlzLmxheWVycy5mb3JFYWNoKChsYXllcikgPT4ge1xuICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5fbGF5ZXJDb250YWluZXJNYXAuZ2V0KGxheWVyKTtcbiAgICAgIGNvbnN0IGxheW91dCA9IGNvbnRhaW5lci5sYXlvdXRFbGVtZW50O1xuICAgICAgbGF5b3V0LmFwcGVuZENoaWxkKGxheWVyLnJlbmRlcigpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgRHJhdyBhbGwgdGhlIGxheWVycyBpbiB0aGUgdGltZWxpbmVcbiAgICovXG4gIGRyYXcobGF5ZXJPckNhdGVnb3J5ID0gbnVsbCkge1xuICAgIGxldCBsYXllcnMgPSBudWxsO1xuXG4gICAgaWYgKHR5cGVvZiBsYXllck9yQ2F0ZWdvcnkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBsYXllcnMgPSB0aGlzLmdldExheWVycyhsYXllck9yQ2F0ZWdvcnkpO1xuICAgIH0gZWxzZSBpZiAobGF5ZXJPckNhdGVnb3J5IGluc3RhbmNlb2YgTGF5ZXIpIHtcbiAgICAgIGxheWVycyA9IFtsYXllck9yQ2F0ZWdvcnldO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYXllcnMgPSB0aGlzLmxheWVycztcbiAgICB9XG5cbiAgICB0aGlzLmxheWVycy5mb3JFYWNoKChsYXllcikgPT4gbGF5ZXIuZHJhdygpKTtcbiAgfVxuXG4gIHVwZGF0ZUNvbnRhaW5lcnMoKSB7XG4gICAgZm9yIChsZXQgaWQgaW4gdGhpcy5jb250YWluZXJzKSB7XG4gICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcnNbaWRdO1xuICAgICAgY29uc3Qgb2Zmc2V0ID0gY29udGFpbmVyLm9mZnNldEVsZW1lbnQ7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5jb250ZXh0O1xuICAgICAgY29uc3QgdHJhbnNsYXRlID0gYHRyYW5zbGF0ZSgke2NvbnRleHQueFNjYWxlKGNvbnRleHQub2Zmc2V0ICogY29udGV4dC5zdHJldGNoUmF0aW8pfSwgMClgO1xuICAgICAgb2Zmc2V0LnNldEF0dHJpYnV0ZU5TKG51bGwsICd0cmFuc2Zvcm0nLCB0cmFuc2xhdGUpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogIFVwZGF0ZSBhbGwgdGhlIGxheWVycyBpbiB0aGUgdGltZWxpbmVcbiAgICogIEBUT0RPIGFjY2VwdCBzZXZlcmFsIGBsYXllcnNgIG9yIGBjYXRlZ29yaWVzYCBhcyBhcmd1bWVudHMgP1xuICAgKi9cbiAgdXBkYXRlKGxheWVyT3JDYXRlZ29yeSA9IG51bGwpIHtcbiAgICB0aGlzLnVwZGF0ZUNvbnRhaW5lcnMoKTtcbiAgICBsZXQgbGF5ZXJzID0gbnVsbDtcblxuICAgIGlmICh0eXBlb2YgbGF5ZXJPckNhdGVnb3J5ID09PSAnc3RyaW5nJykge1xuICAgICAgbGF5ZXJzID0gdGhpcy5nZXRMYXllcnMobGF5ZXJPckNhdGVnb3J5KTtcbiAgICB9IGVsc2UgaWYgKGxheWVyT3JDYXRlZ29yeSBpbnN0YW5jZW9mIExheWVyKSB7XG4gICAgICBsYXllcnMgPSBbbGF5ZXJPckNhdGVnb3J5XTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGF5ZXJzID0gdGhpcy5sYXllcnM7XG4gICAgfVxuXG4gICAgdGhpcy5lbWl0KCd1cGRhdGUnLCBsYXllcnMpO1xuICAgIGxheWVycy5mb3JFYWNoKChsYXllcikgPT4gbGF5ZXIudXBkYXRlKCkpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZWxpbmU7Il19