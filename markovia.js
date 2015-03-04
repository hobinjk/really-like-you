// Each node has successors: {word: number}

// Thanks stackoverflow and http://bl.ocks.org/mbostock/1153292
// (http://stackoverflow.com/questions/16568313/arrows-on-links-in-d3js-force-layout)

var root = {
  successors: {},
  word: '_'
};

var wordNodes = {};

var lyrics = 'I really wanna stop\nBut I just gotta taste for it\nI' +
' feel like I could fly with the ball on the moon\nSo honey hold my hand' +
' you like making me wait for it\nI feel I could die walking up to the' +
' room, oh yeah\nLate night watching television\nBut how we get in this' +
' position?\nIt\'s way too soon, I know this isn\'t love\nBut I need to' +
' tell you something\nI really really really really really really like' +
' you\nAnd I want you, do you want me, do you want me, too?\nI really' +
' really really really really really like you\nAnd I want you, do you' +
' want me, do you want me, too?\nOh, did I say too much?\nI\'m so in my' +
' head\nWhen we\'re out of touch\nI really really really really really' +
' really like you\nAnd I want you, do you want me, do you want me,' +
' too?\nIt\'s like everything you say is a sweet revelation\nAll I wanna' +
' do is get into your head\nYeah we could stay alone, you and me, and' +
' this temptation\nSipping on your lips, hanging on by thread,' +
' baby\nLate night watching television\nBut how we get in this' +
' position?\nIt\'s way too soon, I know this isn\'t love\nBut I need to' +
' tell you something\nI really really really really really really like' +
' you\nAnd I want you, do you want me, do you want me, too?\nI really' +
' really really really really really like you\nAnd I want you, do you' +
' want me, do you want me, too?\nOh, did I say too much?\nI\'m so in my' +
' head\nWhen we\'re out of touch\nI really really really really really' +
' really like you\nAnd I want you, do you want me, do you want me,' +
' too?\nWho gave you eyes like that?\nSaid you could keep them\nI don\'t' +
' know how to act\nThe way I should be leaving\nI\'m running out of' +
' time\nGoing out of my mind\nI need to tell you something\nYeah, I need' +
' to tell you something\nI really really really really really really' +
' like you\nAnd I want you, do you want me, do you want me, too?\nI' +
' really really really really really really like you\nAnd I want you, do' +
' you want me, do you want me, too?\nOh, did I say too much?\nI\'m so in' +
' my head\nWhen we\'re out of touch\nI really really really really' +
' really really like you\nAnd I want you, do you want me, do you want' +
' me, too?\nI really really really really really really like you\nAnd I' +
' want you, do you want me, do you want me, too?\nI really really really' +
' really really really like you\nAnd I want you, do you want me, do you' +
' want me, too?';
var links = {};
var wordsSet = {};

function linkKey(source, target) {
  return source + ' -> ' + target;
}

lyrics.split('\n').forEach(function(line) {
  var lastWord = null;
  line.split(' ').forEach(function(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (wordsSet[word]) {
      wordsSet[word].count += 1;
    } else {
      wordsSet[word] = {
        name: word,
        count: 1
      };
    }

    if (lastWord) {
      var key = linkKey(lastWord, word);
      if (links[key]) {
        links[key].value += 1;
      } else {
        links[key] = {
          source: lastWord,
          target: word,
          value: 1
        };
      }
    }

    lastWord = word;
  });
});

function values(set) {
  return Object.keys(set).map(function(key) {
    return set[key];
  });
}

var wordNodes = values(wordsSet);

var wordIndices = {};

wordNodes.forEach(function(word, index) {
  wordIndices[word.name] = index;
});

var wordLinks = values(links).map(function(link) {
  return {
    source: wordIndices[link.source],
    target: wordIndices[link.target],
    value: link.value
  };
});

var width = window.innerWidth * 2;
var height = window.innerHeight * 2;
var padding = 0;

var force = d3.layout.force()
    .charge(-2500)
    .linkDistance(100)
    .size([width, height]);

var svg = d3.select('#markovia').append('svg')
    .attr('width', width - 2 * padding)
    .attr('height', height - 2 * padding)
  .append('g')
    .attr('transform', 'translate(' + padding + ',' + padding + ')');

svg.append('defs')
   .append('marker')
    .attr('id', 'arrow-head')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 10)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
  .append('path')
    .attr('d', 'M0,-5L10,0L0,5');

force.nodes(wordNodes)
     .links(wordLinks)
     .start();

var diagonal = d3.svg.diagonal();

var link = svg.selectAll('.link')
    .data(wordLinks)
  .enter().append('line')
    .attr('class', 'link')
    .attr('stroke-width', function(d) { return Math.sqrt(d.value); });

var node = svg.selectAll('.node')
    .data(wordNodes)
  .enter().append('g')
    .attr('class', 'node');

function circleRadius(d) {
  return 22 + 2 * Math.sqrt(d.count);
}

node.append('circle')
    .attr('r', circleRadius)
    .call(force.drag);

node.append('text')
    .attr('dy', '.31em')
    .attr('text-anchor', 'middle')
    .text(function(d) {return d.name; });

var arrowPath = svg.append('g').selectAll('path')
    .data(force.links())
  .enter().append('path')
    .attr('class', 'link')
    .attr('marker-end', 'url(#arrow-head)');

force.on('tick', function() {
  arrowPath.attr('d', linkArc);

  // link.attr('x1', function(d) { return d.source.x; })
  //     .attr('y1', function(d) { return d.source.y; })
  //     .attr('x2', function(d) { return d.target.x; })
  //     .attr('y2', function(d) { return d.target.y; });

  node.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
});

function linkArc(link) {
  var target = wordNodes[link.target.index];
  var source = wordNodes[link.source.index];
  var targetRadius = circleRadius(target);
  var sourceRadius = circleRadius(source);

  var dx = target.x - source.x;
  var dy = target.y - source.y;

  var gamma = Math.atan2(dy, dx);

  var dr = Math.sqrt(dx * dx + dy * dy);

  var tx = target.x - Math.cos(gamma) * targetRadius;
  var ty = target.y - Math.sin(gamma) * targetRadius;
  var sx = source.x + Math.cos(gamma) * sourceRadius;
  var sy = source.y + Math.sin(gamma) * sourceRadius;

  console.log(gamma);
  var bendingDirection = (dy / dx > 0) ? 1 : 0;

  return 'M' + sx + ',' + sy + 'A' + dr + ',' + dr + ' 0 0,' +
         bendingDirection + ' ' + tx + ',' + ty;
}
