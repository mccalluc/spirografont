import { findCentroid } from "./geometry.js";

function drawSegment(raphael, label, vertices) {
  const first = vertices[0];
  const rest = vertices.slice(1);
  const path = [
    ['M', ...first],
    ...rest.map((pair) => ['L', ...pair]),
    ['Z']
  ];

  const polygon = raphael.path(path).attr('fill','#444').data('label', label);

  const centroid = findCentroid(vertices);
  const text = raphael.text(centroid[0], centroid[1], label).attr('fill', '#fff');

  raphael.setStart();
  for (let i = 0; i < vertices.length; i++) {
    raphael.circle(...vertices[i], 3).update = function(dx,dy) {
      const cx = this.attr('cx') + dx;
      const cy = this.attr('cy') + dy;
      this.attr({cx, cy});
      
      const oldX = path[i][1];
      const oldY = path[i][2];
      const newX = round(cx);
      const newY = round(cy);
      if (oldX !== newX || oldY !== newY) {
        path[i][1] = newX;
        path[i][2] = newY;
        const vFromPath = path.slice(0,-1).map(triple => [triple[1], triple[2]])
        const centroid = findCentroid(vFromPath);
        text.attr({x: centroid[0], y: centroid[1]})
        polygon.attr({path});
      }
    }
  }

  const controls = raphael.setFinish();
  controls.attr({fill: '#000', stroke: '#fff'});  
  controls.drag(onMove, onStart, function() {
    const cx = round(this.attr('cx'));
    const cy = round(this.attr('cy'));
    this.attr({cx, cy});
    console.log('TODO: emit segment update event');
  });
}

function onMove(dx,dy) {
  this.update(dx - this.dx, dy - this.dy);
  this.dx = dx;
  this.dy = dy;
}

function onStart() {
  this.dx = 0;
  this.dy = 0;
}

function round(x) {
  return Math.round(x/5) * 5
}

export default {
  props: {
    baseUrl: String,
    name: String,
    sampleText: String,
    segmentMap: Object,
    segments: Object,
    shrink: Number,
    grow: Number,
    bevel: Number,
  },
  computed: {
    segmentMapToText() {
      return Object.entries(this.segmentMap).map(([from, to]) => `${from} ${to}`).join('\n');
    }
  },
  mounted() {
    const raphaelContainer = this.$refs.raphael;
    const raphael = Raphael(raphaelContainer, 0, 0, 200, 200).setViewBox(-20, -20, 300, 300);
    for (let label in this.segments) {
      const vertices = this.segments[label].map(([x, y]) => [x, y]);
      drawSegment(raphael, label, vertices)
    }
  },
  template: `
  <p><a :href="baseUrl">home</a></p>
  <h1>{{ name }}</h1>
  <textarea rows="2" columns="12" class="style-me">{{ sampleText }}</textarea>
  <button class="style-me" id="download">GET FONT</button>
  <textarea rows="10" :value="segmentMapToText" />
  <div ref="raphael" />
  `
}
